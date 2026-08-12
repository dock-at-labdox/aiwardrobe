# Turborepo

## Purpose

Turborepo schedules and caches the JavaScript and TypeScript workspace tasks in
this pnpm monorepo. It preserves the existing application and package layout,
builds dependency packages before their consumers, and avoids bespoke build
orchestration.

## Workspace architecture

The pnpm workspace contains the NestJS API (`apps/backend`), public Next.js app
(`apps/web`), admin Next.js app (`apps/admin`), and shared TypeScript packages.
The FastAPI services remain independent Python projects outside the pnpm
workspace. They use uv, each with its own `pyproject.toml`, `uv.lock`, and local
`.venv`; they are not Turborepo workspace members.

## Commands

Use `pnpm turbo <task>` for JavaScript workspace tasks. Development servers are
started explicitly through the root named commands:

- `pnpm dev:web`, `pnpm dev:admin`, and `pnpm dev:backend` start one selected
  JavaScript service through Turbo.
- `pnpm dev:vision`, `pnpm dev:recommendation`, and `pnpm dev:tryon` start the
  corresponding FastAPI service through `uv run uvicorn`.
- `pnpm turbo build`, `lint`, `typecheck`, `test`, and `format` run the matching
  workspace scripts.
- Root `pnpm build`, `lint`, `typecheck`, and `test` include the corresponding
  uv-based Python validation.
- `pnpm format` is the full-repository Prettier check, including Markdown and
  GitHub configuration outside workspace packages.

FastAPI development remains explicit and independent. This avoids adding
artificial Node manifests or a custom multi-process wrapper to Python services.
Run `uv sync` from an individual service directory before editor or local tool
use; `uv run` keeps its local environment synchronized with its committed lock.
Each service overrides its own port through its own `.env` file: `apps/web/.env`
(`WEB_PORT`), `apps/admin/.env` (`ADMIN_PORT`), `apps/backend/.env`
(`API_PORT`), `apps/vision-color/.env` (`VISION_PORT`),
`apps/recommendation/.env` (`RECOMMENDATION_PORT`), and
`apps/tryon-orchestrator/.env` (`TRYON_PORT`) — defaults are 3000, 3001,
4000, 8001, 8002, and 8003 respectively. See
[ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md) for the full per-service
variable list.

## Task graph and cache

`build` depends on `^build`, so dependency packages build before consuming
applications. Build cache outputs are `dist/**` for NestJS and shared packages,
and `.next/**` excluding `.next/cache/**` for Next.js applications. Development
tasks are persistent and uncached; lint, format, typecheck, and test cache their
successful task result and logs without declaring output artifacts.

Local cache is automatic in `.turbo/` and is ignored by Git. CI restores that
directory with GitHub Actions cache in addition to pnpm's dependency-store cache.
No Remote Cache is required today.

## CI and Remote Cache

The Quality workflow uses the root Prettier check for repository-wide formatting,
uses Turbo for JavaScript workspace lint, typecheck, build, and test, and has a
separate Python job for FastAPI lint, typecheck, build, and test. The Security
workflow remains independent because dependency auditing and secret checks are
not build tasks.

To enable Vercel Remote Cache later, set `TURBO_TOKEN` as a GitHub secret and
`TURBO_TEAM` as a GitHub repository variable, then expose them to the Quality
workflow. No `turbo.json` change is required.

## Migration report

- Added Turbo `2.10.7` as a root development dependency and `turbo.json`.
- Replaced recursive pnpm JavaScript task execution with Turbo commands.
- Added the NestJS `dev` alias and package-level formatting scripts.
- Standardized the FastAPI services on uv with independent lockfiles and root
  commands that delegate to their uv-based checks.
- Added local Turbo cache restoration in CI; Remote Cache is intentionally
  deferred until the team configures credentials.
