from app.services.user_service import UserService
from app.services.profile_service import ProfileService
from app.services.conversation_service import ConversationService
from app.services.task_service import TaskService
from app.core.config import settings

# Use mock service in mock mode
if settings.MOCK_MODE:
    from app.services.mock_gemini_service import MockGeminiService as GeminiService
else:
    from app.services.gemini_service import GeminiService

__all__ = [
    "UserService",
    "ProfileService",
    "ConversationService",
    "TaskService",
    "GeminiService",
]
