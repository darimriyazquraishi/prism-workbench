import json
import time
import shutil
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kb", tags=["Knowledge Base Persistence"])

INDEX_FILE = settings.KNOWLEDGE_DIR / "index.json"


class DeleteKbRequest(BaseModel):
    filename: Optional[str] = None
    id: Optional[str] = None


def ensure_knowledge_dir():
    settings.KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)
    if not INDEX_FILE.exists():
        with open(INDEX_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)


def read_kb_index() -> List[dict]:
    ensure_knowledge_dir()
    try:
        with open(INDEX_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            return []
    except Exception as e:
        logger.error(f"Error reading KB index: {e}")
        return []


def write_kb_index(files: List[dict]):
    ensure_knowledge_dir()
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(files, f, indent=2)


def sync_disk_files():
    """Scans settings.KNOWLEDGE_DIR to ensure any existing disk files are indexed."""
    ensure_knowledge_dir()
    indexed = read_kb_index()
    indexed_filenames = {item["filename"] for item in indexed}
    
    updated = False
    for p in settings.KNOWLEDGE_DIR.iterdir():
        if p.is_file() and p.name != "index.json" and p.name not in indexed_filenames:
            stat = p.stat()
            now = datetime.fromtimestamp(stat.st_mtime)
            indexed.append({
                "id": f"kb-{int(stat.st_mtime * 1000)}",
                "name": p.name,
                "filename": p.name,
                "path": str(p),
                "sizeBytes": stat.st_size,
                "mimeType": "application/pdf" if p.suffix.lower() == ".pdf" else "application/octet-stream",
                "uploadedAt": now.isoformat(),
                "formattedDate": now.strftime("%b %d, %Y, %I:%M %p")
            })
            updated = True
    
    if updated:
        write_kb_index(indexed)
    return indexed


@router.get("/files")
async def list_kb_files():
    files = sync_disk_files()
    return {"success": True, "files": files}


@router.post("/upload")
async def upload_kb_file(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ensure_knowledge_dir()
    original_name = file.filename
    safe_filename = original_name.replace(" ", "_")
    target_path = settings.KNOWLEDGE_DIR / safe_filename

    # 1. PERSIST FILE PHYSICALLY TO DISK FIRST
    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to write file to disk: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save file to disk: {str(e)}")

    size_bytes = target_path.stat().st_size
    now = datetime.now()
    metadata = {
        "id": f"kb-{int(time.time() * 1000)}",
        "name": original_name,
        "filename": safe_filename,
        "path": str(target_path),
        "sizeBytes": size_bytes,
        "mimeType": file.content_type or "application/octet-stream",
        "uploadedAt": now.isoformat(),
        "formattedDate": now.strftime("%b %d, %Y, %I:%M %p")
    }

    # 2. UPDATE METADATA INDEX ON DISK IMMEDIATELY
    existing = read_kb_index()
    updated = [metadata] + [f for f in existing if f.get("filename") != safe_filename]
    write_kb_index(updated)
    logger.info(f"Successfully persisted file to disk: {target_path}")

    # 3. OPTIONAL RAG INDEXING (FAILURE MUST NOT REMOVE FILE)
    try:
        from app.rag.vectorstore import vector_store
        await vector_store.add_document(str(target_path))
        logger.info(f"RAG indexing completed for {safe_filename}")
    except Exception as rag_err:
        logger.warning(f"RAG indexing warning for {safe_filename}: {rag_err} (File remains safely persisted)")

    return {"success": True, "file": metadata, "files": updated}


@router.post("/delete")
@router.delete("/delete")
async def delete_kb_file(req: DeleteKbRequest):
    target_identifier = req.filename or req.id
    if not target_identifier:
        raise HTTPException(status_code=400, detail="Filename or ID required for deletion")

    ensure_knowledge_dir()
    existing = read_kb_index()
    target_file = next((f for f in existing if f.get("filename") == target_identifier or f.get("id") == target_identifier or f.get("name") == target_identifier), None)

    safe_filename = target_file["filename"] if target_file else target_identifier.replace(" ", "_")
    target_path = settings.KNOWLEDGE_DIR / safe_filename

    if target_path.exists():
        try:
            target_path.unlink()
            logger.info(f"Physically deleted file: {target_path}")
        except Exception as e:
            logger.error(f"Failed to unlink file {target_path}: {e}")

    updated = [f for f in existing if f.get("filename") != safe_filename and f.get("id") != target_identifier and f.get("name") != target_identifier]
    write_kb_index(updated)

    return {"success": True, "message": f"Successfully deleted {safe_filename}", "files": updated}


@router.get("/view/{filename}")
async def view_kb_file(filename: str):
    ensure_knowledge_dir()
    safe_filename = filename.replace(" ", "_")
    filePath = settings.KNOWLEDGE_DIR / safe_filename

    if not filePath.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {safe_filename}")

    ext = filePath.suffix.lower()
    media_type = "application/octet-stream"
    if ext == ".pdf":
        media_type = "application/pdf"
    elif ext in [".docx", ".doc"]:
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif ext in [".xlsx", ".xls"]:
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif ext == ".txt":
        media_type = "text/plain"

    return FileResponse(path=str(filePath), media_type=media_type, filename=safe_filename)
