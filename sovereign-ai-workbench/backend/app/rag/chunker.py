from dataclasses import dataclass
from app.config import settings


@dataclass
class DocumentChunk:
    chunk_id: str
    text: str
    source_file: str
    page_number: int | None
    section_title: str | None
    chunk_index: int


class RecursiveTextChunker:
    def __init__(self, chunk_size: int = settings.RAG_CHUNK_SIZE, overlap: int = settings.RAG_CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_text(self, text: str, source_file: str, page_number: int | None = None) -> list[DocumentChunk]:
        words = text.split()
        chunks: list[DocumentChunk] = []
        if not words:
            return chunks

        start = 0
        chunk_idx = 0
        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk_words = words[start:end]
            chunk_str = " ".join(chunk_words)

            chunks.append(DocumentChunk(
                chunk_id=f"{source_file}_p{page_number or 1}_c{chunk_idx}",
                text=chunk_str,
                source_file=source_file,
                page_number=page_number,
                section_title=None,
                chunk_index=chunk_idx
            ))

            start += max(1, self.chunk_size - self.overlap)
            chunk_idx += 1

        return chunks


chunker = RecursiveTextChunker()
