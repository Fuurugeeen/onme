from datetime import date, datetime, timedelta
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import ActionLog, DailyTask, TaskCategory


class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_today_task(self, user_id: UUID) -> DailyTask | None:
        today = date.today()
        result = await self.db.execute(
            select(DailyTask).where(
                DailyTask.user_id == user_id,
                DailyTask.date == today,
            )
        )
        return result.scalar_one_or_none()

    async def create_task(
        self,
        user_id: UUID,
        content: str,
        category: TaskCategory,
        task_date: date | None = None,
    ) -> DailyTask:
        task = DailyTask(
            user_id=user_id,
            content=content,
            category=category,
            date=task_date or date.today(),
        )
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def complete_task(
        self,
        task_id: UUID,
        perceived_load: int,
    ) -> DailyTask | None:
        result = await self.db.execute(select(DailyTask).where(DailyTask.id == task_id))
        task = result.scalar_one_or_none()

        if task:
            task.completed = True
            task.perceived_load = perceived_load
            task.completed_at = datetime.utcnow()

            # Create action log
            log = ActionLog(
                user_id=task.user_id,
                task_id=task.id,
                executed=True,
                perceived_load=perceived_load,
            )
            self.db.add(log)

            await self.db.commit()
            await self.db.refresh(task)

        return task

    async def skip_task(self, task_id: UUID) -> DailyTask | None:
        result = await self.db.execute(select(DailyTask).where(DailyTask.id == task_id))
        task = result.scalar_one_or_none()

        if task:
            # Create action log for skipped task
            log = ActionLog(
                user_id=task.user_id,
                task_id=task.id,
                executed=False,
            )
            self.db.add(log)
            await self.db.commit()

        return task

    async def get_streak_days(self, user_id: UUID) -> int:
        """Calculate consecutive days of task completion."""
        today = date.today()
        streak = 0
        check_date = today

        while True:
            result = await self.db.execute(
                select(DailyTask).where(
                    DailyTask.user_id == user_id,
                    DailyTask.date == check_date,
                    DailyTask.completed.is_(True),
                )
            )
            task = result.scalar_one_or_none()

            if task:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                # If today's task exists but not completed, don't break yet
                if check_date == today:
                    check_date -= timedelta(days=1)
                    continue
                break

        return streak

    async def get_completion_stats(self, user_id: UUID) -> dict:
        """Get overall completion statistics."""
        # Total completed
        result = await self.db.execute(
            select(func.count(DailyTask.id)).where(
                DailyTask.user_id == user_id,
                DailyTask.completed.is_(True),
            )
        )
        total_completed = result.scalar() or 0

        # Total tasks
        result = await self.db.execute(
            select(func.count(DailyTask.id)).where(DailyTask.user_id == user_id)
        )
        total_tasks = result.scalar() or 0

        completion_rate = total_completed / total_tasks if total_tasks > 0 else 0

        return {
            "total_completed": total_completed,
            "total_tasks": total_tasks,
            "completion_rate": completion_rate,
        }

    async def get_weekly_stats(self, user_id: UUID) -> list[dict]:
        """Get stats for the last 7 days."""
        today = date.today()
        stats = []

        for i in range(7):
            check_date = today - timedelta(days=6 - i)
            result = await self.db.execute(
                select(DailyTask).where(
                    DailyTask.user_id == user_id,
                    DailyTask.date == check_date,
                )
            )
            tasks = result.scalars().all()

            completed = sum(1 for t in tasks if t.completed)
            total = len(tasks)

            stats.append(
                {
                    "date": check_date.isoformat(),
                    "completed": completed,
                    "total": total if total > 0 else 1,  # Avoid division issues
                }
            )

        return stats
