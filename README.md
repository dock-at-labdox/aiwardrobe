# AI Wardrobe

The canonical AttireIQ monorepo. It contains public and admin Next.js applications, NestJS product API,
three independently deployable FastAPI services, and versioned shared contracts.

## Quick Start

New to the repository? Follow the complete [Developer Setup Guide](docs/DEVELOPER_SETUP.md).
It covers prerequisites, first-time installation, environment variables, service-specific
development commands, validation, and troubleshooting.

## Architecture

- `apps/web`: presentation only; no product-authority decisions.
- `apps/admin`: separate administrative application; no customer-facing routes.
- `apps/backend`: NestJS modular monolith and sole PostgreSQL writer.
- `apps/vision-color`, `apps/recommendation`, `apps/tryon-orchestrator`: contract-only
  FastAPI service foundations. They never read core tables.
- `packages/shared-schemas`: language-neutral OpenAPI/JSON Schema, DTO, event, and validation
  source of truth; also currently the home for hand-maintained shared TypeScript types until
  OpenAPI-to-TypeScript codegen replaces them.
- `packages/shared-config`: shared TypeScript and ESLint base configuration consumed by every
  app and package.
- `packages/shared-web`: shared client providers, UI primitives, forms, and API utilities.

## Setup and commands

Node.js services use Node 22, pnpm 10, and Turborepo. Run
`pnpm install --frozen-lockfile` after the lockfile is committed; Turborepo
schedules and locally caches the JavaScript workspace tasks.

Python services use [uv](https://docs.astral.sh/uv/) and the repository's Python
3.12 pin. Install uv, then run `uv sync` from the required service directory;
each service commits its own `uv.lock` and creates an ignored local `.venv`.
Use `uv run ruff check .`, `uv run mypy app tests`, and `uv run pytest` for
Python quality checks. Root `pnpm build`, `pnpm lint`, `pnpm typecheck`, and
`pnpm test` delegate to the corresponding uv workflows as well.

Every app owns its own environment configuration: copy the `.env.example`
file inside the app(s) you plan to run to `.env` in that same directory
(e.g. `cp apps/backend/.env.example apps/backend/.env`). No root `.env` or
manual `source`/export step is needed — each app loads its own file
automatically. See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for the
full per-service variable list and rationale.

Development servers are started independently.

| Service             | Command                   | URL                             |
| ------------------- | ------------------------- | ------------------------------- |
| Public web          | `pnpm dev:web`            | http://localhost:3000           |
| Admin               | `pnpm dev:admin`          | http://localhost:3001           |
| NestJS API          | `pnpm dev:backend`        | http://localhost:4000/v1/health |
| Vision & Color      | `pnpm dev:vision`         | http://localhost:8001/health    |
| Recommendation      | `pnpm dev:recommendation` | http://localhost:8002/health    |
| Try-On Orchestrator | `pnpm dev:tryon`          | http://localhost:8003/health    |

There is intentionally no bundled `pnpm dev` command. Start only the services
needed for the current task. See [the Turborepo guide](docs/TURBOREPO.md) for
task, cache, and CI details.

## Continuous integration

On pull requests and pushes to `main`, the quality workflow restores pnpm and
Turbo local caches, then runs the full-repository format check followed by Turbo
lint, type-check, build, test, and contract-validation tasks. Its separate Python foundation job runs lint,
type-check, build, and test with Python 3.12. The security workflow runs the
tracked-environment-file check on pull requests and a weekly scheduled production
dependency audit; it also runs on pull requests.

Docker and local infrastructure intentionally begin in EL-002, not this scaffold.

## Standards and contribution

Use short-lived trunk-based branches, Conventional Commits, and the PR template.
API, event, schema, migration, security, billing, and cross-service changes require
Engineering Lead review. See the project documentation for the canonical DoD.
