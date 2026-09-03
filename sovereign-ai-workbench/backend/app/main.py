import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.api.routes import chat, documents, knowledge, artifacts, models, tools, audit, system

# Import all tools to ensure they are registered with tool_registry
import app.tools.file_tools
import app.tools.document_tools
import app.tools.knowledge_tools
import app.tools.code_tools
import app.tools.spreadsheet_tools
import app.tools.office_tools
import app.tools.calc_tools

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("==========================================================")
    logger.info(" SovereignAI Workbench — Starting On-Premise Backend")
    logger.info(f" Mode: {settings.ENVIRONMENT.upper()} (Strict Air-Gap Enforced)")
    logger.info(f" Storage Directory: {settings.DATA_DIR}")
    logger.info("==========================================================")
    yield
    logger.info("SovereignAI Workbench Backend shutting down gracefully.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sovereign On-Premise Agentic AI Workbench for Confidential Industrial Work (MRPL / SIH26117)",
    lifespan=lifespan
)

# CORS Configuration for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(chat.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")
app.include_router(artifacts.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(tools.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(system.router, prefix="/api")

# Mount Static Artifacts for preview/download
app.mount("/static/artifacts", StaticFiles(directory=str(settings.ARTIFACTS_DIR)), name="artifacts")


@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "OPERATIONAL",
        "sovereignty": "AIR-GAPPED SOVEREIGN AI ACTIVE",
        "docs_url": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
