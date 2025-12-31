from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, profile, conversation, tasks
from app.core.config import settings

app = FastAPI(
    title="OnMe API",
    description="Backend API for OnMe - AI Self-Coaching service",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(conversation.router, prefix="/api/conversation", tags=["conversation"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
