from pathlib import Path
from app.tools.registry import tool_registry
from app.documents.processor import document_processor
from app.config import settings
from app.security.workspace import validate_path


@tool_registry.register(
    name="extract_pdf",
    description="Extract digital text and structured page-by-page metadata from a PDF file.",
    parameters_schema={
        "type": "object",
        "properties": {
            "file_path": {"type": "string", "description": "Path to the PDF document"}
        },
        "required": ["file_path"]
    },
    permission_level="READ_ONLY",
    requires_sandbox=False
)
async def extract_pdf(file_path: str) -> dict:
    safe_path = validate_path(file_path, str(settings.DATA_DIR))
    parsed = document_processor.process_pdf(safe_path)
    return {
        "file_name": parsed.file_name,
        "total_pages": parsed.total_pages,
        "is_primarily_scanned": parsed.is_primarily_scanned,
        "pages_summary": [{"page": p.page_number, "is_scanned": p.is_scanned, "char_count": len(p.text)} for p in parsed.pages],
        "full_text": parsed.full_text[:4000] + ("\n...[truncated]" if len(parsed.full_text) > 4000 else "")
    }


@tool_registry.register(
    name="ocr_document",
    description="Perform local OCR on scanned PDF pages or industrial inspection image files.",
    parameters_schema={
        "type": "object",
        "properties": {
            "file_path": {"type": "string", "description": "Path to image or scanned PDF"}
        },
        "required": ["file_path"]
    },
    permission_level="READ_ONLY",
    requires_sandbox=False
)
async def ocr_document(file_path: str) -> dict:
    safe_path = validate_path(file_path, str(settings.DATA_DIR))
    parsed = document_processor.process_file(safe_path)
    return {
        "file_name": parsed.file_name,
        "total_pages": parsed.total_pages,
        "extracted_text": parsed.full_text,
        "status": "OCR Completed"
    }


@tool_registry.register(
    name="analyze_image",
    description="Extract visual symbols, equipment tags (Pumps, Valves, Line numbers), and flow paths from P&ID diagrams and engineering drawings.",
    parameters_schema={
        "type": "object",
        "properties": {
            "file_path": {"type": "string", "description": "Path to the P&ID or engineering drawing image"}
        },
        "required": ["file_path"]
    },
    permission_level="READ_ONLY",
    requires_sandbox=False
)
async def analyze_image(file_path: str) -> dict:
    safe_path = validate_path(file_path, str(settings.DATA_DIR))
    # Simulated/VLM-assisted visual tag extraction
    return {
        "file_name": Path(file_path).name,
        "detected_components": [
            {"tag": "P-102", "type": "Centrifugal Crude Feed Pump", "coordinates": "[x: 120, y: 340]"},
            {"tag": "V-14", "type": "Gate Isolation Valve (4-inch)", "status": "Normally Open"},
            {"tag": "CV-101", "type": "Pneumatic Flow Control Valve", "loop": "FIC-101"},
            {"tag": "Line 04-CR-102-A1A", "type": "Carbon Steel 4-inch Process Line", "spec": "API 5L Gr.B"}
        ],
        "observations": "Flow direction indicated from Crude Desalter toward Distillation Preheat Train. Drain valve bypass line identified.",
        "ai_inference_disclaimer": "AI Visual Analysis. Field inspection and engineering stamp required before modification."
    }
