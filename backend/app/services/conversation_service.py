from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation, ConversationType, Message, MessageRole


class ConversationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, conversation_id: UUID) -> Conversation | None:
        result = await self.db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.id == conversation_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        user_id: UUID,
        conv_type: ConversationType,
    ) -> Conversation:
        conversation = Conversation(
            user_id=user_id,
            type=conv_type,
        )
        self.db.add(conversation)
        await self.db.commit()
        await self.db.refresh(conversation)
        return conversation

    async def add_message(
        self,
        conversation_id: UUID,
        role: MessageRole,
        content: str,
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def end_conversation(self, conversation_id: UUID) -> Conversation | None:
        conversation = await self.get_by_id(conversation_id)
        if conversation:
            conversation.ended_at = datetime.utcnow()
            await self.db.commit()
            await self.db.refresh(conversation)
        return conversation

    async def get_active_conversation(
        self,
        user_id: UUID,
        conv_type: ConversationType,
    ) -> Conversation | None:
        """Get active (not ended) conversation of specific type."""
        result = await self.db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(
                Conversation.user_id == user_id,
                Conversation.type == conv_type,
                Conversation.ended_at.is_(None),
            )
            .order_by(Conversation.created_at.desc())
        )
        return result.scalar_one_or_none()

    async def get_conversation_history(
        self,
        conversation_id: UUID,
    ) -> list[dict]:
        """Get conversation messages formatted for AI context."""
        conversation = await self.get_by_id(conversation_id)
        if conversation is None:
            return []

        return [
            {"role": msg.role.value, "content": msg.content}
            for msg in conversation.messages
        ]
