"""
Supabase client configuration and utilities for InsightEye backend.
This module provides both direct Supabase client access and integration with SQLAlchemy.
"""

import os
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from app.core.config import settings

# Global Supabase client instance
_supabase_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """
    Get or create the Supabase client instance.
    Returns None if Supabase is not configured or not enabled.
    """
    global _supabase_client

    if not settings.USE_SUPABASE or not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return None

    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )

    return _supabase_client

def get_supabase_anon_client() -> Optional[Client]:
    """
    Get Supabase client with anonymous key for frontend operations.
    """
    if not settings.USE_SUPABASE or not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        return None

    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY
    )

class SupabaseService:
    """
    Service class for Supabase operations that complement SQLAlchemy.
    Useful for real-time subscriptions, storage, and edge functions.
    """

    def __init__(self):
        self.client = get_supabase_client()

    async def setup_realtime_subscription(self, table: str, callback_func):
        """
        Set up real-time subscription for a table.
        Useful for live updates on analysis progress.
        """
        if not self.client:
            return None

        return (
            self.client.table(table)
            .on("*", callback_func)
            .subscribe()
        )

    async def upload_file(self, bucket: str, file_path: str, file_data: bytes) -> Dict[str, Any]:
        """
        Upload file to Supabase Storage.
        Useful for storing analysis reports, screenshots, etc.
        """
        if not self.client:
            return {"error": "Supabase client not configured"}

        try:
            result = self.client.storage.from_(bucket).upload(
                file_path,
                file_data,
                file_options={"cache-control": "3600", "upsert": "true"}
            )
            return {"success": True, "data": result}
        except Exception as e:
            return {"error": str(e)}

    async def get_file_url(self, bucket: str, file_path: str) -> Optional[str]:
        """
        Get public URL for a file in Supabase Storage.
        """
        if not self.client:
            return None

        try:
            result = self.client.storage.from_(bucket).get_public_url(file_path)
            return result.get("publicURL")
        except Exception as e:
            print(f"Error getting file URL: {e}")
            return None

    async def invoke_edge_function(self, function_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Invoke a Supabase Edge Function.
        Useful for serverless processing tasks.
        """
        if not self.client:
            return {"error": "Supabase client not configured"}

        try:
            result = self.client.functions.invoke(function_name, invoke_options={"body": payload})
            return {"success": True, "data": result}
        except Exception as e:
            return {"error": str(e)}

# Global service instance
supabase_service = SupabaseService()

def get_supabase_database_url() -> str:
    """
    Construct the database URL for Supabase PostgreSQL connection.
    This is used by SQLAlchemy to connect to the Supabase database.
    """
    if not settings.SUPABASE_URL:
        raise ValueError("SUPABASE_URL not configured")

    # Extract project reference from Supabase URL
    # Format: https://projectref.supabase.co
    supabase_host = settings.SUPABASE_URL.replace("https://", "").replace("http://", "")
    project_ref = supabase_host.split('.')[0]

    # You'll need to provide the database password when setting up
    # This should be set as an environment variable
    db_password = os.getenv("SUPABASE_DB_PASSWORD", "")

    if not db_password:
        raise ValueError("SUPABASE_DB_PASSWORD environment variable is required")

    # Supabase database connection format
    db_url = f"postgresql://postgres:{db_password}@db.{supabase_host}:5432/postgres"

    return db_url

def get_supabase_async_database_url() -> str:
    """
    Get async version of Supabase database URL for SQLAlchemy async operations.
    """
    db_url = get_supabase_database_url()
    return db_url.replace("postgresql://", "postgresql+asyncpg://")

# Health check function
async def check_supabase_connection() -> Dict[str, Any]:
    """
    Check if Supabase connection is working.
    """
    client = get_supabase_client()
    if not client:
        return {"status": "disabled", "message": "Supabase not configured"}

    try:
        # Try a simple query to check connection
        result = client.table("users").select("count", count="exact").limit(0).execute()
        return {"status": "connected", "message": "Supabase connection successful"}
    except Exception as e:
        return {"status": "error", "message": f"Supabase connection failed: {str(e)}"}