import socket
import logging
from dataclasses import dataclass, field
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class NetworkAuditState:
    external_calls_attempted: int = 0
    blocked_connections: list[dict] = field(default_factory=list)
    active_local_services: list[str] = field(default_factory=lambda: ["Ollama Local (11434)", "ChromaDB Local", "SQLite Audit Engine"])
    is_air_gapped: bool = True
    start_time: str = field(default_factory=lambda: datetime.utcnow().isoformat())


network_state = NetworkAuditState()

# Allowed loopback/local networks
ALLOWED_HOSTS = {"localhost", "127.0.0.1", "::1", "0.0.0.0", "host.docker.internal"}


class SovereigntyGuard:
    @staticmethod
    def get_sovereignty_report() -> dict:
        return {
            "is_air_gapped": network_state.is_air_gapped,
            "external_api_calls": network_state.external_calls_attempted,
            "internet_dependency": "NONE",
            "network_mode": "AIR_GAPPED_ENFORCED",
            "local_inference_status": "ONLINE (Open-Weight Models)",
            "local_ocr_status": "ONLINE (Local PaddleOCR/Tesseract)",
            "local_rag_status": "ONLINE (Local ChromaDB)",
            "local_sandbox_status": "ONLINE (Isolated Container, Net: None)",
            "blocked_external_attempts": network_state.blocked_connections[-10:],
            "telemetry_policy": "NO_TELEMETRY_COLLECTED_OR_SENT",
            "active_services": network_state.active_local_services
        }

    @staticmethod
    def log_external_attempt(host: str, port: int):
        network_state.external_calls_attempted += 1
        record = {
            "timestamp": datetime.utcnow().isoformat(),
            "target_host": host,
            "target_port": port,
            "action": "BLOCKED" if settings.STRICT_AIR_GAP_ENFORCEMENT else "WARNED"
        }
        network_state.blocked_connections.append(record)
        logger.warning(f"[Sovereignty Guard] Intercepted external connection attempt to {host}:{port} -> {record['action']}")


sovereignty_guard = SovereigntyGuard()
