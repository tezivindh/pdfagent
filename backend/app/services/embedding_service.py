from langchain_community.embeddings import FastEmbedEmbeddings
from app.config import settings

class EmbeddingService:
    _instance: "EmbeddingService | None" = None
    _embeddings: FastEmbedEmbeddings | None = None

    @classmethod
    def get_instance(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = cls()
            print(f"[EmbeddingService] Loading model: {settings.embedding_model}")
            cls._instance._embeddings = FastEmbedEmbeddings(
                model_name=settings.embedding_model
            )
            print("[EmbeddingService] Model ready.")
        return cls._instance

    def get_embeddings(self) -> FastEmbedEmbeddings:
        if self._embeddings is None:
            raise RuntimeError("EmbeddingService not initialized. Call get_instance() first.")
        return self._embeddings

    def embed_query(self, text: str) -> list[float]:
        return self.get_embeddings().embed_query(text)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self.get_embeddings().embed_documents(texts)
