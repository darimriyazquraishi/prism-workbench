from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/tasks", tags=["Agent Chat & Task Execution"])


class TaskSubmitRequest(BaseModel):
    objective: str
    attached_files: list[str] = []
    force_model: str | None = None


@router.post("")
async def create_task(req: TaskSubmitRequest):
    state = await orchestrator.create_and_run_task(
        objective=req.objective,
        attached_files=req.attached_files,
        force_model=req.force_model
    )
    return state


@router.get("/{task_id}")
async def get_task_status(task_id: str):
    state = orchestrator.get_task(task_id)
    if not state:
        raise HTTPException(status_code=404, detail="Task not found")
    return state


@router.get("/{task_id}/stream")
async def stream_task_events(task_id: str):
    state = orchestrator.get_task(task_id)
    if not state:
        raise HTTPException(status_code=404, detail="Task not found")
    return StreamingResponse(
        orchestrator.run_task_stream(task_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("")
async def list_tasks():
    return orchestrator.list_tasks()
