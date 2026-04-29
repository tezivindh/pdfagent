export interface Citation {
  page_number: number
  section_hint: string
  chunk_id: string
  relevance_score: number
  excerpt: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  citations: Citation[]
  is_refusal: boolean
  refusal_reason?: string
  confidence: number
  timestamp: string
}

export interface PDFMetadata {
  filename: string
  page_count: number
  chunk_count: number
  loaded_at: string
}

export interface PDFUploadResponse {
  conversation_id: string
  filename: string
  page_count: number
  chunk_count: number
  message: string
}

export interface ChatResponse {
  answer: string
  citations: Citation[]
  is_refusal: boolean
  refusal_reason?: string
  confidence: number
  conversation_id: string
  message_index: number
}
