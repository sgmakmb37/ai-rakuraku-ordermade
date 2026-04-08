import json
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict

import redis
from supabase import create_client

from worker.config import config
from worker.pipeline import (
    chunk_text,
    extract_text,
    filter_chunks,
    quantize_model,
    train_lora,
)

logger = logging.getLogger(__name__)

RUNPOD_MODE = os.getenv("RUNPOD_MODE", "0") == "1"

# Model ID mapping
MODEL_ID_MAP = {
    "qwen2.5-1.5b": "Qwen/Qwen2.5-1.5B",
    "qwen2.5-3b": "Qwen/Qwen2.5-3B",
}


class WorkerQueue:
    def __init__(self, redis_url: str = None):
        self.redis_url = redis_url or config.REDIS_URL
        self.client = redis.from_url(self.redis_url, decode_responses=True)
        self.queue_name = config.REDIS_QUEUE_NAME

    def get_job(self) -> Dict[str, Any] | None:
        """
        Get next job from queue.

        Returns:
            Job dict or None if queue is empty
        """
        result = self.client.blpop(self.queue_name, timeout=5)
        if result is None:
            return None
        _, job_json = result
        return json.loads(job_json)

    def mark_job_complete(self, job_id: str, result: Dict[str, Any]) -> None:
        """
        Mark job as complete and store result.

        Args:
            job_id: Job ID
            result: Result data
        """
        supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
        supabase.table("training_jobs").update(
            {
                "status": "done",
                "finished_at": datetime.utcnow().isoformat(),
            }
        ).eq("id", job_id).execute()

    def mark_job_failed(self, job_id: str, error: str) -> None:
        """
        Mark job as failed with error message.

        Args:
            job_id: Job ID
            error: Error message
        """
        supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
        supabase.table("training_jobs").update(
            {
                "status": "failed",
                "error_message": error,
                "finished_at": datetime.utcnow().isoformat(),
            }
        ).eq("id", job_id).execute()


