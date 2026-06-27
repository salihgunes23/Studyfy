"""RAG sorgu uç noktası — guardrail'lı, atıf zorunlu (zero-hallucination)."""

from fastapi import APIRouter
from pydantic import BaseModel

from app.pipelines.guardrail import GuardrailDecision, retrieval_guardrail

router = APIRouter(prefix="/rag", tags=["rag"])


class RagQuery(BaseModel):
    workspace_id: str
    query: str
    top_k: int = 10


class RetrievedChunk(BaseModel):
    chunk_id: str
    score: float


class RagResponse(BaseModel):
    answer: str | None
    citations: list[str]
    refused: bool


@router.post("/query", response_model=RagResponse)
async def rag_query(q: RagQuery) -> RagResponse:
    """Hibrit retrieve -> guardrail -> generate -> citation verify.

    Bu iskelet yalnızca guardrail kapısının davranışını gösterir; tam pipeline
    docs/AI_PROMPTS.md §RAG ve §Guardrail doğrultusunda inşa edilir.
    """
    retrieved: list[RetrievedChunk] = []  # TODO: Qdrant + BM25 hibrit arama
    decision = retrieval_guardrail([c.score for c in retrieved])

    if decision is GuardrailDecision.REFUSE:
        return RagResponse(
            answer="Kaynaklarında bu bilgi yok. Lütfen ilgili dökümanı yükle.",
            citations=[],
            refused=True,
        )

    # TODO: LLM generate (yalnız retrieved context) + citation verifier
    return RagResponse(answer=None, citations=[], refused=False)
