# Try-On Orchestrator

FastAPI boundary for consented virtual try-on provider and job-queue interfaces.
It performs no provider calls, quality gating, media processing, or quota operations.

## Prerequisites

- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- Python 3.12 (uv downloads it automatically when needed)

## Installation

```sh
cd apps/tryon-orchestrator
uv sync
```

## Environment

Copy `apps/tryon-orchestrator/.env.example` to `apps/tryon-orchestrator/.env`:

```sh
cp apps/tryon-orchestrator/.env.example apps/tryon-orchestrator/.env
```

It defines `APP_ENV` (read by `app/infrastructure/settings.py`) and
`TRYON_PORT` (overrides the default uvicorn port below).

## Running locally

```sh
uv run uvicorn app.main:app --reload --port 8003
```

Set `TRYON_PORT` and use `pnpm dev:tryon` from the repository root to use a
different port. Health is available at `http://localhost:8003/health`.

## Running tests

```sh
uv run pytest
```

## Linting

```sh
uv run ruff check .
```

## Type checking

```sh
uv run mypy app tests
```
