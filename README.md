# PDF-Constrained Conversational Agent

> Chat with any PDF or plain-text document — grounded answers, source citations, zero hallucination.

A full **Retrieval-Augmented Generation (RAG)** pipeline built as Assignment 03 for the Google NotebookLM RAG project.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://pdfagent.tezivindh.online |
| GitHub Repo | https://github.com/tezivindh/pdfagent |

---

## Architecture

```
User uploads PDF / TXT
        │
        ▼
┌─────────────────────┐
│   Text Extraction   │  PyMuPDF (PDF) / built-in open() (TXT)
└────────┬────────────┘
         │  raw page text
         ▼
┌─────────────────────┐
│      Chunking       │  RecursiveCharacterTextSplitter
│  chunk_size = 1000  │
│  chunk_overlap = 200│
└────────┬────────────┘
         │  list[chunk_dict]
         ▼
┌─────────────────────┐
│     Embedding       │  FastEmbed — BAAI/bge-small-en-v1.5 (local, ~90 MB)
└────────┬────────────┘
         │  float vectors
         ▼
┌─────────────────────┐
│    Vector Store     │  FAISS (in-memory, per-session)
└────────┬────────────┘
         │  (session stored server-side, TTL = 2 h)
         ▼  on user question:
┌─────────────────────┐
│     Retrieval       │  cosine similarity, top-k = 5
│  confidence ≥ 0.30  │  → refusal if below threshold
└────────┬────────────┘
         │  retrieved chunks + scores
         ▼
┌─────────────────────┐
│     Generation      │  Groq — llama-3.3-70b-versatile
│  context-only prompt│  answers ONLY from retrieved context
└────────┬────────────┘
         │  answer + citations
         ▼
      User sees
  answer + page refs
```

---

## Chunking Strategy

**Strategy used:** `RecursiveCharacterTextSplitter` from LangChain

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `chunk_size` | 1000 characters | Large enough to retain semantic context; small enough to be precise in retrieval |
| `chunk_overlap` | 200 characters | Prevents information loss at chunk boundaries (sentences split across chunks) |
| Separators | `["\n\n", "\n", ". ", " ", ""]` | Tries to split on paragraph breaks first, then newlines, then sentences — preserves meaning at the coarsest available level |

**Why Recursive?**  
Unlike a fixed-size splitter, the recursive approach respects natural text structure. It only falls back to a finer-grained split (e.g. mid-sentence) when the preferred separator would produce a chunk that is too large. This makes retrieved chunks more semantically coherent, which directly improves retrieval quality.

---

## Hallucination Prevention

The system uses a two-layer guard:

1. **Retrieval confidence threshold** — if the maximum cosine-similarity score across all retrieved chunks is below `0.30`, the system refuses to answer and tells the user what it couldn't find. No LLM call is made.
2. **Strict system prompt** — the LLM is instructed under absolute rules to answer *only* from the `[RETRIEVED CONTEXT]` block injected into the prompt. It must never use training knowledge and must begin answers with "According to the document…" or "The document states…". The prompt explicitly forbids guessing, inferring, or extrapolating.

---

## Supported File Types

| Format | Extension | Parser |
|--------|-----------|--------|
| PDF | `.pdf` | `PyMuPDF` |
| Plain Text | `.txt` | Python built-in `open()` |

---

## RAG Pipeline — End-to-End Flow

1. **Ingestion** — User uploads a file via the React UI
2. **Text Extraction** — File content is extracted per-page (PDF) or as a single block (TXT)
3. **Chunking** — Text is split into overlapping chunks using `RecursiveCharacterTextSplitter`
4. **Embedding** — Each chunk is converted to a vector using `FastEmbed` (runs locally on the server)
5. **Storage** — Vectors are stored in a FAISS index tied to the session UUID
6. **Retrieval** — On each user question, the query is embedded and the top-5 most similar chunks are fetched
7. **Confidence Check** — If max relevance < 0.30 the system refuses; otherwise proceeds to generation
8. **Generation** — Groq LLM generates an answer grounded only in the retrieved chunks
9. **Citations** — Every successful answer returns page numbers, section hints, and excerpts

---

## API Reference

### `POST /api/pdf/upload`
Upload a document for processing.

**Form field:** `file` (multipart) — `.pdf` or `.txt`, max 50 MB

**Response:**
```json
{
  "conversation_id": "uuid",
  "filename": "example.pdf",
  "page_count": 12,
  "chunk_count": 87,
  "message": "PDF processed successfully. 87 chunks indexed."
}
```

### `POST /api/chat`
Ask a question about the uploaded document.

**Request:**
```json
{
  "conversation_id": "uuid",
  "message": "What is the main conclusion?"
}
```

**Response:**
```json
{
  "answer": "According to the document, the main conclusion is...",
  "citations": [
    {
      "page_number": 4,
      "section_hint": "Conclusion",
      "chunk_id": "uuid",
      "relevance_score": 0.82,
      "excerpt": "The study concludes that..."
    }
  ],
  "is_refusal": false,
  "confidence": 0.82,
  "conversation_id": "uuid",
  "message_index": 1
}
```

### `GET /api/chat/history/{conversation_id}`
Fetch full conversation history.

### `DELETE /api/pdf/{conversation_id}`
Delete session and FAISS index.

### `GET /api/pdf/health`
Health check — returns model info and active session count.

---

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Add your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

> **Note:** The first run downloads the FastEmbed model (~90 MB). It is cached automatically for subsequent runs.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env            # Set VITE_API_URL=http://localhost:8000
npm run dev
```

---

## Deployment

### Backend → Render (Free Tier)

| Setting | Value |
|---------|-------|
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/api/pdf/health` |

**Environment Variables:** `GROQ_API_KEY`, `FRONTEND_URL`

### Frontend → Vercel

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Environment Variable | `VITE_API_URL=https://your-backend.onrender.com` |

---

## Environment Variables

| Variable | Service | Description | Required | Default |
|----------|---------|-------------|----------|---------|
| `GROQ_API_KEY` | Backend | Groq API key | ✅ Yes | — |
| `FRONTEND_URL` | Backend | Allowed CORS origin | No | `http://localhost:5173` |
| `VITE_API_URL` | Frontend | Backend base URL | ✅ Yes | `http://localhost:8000` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| Backend | FastAPI, Python 3.11+ |
| LLM | Groq API (llama-3.3-70b-versatile) |
| Embeddings | FastEmbed (BAAI/bge-small-en-v1.5) |
| Vector DB | FAISS (in-memory) |
| PDF Parsing | PyMuPDF |
| Chunking | LangChain RecursiveCharacterTextSplitter |
