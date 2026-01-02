from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class ConversationType(str, Enum):
    ONBOARDING = "onboarding"
    DAILY = "daily"
    REFLECTION = "reflection"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


class MessageCreate(BaseModel):
    role: MessageRole
    content: str


class MessageResponse(BaseModel):
    id: UUID
    role: MessageRole
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    type: ConversationType


class ConversationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: ConversationType
    messages: list[MessageResponse]
    created_at: datetime
    ended_at: datetime | None

    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    conversation_id: UUID | None = None
    type: ConversationType
    message: str


class SendMessageResponse(BaseModel):
    conversation_id: UUID
    message: MessageResponse
