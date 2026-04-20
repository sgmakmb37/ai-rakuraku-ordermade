import logging

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from app.deps import get_current_user, get_supabase
from app.schemas import CreateProjectRequest, ProjectResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> list:
    try:
        response = (
            supabase.table("projects")
            .select("*")
            .eq("user_id", current_user["id"])
            .execute()
        )
        return response.data
    except Exception:
        logger.exception("Failed to list projects")
        raise HTTPException(status_code=500, detail="Internal error")


@router.post("", response_model=ProjectResponse)
async def create_project(
    request: CreateProjectRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    try:
        count_response = (
            supabase.table("projects")
            .select("id")
            .eq("user_id", current_user["id"])
            .execute()
        )
        if len(count_response.data) >= 5:
            raise HTTPException(
                status_code=400, detail="Maximum 5 projects allowed per user"
            )

        project_data = {
            "user_id": current_user["id"],
            "name": request.name,
            "model_type": request.model_type,
            "genre": request.genre,
            "description": request.description,
            "status": "created",
        }
        response = supabase.table("projects").insert(project_data).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to create project")
        raise HTTPException(status_code=500, detail="Internal error")


@router.get("/{id}", response_model=ProjectResponse)
async def get_project(
    id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    try:
        response = (
            supabase.table("projects")
            .select("*")
            .eq("id", id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        return response.data
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")


@router.delete("/{id}")
async def delete_project(
    id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> dict:
    result = (
        supabase.table("projects")
        .select("id")
        .eq("id", id)
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        supabase.table("payments").delete().eq("project_id", id).execute()
        supabase.table("projects").delete().eq("id", id).eq("user_id", current_user["id"]).execute()
        return {"deleted": True}
    except Exception:
        logger.exception("Failed to delete project %s", id)
        raise HTTPException(status_code=500, detail="Failed to delete project")
