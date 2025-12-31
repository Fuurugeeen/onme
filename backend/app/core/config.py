from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/onme"

    # Gemini API
    GEMINI_API_KEY: str = ""

    # Firebase
    FIREBASE_PROJECT_ID: str = ""
    GOOGLE_APPLICATION_CREDENTIALS: str = ""

    # App
    SECRET_KEY: str = "your-secret-key-here"
    ENVIRONMENT: str = "development"

    # Mock mode - set to true to bypass external services
    MOCK_MODE: bool = True

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
