"""
Authentication module supporting both Auth0 and Supabase Auth.
Provides unified authentication interface for the InsightEye platform.
"""

import jwt
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.supabase_client import get_supabase_client

security = HTTPBearer()

class AuthService:
    """
    Unified authentication service supporting both Auth0 and Supabase Auth.
    """

    def __init__(self):
        self.supabase_client = get_supabase_client()

    async def verify_auth0_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Auth0 JWT token.
        """
        try:
            # For Auth0, you would typically verify the JWT here
            # This is a simplified version - in production, you'd verify the signature
            decoded_token = jwt.decode(
                token,
                options={"verify_signature": False}  # In production, verify signature!
            )
            return decoded_token
        except jwt.InvalidTokenError:
            return None

    async def verify_supabase_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Supabase JWT token.
        """
        if not self.supabase_client:
            return None

        try:
            # Supabase client can verify JWT tokens
            user = self.supabase_client.auth.get_user(token)
            if user and user.user:
                return {
                    "sub": user.user.id,
                    "email": user.user.email,
                    "email_verified": user.user.email_confirmed_at is not None,
                    "name": user.user.user_metadata.get("name", ""),
                    "picture": user.user.user_metadata.get("avatar_url", ""),
                }
        except Exception as e:
            print(f"Supabase token verification error: {e}")
            return None

    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify token using configured authentication method.
        Tries Supabase first if enabled, then falls back to Auth0.
        """
        if settings.USE_SUPABASE and self.supabase_client:
            supabase_result = await self.verify_supabase_token(token)
            if supabase_result:
                return supabase_result

        # Fallback to Auth0
        return await self.verify_auth0_token(token)

    async def get_current_user(self, token: str) -> Dict[str, Any]:
        """
        Get current user information from token.
        """
        user_data = await self.verify_token(token)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_data

# Global auth service instance
auth_service = AuthService()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    FastAPI dependency to get current authenticated user.
    """
    return await auth_service.get_current_user(credentials.credentials)

async def get_optional_current_user(
    request: Request
) -> Optional[Dict[str, Any]]:
    """
    FastAPI dependency to get current user if authenticated, None otherwise.
    Useful for endpoints that work for both authenticated and anonymous users.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "")
    try:
        return await auth_service.get_current_user(token)
    except HTTPException:
        return None

class SupabaseAuthMiddleware:
    """
    Middleware to handle Supabase authentication context.
    Sets the user context for Row Level Security policies.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Extract token from headers
            headers = dict(scope["headers"])
            auth_header = headers.get(b"authorization", b"").decode()

            if auth_header.startswith("Bearer "):
                token = auth_header.replace("Bearer ", "")
                user_data = await auth_service.verify_token(token)

                if user_data and settings.USE_SUPABASE:
                    # Set user context for Supabase RLS
                    supabase_client = get_supabase_client()
                    if supabase_client:
                        try:
                            # Set the JWT token for RLS context
                            supabase_client.auth.set_session(token)
                        except Exception as e:
                            print(f"Error setting Supabase auth context: {e}")

        await self.app(scope, receive, send)

def create_supabase_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create or update user in Supabase Auth.
    Used when migrating from Auth0 or creating new users.
    """
    supabase_client = get_supabase_client()
    if not supabase_client:
        return {"error": "Supabase not configured"}

    try:
        # Create user with email and metadata
        result = supabase_client.auth.admin.create_user({
            "email": user_data["email"],
            "password": user_data.get("password"),  # Optional for SSO users
            "email_confirm": True,
            "user_metadata": {
                "name": user_data.get("name", ""),
                "picture": user_data.get("picture", ""),
                "auth0_id": user_data.get("auth0_id"),  # For migration tracking
            }
        })
        return {"success": True, "user": result.user}
    except Exception as e:
        return {"error": str(e)}

def sync_user_to_supabase(auth0_user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sync Auth0 user to Supabase for hybrid authentication.
    """
    return create_supabase_user({
        "email": auth0_user["email"],
        "name": auth0_user.get("name", ""),
        "picture": auth0_user.get("picture", ""),
        "auth0_id": auth0_user["sub"],
    })