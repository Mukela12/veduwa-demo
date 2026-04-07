from __future__ import annotations
from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "Veduwa API"
    environment: str = "development"
    api_prefix: str = "/api"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/veduwa_demo"
    redis_url: str = "redis://localhost:6379/0"
    anthropic_api_key: str | None = None
    resend_api_key: str | None = None
    email_from: str = "Veduwa <noreply@fluxium.dev>"
    public_app_url: str = "http://localhost:3099"
    cloudinary_url: str | None = None
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None
    cloudinary_folder: str = "veduwa-demo"
    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_jwt_secret: str | None = None
    cors_origins: str = "http://localhost:3000,http://localhost:3099"
    demo_auth: bool = False
    sql_echo: bool = False
    upload_dir: str = "uploads/resumes"
    anthropic_fast_model: str = "claude-haiku-4-5-20251001"
    anthropic_smart_model: str = "claude-sonnet-4-20250514"
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    local_embeddings_enabled: bool = True

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value and value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
