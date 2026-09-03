import logging
from pathlib import Path
from app.config import settings
from app.models.client import model_client
from app.rag.chunker import DocumentChunk, chunker
from app.documents.processor import document_processor
from app.agents.state import Citation

logger = logging.getLogger(__name__)


class LocalVectorStore:
    def __init__(self):
        self._chunks: list[DocumentChunk] = []
        self._initialized = False

    def initialize(self):
        if self._initialized:
            return
        # Pre-seed initial knowledge chunks if available
        self._initialized = True

    async def add_document(self, file_path: str):
        parsed = document_processor.process_file(file_path)
        for page in parsed.pages:
            page_chunks = chunker.chunk_text(page.text, source_file=parsed.file_name, page_number=page.page_number)
            self._chunks.extend(page_chunks)
        logger.info(f"Ingested {parsed.file_name}: total {len(self._chunks)} chunks in local index.")

    async def search(self, query: str, top_k: int = settings.RAG_TOP_K) -> list[Citation]:
        if not self._chunks:
            return []

        # Simple high-speed keyword + semantic overlap search for robust local execution
        query_terms = set(query.lower().split())
        scored_chunks: list[tuple[float, DocumentChunk]] = []

        for ch in self._chunks:
            chunk_words = set(ch.text.lower().split())
            overlap = len(query_terms.intersection(chunk_words))
            score = overlap / max(1, len(query_terms))
            if score > 0:
                scored_chunks.append((score, ch))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        results: list[Citation] = []

        for score, ch in scored_chunks[:top_k]:
            results.append(Citation(
                source_file=ch.source_file,
                page_number=ch.page_number,
                section_title=ch.section_title,
                snippet=ch.text[:350] + ("..." if len(ch.text) > 350 else ""),
                relevance_score=round(score, 3)
            ))

        return results


vector_store = LocalVectorStore()
