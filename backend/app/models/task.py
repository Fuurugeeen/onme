import enum
import uuid

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TaskCategory(str, enum.Enum):
    STUDY = "study"
    LIFESTYLE = "lifestyle"
    EXERCISE = "exercise"
    SELF_EXPLORATION = "self_exploration"


class DailyTask(Base):
    """Daily task assigned to user."""

    __tablename__ = "daily_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=False)
    category = Column(Enum(TaskCategory), nullable=False)
    date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    perceived_load = Column(Integer, nullable=True)  # 1-5
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="daily_tasks")


class ActionLog(Base):
    """Log of user actions for analysis."""

    __tablename__ = "action_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    task_id = Column(UUID(as_uuid=True), ForeignKey("daily_tasks.id"), nullable=True)
    executed = Column(Boolean, nullable=False)
    perceived_load = Column(Integer, nullable=True)  # 1-5
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="action_logs")
