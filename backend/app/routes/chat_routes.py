from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse, HistoryResponse
from app.agents.chat_agent import chat_agent
from app.session.session_store import session_store

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        return await chat_agent.chat(request)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ChatRoute] Unexpected error: {e}")
        raise HTTPException(500, "Internal agent error")

@router.get("/history/{conversation_id}", response_model=HistoryResponse)
async def get_history(conversation_id: str):
    session = session_store.get_session(conversation_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return HistoryResponse(
        messages=session.messages,
        pdf_metadata=session.pdf_metadata
    )
