"""Application settings, loaded from environment variables / backend/.env."""

from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/.env  (resolved relative to this file, so it works from any CWD)
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Gemini Settings
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-1.5-flash"

    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    max_upload_mb: int = 8

    @property
    def use_mock(self) -> bool:
        """Determines if we should use local logic fallback."""
        return not bool(self.gemini_api_key)

    @property
    def origins(self) -> List[str]:
        """CORS origins as a clean list."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


settings = Settings()


@lru_cache
def get_settings() -> Settings:
    return Settings()
