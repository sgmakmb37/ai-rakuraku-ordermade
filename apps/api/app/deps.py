from fastapi import Depends, HTTPException, Request
from supabase import create_client, Client

from app.config import settings


def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_key)


async def get_current_user(
    request: Request, supabase: Client = Depends(get_supabase)
) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = auth_header.replace("Bearer ", "")
    user = supabase.auth.get_user(token)
    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"id": user.user.id, "email": user.user.email}
