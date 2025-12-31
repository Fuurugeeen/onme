from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.auth import get_current_user
from app.services import (
    UserService,
    ProfileService,
    TaskService,
    GeminiService,
)
from app.models.task import TaskCategory
from app.schemas.task import (
    DailyTaskResponse,
    TaskCompleteRequest,
    ProgressStatsResponse,
)

router = APIRouter()


@router.get("/today", response_model=DailyTaskResponse)
async def get_today_task(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get today's task. Creates one if not exists."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    task_service = TaskService(db)
    task = await task_service.get_today_task(user.id)

    if not task:
        # Generate new task
        profile_service = ProfileService(db)
        profile = await profile_service.get_by_user_id(user.id)

        profile_dict = {
            "thinking_style": profile.thinking_style,
            "motivation_drivers": profile.motivation_drivers,
            "behavioral_patterns": profile.behavioral_patterns,
            "values": profile.values,
        }

        gemini_service = GeminiService()

        # Choose category based on user preferences (simple rotation for MVP)
        categories = [
            TaskCategory.STUDY,
            TaskCategory.LIFESTYLE,
            TaskCategory.EXERCISE,
            TaskCategory.SELF_EXPLORATION,
        ]
        from datetime import date
        category = categories[date.today().day % len(categories)]

        task_content = await gemini_service.generate_task(
            profile_dict, category.value
        )

        task = await task_service.create_task(
            user.id, task_content, category
        )

    return task


@router.post("/{task_id}/complete", response_model=DailyTaskResponse)
async def complete_task(
    task_id: UUID,
    data: TaskCompleteRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark task as completed."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    task_service = TaskService(db)
    task = await task_service.complete_task(task_id, data.perceived_load)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.post("/{task_id}/skip", response_model=DailyTaskResponse)
async def skip_task(
    task_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Skip today's task."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    task_service = TaskService(db)
    task = await task_service.skip_task(task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.get("/progress", response_model=ProgressStatsResponse)
async def get_progress_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get progress statistics."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    task_service = TaskService(db)

    streak_days = await task_service.get_streak_days(user.id)
    completion_stats = await task_service.get_completion_stats(user.id)
    weekly_stats = await task_service.get_weekly_stats(user.id)

    return ProgressStatsResponse(
        streak_days=streak_days,
        total_completed=completion_stats["total_completed"],
        completion_rate=completion_stats["completion_rate"],
        weekly_stats=weekly_stats,
    )
