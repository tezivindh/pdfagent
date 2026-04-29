import re
from datetime import datetime, timezone
from app.config import settings
from app.models.schemas import ChatRequest, ChatResponse, ChatMessage, Citation
from app.services.embedding_service import EmbeddingService
from app.services.vector_store_service import vector_store_service
from app.services.groq_service import groq_service
from app.session.session_store import session_store

SMALL_TALK_PATTERNS = [
    r"^(hi|hello|hey|sup|yo)\b",
    r"^how are you",
    r"^what('s| is) up",
    r"^good\s+(morning|evening|afternoon|night)",
    r"^who are you",
    r"^what are you",
    r"^tell me about yourself",
    r"^(thanks|thank you|thx|ty)\b",
    r"^(ok|okay|got it|cool|great|nice|alright)\b",
]

class ChatAgent:

    def __init__(self):
        self.embedding_service = EmbeddingService.get_instance()

    def _is_small_talk(self, message: str) -> bool:
        msg = message.strip().lower()
        return any(re.match(p, msg) for p in SMALL_TALK_PATTERNS)

    def _now_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _build_refusal_response(
        self,
        reason: str,
        conversation_id: str,
        message_index: int,
        pdf_filename: str = "",
        max_score: float = 0.0,
    ) -> ChatResponse:
        
        if reason == "no_pdf_loaded":
            answer = "No PDF has been loaded for this session. Please upload a PDF to start chatting."
        elif reason == "small_talk":
            answer = f"I'm a document assistant focused on '{pdf_filename}'. Ask me anything about its contents — I'll answer strictly from the document."
        elif reason == "low_confidence":
            answer = f"I found some related content in the document (relevance: {max_score:.0%}), but it's not strong enough to give a reliable answer. Try rephrasing your question or asking about a specific section."
        elif reason == "out_of_scope":
            answer = f"Based on the document '{pdf_filename}', I cannot find information about this topic. This appears to be outside the scope of the document. Please ask questions related to its contents."
        else:
            answer = "I am unable to answer this question."

        return ChatResponse(
            answer=answer,
            citations=[],
            is_refusal=True,
            refusal_reason=reason,
            confidence=max_score,
            conversation_id=conversation_id,
            message_index=message_index,
        )

    async def chat(self, request: ChatRequest) -> ChatResponse:
        session = session_store.get_session(request.conversation_id)
        if not session:
            return self._build_refusal_response(
                "no_pdf_loaded", request.conversation_id, 0
            )

        user_msg = ChatMessage(
            role="user",
            content=request.message,
            timestamp=self._now_iso()
        )
        session_store.add_message(request.conversation_id, user_msg)
        message_index = len(session.messages)

        if self._is_small_talk(request.message):
            response = self._build_refusal_response(
                "small_talk", 
                request.conversation_id,
                message_index,
                pdf_filename=session.pdf_metadata.filename
            )
            assistant_msg = ChatMessage(
                role="assistant",
                content=response.answer,
                is_refusal=True,
                refusal_reason="small_talk",
                confidence=0.0,
                timestamp=self._now_iso()
            )
            session_store.add_message(request.conversation_id, assistant_msg)
            return response

        results = vector_store_service.search_with_scores(
            session.faiss_store,
            request.message,
            k=settings.retrieval_top_k
        )
        max_score = vector_store_service.get_max_score(results)

        if max_score < settings.confidence_threshold:
            reason = "low_confidence" if max_score > 0.05 else "out_of_scope"
            response = self._build_refusal_response(
                reason,
                request.conversation_id,
                message_index,
                pdf_filename=session.pdf_metadata.filename,
                max_score=max_score,
            )
            assistant_msg = ChatMessage(
                role="assistant",
                content=response.answer,
                is_refusal=True,
                refusal_reason=reason,
                confidence=max_score,
                timestamp=self._now_iso()
            )
            session_store.add_message(request.conversation_id, assistant_msg)
            return response

        answer = await groq_service.generate_answer(
            question=request.message,
            retrieved_results=results,
            chat_history=session.messages,
        )

        citations = vector_store_service.build_citations(results)

        is_llm_refusal = answer.strip().startswith("Based on the provided document, I cannot find information")
        is_refusal = is_llm_refusal
        refusal_reason = "out_of_scope" if is_llm_refusal else None
        
        if is_refusal:
            citations = []

        assistant_msg = ChatMessage(
            role="assistant",
            content=answer,
            citations=citations,
            is_refusal=is_refusal,
            refusal_reason=refusal_reason,
            confidence=round(max_score, 4),
            timestamp=self._now_iso()
        )
        session_store.add_message(request.conversation_id, assistant_msg)

        print(
            f"[ChatAgent] "
            f"session={request.conversation_id[:8]} | "
            f"query='{request.message[:40]}...' | "
            f"score={max_score:.3f} | "
            f"chunks={len(results)} | "
            f"refusal={is_refusal}"
        )

        return ChatResponse(
            answer=answer,
            citations=citations,
            is_refusal=is_refusal,
            refusal_reason=refusal_reason,
            confidence=round(max_score, 4),
            conversation_id=request.conversation_id,
            message_index=message_index,
        )

chat_agent = ChatAgent()
