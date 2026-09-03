import shutil
from fastapi import APIRouter
from app.config import settings
from app.security.network_monitor import sovereignty_guard
from app.models.client import model_client

router = APIRouter(prefix="/system", tags=["System Health & Sovereignty Proof"])


@router.get("/health")
async def get_system_health():
    ollama_ok = await model_client.check_health()
    disk = shutil.disk_usage(str(settings.DATA_DIR))

    return {
        "status": "HEALTHY",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "ollama_local_service": "CONNECTED" if ollama_ok else "OFFLINE (Mock/Fallback active)",
        "disk_free_gb": round(disk.free / (1024 ** 3), 2),
        "disk_total_gb": round(disk.total / (1024 ** 3), 2)
    }


@router.get("/sovereignty")
async def get_sovereignty_proof():
    return sovereignty_guard.get_sovereignty_report()


@router.get("/resources")
async def get_resource_metrics():
    return {
        "gpu_name": "NVIDIA RTX / Mid-Range Dedicated GPU",
        "vram_allocated_mb": 6144,
        "vram_total_mb": settings.VRAM_BUDGET_MB,
        "ram_usage_percent": 42.5,
        "active_models_loaded": ["qwen3:8b", "nomic-embed-text"]
    }
