from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.user import User
from app.models.user_profile import UserProfile


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_firebase_uid(self, firebase_uid: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.firebase_uid == firebase_uid)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def create(
        self,
        firebase_uid: str,
        email: str | None = None,
        name: str | None = None,
    ) -> User:
        user = User(
            firebase_uid=firebase_uid,
            email=email,
            name=name,
        )
        self.db.add(user)
        await self.db.flush()

        # Create default profile
        profile = UserProfile(
            user_id=user.id,
            thinking_style={
                "logical_intuitive": 0.5,
                "decisive_deliberate": 0.5,
                "optimistic_cautious": 0.5,
            },
            motivation_drivers={
                "achievement": 0.5,
                "recognition": 0.5,
                "growth": 0.5,
                "stability": 0.5,
            },
            stress_response={
                "pattern": "neutral",
                "triggers": [],
                "coping": [],
            },
            behavioral_patterns={
                "best_time": "afternoon",
                "task_preference": "small",
                "streak_sensitivity": "medium",
            },
            values=[],
            strengths_discovered=[],
            growth_areas=[],
            conversation_insights=[],
        )
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def get_or_create(
        self,
        firebase_uid: str,
        email: str | None = None,
        name: str | None = None,
    ) -> User:
        user = await self.get_by_firebase_uid(firebase_uid)
        if user is None:
            user = await self.create(firebase_uid, email, name)
        return user

    async def update_fcm_token(self, user_id: UUID, fcm_token: str) -> User:
        user = await self.get_by_id(user_id)
        if user:
            user.fcm_token = fcm_token
            await self.db.commit()
            await self.db.refresh(user)
        return user
