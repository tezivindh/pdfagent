from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from app.models.schemas import Citation

class VectorStoreService:
    def build_store(self, chunks: list[dict], embeddings) -> FAISS:
        documents = [
            Document(
                page_content=chunk["text"],
                metadata={
                    "chunk_id": chunk["id"],
                    "page_number": chunk["page_number"],
                    "section_hint": chunk["section_hint"],
                    "char_start": chunk["char_start"],
                    "char_end": chunk["char_end"]
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
        # FAISS in langchain uses L2 distance or inner product. similarity_search_with_relevance_scores 
        # converts it to a score between 0 and 1.
        results = store.similarity_search_with_relevance_scores(query, k=k)
        # Sort descending by score
        results.sort(key=lambda x: x[1], reverse=True)
        return results

    def get_max_score(self, results: list[tuple[Document, float]]) -> float:
        if not results:
            return 0.0
        return max(score for _, score in results)

    def build_citations(self, results: list[tuple[Document, float]]) -> list[Citation]:
        citations = []
        for doc, score in results:
            excerpt = doc.page_content[:120].strip() + "..." if len(doc.page_content) > 120 else doc.page_content.strip()
            citations.append(Citation(
                page_number=doc.metadata["page_number"],
                section_hint=doc.metadata["section_hint"],
                chunk_id=doc.metadata["chunk_id"],
                relevance_score=score,
                excerpt=excerpt
            ))
        return citations

vector_store_service = VectorStoreService()
