import os
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="Personal Knowledge AI API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")
    backend_cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        alias="BACKEND_CORS_ORIGINS",
    )

    upload_dir: str = Field(
        default_factory=lambda: os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads"),
        alias="UPLOAD_DIR",
    )
    max_upload_size_mb: int = Field(default=20, alias="MAX_UPLOAD_SIZE_MB")
    db_path: str = Field(
        default_factory=lambda: os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "ingestion.db"),
        alias="DB_PATH",
    )

    database_url: str = Field(default="", alias="DATABASE_URL", validation_alias="neon_conn_string")
    supabase_anon_key: str = Field(default="", alias="SUPABASE_ANON_KEY", validation_alias="anon_key")
    supabase_service_role_key: str = Field(
        default="",
        alias="SUPABASE_SERVICE_ROLE_KEY",
        validation_alias="service_role_key",
    )
    supabase_jwt_secret: str = Field(default="", alias="SUPABASE_JWT_SECRET", validation_alias="jwt_secret")

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value
        if not value:
            return ["http://localhost:5173"]
        return [origin.strip() for origin in value.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
