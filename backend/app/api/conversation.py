from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.auth import get_current_user
from app.services import (
    UserService,
    ProfileService,
    ConversationService,
    TaskService,
    GeminiService,
)
from app.models.conversation import ConversationType, MessageRole
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
    SendMessageRequest,
    SendMessageResponse,
    MessageResponse,
)

router = APIRouter()


@router.post("/start", response_model=ConversationResponse)
async def start_conversation(
    data: ConversationCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a new conversation."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    conversation_service = ConversationService(db)
    profile_service = ProfileService(db)
    gemini_service = GeminiService()

    # Get user profile
    profile = await profile_service.get_by_user_id(user.id)

    # Create new conversation
    conv_type = ConversationType(data.type.value)
    conversation = await conversation_service.create(user.id, conv_type)

    # Generate initial greeting based on conversation type
    profile_dict = {
        "thinking_style": profile.thinking_style,
        "motivation_drivers": profile.motivation_drivers,
        "stress_response": profile.stress_response,
        "behavioral_patterns": profile.behavioral_patterns,
        "values": profile.values,
        "strengths_discovered": profile.strengths_discovered,
        "onboarding_completed": profile.onboarding_completed,
    }

    if data.type.value == "onboarding":
        greeting = await gemini_service.generate_onboarding_response(
            [], profile_dict
        )
    else:
        # Get today's task for daily coaching
        task_service = TaskService(db)
        today_task = await task_service.get_today_task(user.id)
        task_dict = None
        if today_task:
            task_dict = {
                "content": today_task.content,
                "category": today_task.category.value,
                "completed": today_task.completed,
            }

        greeting = await gemini_service.generate_daily_coach_response(
            [], profile_dict, task_dict
        )

    # Add greeting message
    message = await conversation_service.add_message(
        conversation.id, MessageRole.ASSISTANT, greeting
    )

    # Refresh to get messages
    conversation = await conversation_service.get_by_id(conversation.id)

    return conversation


@router.post("/message", response_model=SendMessageResponse)
async def send_message(
    data: SendMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message and get AI response."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    conversation_service = ConversationService(db)
    profile_service = ProfileService(db)
    gemini_service = GeminiService()

    # Get or create conversation
    if data.conversation_id:
        conversation = await conversation_service.get_by_id(data.conversation_id)
        if not conversation or conversation.user_id != user.id:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv_type = ConversationType(data.type.value)
        conversation = await conversation_service.create(user.id, conv_type)

    # Add user message
    await conversation_service.add_message(
        conversation.id, MessageRole.USER, data.message
    )

    # Get conversation history
    history = await conversation_service.get_conversation_history(conversation.id)

    # Get user profile
    profile = await profile_service.get_by_user_id(user.id)
    profile_dict = {
        "thinking_style": profile.thinking_style,
        "motivation_drivers": profile.motivation_drivers,
        "stress_response": profile.stress_response,
        "behavioral_patterns": profile.behavioral_patterns,
        "values": profile.values,
        "strengths_discovered": profile.strengths_discovered,
        "onboarding_completed": profile.onboarding_completed,
    }

    # Generate AI response
    if data.type.value == "onboarding":
        response_text = await gemini_service.generate_onboarding_response(
            history, profile_dict
        )
    else:
        task_service = TaskService(db)
        today_task = await task_service.get_today_task(user.id)
        task_dict = None
        if today_task:
            task_dict = {
                "content": today_task.content,
                "category": today_task.category.value,
                "completed": today_task.completed,
            }

        response_text = await gemini_service.generate_daily_coach_response(
            history, profile_dict, task_dict
        )

    # Add AI response
    ai_message = await conversation_service.add_message(
        conversation.id, MessageRole.ASSISTANT, response_text
    )

    return SendMessageResponse(
        conversation_id=conversation.id,
        message=MessageResponse(
            id=ai_message.id,
            role=ai_message.role,
            content=ai_message.content,
            created_at=ai_message.created_at,
        ),
    )


@router.post("/{conversation_id}/end", response_model=ConversationResponse)
async def end_conversation(
    conversation_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """End a conversation and trigger analysis."""
    user_service = UserService(db)
    user = await user_service.get_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    conversation_service = ConversationService(db)
    conversation = await conversation_service.get_by_id(conversation_id)

    if not conversation or conversation.user_id != user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Analyze conversation and update profile
    gemini_service = GeminiService()
    profile_service = ProfileService(db)

    history = await conversation_service.get_conversation_history(conversation_id)
    analysis = await gemini_service.analyze_conversation(history)

    if analysis:
        await profile_service.update_profile_from_analysis(user.id, analysis)
        if "insight" in analysis:
            await profile_service.add_conversation_insight(
                user.id,
                analysis["insight"],
                f"{conversation.type.value} conversation",
            )

    # End conversation
    conversation = await conversation_service.end_conversation(conversation_id)

    return conversation
