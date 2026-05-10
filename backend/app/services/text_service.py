import uuid
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings


class TextService:
    """
    Service for ingesting plain-text (.txt) files.

    Uses the same RecursiveCharacterTextSplitter strategy as PDFService so
    the rest of the pipeline (embedding → FAISS → retrieval → generation)
    is completely unchanged.
    """

    def extract_pages(self, file_path: str) -> list[dict]:
        """
        Read a .txt file and return it as a single 'page' dict so the
        downstream chunk_document() call is identical to the PDF path.
        """
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            text = f.read().strip()

        if not text:
            return []

        # Treat the whole file as page 1
        return [{"page_number": 1, "text": text}]

    def chunk_document(self, pages: list[dict]) -> list[dict]:
        """
        Split pages into overlapping chunks using RecursiveCharacterTextSplitter.

        Strategy: recursive character splitting
        - chunk_size   : configurable (default 1000 chars)
        - chunk_overlap: configurable (default 200 chars)
        - separators   : paragraph breaks → newlines → sentences → words → chars
          This hierarchy preserves semantic units as much as possible before
          falling back to finer-grained splits.
        """
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

        chunks = []
        for page in pages:
            splits = splitter.split_text(page["text"])
            for split in splits:
                lines = [line.strip() for line in split.split("\n") if line.strip()]
                section_hint = lines[0][:100] if lines else ""

                char_start = page["text"].find(split[:50])
                if char_start == -1:
                    char_start = 0

                chunks.append(
                    {
                        "id": str(uuid.uuid4()),
                        "text": split,
                        "page_number": page["page_number"],
                        "section_hint": section_hint,
                        "char_start": char_start,
                        "char_end": char_start + len(split),
                    }
                )
        return chunks


text_service = TextService()
