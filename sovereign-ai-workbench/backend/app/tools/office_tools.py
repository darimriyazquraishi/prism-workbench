from typing import Any
from app.tools.registry import tool_registry
from app.artifacts.docx_gen import generate_professional_docx
from app.artifacts.xlsx_gen import generate_professional_xlsx
from app.artifacts.pptx_gen import generate_professional_pptx


@tool_registry.register(
    name="generate_docx",
    description="Generate a formal, publication-ready Word document (.docx) approval note with executive summary, inspection findings, math calculations, recommendations, citations, and sign-off block.",
    parameters_schema={
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "Title of the approval note"},
            "subject": {"type": "string", "description": "Subject / Asset tag under review"},
            "executive_summary": {"type": "string", "description": "Executive summary paragraph"},
            "findings": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "tag": {"type": "string"},
                        "condition": {"type": "string"},
                        "measured": {"type": "string"},
                        "severity": {"type": "string"}
                    }
                }
            },
            "calculations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "parameter": {"type": "string"},
                        "formula": {"type": "string"},
                        "result": {"type": "string"},
                        "limit": {"type": "string"}
                    }
                }
            },
            "recommendations": {"type": "array", "items": {"type": "string"}},
            "references": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["title", "subject", "executive_summary", "findings", "recommendations"]
    },
    permission_level="DOCUMENT_GENERATION",
    requires_sandbox=False
)
async def generate_docx(
    title: str,
    subject: str,
    executive_summary: str,
    findings: list[dict],
    recommendations: list[str],
    calculations: list[dict] | None = None,
    references: list[str] | None = None
) -> dict:
    path = generate_professional_docx(
        title=title,
        subject=subject,
        executive_summary=executive_summary,
        findings=findings,
        calculations=calculations or [],
        recommendations=recommendations,
        references=references or []
    )
    return {
        "status": "success",
        "file_type": "docx",
        "file_path": path,
        "message": f"Successfully generated Word Approval Note deliverable: {path}"
    }


@tool_registry.register(
    name="generate_xlsx",
    description="Generate an industrial formatted Excel (.xlsx) workbook with summary metrics and structured records.",
    parameters_schema={
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "headers": {"type": "array", "items": {"type": "string"}},
            "data_rows": {"type": "array", "items": {"type": "array"}},
            "summary_stats": {"type": "object"}
        },
        "required": ["title", "headers", "data_rows"]
    },
    permission_level="DOCUMENT_GENERATION",
    requires_sandbox=False
)
async def generate_xlsx(
    title: str,
    headers: list[str],
    data_rows: list[list],
    summary_stats: dict | None = None
) -> dict:
    path = generate_professional_xlsx(
        title=title,
        headers=headers,
        data_rows=data_rows,
        summary_stats=summary_stats
    )
    return {
        "status": "success",
        "file_type": "xlsx",
        "file_path": path,
        "message": f"Successfully generated Excel dataset deliverable: {path}"
    }


@tool_registry.register(
    name="generate_pptx",
    description="Generate an executive slide deck (.pptx) summarizing engineering inspections or project status.",
    parameters_schema={
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "subtitle": {"type": "string"},
            "slides": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "heading": {"type": "string"},
                        "bullets": {"type": "array", "items": {"type": "string"}}
                    }
                }
            }
        },
        "required": ["title", "subtitle", "slides"]
    },
    permission_level="DOCUMENT_GENERATION",
    requires_sandbox=False
)
async def generate_pptx(
    title: str,
    subtitle: str,
    slides: list[dict]
) -> dict:
    path = generate_professional_pptx(
        title=title,
        subtitle=subtitle,
        slides_data=slides
    )
    return {
        "status": "success",
        "file_type": "pptx",
        "file_path": path,
        "message": f"Successfully generated PowerPoint deck deliverable: {path}"
    }
