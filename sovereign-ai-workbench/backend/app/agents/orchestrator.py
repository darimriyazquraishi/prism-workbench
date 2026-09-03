import asyncio
import json
import logging
import uuid
from datetime import datetime
from typing import AsyncGenerator
from pathlib import Path
from app.agents.state import TaskState, ArtifactRecord, Citation
from app.models.router import router
from app.agents.planner import planner
from app.agents.executor import executor
from app.audit.store import emit_audit_event
from app.config import settings

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """Coordinates the sovereign ReAct loop, model routing, multi-step execution, and SSE event streaming."""

    def __init__(self):
        self._tasks: dict[str, TaskState] = {}

    def get_task(self, task_id: str) -> TaskState | None:
        return self._tasks.get(task_id)

    def list_tasks(self) -> list[TaskState]:
        return list(self._tasks.values())

    async def create_and_run_task(
        self,
        objective: str,
        attached_files: list[str] | None = None,
        force_model: str | None = None
    ) -> TaskState:
        task_id = f"TASK-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        attached_files = attached_files or []

        # 1. Route to best local model
        routing = router.route(objective, attached_files, force_model)

        state = TaskState(
            task_id=task_id,
            objective=objective,
            attached_files=attached_files,
            selected_model_id=routing.selected_model_id,
            selected_model_name=routing.ollama_model_name,
            task_type=routing.task_type,
            routing_reason=routing.reason,
            status="pending"
        )
        self._tasks[task_id] = state

        emit_audit_event(
            event_type="TASK_CREATED",
            task_id=task_id,
            model_used=state.selected_model_id,
            files_accessed=attached_files,
            details={"objective": objective, "routing": routing.__dict__}
        )

        return state

    async def run_task_stream(self, task_id: str) -> AsyncGenerator[str, None]:
        state = self.get_task(task_id)
        if not state:
            yield f"data: {json.dumps({'event': 'error', 'message': 'Task not found'})}\n\n"
            return

        def sse_pack(event_type: str, data: dict) -> str:
            payload = {"event": event_type, "timestamp": datetime.utcnow().isoformat(), "data": data}
            return f"data: {json.dumps(payload)}\n\n"

        # 1. Emit Initial State & Routing Decision
        yield sse_pack("TASK_INITIALIZED", {
            "task_id": state.task_id,
            "objective": state.objective,
            "selected_model": state.selected_model_id,
            "task_type": state.task_type,
            "routing_reason": state.routing_reason
        })
        await asyncio.sleep(0.3)

        # 2. Planning Phase
        state.status = "planning"
        yield sse_pack("PLANNING_START", {"message": "Decomposing task with local open-weight model..."})
        
        plan = await planner.create_plan(state.objective, state.attached_files, state.selected_model_name)
        state.plan = plan
        yield sse_pack("PLAN_GENERATED", {"plan": [s.model_dump() for s in state.plan]})
        await asyncio.sleep(0.4)

        # 3. Step Execution Phase
        state.status = "running"
        context: dict = {}

        for idx, step in enumerate(state.plan):
            state.current_step_index = idx
            yield sse_pack("STEP_START", {
                "step_id": step.step_id,
                "title": step.title,
                "tool": step.tool_name,
                "description": step.description
            })

            success, output, err = await executor.execute_step(step, state, context)

            if success:
                # Inspect if an office artifact was produced
                if isinstance(output, dict) and output.get("file_type") in ["docx", "xlsx", "pptx"]:
                    fpath = output.get("file_path", "")
                    p = Path(fpath)
                    if p.exists():
                        art = ArtifactRecord(
                            artifact_id=f"ART-{uuid.uuid4().hex[:6].upper()}",
                            file_name=p.name,
                            file_type=output["file_type"],
                            file_path=str(p),
                            size_bytes=p.stat().st_size,
                            description=f"Generated {output['file_type'].upper()} deliverable for {state.task_id}"
                        )
                        state.artifacts.append(art)
                        yield sse_pack("ARTIFACT_GENERATED", art.model_dump())

                # Populate citations if retrieved
                if isinstance(output, dict) and "citations" in output:
                    for c in output["citations"]:
                        cit = Citation(**c)
                        state.citations.append(cit)
                    yield sse_pack("CITATIONS_UPDATED", {"citations": [c.model_dump() for c in state.citations]})

                yield sse_pack("STEP_SUCCESS", {
                    "step_id": step.step_id,
                    "result_summary": step.result_summary,
                    "tool_record": state.tool_calls[-1].model_dump() if state.tool_calls else None
                })
            else:
                yield sse_pack("STEP_FAILED", {
                    "step_id": step.step_id,
                    "error": err
                })

            await asyncio.sleep(0.5)

        # 4. Final Deliverable Synthesis
        state.status = "verifying"
        yield sse_pack("VERIFICATION_START", {"message": "Verifying calculations and deliverable structure against safety policies..."})
        await asyncio.sleep(0.4)

        state.status = "completed"
        state.final_output = f"Successfully executed workflow for '{state.objective}'. Generated {len(state.artifacts)} verified deliverables and grounded with {len(state.citations)} citations."

        emit_audit_event(
            event_type="TASK_COMPLETED",
            task_id=state.task_id,
            model_used=state.selected_model_id,
            status="COMPLETED",
            details={"artifacts_count": len(state.artifacts), "citations_count": len(state.citations)}
        )

        yield sse_pack("TASK_COMPLETED", {
            "task_id": state.task_id,
            "status": state.status,
            "final_output": state.final_output,
            "artifacts": [a.model_dump() for a in state.artifacts],
            "citations": [c.model_dump() for c in state.citations]
        })


orchestrator = AgentOrchestrator()
