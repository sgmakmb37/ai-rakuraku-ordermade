import json
import logging
import uuid
from datetime import datetime, timedelta, timezone

import httpx
import redis
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.config import settings
from app.deps import get_supabase, get_current_user, get_redis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects/{project_id}", tags=["training"])


def _get_user_project(
    supabase: Client, project_id: str, user_id: str, columns: str = "*",
) -> dict:
    """user_idをクエリ条件に含めてプロジェクトを取得する。存在しなければ404。"""
    try:
        result = (
            supabase.table("projects")
            .select(columns)
            .eq("id", project_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        return result.data
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")


@router.post("/train")
async def start_training(
    project_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    _get_user_project(supabase, project_id, user["id"])

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

    # ジョブ投入: RunPod Serverless or Redis
    if settings.runpod_endpoint_id and settings.runpod_api_key:
        # RunPod Serverless API経由
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
    _get_user_project(supabase, project_id, user["id"])

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
    _get_user_project(supabase, project_id, user["id"])

    # 最新のlora_artifactを取得
    artifacts = (
        supabase.table("lora_artifacts")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not artifacts.data:
        raise HTTPException(status_code=404, detail="No model available for download")

    artifact = artifacts.data[0]
    storage_path = artifact["storage_path"]
    # Parent prefix = "projects/{pid}/{jid}"
    parent_prefix = "/".join(storage_path.split("/")[:-1]) if "/" in storage_path else ""

    files = []
    if parent_prefix:
        try:
            listing = supabase.storage.from_("models").list(parent_prefix) or []
            for entry in listing:
                name = entry.get("name") if isinstance(entry, dict) else None
                if not name or name.startswith("checkpoint-"):
                    continue  # skip trainer intermediate checkpoints
                remote_path = f"{parent_prefix}/{name}"
                signed = supabase.storage.from_("models").create_signed_url(
                    remote_path, 3600
                )
                signed_url = signed.get("signedURL") if isinstance(signed, dict) else signed
                files.append({"name": name, "url": signed_url})
        except Exception as e:
            logger.warning("Failed to list LoRA bundle: %s", e)

    # Always include the primary file; fallback if listing failed
    if not files:
        primary = supabase.storage.from_("models").create_signed_url(storage_path, 3600)
        primary_url = primary.get("signedURL") if isinstance(primary, dict) else primary
        files = [
            {"name": storage_path.rsplit("/", 1)[-1], "url": primary_url}
        ]

    # Primary signed URL for single-file downloads (backward compat)
    primary = supabase.storage.from_("models").create_signed_url(storage_path, 3600)
    primary_url = primary.get("signedURL") if isinstance(primary, dict) else primary

    # last_action_atとexpires_at更新
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30)
    supabase.table("projects").update({
        "last_action_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    }).eq("id", project_id).execute()

    return {
        "download_url": primary_url,  # backward compat for current FE
        "files": files,  # full bundle (adapter_config.json, tokenizer, etc.)
        "version": artifact.get("version", 1),
    }


@router.get("/history")
async def get_training_history(
    project_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """プロジェクトの学習履歴を取得する。"""
    _get_user_project(supabase, project_id, user["id"])

    jobs = (
        supabase.table("training_jobs")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    return {"jobs": jobs.data}
