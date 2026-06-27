"""Ingestion uç noktaları — core-api buradan iş tetikler, callback ile sonuç döner."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/ingestion", tags=["ingestion"])


class IngestRequest(BaseModel):
    file_id: str
    workspace_id: str
    storage_key: str
    modality: str  # document|image|handwriting|audio|video


class IngestAccepted(BaseModel):
    file_id: str
    status: str = "queued"


@router.post("/run", response_model=IngestAccepted)
async def run_ingestion(req: IngestRequest) -> IngestAccepted:
    """Pipeline'ı kuyruğa alır: parse/OCR/STT -> normalize -> chunk -> embedding.

    Gerçek implementasyon app/pipelines/ altında LangGraph ile yapılacaktır.
    """
    return IngestAccepted(file_id=req.file_id)
