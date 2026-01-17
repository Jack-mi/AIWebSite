from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import asyncpg
from app.core.config import settings

# Determine database URL based on configuration
def get_database_url():
    if settings.USE_SUPABASE and settings.SUPABASE_URL:
        from app.core.supabase_client import get_supabase_database_url
        return get_supabase_database_url()
    return settings.DATABASE_URL

def get_async_database_url():
    if settings.USE_SUPABASE and settings.SUPABASE_URL:
        from app.core.supabase_client import get_supabase_async_database_url
        return get_supabase_async_database_url()
    db_url = get_database_url()
    return db_url.replace("postgresql://", "postgresql+asyncpg://")

# Convert PostgreSQL URL for async
ASYNC_DATABASE_URL = get_async_database_url()

# Create async engine
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,
    future=True
)

# Create sync engine for migrations
sync_engine = create_engine(get_database_url())

# Create session makers
AsyncSessionLocal = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

# Create base class for models
Base = declarative_base()

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Initialize database
async def init_db():
    async with async_engine.begin() as conn:
        # Import all models here to ensure they are registered
        from app.models import website, analysis, user

        # Create all tables
        await conn.run_sync(Base.metadata.create_all)