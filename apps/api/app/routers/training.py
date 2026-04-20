import logging
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.config import settings
from app.deps import get_supabase, get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects/{project_id}", tags=["training"])


def _get_user_project(
    supabase: Client, project_id: str, user_id: str, columns: str = "*",
) -> dict:
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


async def _submit_training_job(
    job_id: str, project_id: str, supabase: Client
) -> None:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                settings.modal_webhook_url,
                headers={"x-webhook-secret": settings.modal_webhook_secret},
                json={"job_id": job_id, "project_id": project_id},
                timeout=30.0,
            )
            resp.raise_for_status()
    except Exception:
        logger.exception("Failed to submit training job %s", job_id)
        supabase.table("training_jobs").update(
            {"status": "failed", "error_message": "Training service error"}
        ).eq("id", job_id).execute()
        supabase.table("projects").update(
            {"status": "created"}
        ).eq("id", project_id).execute()
        raise HTTPException(status_code=502, detail="Training service error")


@router.post("/train")
async def start_training(
    project_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    _get_user_project(supabase, project_id, user["id"])

    payments = (
        supabase.table("payments")
        .select("id")
        .eq("project_id", project_id)
        .eq("status", "completed")
        .execute()
    )
    if not payments.data:
        raise HTTPException(status_code=402, detail="Payment required")

    supabase.table("projects").update({"status": "training"}).eq("id", project_id).execute()

    job_id = str(uuid.uuid4())
    supabase.table("training_jobs").insert({
        "id": job_id,
        "project_id": project_id,
        "status": "queued",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    await _submit_training_job(job_id, project_id, supabase)

    return {"job_id": job_id, "status": "queued"}


@router.post("/reset")
async def reset_project(
    project_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    _get_user_project(supabase, project_id, user["id"])

    supabase.table("lora_artifacts").delete().eq("project_id", project_id).execute()

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30)
    supabase.table("projects").update({
        "status": "created",
        "last_action_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    }).eq("id", project_id).execute()

    return {"status": "reset"}


def _sign_object(supabase: Client, bucket: str, path: str, ttl: int = 3600) -> str:
    signed = supabase.storage.from_(bucket).create_signed_url(path, ttl)
    if isinstance(signed, dict):
        return signed.get("signedURL", "")
    return signed


@router.get("/download")
async def download_model(
    project_id: str,
    format: str = "adapter",
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    _get_user_project(supabase, project_id, user["id"])

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
    parent_prefix = "/".join(storage_path.split("/")[:-1]) if "/" in storage_path else ""

    if format == "gguf":
        gguf_manifest_path = artifact.get("gguf_manifest_path")
        if not gguf_manifest_path:
            raise HTTPException(
                status_code=404,
                detail="GGUF export not available for this artifact",
            )

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30)
    supabase.table("projects").update({
        "last_action_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    }).eq("id", project_id).execute()

    if format == "gguf":
        import json
        try:
            manifest_bytes = supabase.storage.from_("models").download(gguf_manifest_path)
            manifest = json.loads(manifest_bytes.decode("utf-8"))
        except Exception:
            logger.exception("Failed to read GGUF manifest")
            raise HTTPException(status_code=500, detail="Manifest read error")

        gguf_prefix = "/".join(gguf_manifest_path.split("/")[:-1])
        chunks_with_urls = []
        for chunk in manifest.get("chunks", []):
            chunk_path = f"{gguf_prefix}/{chunk['name']}"
            chunks_with_urls.append({
                "index": chunk.get("index"),
                "name": chunk.get("name"),
                "size": chunk.get("size"),
                "url": _sign_object(supabase, "models", chunk_path),
            })
        return {
            "manifest_url": _sign_object(supabase, "models", gguf_manifest_path),
            "filename": manifest.get("filename"),
            "total_size": manifest.get("total_size"),
            "sha256": manifest.get("sha256"),
            "chunks": chunks_with_urls,
            "version": artifact.get("version", 1),
        }

    files = []
    if parent_prefix:
        try:
            listing = supabase.storage.from_("models").list(parent_prefix) or []
            for entry in listing:
                name = entry.get("name") if isinstance(entry, dict) else None
                if not name or name.startswith("checkpoint-") or name == "gguf":
                    continue
                remote_path = f"{parent_prefix}/{name}"
                files.append({
                    "name": name,
                    "url": _sign_object(supabase, "models", remote_path),
                })
        except Exception as e:
            logger.warning("Failed to list LoRA bundle: %s", e)

    if not files:
        files = [{
            "name": storage_path.rsplit("/", 1)[-1],
            "url": _sign_object(supabase, "models", storage_path),
        }]

    return {
        "download_url": _sign_object(supabase, "models", storage_path),
        "files": files,
        "version": artifact.get("version", 1),
    }


@router.get("/history")
async def get_training_history(
    project_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
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
