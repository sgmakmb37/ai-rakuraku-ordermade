from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from app.deps import get_current_user, get_supabase
from app.schemas import AddSourceRequest, SourceResponse

router = APIRouter(prefix="/projects", tags=["sources"])

MAX_CHAR_COUNT = 500000


@router.post("/{id}/sources", response_model=SourceResponse)
async def add_source(
    id: str,
    request: AddSourceRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    try:
        project = (
            supabase.table("projects")
            .select("id")
            .eq("id", id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )

        sources_response = (
            supabase.table("data_sources")
            .select("id, char_count")
            .eq("project_id", id)
            .execute()
        )

        if len(sources_response.data) >= 5:
            raise HTTPException(
                status_code=400, detail="Maximum 5 sources per project"
            )

        total_char_count = sum(s["char_count"] for s in sources_response.data)
        content_length = len(request.content)

        if total_char_count + content_length > MAX_CHAR_COUNT:
            raise HTTPException(
                status_code=400,
                detail=f"Total character count exceeds {MAX_CHAR_COUNT} limit",
            )

        source_data = {
            "project_id": id,
            "type": request.type,
            "name": request.name,
            "content": request.content,
            "char_count": content_length,
        }
        response = supabase.table("data_sources").insert(source_data).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail="Project not found")


@router.delete("/{id}/sources/{sid}")
async def delete_source(
    id: str,
    sid: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    try:
        project = (
            supabase.table("projects")
            .select("id")
            .eq("id", id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )

        supabase.table("data_sources").delete().eq("id", sid).eq("project_id", id).execute()
        return {"deleted": True}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Source not found")
