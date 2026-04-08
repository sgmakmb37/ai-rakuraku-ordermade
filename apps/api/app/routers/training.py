import json
import logging
import uuid
from datetime import datetime, timedelta, timezone

import redis
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.config import settings
from app.deps import get_supabase, get_current_user, get_redis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects/{project_id}", tags=["training"])


@router.post("/train")
async def start_training(
    project_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # プロジェクト存在確認 + user_id一致確認
    project = supabase.table("projects").select("*").eq("id", project_id).single().execute()
    if not project.data or project.data["user_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Project not found")

    # ステータスをtrainingに更新
    supabase.table("projects").update({"status": "training"}).eq("id", project_id).execute()

    # training_jobsにqueued状態で作成
    job_id = str(uuid.uuid4())
    supabase.table("training_jobs").insert({
        "id": job_id,
        "project_id": project_id,
        "status": "queued",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    # Redisキューにジョブ投入
    try:
        redis_client = get_redis()
        queue_data = json.dumps({"job_id": job_id, "project_id": project_id})
        redis_client.rpush("training_jobs", queue_data)
    except redis.RedisError:
        logger.exception("Failed to enqueue training job %s", job_id)
        supabase.table("training_jobs").update(
            {"status": "failed", "error_message": "Queue error"}
        ).eq("id", job_id).execute()
        raise HTTPException(status_code=502, detail="Queue service error")

    return {"job_id": job_id, "status": "queued"}


@router.post("/reset")
async def reset_project(
    project_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # プロジェクト存在確認 + user_id一致確認
    project = supabase.table("projects").select("*").eq("id", project_id).single().execute()
    if not project.data or project.data["user_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Project not found")

    # lora_artifacts削除
    supabase.table("lora_artifacts").delete().eq("project_id", project_id).execute()

    # ステータスをcreatedに戻す
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30)
    supabase.table("projects").update({
        "status": "created",
        "last_action_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    }).eq("id", project_id).execute()

    return {"status": "reset"}


@router.get("/download")
async def download_model(
    project_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # プロジェクト存在確認 + user_id一致確認
    project = supabase.table("projects").select("*").eq("id", project_id).single().execute()
    if not project.data or project.data["user_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Project not found")

    # 最新のlora_artifactを取得
    artifacts = supabase.table("lora_artifacts").select("*").eq("project_id", project_id).order("created_at", desc=True).limit(1).execute()
    if not artifacts.data:
        raise HTTPException(status_code=404, detail="No model available for download")

    artifact = artifacts.data[0]

    # Supabase Storageからsigned URLを生成して返す
    signed_url = supabase.storage.from_("lora_models").create_signed_url(
        artifact["file_path"],
        3600  # 1時間有効
    )

    # last_action_atとexpires_at更新
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30)
    supabase.table("projects").update({
        "last_action_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    }).eq("id", project_id).execute()

    return {"download_url": signed_url}
