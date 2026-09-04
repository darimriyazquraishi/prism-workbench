from dataclasses import dataclass, field
from typing import Literal


@dataclass
class ModelMetadata:
    id: str
    ollama_name: str
    type: Literal["llm", "vlm", "code", "embedding"]
    capabilities: list[str]
    context_window: int
    vision: bool = False
    coding: bool = False
    priority: float = 1.0
    vram_mb: int = 6000
    description: str = ""
    is_active: bool = True


class ModelRegistry:
    def __init__(self):
        self._models: dict[str, ModelMetadata] = {}
        self._register_defaults()

    def _register_defaults(self):
        defaults = [
            ModelMetadata(
                id="qwen3-8b",
                ollama_name="qwen3:8b",
                type="llm",
                capabilities=["general", "reasoning", "document_analysis", "planning", "tool_calling"],
                context_window=32768,
                vision=False,
                coding=True,
                priority=0.9,
                vram_mb=6144,
                description="High-performance open-weight LLM for industrial reasoning, multi-step orchestration, and document synthesis."
            ),
            ModelMetadata(
                id="qwen2.5-vl-7b",
                ollama_name="qwen2.5-vl:7b",
                type="vlm",
                capabilities=["vision", "ocr", "p_and_id_analysis", "diagram_reading"],
                context_window=32768,
                vision=True,
                coding=False,
                priority=0.85,
                vram_mb=7680,
                description="Multimodal Vision-Language model for engineering drawings, P&IDs, scanned forms, and equipment photos."
            ),
            ModelMetadata(
                id="qwen2.5-coder-7b",
                ollama_name="qwen2.5-coder:7b",
                type="code",
                capabilities=["coding", "python_generation", "data_science", "error_debugging"],
                context_window=32768,
                vision=False,
                coding=True,
                priority=0.8,
                vram_mb=6144,
                description="Specialized coding model for automated Python numerical scripts, data processing, and sandbox execution."
            ),
            ModelMetadata(
                id="nomic-embed-text",
                ollama_name="nomic-embed-text",
                type="embedding",
                capabilities=["embedding", "semantic_search", "rag"],
                context_window=8192,
                vision=False,
                coding=False,
                priority=1.0,
                vram_mb=512,
                description="Local text embedding model (768-dim) for internal SOP/manual retrieval."
            )
        ]
        for m in defaults:
            self._models[m.id] = m

    def get(self, model_id: str) -> ModelMetadata | None:
        return self._models.get(model_id)

    def list_all(self) -> list[ModelMetadata]:
        return list(self._models.values())

    def register(self, model: ModelMetadata):
        self._models[model.id] = model

    def get_by_capability(self, capability: str) -> list[ModelMetadata]:
        return [m for m in self._models.values() if capability in m.capabilities and m.is_active]


registry = ModelRegistry()
