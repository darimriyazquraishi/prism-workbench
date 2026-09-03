from fastapi import APIRouter
from app.models.registry import registry
from app.models.client import model_client
from app.config import settings

router = APIRouter(prefix="/models", tags=["Model Registry & Routing"])


@router.get("")
async def list_registered_models():
    models = registry.list_all()
    available_in_ollama = await model_client.list_available_models()
    result = []
    for m in models:
        result.append({
            "id": m.id,
            "ollama_name": m.ollama_name,
            "type": m.type,
            "capabilities": m.capabilities,
            "context_window": m.context_window,
            "vision": m.vision,
            "coding": m.coding,
            "vram_mb": m.vram_mb,
            "description": m.description,
            "is_installed": any(m.ollama_name in av for av in available_in_ollama) if available_in_ollama else True
        })
    return {
        "models": result,
        "total_vram_budget_mb": settings.VRAM_BUDGET_MB,
        "active_backend": "Ollama Local Daemon",
        "provider": "Sovereign / Open-Weight (Qwen & Nomic)"
    }
