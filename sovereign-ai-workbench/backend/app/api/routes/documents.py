import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings
from app.documents.processor import document_processor
from app.documents.metadata_cleaner import metadata_cleaner

router = APIRouter(prefix="/documents", tags=["Document Processing & OCR"])


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    target_path = settings.DOCUMENTS_DIR / file.filename
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 1. Automatically inspect and clean file metadata using local engine & models
    clean_path, clean_report = metadata_cleaner.clean_file(str(target_path))

    # 2. Process the sanitized document
    parsed = document_processor.process_file(clean_path)

    return {
        "file_name": file.filename,
        "file_path": clean_path,
        "size_bytes": Path(clean_path).stat().st_size,
        "total_pages": parsed.total_pages,
        "is_primarily_scanned": parsed.is_primarily_scanned,
        "metadata_cleaned": True,
        "metadata_report": {
            "stripped_tags": clean_report.stripped_tags,
            "llm_sanitized": clean_report.llm_sanitized,
            "summary": clean_report.summary,
            "original_size": clean_report.original_size_bytes,
            "cleaned_size": clean_report.cleaned_size_bytes
        },
        "pages": [{"page": p.page_number, "is_scanned": p.is_scanned, "confidence": p.ocr_confidence} for p in parsed.pages]
    }


@router.get("")
async def list_documents():
    docs = []
    for f in settings.DOCUMENTS_DIR.iterdir():
        if f.is_file():
            docs.append({
                "file_name": f.name,
                "file_path": str(f),
                "size_bytes": f.stat().st_size,
                "extension": f.suffix.lower()
            })
    return docs


@router.post("/{file_name}/process")
async def process_document(file_name: str):
    p = settings.DOCUMENTS_DIR / file_name
    if not p.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    parsed = document_processor.process_file(str(p))
    return parsed
