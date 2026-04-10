import logging
from io import BytesIO

import pymupdf
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from supabase import Client

from app.deps import get_current_user, get_supabase
from app.schemas import AddSourceRequest, SourceResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["sources"])

MAX_CHAR_COUNT = 500000
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTS = {"pdf", "txt", "csv", "json"}


def _verify_project_and_budget(
    supabase: Client, project_id: str, user_id: str, new_content_len: int
) -> None:
    """Raise HTTPException if project not owned, at 5-source cap, or exceeds char budget."""
    supabase.table("projects").select("id").eq("id", project_id).eq(
        "user_id", user_id
    ).single().execute()

    sources_response = (
        supabase.table("data_sources")
        .select("id, char_count")
        .eq("project_id", project_id)
        .execute()
    )
    if len(sources_response.data) >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 sources per project")

    total = sum(s["char_count"] for s in sources_response.data)
    if total + new_content_len > MAX_CHAR_COUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Total character count exceeds {MAX_CHAR_COUNT} limit",
        )


def _insert_source(
    supabase: Client,
    project_id: str,
    source_type: str,
    name: str,
    content: str,
) -> dict:
    source_data = {
        "project_id": project_id,
        "type": source_type,
        "name": name,
        "content": content,
        "char_count": len(content),
    }
    response = supabase.table("data_sources").insert(source_data).execute()
    return response.data[0]


def _extract_text_from_bytes(filename: str, data: bytes) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension: .{ext}. Allowed: {sorted(ALLOWED_EXTS)}",
        )
    if ext == "pdf":
        try:
            with pymupdf.open(stream=BytesIO(data), filetype="pdf") as doc:
                return "\n\n".join(page.get_text() for page in doc)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"PDF parse error: {e}"
            )
    # Text formats: decode as UTF-8 with replacement for invalid bytes
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("utf-8", errors="replace")


@router.post("/{id}/sources", response_model=SourceResponse)
async def add_source(
    id: str,
    request: AddSourceRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    try:
        _verify_project_and_budget(
            supabase, id, current_user["id"], len(request.content)
        )
        return _insert_source(
            supabase, id, request.type, request.name, request.content
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to add source")
        raise HTTPException(status_code=500, detail="Internal error")


@router.post("/{id}/sources/file", response_model=SourceResponse)
async def add_source_file(
    id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    """
    Upload a file (PDF/TXT/CSV/JSON) and extract its text on the server side.
    Avoids the FE `readAsText` bug that corrupts PDF binary.
    """
    try:
        # Size guard: read bytes but cap at MAX_FILE_SIZE
        data = await file.read()
        if len(data) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds {MAX_FILE_SIZE // (1024 * 1024)}MB limit",
            )

        content = _extract_text_from_bytes(file.filename or "unnamed", data)
        if not content.strip():
            raise HTTPException(
                status_code=400,
                detail="No extractable text found in file",
            )

        _verify_project_and_budget(
            supabase, id, current_user["id"], len(content)
        )
        return _insert_source(
            supabase, id, "file", file.filename or "unnamed", content
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to add source file")
        raise HTTPException(status_code=500, detail="Internal error")


@router.delete("/{id}/sources/{sid}")
async def delete_source(
    id: str,
    sid: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    try:
        # プロジェクト所有権確認
        supabase.table("projects").select("id").eq("id", id).eq(
            "user_id", current_user["id"]
        ).single().execute()
        # project_idも条件に含めて削除
        supabase.table("data_sources").delete().eq("id", sid).eq(
            "project_id", id
        ).execute()
        return {"deleted": True}
    except Exception:
        raise HTTPException(status_code=404, detail="Source not found")
