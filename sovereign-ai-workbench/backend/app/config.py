from pathlib import Path
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Core Application
    APP_NAME: str = "SovereignAI Workbench"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: Literal["air-gapped", "on-premise", "development"] = "air-gapped"
    
    # Host & Port
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Storage Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    DOCUMENTS_DIR: Path = DATA_DIR / "documents"
    KNOWLEDGE_DIR: Path = DATA_DIR / "knowledge"
    ARTIFACTS_DIR: Path = DATA_DIR / "artifacts"
    INDEXES_DIR: Path = DATA_DIR / "indexes"
    WORKSPACES_DIR: Path = DATA_DIR / "workspaces"
    AUDIT_DB_PATH: Path = DATA_DIR / "audit.db"

    # Local Model Serving (Ollama / llama.cpp)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_GENERAL_MODEL: str = "qwen3:8b"
    DEFAULT_VISION_MODEL: str = "qwen2.5-vl:7b"
    DEFAULT_CODING_MODEL: str = "qwen2.5-coder:7b"
    DEFAULT_EMBEDDING_MODEL: str = "nomic-embed-text"
    MODEL_REQUEST_TIMEOUT: float = 180.0
    VRAM_BUDGET_MB: int = 16384  # 16GB default target VRAM

    # Vector Database (ChromaDB)
    CHROMA_COLLECTION_NAME: str = "mrpl_industrial_knowledge"
    RAG_TOP_K: int = 5
    RAG_CHUNK_SIZE: int = 512
    RAG_CHUNK_OVERLAP: int = 64

    # Code Execution Sandbox
    SANDBOX_ENABLED: bool = True
    SANDBOX_DOCKER_IMAGE: str = "sovereign-sandbox:latest"
    SANDBOX_TIMEOUT_SECONDS: int = 30
    SANDBOX_MAX_MEMORY_MB: int = 256
    SANDBOX_MAX_CPUS: float = 1.0

    # Security & Sovereignty
    STRICT_AIR_GAP_ENFORCEMENT: bool = True
    ALLOW_EXTERNAL_CALLS: bool = False
    MAX_UPLOAD_SIZE_BYTES: int = 100 * 1024 * 1024  # 100 MB


settings = Settings()

# Ensure directories exist
for path in [
    settings.DATA_DIR,
    settings.DOCUMENTS_DIR,
    settings.KNOWLEDGE_DIR,
    settings.ARTIFACTS_DIR,
    settings.INDEXES_DIR,
    settings.WORKSPACES_DIR,
]:
    path.mkdir(parents=True, exist_ok=True)
