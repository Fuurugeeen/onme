from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class UserProfile(Base):
    """
    User profile storing thinking patterns, values, and coaching insights.

    thinking_style: {
        "logical_intuitive": 0.7,      # 0=intuitive ~ 1=logical
        "decisive_deliberate": 0.3,    # 0=decisive ~ 1=deliberate
        "optimistic_cautious": 0.5     # 0=optimistic ~ 1=cautious
    }

    motivation_drivers: {
        "achievement": 0.8,
        "recognition": 0.3,
        "growth": 0.9,
        "stability": 0.4
    }

    stress_response: {
        "pattern": "avoidant",  # avoidant/confronting/seeking_help
        "triggers": ["deadline", "comparison"],
        "coping": ["walking", "music"]
    }

    behavioral_patterns: {
        "best_time": "afternoon",
        "task_preference": "small",
        "streak_sensitivity": "high"
    }

    conversation_insights: [
        {
            "date": "2025-01-15",
            "insight": "Tends to fear failure excessively",
            "context": "When discussing new challenges"
        }
    ]
    """
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    # Thinking and behavioral patterns
    thinking_style = Column(JSONB, default={})
    motivation_drivers = Column(JSONB, default={})
    stress_response = Column(JSONB, default={})
    behavioral_patterns = Column(JSONB, default={})

    # Discovered traits
    values = Column(JSONB, default=[])  # ["freedom", "creativity", "honesty"]
    strengths_discovered = Column(JSONB, default=[])  # ["listening", "persistence"]
    growth_areas = Column(JSONB, default=[])  # ["decisiveness", "self-assertion"]

    # Insights from conversations
    conversation_insights = Column(JSONB, default=[])

    # Temporary buffer for daily analysis
    daily_observation_buffer = Column(JSONB, default=[])

    # Status
    onboarding_completed = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profile")
