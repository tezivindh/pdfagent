import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import PDFUploadResponse, PDFMetadata, HealthResponse, ErrorResponse
from app.services.pdf_service import pdf_service
from app.services.embedding_service import EmbeddingService
from app.services.vector_store_service import vector_store_service
from app.session.session_store import session_store
from app.config import settings

router = APIRouter(prefix="/api/pdf", tags=["PDF"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files are accepted")

    content = await file.read()
    max_bytes = settings.max_pdf_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(413, f"File exceeds {settings.max_pdf_size_mb}MB limit")

    tmp_filename = f"{uuid.uuid4()}_{file.filename}"
    tmp_path = os.path.join(UPLOAD_DIR, tmp_filename)
    with open(tmp_path, "wb") as f:
        f.write(content)

    try:
        pages = pdf_service.extract_pages(tmp_path)
        if not pages:
            raise HTTPException(422, "Could not extract text from PDF")
        
        chunks = pdf_service.chunk_document(pages)
        page_count = pdf_service.get_page_count(tmp_path)
        
        embeddings = EmbeddingService.get_instance().get_embeddings()
        faiss_store = vector_store_service.build_store(chunks, embeddings)
        
        pdf_metadata = PDFMetadata(
            filename=file.filename,
            page_count=page_count,
            chunk_count=len(chunks),
            loaded_at=datetime.now(timezone.utc).isoformat()
        )
        
        conversation_id = session_store.create_session(
            pdf_metadata, faiss_store, chunks
        )
        
        print(f"[PDF Upload] {file.filename} | pages={page_count} | chunks={len(chunks)}")
        
        return PDFUploadResponse(
            conversation_id=conversation_id,
            filename=file.filename,
            page_count=page_count,
            chunk_count=len(chunks),
            message=f"PDF processed successfully. {len(chunks)} chunks indexed."
        )
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.get("/info/{conversation_id}", response_model=PDFMetadata)
async def get_pdf_info(conversation_id: str):
    session = session_store.get_session(conversation_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return session.pdf_metadata

@router.delete("/{conversation_id}")
async def delete_session(conversation_id: str):
    deleted = session_store.delete_session(conversation_id)
    if not deleted:
        raise HTTPException(404, "Session not found")
    return {"deleted": True, "conversation_id": conversation_id}

@router.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        model=settings.groq_model,
        embedding_model=settings.embedding_model,
        active_sessions=session_store.active_count(),
        timestamp=datetime.now(timezone.utc).isoformat()
    )
