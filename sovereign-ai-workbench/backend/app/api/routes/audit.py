from fastapi import APIRouter, Query
from app.audit.store import audit_store

router = APIRouter(prefix="/audit", tags=["Audit Log & Transparency"])


@router.get("/events")
async def get_audit_events(
    limit: int = Query(default=100, le=500),
    task_id: str | None = None
):
    return audit_store.query_events(limit=limit, task_id=task_id)
