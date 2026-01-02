from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

security = HTTPBearer(auto_error=not settings.MOCK_MODE)


# Initialize Firebase Admin only if not in mock mode
if not settings.MOCK_MODE:
    import firebase_admin
    from firebase_admin import credentials

    if not firebase_admin._apps:
        if settings.GOOGLE_APPLICATION_CREDENTIALS:
            cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """Verify Firebase ID token and return user info."""

    # Mock mode: return mock user
    if settings.MOCK_MODE:
        # Allow custom mock user ID via token or use default
        mock_uid = "mock-user-001"
        if credentials and credentials.credentials:
            # Use token as mock user ID if provided
            mock_uid = (
                credentials.credentials
                if credentials.credentials != "mock"
                else mock_uid
            )

        return {
            "uid": mock_uid,
            "email": f"{mock_uid}@example.com",
            "name": "Mock User",
        }

    # Production mode: verify Firebase token
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        from firebase_admin import auth

        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name"),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        ) from e
