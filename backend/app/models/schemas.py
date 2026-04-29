from pydantic import BaseModel, Field
from typing import Literal, Optional, List

class Citation(BaseModel):
    page_number: int
    section_hint: str
    chunk_id: str
    relevance_score: float
    excerpt: str

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    citations: List[Citation] = []
    is_refusal: bool = False
    refusal_reason: Optional[Literal[
        "out_of_scope", "low_confidence", 
        "no_pdf_loaded", "small_talk"
    ]] = None
    confidence: float = 0.0
    timestamp: str

class PDFMetadata(BaseModel):
    filename: str
    page_count: int
    chunk_count: int
    loaded_at: str

class PDFUploadResponse(BaseModel):
    conversation_id: str
    filename: str
    page_count: int
    chunk_count: int
    message: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    conversation_id: str

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]
    is_refusal: bool
    refusal_reason: Optional[str] = None
    confidence: float
    conversation_id: str
    message_index: int

class HistoryResponse(BaseModel):
    messages: List[ChatMessage]
    pdf_metadata: PDFMetadata

class HealthResponse(BaseModel):
    status: str
    model: str
    embedding_model: str
    active_sessions: int
    timestamp: str

class ErrorResponse(BaseModel):
    detail: str
    code: str
