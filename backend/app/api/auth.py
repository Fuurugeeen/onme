from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.schemas.user import UserResponse
from app.services.user_service import UserService

router = APIRouter()


@router.post("/sync", response_model=UserResponse)
async def sync_user(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sync Firebase user with database."""
    user_service = UserService(db)
    user = await user_service.get_or_create(
        firebase_uid=current_user["uid"],
        email=current_user.get("email"),
        name=current_user.get("name"),
    )
    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user information."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    return user
