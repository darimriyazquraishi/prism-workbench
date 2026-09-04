from dataclasses import dataclass
from pathlib import Path
from app.models.registry import registry, ModelMetadata
from app.config import settings


@dataclass
class RoutingDecision:
    selected_model_id: str
    ollama_model_name: str
    task_type: str
    reason: str
    alternatives: list[str]
    vram_allocated_mb: int


class ModelRouter:
    """Classifies incoming tasks and routes to the most capable local open-weight model."""

    def route(
        self,
        task_text: str,
        attached_files: list[str] | None = None,
        force_model: str | None = None
    ) -> RoutingDecision:
        if force_model and registry.get(force_model):
            meta = registry.get(force_model)!
            return RoutingDecision(
                selected_model_id=meta.id,
                ollama_model_name=meta.ollama_name,
                task_type="Manual Override",
                reason=f"User explicitly requested {meta.id}.",
                alternatives=[],
                vram_allocated_mb=meta.vram_mb
            )

        attached_files = attached_files or []
        task_lower = task_text.lower()

        # 1. Check for Multimodal / Image / P&ID / Scanned Document
        has_images = any(f.lower().endswith((".png", ".jpg", ".jpeg", ".tiff", ".bmp")) for f in attached_files)
        is_vision_query = any(k in task_lower for k in ["p&id", "pid", "drawing", "diagram", "blueprint", "image", "photo", "scanned", "visual", "schematic"])
        
        if has_images or is_vision_query:
            vlm = registry.get("qwen2.5-vl-7b") or registry.get_by_capability("vision")[0]
            return RoutingDecision(
                selected_model_id=vlm.id,
                ollama_model_name=vlm.ollama_name,
                task_type="Vision & Document Intelligence",
                reason="Task involves image inputs, engineering schematics, P&IDs, or scanned diagrams requiring spatial vision reasoning.",
                alternatives=["qwen3-8b"],
                vram_allocated_mb=vlm.vram_mb
            )

        # 2. Check for Code Generation / Data Analysis / Script Execution
        is_code_task = any(k in task_lower for k in [
            "python", "code", "script", "dataframe", "csv", "xlsx", "calculate statistics",
            "plot", "pandas", "numpy", "debug", "execute script", "simulation", "mtbf"
        ])
        has_tabular = any(f.lower().endswith((".csv", ".xlsx", ".xls")) for f in attached_files)

        if is_code_task or has_tabular:
            coder = registry.get("qwen2.5-coder-7b") or registry.get_by_capability("coding")[0]
            return RoutingDecision(
                selected_model_id=coder.id,
                ollama_model_name=coder.ollama_name,
                task_type="Code & Numerical Analysis",
                reason="Task requires writing, executing, or debugging Python code for data processing and deterministic arithmetic.",
                alternatives=["qwen3-8b"],
                vram_allocated_mb=coder.vram_mb
            )

        # 3. Default to General Reasoning & Synthesis Model
        general = registry.get("qwen3-8b") or registry.list_all()[0]
        return RoutingDecision(
            selected_model_id=general.id,
            ollama_model_name=general.ollama_name,
            task_type="General Reasoning & Synthesis",
            reason="Task requires multi-step planning, RAG synthesis, policy comparison, and document draft generation.",
            alternatives=["qwen2.5-coder-7b"],
            vram_allocated_mb=general.vram_mb
        )


router = ModelRouter()
