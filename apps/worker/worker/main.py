import json
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict

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

GGUF_CHUNK_SIZE = 48 * 1024 * 1024

MODEL_ID_MAP = {
    "qwen2.5-1.5b": "Qwen/Qwen2.5-1.5B",
    "qwen2.5-3b": "Qwen/Qwen2.5-3B",
    "gemma-4-e2b": "google/gemma-4-E2B",
    "gemma-4-e4b": "google/gemma-4-E4B",
}


def _shard_and_upload_gguf(supabase, gguf_path: Path, storage_dir: str) -> str:
    import hashlib

    if not gguf_path.exists():
        raise FileNotFoundError(f"GGUF file not found: {gguf_path}")

    gguf_prefix = f"{storage_dir}/gguf"
    total_size = gguf_path.stat().st_size
    sha256 = hashlib.sha256()
    chunks = []
    chunk_idx = 0

    with open(gguf_path, "rb") as f:
        while True:
            data = f.read(GGUF_CHUNK_SIZE)
            if not data:
                break
            sha256.update(data)
            chunk_name = f"part_{chunk_idx:04d}.bin"
            chunk_storage_path = f"{gguf_prefix}/{chunk_name}"
            try:
                supabase.storage.from_("models").upload(chunk_storage_path, data)
            except Exception:
                try:
                    supabase.storage.from_("models").remove([chunk_storage_path])
                except Exception:
                    pass
                supabase.storage.from_("models").upload(chunk_storage_path, data)
            chunks.append({
                "index": chunk_idx,
                "name": chunk_name,
                "size": len(data),
            })
            logger.info(f"[GGUF] uploaded chunk {chunk_idx} ({len(data)} bytes)")
            chunk_idx += 1

    manifest = {
        "filename": gguf_path.name,
        "total_size": total_size,
        "chunk_size": GGUF_CHUNK_SIZE,
        "chunks": chunks,
        "sha256": sha256.hexdigest(),
    }
    manifest_bytes = json.dumps(manifest, indent=2).encode("utf-8")
    manifest_storage_path = f"{gguf_prefix}/manifest.json"
    try:
        supabase.storage.from_("models").upload(manifest_storage_path, manifest_bytes)
    except Exception:
        try:
            supabase.storage.from_("models").remove([manifest_storage_path])
        except Exception:
            pass
        supabase.storage.from_("models").upload(manifest_storage_path, manifest_bytes)

    return manifest_storage_path


