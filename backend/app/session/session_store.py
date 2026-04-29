import uuid
from datetime import datetime, timedelta, timezone
from threading import Lock
from langchain_community.vectorstores import FAISS
from app.models.schemas import ChatMessage, PDFMetadata
from app.config import settings

class ConversationSession:
    def __init__(
        self,
        conversation_id: str,
        pdf_metadata: PDFMetadata,
        faiss_store: FAISS,
        chunks: list[dict],
    ):
        self.conversation_id = conversation_id
        self.pdf_metadata = pdf_metadata
        self.faiss_store = faiss_store
        self.chunks = chunks
        self.messages: list[ChatMessage] = []
        self.last_active: datetime = datetime.now(timezone.utc)
        self._lock = Lock()

class SessionStore:
    def __init__(self):
        self._sessions: dict[str, ConversationSession] = {}
        self._lock = Lock()

    def create_session(
        self,
        pdf_metadata: PDFMetadata,
        faiss_store: FAISS,
        chunks: list[dict]
    ) -> str:
        conversation_id = str(uuid.uuid4())
        session = ConversationSession(conversation_id, pdf_metadata, faiss_store, chunks)
        with self._lock: 
            self._sessions[conversation_id] = session
        print(f"[Session] Created: {conversation_id[:8]}... | PDF: {pdf_metadata.filename}")
        return conversation_id

    def get_session(
        self, 
        conversation_id: str
    ) -> ConversationSession | None:
        session = self._sessions.get(conversation_id)
        if session:
            session.last_active = datetime.now(timezone.utc)
        return session

    def add_message(
        self, 
        conversation_id: str, 
        message: ChatMessage
    ) -> None:
        session = self._sessions.get(conversation_id)
        if session:
            with session._lock:
                session.messages.append(message)
                session.last_active = datetime.now(timezone.utc)

    def delete_session(self, conversation_id: str) -> bool:
        with self._lock:
            if conversation_id in self._sessions:
                del self._sessions[conversation_id]
                return True
        return False

    def cleanup_expired(self) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=settings.session_ttl_hours)
        expired = [
            cid for cid, s in self._sessions.items() 
            if s.last_active < cutoff
        ]
        with self._lock:
            for cid in expired:
                del self._sessions[cid]
        if expired:
            print(f"[Session] Cleaned up {len(expired)} expired sessions")
        return len(expired)

    def active_count(self) -> int:
        return len(self._sessions)

session_store = SessionStore()
