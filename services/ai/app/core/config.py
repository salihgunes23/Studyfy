"""Ortam yapılandırması (pydantic-settings)."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"

    # Vektör & gateway
    qdrant_url: str = "http://localhost:6333"
    litellm_base_url: str = "http://localhost:4000"

    # Model yönlendirme (güncel Claude model ID'lerini Claude API reference'ından doğrula)
    reasoning_model: str = "claude-sonnet"
    cheap_model: str = "gemini-flash"
    vision_model: str = "gpt-4o"
    embedding_model: str = "bge-m3"
    embedding_dim: int = 1024

    # STT
    whisper_model: str = "large-v3"
    whisper_device: str = "cuda"

    # Guardrail: retrieval boş/zayıfsa üretimi durdur
    retrieval_min_score: float = 0.2


settings = Settings()
