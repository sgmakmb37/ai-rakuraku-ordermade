import logging

import redis
from fastapi import Depends, HTTPException, Request
from supabase import create_client, Client

from app.config import settings

logger = logging.getLogger(__name__)

_redis_client: redis.Redis | None = None


def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_key)


def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(settings.redis_url)
    return _redis_client


async def get_current_user(
    request: Request, supabase: Client = Depends(get_supabase)
) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = auth_header.split(" ", 1)[1]
    try:
        user = supabase.auth.get_user(token)
    except Exception:
        logger.exception("Auth token verification failed")
        raise HTTPException(status_code=401, detail="Invalid token")
    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"id": user.user.id, "email": user.user.email}
