from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class UserCreate(BaseModel):
    firebase_uid: str
    email: str | None = None
    name: str | None = None


class UserResponse(BaseModel):
    id: UUID
    firebase_uid: str
    email: str | None
    name: str | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
