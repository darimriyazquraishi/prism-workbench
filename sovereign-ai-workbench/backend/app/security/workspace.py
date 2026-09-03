from pathlib import Path


class SecurityException(Exception):
    pass


def validate_path(requested_path: str, base_dir: str) -> str:
    """
    Validates that requested_path does not escape the allowed base directory.
    Prevents path traversal attacks (e.g., ../../etc/passwd or C:\\Windows).
    """
    base = Path(base_dir).resolve()
    target = (base / requested_path).resolve() if not Path(requested_path).is_absolute() else Path(requested_path).resolve()

    try:
        target.relative_to(base)
    except ValueError:
        raise SecurityException(
            f"Access Denied: Path traversal detected. Target '{requested_path}' is outside sandbox root '{base_dir}'."
        )

    return str(target)
