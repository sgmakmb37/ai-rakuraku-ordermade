"""Training job creation and submission logic shared by /train and webhook."""

import json
import logging
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import HTTPException
from supabase import Client

from app.config import settings
from app.deps import get_redis

logger = logging.getLogger(__name__)


def check_active_job(supabase: Client, project_id: str) -> dict | None:
    """queued/running状態のjobが既にあれば返す。なければNone。"""
    result = (
        supabase.table("training_jobs")
        .select("id,status")
        .eq("project_id", project_id)
        .in_("status", ["queued", "running"])
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def create_training_job(supabase: Client, project_id: str) -> str:
    """training_jobsにqueued状態で新規作成。job_idを返す。"""
    job_id = str(uuid.uuid4())
    supabase.table("training_jobs").insert({
        "id": job_id,
        "project_id": project_id,
        "status": "queued",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return job_id


async def submit_job(
    supabase: Client, job_id: str, project_id: str,
) -> None:
    """RunPod or Redis にジョブを投入する。失敗時はtraining_jobをfailedに更新しHTTPExceptionを送出。"""
    if settings.runpod_endpoint_id and settings.runpod_api_key:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"https://api.runpod.ai/v2/{settings.runpod_endpoint_id}/run",
                    headers={"Authorization": f"Bearer {settings.runpod_api_key}"},
                    json={"input": {"job_id": job_id, "project_id": project_id}},
                    timeout=30.0,
                )
                resp.raise_for_status()
        except Exception:
            logger.exception("Failed to submit RunPod job %s", job_id)
            supabase.table("training_jobs").update(
                {"status": "failed", "error_message": "RunPod API error"}
            ).eq("id", job_id).execute()
            raise HTTPException(status_code=502, detail="RunPod API error")
    else:
        try:
            redis_client = get_redis()
            # key は "id" で統一（worker consumer が job["id"] で参照するため）
            queue_data = json.dumps({"id": job_id, "project_id": project_id})
            redis_client.rpush("training_jobs", queue_data)
        except Exception:
            logger.exception("Failed to enqueue training job %s", job_id)
            supabase.table("training_jobs").update(
                {"status": "failed", "error_message": "Queue error"}
            ).eq("id", job_id).execute()
            raise HTTPException(status_code=502, detail="Queue service error")
