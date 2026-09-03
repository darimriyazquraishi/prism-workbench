import math
import re
from app.tools.registry import tool_registry


@tool_registry.register(
    name="calculator",
    description="Execute deterministic mathematical calculations, engineering formulas, and unit conversions. Always use this instead of LLM mental math.",
    parameters_schema={
        "type": "object",
        "properties": {
            "expression": {"type": "string", "description": "Mathematical expression (e.g., '(5.0 - 3.8) / 3.5' or '1200 * 18')"}
        },
        "required": ["expression"]
    },
    permission_level="READ_ONLY",
    requires_sandbox=False
)
async def calculator(expression: str) -> dict:
    """Safe deterministic calculator evaluating standard arithmetic and math functions."""
    # Whitelist allowed math symbols and names
    clean_expr = expression.strip().replace("^", "**")
    allowed_names = {
        "sin": math.sin,
        "cos": math.cos,
        "tan": math.tan,
        "sqrt": math.sqrt,
        "log": math.log,
        "log10": math.log10,
        "exp": math.exp,
        "pi": math.pi,
        "e": math.e,
        "abs": abs,
        "round": round,
        "min": min,
        "max": max,
    }

    # Ensure no dangerous builtins
    if re.search(r"[a-zA-Z_][a-zA-Z0-9_]*", clean_expr):
        tokens = re.findall(r"[a-zA-Z_][a-zA-Z0-9_]*", clean_expr)
        for token in tokens:
            if token not in allowed_names:
                return {"error": f"Invalid math token: '{token}'. Only standard arithmetic and math functions allowed."}

    try:
        result = eval(clean_expr, {"__builtins__": None}, allowed_names)
        return {
            "expression": expression,
            "result": result,
            "formatted_result": f"{result:,.4f}".rstrip("0").rstrip(".") if isinstance(result, float) else str(result),
            "status": "success"
        }
    except Exception as e:
        return {"error": f"Calculation failed: {str(e)}"}


@tool_registry.register(
    name="industrial_corrosion_calculator",
    description="Calculates corrosion rate and remaining service life of piping/vessels based on inspection thickness measurements according to API 570 standards.",
    parameters_schema={
        "type": "object",
        "properties": {
            "initial_thickness_mm": {"type": "number", "description": "Previous or nominal thickness (mm)"},
            "actual_thickness_mm": {"type": "number", "description": "Current measured thickness (mm)"},
            "years_elapsed": {"type": "number", "description": "Time between inspections (years)"},
            "minimum_allowable_thickness_mm": {"type": "number", "description": "Retirement limit / minimum allowable thickness (mm)"}
        },
        "required": ["initial_thickness_mm", "actual_thickness_mm", "years_elapsed", "minimum_allowable_thickness_mm"]
    },
    permission_level="READ_ONLY",
    requires_sandbox=False
)
async def industrial_corrosion_calculator(
    initial_thickness_mm: float,
    actual_thickness_mm: float,
    years_elapsed: float,
    minimum_allowable_thickness_mm: float
) -> dict:
    if years_elapsed <= 0:
        return {"error": "years_elapsed must be greater than 0"}

    loss_mm = initial_thickness_mm - actual_thickness_mm
    corrosion_rate_mm_year = loss_mm / years_elapsed

    if corrosion_rate_mm_year <= 0:
        remaining_life_years = 999.0
    else:
        remaining_margin = actual_thickness_mm - minimum_allowable_thickness_mm
        remaining_life_years = remaining_margin / corrosion_rate_mm_year

    status = "CRITICAL - RETIREMENT LIMIT EXCEEDED" if actual_thickness_mm < minimum_allowable_thickness_mm else (
        "WARNING - IMMEDIATE REVIEW" if remaining_life_years < 3.0 else "ACCEPTABLE"
    )

    return {
        "initial_thickness_mm": initial_thickness_mm,
        "actual_thickness_mm": actual_thickness_mm,
        "minimum_allowable_thickness_mm": minimum_allowable_thickness_mm,
        "total_metal_loss_mm": round(loss_mm, 4),
        "corrosion_rate_mm_year": round(corrosion_rate_mm_year, 4),
        "remaining_life_years": round(max(0.0, remaining_life_years), 2),
        "condition_status": status,
        "standard_reference": "API 570 / ASME B31.3 Inspection Standard"
    }
