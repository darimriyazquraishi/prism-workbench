from dataclasses import dataclass
from pathlib import Path
import fitz  # PyMuPDF
from app.documents.ocr import ocr_engine, OCRResult
from app.documents.image_proc import preprocess_image_for_ocr


@dataclass
class PageData:
    page_number: int
    text: str
    is_scanned: bool
    ocr_confidence: float = 1.0


@dataclass
class ParsedDocument:
    file_name: str
    total_pages: int
    pages: list[PageData]
    is_primarily_scanned: bool
    full_text: str


class DocumentProcessor:
    """Classifies, parses, OCRs, and extracts text & metadata from industrial PDFs and images."""

    def process_pdf(self, pdf_path: str) -> ParsedDocument:
        doc = fitz.open(pdf_path)
        pages_data: list[PageData] = []
        scanned_count = 0

        for page_idx in range(len(doc)):
            page_num = page_idx + 1
            page = doc[page_idx]
            extracted_text = page.get_text("text").strip()

            # If character count is very low (< 60 chars), treat page as scanned image
            if len(extracted_text) < 60:
                scanned_count += 1
                # Render page to high-res pixmap (300 DPI)
                pix = page.get_pixmap(dpi=300)
                img_bytes = pix.tobytes("png")
                preprocessed = preprocess_image_for_ocr(img_bytes)
                ocr_res = ocr_engine.ocr_image_bytes(preprocessed, page_number=page_num)
                pages_data.append(PageData(
                    page_number=page_num,
                    text=ocr_res.text,
                    is_scanned=True,
                    ocr_confidence=ocr_res.confidence
                ))
            else:
                pages_data.append(PageData(
                    page_number=page_num,
                    text=extracted_text,
                    is_scanned=False,
                    ocr_confidence=1.0
                ))

        doc.close()
        full_text = "\n\n".join([f"--- Page {p.page_number} ---\n{p.text}" for p in pages_data])
        is_primarily_scanned = scanned_count > (len(pages_data) / 2)

        return ParsedDocument(
            file_name=Path(pdf_path).name,
            total_pages=len(pages_data),
            pages=pages_data,
            is_primarily_scanned=is_primarily_scanned,
            full_text=full_text
        )

    def process_file(self, file_path: str) -> ParsedDocument:
        p = Path(file_path)
        ext = p.suffix.lower()

        if ext == ".pdf":
            return self.process_pdf(file_path)
        elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
            with open(file_path, "rb") as f:
                raw_bytes = f.read()
            processed = preprocess_image_for_ocr(raw_bytes)
            ocr_res = ocr_engine.ocr_image_bytes(processed, page_number=1)
            page_data = PageData(page_number=1, text=ocr_res.text, is_scanned=True, ocr_confidence=ocr_res.confidence)
            return ParsedDocument(
                file_name=p.name,
                total_pages=1,
                pages=[page_data],
                is_primarily_scanned=True,
                full_text=ocr_res.text
            )
        else:
            # Plain text, CSV, markdown, etc.
            text = p.read_text(encoding="utf-8", errors="replace")
            page_data = PageData(page_number=1, text=text, is_scanned=False, ocr_confidence=1.0)
            return ParsedDocument(
                file_name=p.name,
                total_pages=1,
                pages=[page_data],
                is_primarily_scanned=False,
                full_text=text
            )


document_processor = DocumentProcessor()
