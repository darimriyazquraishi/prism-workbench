from fastapi import APIRouter
from app.tools.registry import tool_registry

router = APIRouter(prefix="/tools", tags=["Tool Registry & Sandboxing"])


@router.get("")
async def list_tools():
    return tool_registry.list_tools()
