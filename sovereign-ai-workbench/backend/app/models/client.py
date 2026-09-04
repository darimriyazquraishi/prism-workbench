import json
import logging
from typing import AsyncGenerator, Any
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


class LocalModelClient:
    def __init__(self, base_url: str = settings.OLLAMA_BASE_URL):
        self.base_url = base_url.rstrip("/")

    async def check_health(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    async def list_available_models(self) -> list[str]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    return [m["name"] for m in data.get("models", [])]
        except Exception as e:
            logger.warning(f"Failed to fetch models from Ollama: {e}")
        return []

    async def generate_chat(
        self,
        model: str,
        messages: list[dict[str, Any]],
        system: str | None = None,
        temperature: float = 0.2,
        format: str | None = None,
        images: list[str] | None = None
    ) -> str:
        """Single-shot chat completion."""
        payload: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature}
        }
        if system:
            payload["messages"] = [{"role": "system", "content": system}] + payload["messages"]
        if format:
            payload["format"] = format

        try:
            async with httpx.AsyncClient(timeout=settings.MODEL_REQUEST_TIMEOUT) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("message", {}).get("content", "")
                else:
                    logger.error(f"Ollama chat error: {res.status_code} {res.text}")
                    return f"Error from local model server: HTTP {res.status_code}"
        except Exception as e:
            logger.error(f"Failed to communicate with local model {model}: {e}")
            # Fallback simulated response if Ollama daemon is offline during testing
            return f"[Local Model Error / Fallback] Unable to reach {model} at {self.base_url}. Error: {str(e)}"

    async def stream_chat(
        self,
        model: str,
        messages: list[dict[str, Any]],
        system: str | None = None,
        temperature: float = 0.2,
    ) -> AsyncGenerator[str, None]:
        """Streaming chat completion yielding text tokens."""
        payload: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {"temperature": temperature}
        }
        if system:
            payload["messages"] = [{"role": "system", "content": system}] + payload["messages"]

        try:
            async with httpx.AsyncClient(timeout=settings.MODEL_REQUEST_TIMEOUT) as client:
                async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        chunk = json.loads(line)
                        content = chunk.get("message", {}).get("content", "")
                        if content:
                            yield content
        except Exception as e:
            logger.error(f"Stream error with local model {model}: {e}")
            yield f"\n[Streaming Error: {str(e)}]"

    async def get_embeddings(self, text: str, model: str = settings.DEFAULT_EMBEDDING_MODEL) -> list[float]:
        """Get embeddings for text from local model."""
        payload = {"model": model, "prompt": text}
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(f"{self.base_url}/api/embeddings", json=payload)
                if res.status_code == 200:
                    return res.json().get("embedding", [])
        except Exception as e:
            logger.error(f"Failed to get embeddings from {model}: {e}")
        # Deterministic pseudo-embedding fallback (384-dim) for offline mock testing
        import hashlib
        h = hashlib.sha256(text.encode("utf-8")).digest()
        return [(b / 255.0) - 0.5 for b in (h * 12)[:384]]


model_client = LocalModelClient()
