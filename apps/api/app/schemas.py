from typing import Literal
from datetime import datetime
from pydantic import BaseModel


class CreateProjectRequest(BaseModel):
    name: str
    model_type: str
    genre: str
    description: str = ""


class ProjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    model_type: str
    genre: str
    description: str
    status: str
    created_at: datetime
    last_action_at: datetime
    expires_at: datetime


class AddSourceRequest(BaseModel):
    type: Literal["url", "file"]
    name: str
    content: str = ""


class SourceResponse(BaseModel):
    id: str
    project_id: str
    type: str
    name: str
    char_count: int
    created_at: datetime