def process_job(job: Dict[str, Any]) -> Dict[str, Any]:
    supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
    job_id = job["id"]
    project_id = job["project_id"]

    try:
        # 1. Update status to running
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

        # 2. Get project
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
        raw_data = data_sources_result.data or []
        if raw_data and isinstance(raw_data[0], list):
            raw_data = [item for sublist in raw_data for item in sublist if isinstance(item, dict)]
        data_sources = [s for s in raw_data if isinstance(s, dict)]

        # 4. Extract text
        all_texts = []
        for source in data_sources:
            content = source.get("content", "") or ""
            if content.strip():
                all_texts.append(content)
                continue
            source_type = source.get("type") or source.get("source_type") or "url"
            source_value = source.get("source_value") or source.get("name") or ""
            if source_value:
                text = extract_text(source_type, source_value)
                if text:
                    all_texts.append(text)

        combined_text = "\n\n".join(all_texts)
        if not combined_text.strip():
            raise ValueError("No text extracted from sources")

        # 5. Chunk and filter
        chunks = chunk_text(combined_text)
        filtered_chunks = filter_chunks(chunks)
        if not filtered_chunks:
            raise ValueError("No valid chunks after filtering")

        # 6. Check for existing LoRA to resume from
        existing_lora_path = None
        storage_path = ""
        lora_artifacts_result = (
            supabase.table("lora_artifacts")
            .select("*")
            .eq("project_id", project_id)
            .order("version", desc=True)
            .limit(1)
            .execute()
        )
        if lora_artifacts_result.data:
            latest = lora_artifacts_result.data[0]
            storage_path = latest.get("storage_path", "")
            parent_prefix = "/".join(storage_path.split("/")[:-1]) if "/" in storage_path else ""
            if parent_prefix:
                try:
                    resume_dir = Path(config.MODEL_CACHE_DIR) / f"resume_{job_id}"
                    resume_dir.mkdir(parents=True, exist_ok=True)
                    files_in_prefix = supabase.storage.from_("models").list(parent_prefix)
                    for entry in files_in_prefix or []:
                        fname = entry.get("name") if isinstance(entry, dict) else None
                        if not fname:
                            continue
                        remote_path = f"{parent_prefix}/{fname}"
                        try:
                            blob = supabase.storage.from_("models").download(remote_path)
                            (resume_dir / fname).write_bytes(blob)
                        except Exception as dl_err:
                            logger.warning(f"[RESUME] skip {remote_path}: {dl_err}")
                    if (resume_dir / "adapter_config.json").exists():
                        existing_lora_path = str(resume_dir)
                        logger.info(f"[RESUME] will continue from {existing_lora_path}")
                except Exception:
                    logger.exception("[RESUME] failed to prepare resume dir, training fresh")

        # 7. Train LoRA
        lora_output_dir = str(Path(config.MODEL_CACHE_DIR) / f"lora_{job_id}")
        train_lora(
            model_id=model_id,
            train_texts=filtered_chunks,
            output_dir=lora_output_dir,
            existing_lora_path=existing_lora_path,
            max_steps=60,
        )

        # 8. Upload adapter files
        lora_path = Path(lora_output_dir)
        if not lora_path.exists():
            raise ValueError(f"LoRA adapter not found at {lora_output_dir}")

        adapter_files = [f for f in lora_path.rglob("*") if f.is_file()]
        if not adapter_files:
            raise ValueError(f"No adapter files found in {lora_output_dir}")

        primary_candidates = [
            f for f in adapter_files
            if f.name in ("adapter_model.safetensors", "adapter_model.bin")
        ]
        primary_file = primary_candidates[0] if primary_candidates else max(
            adapter_files, key=lambda f: f.stat().st_size
        )

        storage_dir = f"projects/{project_id}/{job_id}"
        primary_storage_path = f"{storage_dir}/{primary_file.name}"

        for adapter_file in adapter_files:
            rel = adapter_file.relative_to(lora_path)
            with open(adapter_file, "rb") as f:
                file_bytes = f.read()
            file_storage_path = f"{storage_dir}/{rel.as_posix()}"
            try:
                supabase.storage.from_("models").upload(file_storage_path, file_bytes)
            except Exception:
                try:
                    supabase.storage.from_("models").remove([file_storage_path])
                    supabase.storage.from_("models").upload(file_storage_path, file_bytes)
                except Exception as retry_err:
                    raise ValueError(f"Upload to {file_storage_path} failed: {retry_err}")

        # 9. Optional GGUF export
        gguf_manifest_path = None
        if os.getenv("ENABLE_GGUF_EXPORT", "0") == "1":
            try:
                gguf_dir = Path(config.MODEL_CACHE_DIR) / f"gguf_{job_id}"
                gguf_file = quantize_model(
                    base_model_id=model_id,
                    adapter_path=lora_output_dir,
                    output_path=str(gguf_dir),
                    quant_type=os.getenv("GGUF_QUANT_TYPE", "q4_k_m"),
                )
                gguf_manifest_path = _shard_and_upload_gguf(
                    supabase, Path(gguf_file), storage_dir
                )
            except Exception:
                logger.exception("[GGUF] export failed, continuing with adapter only")

        # 10. Record artifact
        current_version = 1
        if lora_artifacts_result.data:
            current_version = lora_artifacts_result.data[0].get("version", 0) + 1

        artifact_record = {
            "project_id": project_id,
            "version": current_version,
            "storage_path": primary_storage_path,
            "created_at": datetime.utcnow().isoformat(),
        }
        if gguf_manifest_path:
            artifact_record["gguf_manifest_path"] = gguf_manifest_path
        supabase.table("lora_artifacts").insert(artifact_record).execute()

        # 11. Update project status
        expiry_date = (datetime.utcnow() + timedelta(days=30)).isoformat()
        supabase.table("projects").update(
            {
                "status": "completed",
                "last_action_at": datetime.utcnow().isoformat(),
                "expires_at": expiry_date,
            }
        ).eq("id", project_id).execute()

        supabase.table("training_jobs").update(
            {"status": "done", "finished_at": datetime.utcnow().isoformat()}
        ).eq("id", job_id).execute()

        return {
            "job_id": job_id,
            "project_id": project_id,
            "status": "success",
            "storage_path": primary_storage_path,
            "version": current_version,
        }

    except Exception as e:
        logger.error(f"Job {job_id} failed: {str(e)}", exc_info=True)
        supabase.table("training_jobs").update(
            {"status": "failed", "error_message": str(e), "finished_at": datetime.utcnow().isoformat()}
        ).eq("id", job_id).execute()
        # Only mark project failed if it's still in "training" state (avoid overwriting "completed")
        supabase.table("projects").update({"status": "failed"}).eq("id", project_id).eq("status", "training").execute()
        raise
