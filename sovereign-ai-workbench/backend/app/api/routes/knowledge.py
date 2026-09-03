import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from app.config import settings
from app.rag.vectorstore import vector_store

router = APIRouter(prefix="/knowledge", tags=["Local Knowledge Base & RAG"])


class KnowledgeSearchRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/ingest")
async def ingest_knowledge_document(file: UploadFile = File(...)):
    target_path = settings.KNOWLEDGE_DIR / file.filename
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    await vector_store.add_document(str(target_path))

    return {
        "status": "success",
        "file_name": file.filename,
        "indexed": True,
        "message": f"Successfully parsed, chunked, embedded and indexed {file.filename} into local ChromaDB."
    }


@router.post("/search")
async def search_knowledge(req: KnowledgeSearchRequest):
    results = await vector_store.search(req.query, top_k=req.top_k)
    return {
        "query": req.query,
        "results": [r.model_dump() for r in results]
    }


@router.get("/collections")
async def list_knowledge_files():
    files = []
    for f in settings.KNOWLEDGE_DIR.iterdir():
        if f.is_file():
            files.append({
                "file_name": f.name,
                "size_bytes": f.stat().st_size,
                "indexed": True
            })
    return {
        "collection_name": settings.CHROMA_COLLECTION_NAME,
        "files": files,
        "embedding_model": settings.DEFAULT_EMBEDDING_MODEL,
        "status": "LOCAL_ONLINE"
    }
