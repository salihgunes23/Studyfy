"""Studfy AI servisi — FastAPI giriş noktası.

Sorumluluklar (bkz. docs/ARCHITECTURE.md §2, docs/AI_PROMPTS.md):
  - Ingestion: parse / OCR / STT -> normalize -> chunk -> embedding
  - RAG sorgu pipeline'ı (LangGraph) — guardrail'lı, atıf zorunlu
  - Test üretimi (grounding + verifier)
  - 3 katmanlı içerik üretimi + TTS
"""

from fastapi import FastAPI

from app.core.config import settings
from app.routers import health, ingestion, rag

app = FastAPI(
    title="Studfy AI Service",
    version="0.1.0",
    description="Zero-hallucination RAG ve multimodal ingestion pipeline'ları.",
)

app.include_router(health.router)
app.include_router(ingestion.router)
app.include_router(rag.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "studfy-ai", "env": settings.environment}
