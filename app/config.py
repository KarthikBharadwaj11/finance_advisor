from pathlib import Path
from typing import Literal

from pydantic import PostgresDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # LLM
    OPENAI_API_KEY: SecretStr
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_TEMPERATURE: float = 0.0

    # Database
    DATABASE_URL: PostgresDsn

    # Vector store
    FAISS_INDEX_PATH: Path = Path("faiss_index")

    # Application
    LOG_LEVEL: str = "INFO"
    LOG_RENDERER: Literal["json", "console"] = "json"
    MAX_AGENT_ITERATIONS: int = 10
    AGENT_TIMEOUT_SECONDS: int = 60
    CORS_ORIGINS: list[str] = []

    # Security
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440


settings = Settings()
