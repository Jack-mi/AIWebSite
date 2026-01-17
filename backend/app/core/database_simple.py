"""
Simplified database configuration for Supabase
Uses Supabase REST API instead of direct PostgreSQL connection
"""
from app.core.config import settings
from app.core.supabase_client import get_supabase_client

# Simple database initialization for Supabase mode
async def init_db():
    """Initialize database - simplified for Supabase"""
    if settings.USE_SUPABASE:
        # Just verify Supabase connection
        try:
            supabase = get_supabase_client()
            # Test connection with a simple query
            result = supabase.table('websites').select('*').limit(1).execute()
            print(f"✅ Supabase connected successfully")
            return True
        except Exception as e:
            print(f"⚠️  Supabase connection warning: {e}")
            print("Database tables may need to be created manually")
            return False
    else:
        print("⚠️  Using Supabase mode, skipping traditional database setup")
        return True

# Dependency to get Supabase client
def get_db():
    """Get Supabase client for database operations"""
    return get_supabase_client()