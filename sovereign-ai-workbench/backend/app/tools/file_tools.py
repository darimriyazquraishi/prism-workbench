from pathlib import Path
from app.tools.registry import tool_registry
from app.config import settings
from app.security.workspace import validate_path


@tool_registry.register(
    name="read_file",
    description="Read the text content of a file located within the authorized documents or workspace directory.",
    parameters_schema={
        "type": "object",
        "properties": {
            "file_path": {"type": "string", "description": "Relative or absolute path of the file to read"}
        },
        "required": ["file_path"]
    },
    permission_level="READ_ONLY",
    requires_sandbox=False
)
async def read_file(file_path: str) -> dict:
    safe_path = validate_path(file_path, str(settings.DATA_DIR))
    p = Path(safe_path)
    if not p.exists():
        return {"error": f"File not found: {file_path}"}
    try:
        content = p.read_text(encoding="utf-8", errors="replace")
        return {"file_path": file_path, "content": content, "size_bytes": len(content)}
    except Exception as e:
        return {"error": f"Failed to read file: {str(e)}"}


@tool_registry.register(
    name="write_file",
    description="Write text or script content to an authorized path in the task workspace.",
    parameters_schema={
        "type": "object",
        "properties": {
            "file_path": {"type": "string", "description": "Target file path"},
            "content": {"type": "string", "description": "Text content to write"}
        },
        "required": ["file_path", "content"]
    },
    permission_level="LOCAL_WRITE",
    requires_sandbox=False
)
async def write_file(file_path: str, content: str) -> dict:
    safe_path = validate_path(file_path, str(settings.DATA_DIR))
    p = Path(safe_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    return {"status": "success", "file_path": file_path, "bytes_written": len(content.encode("utf-8"))}


@tool_registry.register(
    name="list_files",
    description="List files in a specific workspace directory.",
    parameters_schema={
        "type": "object",
        "properties": {
            "directory": {"type": "string", "description": "Directory path", "default": "."}
        }
    },
    permission_level="READ_ONLY",
    requires_sandbox=False
)
async def list_files(directory: str = ".") -> dict:
    safe_path = validate_path(directory, str(settings.DATA_DIR))
    p = Path(safe_path)
    if not p.exists():
        return {"error": f"Directory not found: {directory}"}
    files = [f.name for f in p.iterdir() if f.is_file()]
    dirs = [d.name for d in p.iterdir() if d.is_dir()]
    return {"directory": directory, "files": files, "subdirectories": dirs}
