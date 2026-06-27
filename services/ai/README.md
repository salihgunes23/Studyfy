# studfy-ai

Studfy AI servisi — **Python 3.11 + FastAPI + LangGraph + LlamaIndex**.
Multimodal ingestion (OCR/STT), guardrail'lı RAG, test üretimi (grounding + verifier),
3 katmanlı içerik ve TTS pipeline'ları.

## Geliştirme
```bash
cd services/ai
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000           # http://localhost:8000/docs
pytest -q
```

## Yapı
- `app/routers/` — HTTP uç noktaları (health, ingestion, rag).
- `app/pipelines/` — ingestion & RAG graph'ları, guardrail'lar.
- `app/core/` — yapılandırma, LLM gateway (LiteLLM) istemcileri.

Prompt'lar ve guardrail tasarımı: [docs/AI_PROMPTS.md](../../docs/AI_PROMPTS.md).
