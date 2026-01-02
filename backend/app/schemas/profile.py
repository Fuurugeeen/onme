from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ThinkingStyle(BaseModel):
    logical_intuitive: float = 0.5  # 0=intuitive ~ 1=logical
    decisive_deliberate: float = 0.5  # 0=decisive ~ 1=deliberate
    optimistic_cautious: float = 0.5  # 0=optimistic ~ 1=cautious


class MotivationDrivers(BaseModel):
    achievement: float = 0.5
    recognition: float = 0.5
    growth: float = 0.5
    stability: float = 0.5


class StressResponse(BaseModel):
    pattern: str = "neutral"  # avoidant/confronting/seeking_help/neutral
    triggers: list[str] = []
    coping: list[str] = []


class BehavioralPatterns(BaseModel):
    best_time: str = "afternoon"  # morning/afternoon/evening/night
    task_preference: str = "small"  # small/medium/large
    streak_sensitivity: str = "medium"  # low/medium/high


class ConversationInsight(BaseModel):
    date: str
    insight: str
    context: str


class UserProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    thinking_style: ThinkingStyle | dict
    motivation_drivers: MotivationDrivers | dict
    stress_response: StressResponse | dict
    behavioral_patterns: BehavioralPatterns | dict
    values: list[str]
    strengths_discovered: list[str]
    growth_areas: list[str]
    conversation_insights: list[ConversationInsight] | list[dict]
    onboarding_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    thinking_style: ThinkingStyle | None = None
    motivation_drivers: MotivationDrivers | None = None
    stress_response: StressResponse | None = None
    behavioral_patterns: BehavioralPatterns | None = None
    values: list[str] | None = None
    strengths_discovered: list[str] | None = None
    growth_areas: list[str] | None = None
