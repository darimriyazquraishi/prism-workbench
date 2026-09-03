import json
import sqlite3
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Any
from app.config import settings


@dataclass
class AuditEvent:
    event_id: str
    timestamp: str
    event_type: str
    task_id: str | None
    user: str
    model_used: str | None
    tool_used: str | None
    files_accessed: list[str]
    artifact_created: str | None
    status: str
    details: dict[str, Any]


class AuditStore:
    def __init__(self, db_path: str = str(settings.AUDIT_DB_PATH)):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_events (
                event_id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                event_type TEXT NOT NULL,
                task_id TEXT,
                user TEXT,
                model_used TEXT,
                tool_used TEXT,
                files_accessed TEXT,
                artifact_created TEXT,
                status TEXT,
                details TEXT
            )
        """)
        conn.commit()
        conn.close()

    def log_event(self, event: AuditEvent):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO audit_events (
                event_id, timestamp, event_type, task_id, user,
                model_used, tool_used, files_accessed, artifact_created, status, details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            event.event_id,
            event.timestamp,
            event.event_type,
            event.task_id,
            event.user,
            event.model_used,
            event.tool_used,
            json.dumps(event.files_accessed),
            event.artifact_created,
            event.status,
            json.dumps(event.details)
        ))
        conn.commit()
        conn.close()

    def query_events(self, limit: int = 100, task_id: str | None = None) -> list[dict]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if task_id:
            cursor.execute("SELECT * FROM audit_events WHERE task_id = ? ORDER BY timestamp DESC LIMIT ?", (task_id, limit))
        else:
            cursor.execute("SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()

        events = []
        for r in rows:
            events.append({
                "event_id": r["event_id"],
                "timestamp": r["timestamp"],
                "event_type": r["event_type"],
                "task_id": r["task_id"],
                "user": r["user"],
                "model_used": r["model_used"],
                "tool_used": r["tool_used"],
                "files_accessed": json.loads(r["files_accessed"] or "[]"),
                "artifact_created": r["artifact_created"],
                "status": r["status"],
                "details": json.loads(r["details"] or "{}")
            })
        return events


audit_store = AuditStore()


def emit_audit_event(
    event_type: str,
    task_id: str | None = None,
    user: str = "engineer_operator",
    model_used: str | None = None,
    tool_used: str | None = None,
    files_accessed: list[str] | None = None,
    artifact_created: str | None = None,
    status: str = "SUCCESS",
    details: dict[str, Any] | None = None
) -> AuditEvent:
    ev = AuditEvent(
        event_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
        timestamp=datetime.utcnow().isoformat(),
        event_type=event_type,
        task_id=task_id,
        user=user,
        model_used=model_used,
        tool_used=tool_used,
        files_accessed=files_accessed or [],
        artifact_created=artifact_created,
        status=status,
        details=details or {}
    )
    audit_store.log_event(ev)
    return ev
