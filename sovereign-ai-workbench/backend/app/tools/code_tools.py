from app.tools.registry import tool_registry
from app.sandbox.docker_sandbox import code_sandbox


@tool_registry.register(
    name="execute_python",
    description="Execute Python scripts in an isolated, network-disabled sandbox for data analysis, numerical calculations, or chart plotting.",
    parameters_schema={
        "type": "object",
        "properties": {
            "code": {"type": "string", "description": "Python source code to execute in sandbox"}
        },
        "required": ["code"]
    },
    permission_level="CODE_EXECUTION",
    requires_sandbox=True
)
async def execute_python(code: str) -> dict:
    res = await code_sandbox.execute_code(code)
    return {
        "success": res.success,
        "stdout": res.stdout,
        "stderr": res.stderr,
        "exit_code": res.exit_code,
        "duration_seconds": res.duration_seconds,
        "generated_files": res.output_files
    }
