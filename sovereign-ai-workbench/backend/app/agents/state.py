from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, Field


class ToolCallRecord(BaseModel):
    call_id: str
    tool_name: str
    arguments: dict[str, Any]
    output: Any = None
    status: Literal["pending", "success", "error"] = "pending"
    error_message: str | None = None
    execution_time_ms: float = 0.0
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Citation(BaseModel):
    source_file: str
    page_number: int | None = None
    section_title: str | None = None
    snippet: str
    relevance_score: float = 1.0


class ArtifactRecord(BaseModel):
    artifact_id: str
    file_name: str
    file_type: Literal["docx", "xlsx", "pptx", "py", "csv", "png", "pdf", "txt"]
    file_path: str
    size_bytes: int
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    approval_status: Literal["draft", "reviewed", "approved", "rejected"] = "draft"
    description: str = ""


class AgentStep(BaseModel):
    step_id: int
    title: str
    description: str
    tool_name: str | None = None
    status: Literal["pending", "running", "completed", "failed", "skipped"] = "pending"
    result_summary: str | None = None
    error: str | None = None
    attempts: int = 0
    duration_ms: float = 0.0


class TaskState(BaseModel):
    task_id: str
    objective: str
    status: Literal["pending", "planning", "running", "verifying", "completed", "failed"] = "pending"
    attached_files: list[str] = Field(default_factory=list)
    selected_model_id: str = "qwen3-8b"
    selected_model_name: str = "qwen3:8b"
    task_type: str = "General"
    routing_reason: str = ""
    plan: list[AgentStep] = Field(default_factory=list)
    current_step_index: int = 0
    tool_calls: list[ToolCallRecord] = Field(default_factory=list)
    citations: list[Citation] = Field(default_factory=list)
    artifacts: list[ArtifactRecord] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    final_output: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
