from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain.schema import HumanMessage, AIMessage, Document
from app.config import settings
from app.models.schemas import ChatMessage
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a precise document assistant helping a user understand 
a specific uploaded PDF document.

ABSOLUTE RULES — THESE ARE NON-NEGOTIABLE:
1. Answer ONLY using information from the [RETRIEVED CONTEXT] provided.
2. NEVER use your training knowledge. Even if you know the answer, if it is not 
   in the context below, you must not use it.
3. If the context does not contain enough information to answer:
   - Say: "Based on the provided document, I cannot find information about [topic]."
   - Briefly mention what the document does cover if evident from context.
   - Do NOT guess, infer, or extrapolate.
4. Always frame answers as: "The document states..." or "According to the document..."
5. Never present information as your own knowledge.
6. Be concise and precise. Under 300 words unless complexity requires more.
7. Do NOT add citation markers like [1] or (p.12) in your text — 
   citations are handled separately by the system.

[RETRIEVED CONTEXT]
{context}"""

class GroqService:

    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=settings.groq_api_key,
            model_name=settings.groq_model,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )

    def _build_chain(self):
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}"),
        ])
        return prompt | self.llm | StrOutputParser()

    def _format_context(
        self, 
        results: list[tuple[Document, float]]
    ) -> str:
        formatted = []
        for doc, score in results:
            formatted.append(f"[Page {doc.metadata['page_number']} | Relevance: {score:.2f}]\n{doc.page_content}")
        return "\n\n---\n\n".join(formatted)

    def _format_history(
        self, 
        messages: list[ChatMessage]
    ) -> list:
        recent_messages = messages[-6:]
        langchain_msgs = []
        for msg in recent_messages:
            if msg.role == "user":
                langchain_msgs.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                langchain_msgs.append(AIMessage(content=msg.content))
        return langchain_msgs

    async def generate_answer(
        self,
        question: str,
        retrieved_results: list[tuple[Document, float]],
        chat_history: list[ChatMessage],
    ) -> str:
        try:
            context = self._format_context(retrieved_results)
            history = self._format_history(chat_history)
            chain = self._build_chain()
            
            # Using invoke, though agenerate/ainvoke is better if fully async. The prompt asks for generate_answer as async.
            # We'll use ainvoke.
            answer = await chain.ainvoke({
                "context": context,
                "chat_history": history,
                "question": question
            })
            return answer
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            raise HTTPException(status_code=502, detail="LLM service error")

groq_service = GroqService()
