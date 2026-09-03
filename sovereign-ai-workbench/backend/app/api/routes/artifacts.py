from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.config import settings

router = APIRouter(prefix="/artifacts", tags=["Generated Business Deliverables"])


class ApprovalUpdateRequest(BaseModel):
    status: str  # approved | rejected | reviewed


@router.get("")
async def list_artifacts():
    artifacts = []
    for f in settings.ARTIFACTS_DIR.iterdir():
        if f.is_file():
            artifacts.append({
                "file_name": f.name,
                "file_path": str(f),
                "file_type": f.suffix.lstrip(".").lower(),
                "size_bytes": f.stat().st_size,
                "created_at": f.stat().st_ctime,
                "approval_status": "draft"
            })
    return artifacts


@router.get("/{file_name}/download")
async def download_artifact(file_name: str):
    target = settings.ARTIFACTS_DIR / file_name
    if not target.exists():
        raise HTTPException(status_code=404, detail="Artifact file not found")
    return FileResponse(
        path=str(target),
        filename=file_name,
        media_type="application/octet-stream"
    )
