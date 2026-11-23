"""Application settings, loaded from environment variables / backend/.env."""

from functools import lru_cache
from pathlib import Path
from typing import List, Optional
import os
from dotenv import dotenv_values
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/.env  (resolved relative to this file, so it works from any CWD)
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

# Explicitly load .env file values and override any stale system env vars
_file_env = dotenv_values(ENV_FILE) if ENV_FILE.exists() else {}
if _file_env.get("GEMINI_API_KEY"):
    os.environ["GEMINI_API_KEY"] = _file_env["GEMINI_API_KEY"]
if _file_env.get("GEMINI_MODEL"):
    os.environ["GEMINI_MODEL"] = _file_env["GEMINI_MODEL"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Gemini Settings
    gemini_api_key: Optional[str] = _file_env.get("GEMINI_API_KEY")
    gemini_model: str = _file_env.get("GEMINI_MODEL") or "gemini-3.5-flash"
    request_timeout_s: int = int(_file_env.get("REQUEST_TIMEOUT_S") or 60)

    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    max_upload_mb: int = int(_file_env.get("MAX_UPLOAD_MB") or 8)

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
