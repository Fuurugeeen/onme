from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_profile import UserProfile
from app.schemas.profile import UserProfileUpdate


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_id(self, user_id: UUID) -> UserProfile | None:
        result = await self.db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def update(
        self,
        user_id: UUID,
        update_data: UserProfileUpdate,
    ) -> UserProfile | None:
        profile = await self.get_by_user_id(user_id)
        if profile is None:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None:
                if hasattr(value, "model_dump"):
                    setattr(profile, key, value.model_dump())
                else:
                    setattr(profile, key, value)

        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def complete_onboarding(self, user_id: UUID) -> UserProfile | None:
        profile = await self.get_by_user_id(user_id)
        if profile:
            profile.onboarding_completed = True
            await self.db.commit()
            await self.db.refresh(profile)
        return profile

    async def add_conversation_insight(
        self,
        user_id: UUID,
        insight: str,
        context: str,
    ) -> UserProfile | None:
        from datetime import date

        profile = await self.get_by_user_id(user_id)
        if profile:
            insights = list(profile.conversation_insights or [])
            insights.append(
                {
                    "date": date.today().isoformat(),
                    "insight": insight,
                    "context": context,
                }
            )
            # Keep only last 50 insights
            profile.conversation_insights = insights[-50:]
            await self.db.commit()
            await self.db.refresh(profile)
        return profile

    async def add_daily_observation(
        self,
        user_id: UUID,
        observation: dict,
    ) -> UserProfile | None:
        profile = await self.get_by_user_id(user_id)
        if profile:
            buffer = list(profile.daily_observation_buffer or [])
            buffer.append(observation)
            profile.daily_observation_buffer = buffer
            await self.db.commit()
            await self.db.refresh(profile)
        return profile

    async def clear_daily_observation_buffer(
        self,
        user_id: UUID,
    ) -> UserProfile | None:
        profile = await self.get_by_user_id(user_id)
        if profile:
            profile.daily_observation_buffer = []
            await self.db.commit()
            await self.db.refresh(profile)
        return profile

    async def update_profile_from_analysis(
        self,
        user_id: UUID,
        analysis: dict,
    ) -> UserProfile | None:
        """Update profile based on AI analysis results."""
        profile = await self.get_by_user_id(user_id)
        if profile is None:
            return None

        # Merge thinking_style
        if "thinking_style" in analysis:
            current = dict(profile.thinking_style or {})
            for key, value in analysis["thinking_style"].items():
                if key in current:
                    # Weighted average: 70% existing + 30% new
                    current[key] = current[key] * 0.7 + value * 0.3
                else:
                    current[key] = value
            profile.thinking_style = current

        # Merge motivation_drivers
        if "motivation_drivers" in analysis:
            current = dict(profile.motivation_drivers or {})
            for key, value in analysis["motivation_drivers"].items():
                if key in current:
                    current[key] = current[key] * 0.7 + value * 0.3
                else:
                    current[key] = value
            profile.motivation_drivers = current

        # Add new values (deduplicated)
        if "values" in analysis:
            current_values = set(profile.values or [])
            current_values.update(analysis["values"])
            profile.values = list(current_values)

        # Add new strengths (deduplicated)
        if "strengths_discovered" in analysis:
            current_strengths = set(profile.strengths_discovered or [])
            current_strengths.update(analysis["strengths_discovered"])
            profile.strengths_discovered = list(current_strengths)

        await self.db.commit()
        await self.db.refresh(profile)
        return profile
