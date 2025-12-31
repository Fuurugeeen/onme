from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import List, Optional


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
    triggers: List[str] = []
    coping: List[str] = []


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
    values: List[str]
    strengths_discovered: List[str]
    growth_areas: List[str]
    conversation_insights: List[ConversationInsight] | List[dict]
    onboarding_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    thinking_style: Optional[ThinkingStyle] = None
    motivation_drivers: Optional[MotivationDrivers] = None
    stress_response: Optional[StressResponse] = None
    behavioral_patterns: Optional[BehavioralPatterns] = None
    values: Optional[List[str]] = None
    strengths_discovered: Optional[List[str]] = None
    growth_areas: Optional[List[str]] = None
