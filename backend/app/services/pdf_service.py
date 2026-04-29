import fitz  # pymupdf
import uuid
import re
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings

class PDFService:

    def extract_pages(self, file_path: str) -> list[dict]:
        pages = []
        doc = fitz.open(file_path)
        try:
            for i in range(doc.page_count):
                page = doc[i]
                text = page.get_text("text")
                text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
                text = re.sub(r'\n{3,}', '\n\n', text)
                text = text.strip()
                
                if len(text) < 20:
                    continue
                
                pages.append({"page_number": i + 1, "text": text})
        finally:
            doc.close()
        return pages

    def chunk_document(self, pages: list[dict]) -> list[dict]:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        chunks = []
        for page in pages:
            splits = splitter.split_text(page["text"])
            for split in splits:
                lines = [line.strip() for line in split.split('\n') if line.strip()]
                section_hint = lines[0][:100] if lines else ""
                
                char_start = page["text"].find(split[:50])
                if char_start == -1:
                    char_start = 0
                    
                chunks.append({
                    "id": str(uuid.uuid4()),
                    "text": split,
                    "page_number": page["page_number"],
                    "section_hint": section_hint,
                    "char_start": char_start,
                    "char_end": char_start + len(split)
                })
        return chunks

    def get_page_count(self, file_path: str) -> int:
        doc = fitz.open(file_path)
        try:
            count = doc.page_count
        finally:
            doc.close()
        return count

pdf_service = PDFService()
