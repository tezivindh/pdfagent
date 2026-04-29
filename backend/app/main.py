import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.services.embedding_service import EmbeddingService
from app.session.session_store import session_store
from app.routes.pdf_routes import router as pdf_router
from app.routes.chat_routes import router as chat_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Startup] Warming up embedding model...")
    EmbeddingService.get_instance()
    print("[Startup] Embedding model ready.")

    async def cleanup_loop():
        while True:
            await asyncio.sleep(30 * 60)
            session_store.cleanup_expired()

    task = asyncio.create_task(cleanup_loop())
    print("[Startup] Session cleanup task running.")
    print("[Startup] Server ready.")

    yield

    task.cancel()
    print("[Shutdown] Goodbye.")

app = FastAPI(
    title="PDF Conversational Agent",
    description="Chat with any PDF — grounded, cited, zero hallucination.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pdf_router)
app.include_router(chat_router)

@app.get("/health")
async def root_health():
    return {
        "status": "ok",
        "model": settings.groq_model,
        "embedding_model": settings.embedding_model,
        "active_sessions": session_store.active_count(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
