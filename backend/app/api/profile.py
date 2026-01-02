from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.schemas.profile import UserProfileResponse, UserProfileUpdate
from app.services.profile_service import ProfileService
from app.services.user_service import UserService

router = APIRouter()


@router.get("", response_model=UserProfileResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's profile."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile_service = ProfileService(db)
    profile = await profile_service.get_by_user_id(user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.patch("", response_model=UserProfileResponse)
async def update_profile(
    update_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user's profile."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile_service = ProfileService(db)
    profile = await profile_service.update(user.id, update_data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.post("/complete-onboarding", response_model=UserProfileResponse)
async def complete_onboarding(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark onboarding as completed."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile_service = ProfileService(db)
    profile = await profile_service.complete_onboarding(user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile
