# Vision & Color Service

FastAPI boundary for image quality, segmentation, classification, and color-analysis
contracts. It contains no model, SDK, worker, or provider implementation. The
`adapters` package is the only future provider SDK boundary.

## Prerequisites

- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- Python 3.12 (uv downloads it automatically when needed)

## Installation

```sh
cd apps/vision-color
uv sync
```

## Environment

Copy `apps/vision-color/.env.example` to `apps/vision-color/.env`:

```sh
cp apps/vision-color/.env.example apps/vision-color/.env
```

It defines `APP_ENV` (read by `app/infrastructure/settings.py`) and
`VISION_PORT` (overrides the default uvicorn port below).

## Running locally

```sh
uv run uvicorn app.main:app --reload --port 8001
```

Set `VISION_PORT` and use `pnpm dev:vision` from the repository root to use a
different port. Health is available at `http://localhost:8001/health`.

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
