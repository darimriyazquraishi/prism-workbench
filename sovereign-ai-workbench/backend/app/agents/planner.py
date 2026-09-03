import json
import logging
from app.agents.state import AgentStep
from app.models.client import model_client
from app.tools.registry import tool_registry

logger = logging.getLogger(__name__)


PLANNER_SYSTEM_PROMPT = """You are the Lead Sovereign AI Orchestrator for an industrial refinery workbench.
Your job is to break down a complex industrial user task into 3 to 6 ordered, actionable steps.

You have access to the following local tools:
{tools_description}

Rules:
1. Return ONLY a valid JSON array of steps. No markdown preamble, no thought commentary.
2. Each step must have:
   - "step_id": integer starting from 1
   - "title": short action title (e.g. "OCR Inspection Report")
   - "description": clear explanation of what this step achieves
   - "tool_name": name of the specific local tool to invoke, or null if it is pure synthesis.

Example JSON output:
[
  {{"step_id": 1, "title": "Extract Report & Run OCR", "description": "Process scanned PDF to extract findings.", "tool_name": "ocr_document"}},
  {{"step_id": 2, "title": "Retrieve Internal SOP Standard", "description": "Query local RAG knowledge base for threshold limits.", "tool_name": "search_internal_knowledge"}},
  {{"step_id": 3, "title": "Calculate Corrosion Rate", "description": "Use deterministic formula to compute remaining life.", "tool_name": "industrial_corrosion_calculator"}},
  {{"step_id": 4, "title": "Generate Approval Note Deliverable", "description": "Create formal Word .docx document with sign-off block.", "tool_name": "generate_docx"}}
]
"""


class TaskPlanner:
    async def create_plan(
        self,
        objective: str,
        attached_files: list[str],
        model_name: str
    ) -> list[AgentStep]:
        tools_desc = tool_registry.get_tools_prompt_description()
        system = PLANNER_SYSTEM_PROMPT.format(tools_description=tools_desc)

        user_content = f"Task: {objective}\nAttached Files: {', '.join(attached_files) if attached_files else 'None'}\n\nDecompose into an execution plan JSON."

        messages = [{"role": "user", "content": user_content}]
        raw_plan = await model_client.generate_chat(
            model=model_name,
            messages=messages,
            system=system,
            temperature=0.1
        )

        steps: list[AgentStep] = []
        try:
            # Clean JSON markdown fences if present
            cleaned = raw_plan.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
                cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            if isinstance(parsed, dict) and "plan" in parsed:
                parsed = parsed["plan"]

            for idx, s in enumerate(parsed):
                steps.append(AgentStep(
                    step_id=s.get("step_id", idx + 1),
                    title=s.get("title", f"Step {idx + 1}"),
                    description=s.get("description", ""),
                    tool_name=s.get("tool_name"),
                    status="pending"
                ))
        except Exception as e:
            logger.warning(f"Failed to parse model plan as JSON ({e}). Falling back to heuristic plan.")
            steps = self._generate_heuristic_plan(objective, attached_files)

        return steps

    def _generate_heuristic_plan(self, objective: str, attached_files: list[str]) -> list[AgentStep]:
        """Deterministic plan fallback if local model response formatting is noisy."""
        obj_lower = objective.lower()
        steps = []

        if any(f.endswith(".pdf") or "inspection" in obj_lower for f in attached_files):
            steps.append(AgentStep(step_id=1, title="Extract & OCR Document", description="Process uploaded inspection report pages and perform local OCR.", tool_name="ocr_document"))
            steps.append(AgentStep(step_id=2, title="Retrieve Compliance SOP", description="Search internal knowledge base for allowable limits and corrosion standards.", tool_name="search_internal_knowledge"))
            steps.append(AgentStep(step_id=3, title="Calculate Corrosion & Service Life", description="Run deterministic calculation for wall thinning and remaining lifespan.", tool_name="industrial_corrosion_calculator"))
            steps.append(AgentStep(step_id=4, title="Generate Word Approval Deliverable", description="Create formatted Word (.docx) approval note with human sign-off block.", tool_name="generate_docx"))
        elif any(f.endswith((".csv", ".xlsx")) or "python" in obj_lower for f in attached_files):
            steps.append(AgentStep(step_id=1, title="Inspect Dataset Structure", description="Read spreadsheet schema and statistical summary.", tool_name="read_excel"))
            steps.append(AgentStep(step_id=2, title="Execute Code Analysis in Sandbox", description="Run sandboxed Python script for statistical aggregation and chart generation.", tool_name="execute_python"))
            steps.append(AgentStep(step_id=3, title="Generate Excel Dataset Deliverable", description="Export calculated metrics into a clean Excel report.", tool_name="generate_xlsx"))
        elif any(f.endswith((".png", ".jpg")) or "p&id" in obj_lower for f in attached_files):
            steps.append(AgentStep(step_id=1, title="Vision Analysis of Engineering Drawing", description="Inspect P&ID diagram to extract equipment tags, valve IDs, and flow lines.", tool_name="analyze_image"))
            steps.append(AgentStep(step_id=2, title="Generate Technical Briefing Slide Deck", description="Produce presentation slides summarizing diagram observations.", tool_name="generate_pptx"))
        else:
            steps.append(AgentStep(step_id=1, title="Retrieve Relevant Standards", description="Query local RAG knowledge base for context.", tool_name="search_internal_knowledge"))
            steps.append(AgentStep(step_id=2, title="Synthesize Technical Analysis", description="Reason through operational requirements and prepare recommendations.", tool_name=None))

        return steps


planner = TaskPlanner()
