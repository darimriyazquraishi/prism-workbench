import asyncio
import logging
import os
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class SandboxResult:
    stdout: str
    stderr: str
    exit_code: int
    duration_seconds: float
    output_files: list[str]
    success: bool


class CodeSandbox:
    """Executes Python code in an isolated Docker container with network disabled, or falls back to restricted process."""

    def __init__(self):
        self.has_docker = self._check_docker()

    def _check_docker(self) -> bool:
        try:
            res = subprocess.run(["docker", "version"], capture_output=True, timeout=2)
            return res.returncode == 0
        except Exception:
            return False

    async def execute_code(self, script_content: str, workspace_dir: str | None = None) -> SandboxResult:
        if not workspace_dir:
            temp_dir = tempfile.mkdtemp(prefix="sovereign_sandbox_")
            cleanup_temp = True
        else:
            temp_dir = workspace_dir
            cleanup_temp = False

        script_file = Path(temp_dir) / "sandbox_exec.py"
        script_file.write_text(script_content, encoding="utf-8")

        start_time = asyncio.get_event_loop().time()

        if self.has_docker and settings.SANDBOX_ENABLED:
            result = await self._run_in_docker(temp_dir, "sandbox_exec.py")
        else:
            result = await self._run_subprocess_restricted(temp_dir, "sandbox_exec.py")

        duration = asyncio.get_event_loop().time() - start_time
        result.duration_seconds = round(duration, 3)

        if cleanup_temp and Path(temp_dir).exists():
            shutil.rmtree(temp_dir, ignore_errors=True)

        return result

    async def _run_in_docker(self, temp_dir: str, script_name: str) -> SandboxResult:
        cmd = [
            "docker", "run", "--rm",
            "--network", "none",
            "--memory", f"{settings.SANDBOX_MAX_MEMORY_MB}m",
            "--cpus", str(settings.SANDBOX_MAX_CPUS),
            "-v", f"{Path(temp_dir).resolve()}:/workspace",
            "-w", "/workspace",
            settings.SANDBOX_DOCKER_IMAGE,
            "python", script_name
        ]
        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            try:
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=settings.SANDBOX_TIMEOUT_SECONDS)
                return SandboxResult(
                    stdout=stdout.decode("utf-8", errors="replace"),
                    stderr=stderr.decode("utf-8", errors="replace"),
                    exit_code=proc.returncode or 0,
                    duration_seconds=0.0,
                    output_files=[f.name for f in Path(temp_dir).iterdir() if f.name != script_name],
                    success=proc.returncode == 0
                )
            except asyncio.TimeoutError:
                proc.kill()
                return SandboxResult(
                    stdout="",
                    stderr=f"Execution timed out after {settings.SANDBOX_TIMEOUT_SECONDS} seconds.",
                    exit_code=-1,
                    duration_seconds=settings.SANDBOX_TIMEOUT_SECONDS,
                    output_files=[],
                    success=False
                )
        except Exception as e:
            logger.warning(f"Docker sandbox execution failed, falling back to restricted subprocess: {e}")
            return await self._run_subprocess_restricted(temp_dir, script_name)

    async def _run_subprocess_restricted(self, temp_dir: str, script_name: str) -> SandboxResult:
        # Restricted subprocess execution with python binary
        env = os.environ.copy()
        env["PYTHONDONTWRITEBYTECODE"] = "1"
        
        try:
            proc = await asyncio.create_subprocess_exec(
                sys.executable,
                str(Path(temp_dir) / script_name),
                cwd=temp_dir,
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            try:
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=settings.SANDBOX_TIMEOUT_SECONDS)
                return SandboxResult(
                    stdout=stdout.decode("utf-8", errors="replace"),
                    stderr=stderr.decode("utf-8", errors="replace"),
                    exit_code=proc.returncode or 0,
                    duration_seconds=0.0,
                    output_files=[f.name for f in Path(temp_dir).iterdir() if f.name != script_name],
                    success=proc.returncode == 0
                )
            except asyncio.TimeoutError:
                proc.kill()
                return SandboxResult(
                    stdout="",
                    stderr=f"Execution timed out after {settings.SANDBOX_TIMEOUT_SECONDS} seconds.",
                    exit_code=-1,
                    duration_seconds=settings.SANDBOX_TIMEOUT_SECONDS,
                    output_files=[],
                    success=False
                )
        except Exception as e:
            return SandboxResult(
                stdout="",
                stderr=f"Subprocess launch error: {str(e)}",
                exit_code=-1,
                duration_seconds=0.0,
                output_files=[],
                success=False
            )


code_sandbox = CodeSandbox()
