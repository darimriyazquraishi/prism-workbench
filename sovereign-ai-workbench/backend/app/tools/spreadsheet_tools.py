from pathlib import Path
import pandas as pd
from app.tools.registry import tool_registry
from app.config import settings
from app.security.workspace import validate_path


@tool_registry.register(
    name="read_excel",
    description="Read and summarize tabular data from Excel (.xlsx) or CSV files, returning column headers, shape, and head rows.",
    parameters_schema={
        "type": "object",
        "properties": {
            "file_path": {"type": "string", "description": "Path to Excel or CSV file"}
        },
        "required": ["file_path"]
    },
    permission_level="READ_ONLY",
    requires_sandbox=False
)
async def read_excel(file_path: str) -> dict:
    safe_path = validate_path(file_path, str(settings.DATA_DIR))
    p = Path(safe_path)
    if not p.exists():
        return {"error": f"File not found: {file_path}"}

    try:
        if p.suffix.lower() == ".csv":
            df = pd.read_csv(safe_path)
        else:
            df = pd.read_excel(safe_path)

        summary = {
            "file_name": p.name,
            "total_rows": len(df),
            "columns": list(df.columns),
            "sample_data": df.head(5).to_dict(orient="records"),
            "numerical_summary": df.describe().to_dict() if not df.select_dtypes(include="number").empty else {}
        }
        return summary
    except Exception as e:
        return {"error": f"Failed to parse spreadsheet: {str(e)}"}
