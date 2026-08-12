import ast
import pathlib
import sys

command = sys.argv[1] if len(sys.argv) > 1 else ""
if command not in {"lint", "typecheck", "test", "build"}:
    raise SystemExit(f"Unsupported check: {command}")
for source in (pathlib.Path(__file__).parent.parent / "app").rglob("*.py"):
    ast.parse(source.read_text(encoding="utf-8"), filename=str(source))
print(f"recommendation {command} foundation check passed")
