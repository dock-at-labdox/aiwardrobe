# Recommendation Service

FastAPI boundary for future deterministic eligibility, rules, embeddings, and grounded
LLM explanation interfaces. This scaffold deliberately implements none of them.

## Prerequisites

- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- Python 3.12 (uv downloads it automatically when needed)

## Installation

```sh
cd apps/recommendation
uv sync
```

## Environment

Copy `apps/recommendation/.env.example` to `apps/recommendation/.env`:

```sh
cp apps/recommendation/.env.example apps/recommendation/.env
```

It defines `APP_ENV` (read by `app/infrastructure/settings.py`) and
`RECOMMENDATION_PORT` (overrides the default uvicorn port below).

## Running locally

```sh
uv run uvicorn app.main:app --reload --port 8002
```

Set `RECOMMENDATION_PORT` and use `pnpm dev:recommendation` from the repository
root to use a different port. Health is available at `http://localhost:8002/health`.

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
