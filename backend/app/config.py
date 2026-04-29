from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    groq_api_key: str
    frontend_url: str = "http://localhost:5173"
    groq_model: str = "llama-3.3-70b-versatile"
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    retrieval_top_k: int = 5
    confidence_threshold: float = 0.30
    session_ttl_hours: int = 2
    llm_temperature: float = 0.1
    llm_max_tokens: int = 1024
    max_pdf_size_mb: int = 50

    class Config:
        env_file = ".env"

settings = Settings()
