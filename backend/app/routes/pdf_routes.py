import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import PDFUploadResponse, PDFMetadata, HealthResponse, ErrorResponse
from app.services.pdf_service import pdf_service
from app.services.text_service import text_service
from app.services.embedding_service import EmbeddingService
from app.services.vector_store_service import vector_store_service
from app.session.session_store import session_store
from app.config import settings

router = APIRouter(prefix="/api/pdf", tags=["PDF"])

ACCEPTED_TYPES = {
    "application/pdf",
    "text/plain",
    "application/octet-stream",  # Some browsers send this for .txt
}

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    if ext not in (".pdf", ".txt"):
        raise HTTPException(
            400,
            "Only PDF (.pdf) and plain-text (.txt) files are accepted"
        )

    content = await file.read()
    max_bytes = settings.max_pdf_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(413, f"File exceeds {settings.max_pdf_size_mb}MB limit")

    tmp_filename = f"{uuid.uuid4()}_{filename}"
    tmp_path = os.path.join(UPLOAD_DIR, tmp_filename)
    with open(tmp_path, "wb") as f:
        f.write(content)

    try:
        # Branch on file type — both services return identical chunk dicts
        if ext == ".pdf":
            pages = pdf_service.extract_pages(tmp_path)
            if not pages:
                raise HTTPException(422, "Could not extract text from PDF")
            chunks = pdf_service.chunk_document(pages)
            page_count = pdf_service.get_page_count(tmp_path)
        else:  # .txt
            pages = text_service.extract_pages(tmp_path)
            if not pages:
                raise HTTPException(422, "The text file appears to be empty")
            chunks = text_service.chunk_document(pages)
            page_count = len(pages)  # txt treated as 1 "page"

        embeddings = EmbeddingService.get_instance().get_embeddings()
        faiss_store = vector_store_service.build_store(chunks, embeddings)

        doc_metadata = PDFMetadata(
            filename=filename,
            page_count=page_count,
            chunk_count=len(chunks),
            loaded_at=datetime.now(timezone.utc).isoformat()
        )

        conversation_id = session_store.create_session(
            doc_metadata, faiss_store, chunks
        )

        file_type = "PDF" if ext == ".pdf" else "Text"
        print(f"[Upload] {file_type}: {filename} | pages={page_count} | chunks={len(chunks)}")

        return PDFUploadResponse(
            conversation_id=conversation_id,
            filename=filename,
            page_count=page_count,
            chunk_count=len(chunks),
            message=f"{file_type} processed successfully. {len(chunks)} chunks indexed."
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
