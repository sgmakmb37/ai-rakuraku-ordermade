import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.deps import get_supabase, get_current_user
from app.services.training_jobs import check_active_job, create_training_job, submit_job

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

    # 二重job作成防止: queued/running状態のjobが既にあれば409
    active = check_active_job(supabase, project_id)
    if active:
        raise HTTPException(
            status_code=409,
            detail=f"Training already in progress (job {active['id']})",
        )

    # 決済チェック: このprojectに紐づくcompleted paymentが存在するか確認
    payments = (
        supabase.table("payments")
        .select("id")
        .eq("project_id", project_id)
        .eq("status", "completed")
        .limit(1)
        .execute()
    )
    if not payments.data:
        raise HTTPException(status_code=402, detail="Payment required")

    # ステータスをtrainingに更新
    supabase.table("projects").update({"status": "training"}).eq("id", project_id).execute()

    job_id = create_training_job(supabase, project_id)

    try:
        await submit_job(supabase, job_id, project_id)
    except HTTPException:
        # submit失敗時: projectステータスをロールバック
        supabase.table("projects").update({"status": "created"}).eq("id", project_id).execute()
        raise

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
    """
    Download a trained model.

    Query params:
        format: "adapter" (default) = LoRA adapter bundle
                "gguf"             = quantized GGUF shards + manifest

    Returns:
        adapter mode: {download_url, files: [{name, url}], version}
        gguf    mode: {manifest_url, chunks: [{name, url, index, size}], version, total_size}
    """
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

    # GGUF mode: return manifest + chunk signed URLs.
    # Check availability BEFORE updating activity so 404 doesn't extend expiry.
    if format == "gguf":
        gguf_manifest_path = artifact.get("gguf_manifest_path")
        if not gguf_manifest_path:
            raise HTTPException(
                status_code=404,
                detail="GGUF export not available for this artifact",
            )

    # Update project activity (only reached when download is actually served)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30)
    supabase.table("projects").update({
        "last_action_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    }).eq("id", project_id).execute()

    if format == "gguf":
        try:
            manifest_bytes = supabase.storage.from_("models").download(gguf_manifest_path)
            import json as _json
            manifest = _json.loads(manifest_bytes.decode("utf-8"))
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

    # Adapter mode (default): return bundle
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
