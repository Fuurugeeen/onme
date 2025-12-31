from pydantic import BaseModel
from datetime import datetime, date
from uuid import UUID
from typing import List, Optional
from enum import Enum


class TaskCategory(str, Enum):
    STUDY = "study"
    LIFESTYLE = "lifestyle"
    EXERCISE = "exercise"
    SELF_EXPLORATION = "self_exploration"


class DailyTaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    content: str
    category: TaskCategory
    date: date
    completed: bool
    perceived_load: Optional[int]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class TaskCompleteRequest(BaseModel):
    perceived_load: int  # 1-5


class WeeklyStat(BaseModel):
    date: str
    completed: int
    total: int


class ProgressStatsResponse(BaseModel):
    streak_days: int
    total_completed: int
    completion_rate: float
    weekly_stats: List[WeeklyStat]