def process_job(job: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process a single job.

    Args:
        job: Job data

    Returns:
        Result data
    """
    supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
    job_id = job["id"]
    project_id = job["project_id"]

    try:
        # 1. Get training job and update to running
        training_job_result = (
            supabase.table("training_jobs")
            .select("*")
            .eq("id", job_id)
            .execute()
        )
        if not training_job_result.data:
            raise ValueError(f"Training job {job_id} not found")

        supabase.table("training_jobs").update(
            {
                "status": "running",
                "started_at": datetime.utcnow().isoformat(),
            }
        ).eq("id", job_id).execute()

        # 2. Get project to find model_type
        project_result = (
            supabase.table("projects").select("*").eq("id", project_id).execute()
        )
        if not project_result.data:
            raise ValueError(f"Project {project_id} not found")

        project = project_result.data[0]
        model_type = project.get("model_type", "qwen2.5-1.5b")
        model_id = MODEL_ID_MAP.get(model_type, "Qwen/Qwen2.5-1.5B")

        # 3. Get data sources
        data_sources_result = (
            supabase.table("data_sources")
            .select("*")
            .eq("project_id", project_id)
            .execute()
        )
        data_sources = data_sources_result.data or []

        # 4. Extract text from each source
        all_texts = []
        for source in data_sources:
            source_type = source.get("source_type", "url")
            source_value = source.get("source_value", "")
            logger.info(f"Extracting text from {source_type}: {source_value}")
            text = extract_text(source_type, source_value)
            if text:
                all_texts.append(text)

        combined_text = "\n\n".join(all_texts)
        if not combined_text.strip():
            raise ValueError("No text extracted from sources")

        # 5. Chunk text
        chunks = chunk_text(combined_text)

        # 6. Filter chunks
        filtered_chunks = filter_chunks(chunks)
        if not filtered_chunks:
            raise ValueError("No valid chunks after filtering")

        # 7. Get existing LoRA artifact if available
        existing_lora_path = None
        lora_artifacts_result = (
            supabase.table("lora_artifacts")
            .select("*")
            .eq("project_id", project_id)
            .order("version", desc=True)
            .limit(1)
            .execute()
        )
        if lora_artifacts_result.data:
            artifact = lora_artifacts_result.data[0]
            existing_lora_path = artifact.get("artifact_path")

        # 8. Train LoRA
        lora_output_dir = str(Path(config.MODEL_CACHE_DIR) / f"lora_{job_id}")
        logger.info(f"Training LoRA for job {job_id}")
        train_lora(
            model_id=model_id,
            train_texts=filtered_chunks,
            output_dir=lora_output_dir,
            existing_lora_path=existing_lora_path,
            max_steps=500,
        )

        # 9. Quantize model
        quantized_output_dir = str(
            Path(config.MODEL_CACHE_DIR) / f"quantized_{job_id}"
        )
        logger.info(f"Quantizing model for job {job_id}")
        quantize_model(lora_output_dir, quantized_output_dir)

        # 10. Upload artifacts to Supabase Storage
        quantized_model_path = Path(quantized_output_dir)
        if not quantized_model_path.exists():
            raise ValueError(f"Quantized model not found at {quantized_output_dir}")

        # Read quantized model file and upload
        model_files = list(quantized_model_path.glob("*"))
        if not model_files:
            raise ValueError(f"No model files found in {quantized_output_dir}")

        storage_path = f"projects/{project_id}/{job_id}/model"
        for model_file in model_files:
            if model_file.is_file():
                with open(model_file, "rb") as f:
                    file_bytes = f.read()
                file_storage_path = f"{storage_path}/{model_file.name}"
                supabase.storage.from_("models").upload(
                    file_storage_path, file_bytes
                )
                logger.info(f"Uploaded {file_storage_path}")

        # 11. Record LoRA artifact
        current_version = 1
        if lora_artifacts_result.data:
            current_version = lora_artifacts_result.data[0].get("version", 0) + 1

        artifact_record = {
            "project_id": project_id,
            "job_id": job_id,
            "version": current_version,
            "artifact_path": storage_path,
            "model_type": model_type,
            "created_at": datetime.utcnow().isoformat(),
        }
        supabase.table("lora_artifacts").insert(artifact_record).execute()

        # 12. Update project status
        expiry_date = (datetime.utcnow() + timedelta(days=30)).isoformat()
        supabase.table("projects").update(
            {
                "status": "completed",
                "last_action_at": datetime.utcnow().isoformat(),
                "expires_at": expiry_date,
            }
        ).eq("id", project_id).execute()

        result = {
            "job_id": job_id,
            "project_id": project_id,
            "status": "success",
            "artifact_path": storage_path,
            "version": current_version,
        }

        logger.info(f"Job {job_id} completed successfully")
        return result

    except Exception as e:
        logger.error(f"Job {job_id} failed: {str(e)}", exc_info=True)
        raise


def run_worker_loop(max_jobs: int = None) -> None:
    """
    Main worker loop that continuously processes jobs from queue.

    Args:
        max_jobs: Maximum jobs to process before exiting (None for infinite)
    """
    queue = WorkerQueue()
    job_count = 0

    try:
        while True:
            if max_jobs is not None and job_count >= max_jobs:
                logger.info(f"Reached max_jobs limit ({max_jobs}), exiting")
                break

            job = queue.get_job()
            if job is None:
                logger.debug("No job in queue, waiting...")
                continue

            job_id = job.get("id")
            logger.info(f"Processing job {job_id}")

            try:
                result = process_job(job)
                queue.mark_job_complete(job_id, result)
                logger.info(f"Job {job_id} marked as complete")
            except Exception as e:
                error_message = str(e)
                logger.error(f"Job {job_id} failed with error: {error_message}")
                queue.mark_job_failed(job_id, error_message)

            job_count += 1

    except KeyboardInterrupt:
        logger.info("Worker interrupted by user, shutting down gracefully")
    except Exception as e:
        logger.error(f"Worker loop failed: {str(e)}", exc_info=True)
        raise


def handler(job: Dict[str, Any]) -> Dict[str, Any]:
    """
    RunPod Serverless handler.

    Args:
        job: RunPod job dict with "input" key containing job data

    Returns:
        Result data
    """
    job_input = job["input"]
    job_id = job_input.get("job_id") or job_input.get("id")
    project_id = job_input["project_id"]

    queue = WorkerQueue()
    process_input = {"id": job_id, "project_id": project_id}

    try:
        result = process_job(process_input)
        queue.mark_job_complete(job_id, result)
        return result
    except Exception as e:
        error_message = str(e)
        logger.error(f"RunPod job {job_id} failed: {error_message}", exc_info=True)
        queue.mark_job_failed(job_id, error_message)
        return {"error": error_message}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    if RUNPOD_MODE:
        import runpod

        runpod.serverless.start({"handler": handler})
    else:
        run_worker_loop()
