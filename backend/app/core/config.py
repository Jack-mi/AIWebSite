import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "InsightEye"

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",  # Frontend dev server
        "http://localhost:8000",  # Backend dev server
        "https://insighteye.vercel.app",  # Production frontend
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Trusted hosts
    ALLOWED_HOSTS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/insighteye"
    )

    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_DB_PASSWORD: str = os.getenv("SUPABASE_DB_PASSWORD", "")
    USE_SUPABASE: bool = os.getenv("USE_SUPABASE", "false").lower() == "true"

    # Redis
    REDIS_URL: str = os.getenv(
        "REDIS_URL",
        "redis://localhost:6379"
    )

    # OpenRouter API
    OPENROUTER_API_KEY: str = os.getenv(
        "OPENROUTER_API_KEY",
        ""
    )
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # Auth0
    AUTH0_DOMAIN: str = os.getenv("AUTH0_DOMAIN", "")
    AUTH0_CLIENT_ID: str = os.getenv("AUTH0_CLIENT_ID", "")
    AUTH0_CLIENT_SECRET: str = os.getenv("AUTH0_CLIENT_SECRET", "")
    AUTH0_SECRET: str = os.getenv("AUTH0_SECRET", "")
    AUTH0_BASE_URL: str = os.getenv("AUTH0_BASE_URL", "")
    AUTH0_ISSUER_BASE_URL: str = os.getenv("AUTH0_ISSUER_BASE_URL", "")

    # External APIs
    SIMILARWEB_API_KEY: str = os.getenv("SIMILARWEB_API_KEY", "")
    AHREFS_API_KEY: str = os.getenv("AHREFS_API_KEY", "")
    GOOGLE_ANALYTICS_CLIENT_ID: str = os.getenv("GOOGLE_ANALYTICS_CLIENT_ID", "")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 100

    # Celery
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

    # Frontend
    NEXT_PUBLIC_API_URL: str = os.getenv("NEXT_PUBLIC_API_URL", "")

    class Config:
        case_sensitive = True
        env_file = "../.env"

settings = Settings()