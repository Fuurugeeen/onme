import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func

from app.core.database import Base


class InsightType(str, enum.Enum):
    EFFECTIVE_QUESTION = "effective_question"
    SUCCESS_APPROACH = "success_approach"
    FAILURE_PATTERN = "failure_pattern"
    REFRAME_EXAMPLE = "reframe_example"


class InsightSource(str, enum.Enum):
    SEED = "seed"
    LEARNED = "learned"


class CoachingInsight(Base):
    """
    Coaching insights collected from user interactions.

    content example:
    {
        "question": "What animal would you compare yourself to right now? Why?",
        "approach": "Use metaphors for self-understanding",
        "description": "Helps users think about themselves in new ways"
    }

    target_profile example:
    {
        "thinking_style": "intuitive",
        "stress_response": "avoidant"
    }

    effect_metric example:
    {
        "7day_retention_lift": 0.15,
        "conversation_depth_lift": 0.12
    }
    """

    __tablename__ = "coaching_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    insight_type = Column(Enum(InsightType), nullable=False)
    content = Column(JSONB, nullable=False)
    target_profile = Column(JSONB, default={})
    context = Column(String, nullable=True)  # e.g., "onboarding", "after_failure"
    effect_metric = Column(JSONB, default={})
    sample_size = Column(Integer, default=0)
    source = Column(Enum(InsightSource), default=InsightSource.SEED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class InsightApplication(Base):
    """Log of when insights are applied to users for effect measurement."""

    __tablename__ = "insight_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    insight_id = Column(
        UUID(as_uuid=True), ForeignKey("coaching_insights.id"), nullable=False
    )
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    retention_day7 = Column(Boolean, nullable=True)  # Measured 7 days later
    conversation_depth_score = Column(Integer, nullable=True)  # 0-100
    measured_at = Column(DateTime(timezone=True), nullable=True)
