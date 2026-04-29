# PDF-Constrained Conversational Agent

Chat with any PDF — grounded, cited, zero hallucination.

## Architecture

This application uses a Retrieval-Augmented Generation (RAG) architecture:
1. **PDF Extraction**: Extracts text from uploaded PDFs using `PyMuPDF`.
2. **Chunking**: Splits text into manageable chunks using LangChain's `RecursiveCharacterTextSplitter`.
3. **Embedding**: Converts chunks into vector embeddings locally using `FastEmbed`.
4. **Storage**: Stores vectors in an in-memory `FAISS` database.
5. **Retrieval**: Retrieves the most relevant chunks using cosine similarity based on the user's query.
6. **Confidence Check**: Refuses to answer if the maximum relevance score is below the configured threshold (e.g., 0.30).
7. **Generation**: Uses Groq LLM to generate an answer strictly based on the retrieved context, eliminating hallucinations.
8. **Citation**: Attaches page numbers, section hints, and excerpts to the generated response.

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Add your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```
*Note: The first run will download the FastEmbed model (~90MB), which will be cached for subsequent runs.*

### Frontend

```bash
cd frontend
npm install
cp .env.example .env       # Set VITE_API_URL=http://localhost:8000
npm run dev
```

## Deployment

### Backend → Render (Free Tier)
1. Build Command: `pip install -r requirements.txt`
2. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Health Check Path: `/health`
4. Environment Variables: `GROQ_API_KEY`, `FRONTEND_URL`

### Frontend → Vercel
1. Framework Preset: Vite
2. Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | Your API key for Groq | Yes | None |
| `FRONTEND_URL` | Allowed origin for CORS | No | `http://localhost:5173` |
| `VITE_API_URL` | Backend URL for the frontend | Yes (Frontend) | `http://localhost:8000` |
