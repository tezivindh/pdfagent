export interface Citation {
  page_number: number;
  section_hint: string;
  chunk_id: string;
  relevance_score: number;
  excerpt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  is_refusal?: boolean;
  refusal_reason?: 'out_of_scope' | 'low_confidence' | 'no_pdf_loaded';
  confidence?: number;
  timestamp: string;
}

export interface PDFMetadata {
  filename: string;
  page_count: number;
  chunk_count: number;
  loaded_at: string;
}
