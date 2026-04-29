from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from app.models.schemas import Citation

class VectorStoreService:

    def build_store(self, chunks: list[dict], embeddings) -> FAISS:
        if not chunks:
            raise ValueError("Chunks list is empty")
            
        documents = [
            Document(
                page_content=chunk["text"],
                metadata={
                    "chunk_id": chunk["id"],
                    "page_number": chunk["page_number"],
                    "section_hint": chunk["section_hint"],
                }
            )
            for chunk in chunks
        ]
        
        return FAISS.from_documents(documents, embeddings)

    def search_with_scores(
        self,
        store: FAISS,
        query: str,
        k: int = 5
    ) -> list[tuple[Document, float]]:
        results = store.similarity_search_with_relevance_scores(query, k=k)
        results.sort(key=lambda x: x[1], reverse=True)
        return results

    def get_max_score(self, results: list[tuple[Document, float]]) -> float:
        if not results:
            return 0.0
        return max(score for _, score in results)

    def build_citations(
        self, 
        results: list[tuple[Document, float]]
    ) -> list[Citation]:
        citations = []
        seen_chunks = set()
        
        for doc, score in results:
            chunk_id = doc.metadata["chunk_id"]
            if chunk_id in seen_chunks:
                continue
            seen_chunks.add(chunk_id)
            
            excerpt = doc.page_content[:120].strip()
            if len(doc.page_content) > 120:
                excerpt += "..."
            
            citations.append(
                Citation(
                    page_number=doc.metadata["page_number"],
                    section_hint=doc.metadata["section_hint"],
                    chunk_id=chunk_id,
                    relevance_score=round(score, 4),
                    excerpt=excerpt
                )
            )
            
        return citations

vector_store_service = VectorStoreService()
