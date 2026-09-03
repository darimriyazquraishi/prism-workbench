from dataclasses import dataclass
from typing import Any, Callable, Coroutine, Literal
from pydantic import BaseModel


class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters_schema: dict[str, Any]
    permission_level: Literal["READ_ONLY", "LOCAL_WRITE", "CODE_EXECUTION", "DOCUMENT_GENERATION"]
    requires_sandbox: bool = False


class ToolRegistry:
    def __init__(self):
        self._definitions: dict[str, ToolDefinition] = {}
        self._handlers: dict[str, Callable[..., Coroutine[Any, Any, Any]]] = {}

    def register(
        self,
        name: str,
        description: str,
        parameters_schema: dict[str, Any],
        permission_level: Literal["READ_ONLY", "LOCAL_WRITE", "CODE_EXECUTION", "DOCUMENT_GENERATION"],
        requires_sandbox: bool = False
    ):
        def decorator(func: Callable[..., Coroutine[Any, Any, Any]]):
            self._definitions[name] = ToolDefinition(
                name=name,
                description=description,
                parameters_schema=parameters_schema,
                permission_level=permission_level,
                requires_sandbox=requires_sandbox
            )
            self._handlers[name] = func
            return func
        return decorator

    def get_definition(self, name: str) -> ToolDefinition | None:
        return self._definitions.get(name)

    def get_handler(self, name: str) -> Callable[..., Coroutine[Any, Any, Any]] | None:
        return self._handlers.get(name)

    def list_tools(self) -> list[ToolDefinition]:
        return list(self._definitions.values())

    def get_tools_prompt_description(self) -> str:
        """Formats tool specifications for model planning and reasoning."""
        lines = ["Available Local Tools:"]
        for tool in self._definitions.values():
            lines.append(f"- **{tool.name}** ({tool.permission_level}): {tool.description}")
            lines.append(f"  Parameters: {tool.parameters_schema}")
        return "\n".join(lines)


tool_registry = ToolRegistry()
