# Developer setup

This guide is the starting point for every AI Wardrobe contributor. Follow it after
cloning the repository to set up the JavaScript and Python projects, configure local
environment values, run only the services you need, and validate your work.

## What this repository contains

AI Wardrobe is a monorepo: one Git repository that contains several applications and
shared packages. The JavaScript applications use pnpm and Turborepo. The independent
Python services use uv. You do not need to start every application to work on one area.

## Prerequisites

Install these before starting:

| Tool    | Required version          | Why it is needed                                                                  |
| ------- | ------------------------- | --------------------------------------------------------------------------------- |
| Git     | Current supported version | Clone the repository and create branches.                                         |
| Node.js | 22.x (`>=22 <23`)         | Runs the Next.js, NestJS, pnpm, and Turborepo tooling. `.nvmrc` contains `22`.    |
| pnpm    | 10.18.2                   | Installs and runs JavaScript workspace dependencies.                              |
| Python  | 3.12                      | Required by every FastAPI service. `.python-version` contains `3.12`.             |
| uv      | Current stable release    | Creates Python environments, installs locked dependencies, and runs Python tools. |

### Install uv

Use an installation method from the [official uv installation guide](https://docs.astral.sh/uv/getting-started/installation/).
On macOS or Linux, the official installer is:

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

After installation, open a new terminal and confirm:

```sh
uv --version
```

uv can download Python 3.12 automatically. To install it explicitly, run:

```sh
uv python install 3.12
```

### Recommended VS Code extensions

The repository recommends these extensions through `.vscode/extensions.json`:

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Python (`ms-python.python`)
- Ruff (`charliermarsh.ruff`)

The shared VS Code settings enable format-on-save, explicit ESLint fixes, strict Python
analysis, and hide generated folders such as `node_modules`, `.next`, and `__pycache__`.

### Operating-system notes

- macOS and Linux work directly with the documented commands.
- Windows developers should use WSL2 with a Linux distribution. The current package
  scripts use POSIX shell syntax such as `${WEB_PORT:-3000}` and `cd ... && ...`, which
  does not run directly in Command Prompt or standard PowerShell.
- Do not commit `.env`, `.venv`, generated build output, or editor-local files. They are
  ignored by `.gitignore`.

## First-time setup

### 1. Clone the repository

```sh
git clone <repository-url>
cd aiwardrobe
```

Replace `<repository-url>` with the repository URL supplied by your team.

### 2. Install JavaScript dependencies

```sh
pnpm install
```

pnpm reads the committed `pnpm-lock.yaml` and installs the dependencies needed by the
Next.js web/admin apps, NestJS API, shared packages, and development tooling.

### 3. Install Python dependencies

Each FastAPI service is an independent uv project. Run `uv sync` once in each directory:

```sh
cd apps/vision-color && uv sync
cd ../recommendation && uv sync
cd ../tryon-orchestrator && uv sync
cd ../..
```

`uv sync` creates a local `.venv` and installs versions recorded in that service's
committed `uv.lock`. Run it again when that service's `pyproject.toml` or `uv.lock`
changes. You can also synchronize all three from the repository root with:

```sh
pnpm python:sync
```

## Environment setup

Every app owns its own environment configuration: a `.env.example` template
in its own directory. There is no shared root `.env`. Copy the template for
each service you plan to run — only the ones you actually start:

```sh
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/backend/.env.example apps/backend/.env
cp apps/vision-color/.env.example apps/vision-color/.env
cp apps/recommendation/.env.example apps/recommendation/.env
cp apps/tryon-orchestrator/.env.example apps/tryon-orchestrator/.env
```

Each `.env` is ignored by Git and loaded automatically by that app's own
tooling (Next.js's per-directory env loading, NestJS's `ConfigModule`, and
each Python service's `pydantic-settings`) — no manual `source`/export step
is required. See [ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md) for the
full rationale and how each app resolves its file.

### Required development values

Each `.env.example` contains development defaults and placeholder values
only; never put credentials in these files. `APP_ENV`, the six port
variables, and `NEXT_PUBLIC_API_BASE_URL` have usable defaults out of the
box. Backend's `DATABASE_URL`, `REDIS_URL`, `OBJECT_STORAGE_ENDPOINT`, and
`OIDC_ISSUER_URL` are placeholders for future integrations — do not replace
them with production credentials.

| Service             | Env file                               | Port variable         | Default port | Local address                   |
| ------------------- | -------------------------------------- | --------------------- | -----------: | ------------------------------- |
| Public web          | `apps/web/.env.example`                | `WEB_PORT`            |         3000 | http://localhost:3000           |
| Admin               | `apps/admin/.env.example`              | `ADMIN_PORT`          |         3001 | http://localhost:3001           |
| NestJS API          | `apps/backend/.env.example`            | `API_PORT`            |         4000 | http://localhost:4000/v1/health |
| Vision & Color      | `apps/vision-color/.env.example`       | `VISION_PORT`         |         8001 | http://localhost:8001/health    |
| Recommendation      | `apps/recommendation/.env.example`     | `RECOMMENDATION_PORT` |         8002 | http://localhost:8002/health    |
| Try-On Orchestrator | `apps/tryon-orchestrator/.env.example` | `TRYON_PORT`          |         8003 | http://localhost:8003/health    |

`NEXT_PUBLIC_API_BASE_URL` defaults to `http://localhost:4000/v1` in both
`apps/web/.env.example` and `apps/admin/.env.example`. Each app's browser
client uses its own copy of this value for API requests.

## Project structure

```text
apps/       Deployable applications and services
packages/   Shared JavaScript/TypeScript packages
docs/       Project, workflow, and onboarding documentation
```

### Applications

| Path                      | Technology         | Responsibility                                                                          |
| ------------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| `apps/web`                | Next.js App Router | Public AI Wardrobe web experience and browser-side presentation.                        |
| `apps/admin`              | Next.js App Router | Separate administrative interface.                                                      |
| `apps/backend`            | NestJS             | Product API and the only service allowed to write product data.                         |
| `apps/vision-color`       | FastAPI            | Boundary for image quality, segmentation, classification, and color analysis.           |
| `apps/recommendation`     | FastAPI            | Boundary for deterministic rules, embeddings, and grounded recommendation explanations. |
| `apps/tryon-orchestrator` | FastAPI            | Boundary for consented virtual try-on providers and job-queue interfaces.               |

The three FastAPI services are foundations: they expose health endpoints and integration
boundaries, but do not yet implement provider, model, worker, or product behavior.

### Shared packages

| Path                      | Responsibility                                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared-schemas` | Versioned language-neutral OpenAPI, JSON Schema, DTO, event, and validation contracts; also currently holds hand-maintained shared TypeScript types until codegen replaces them. |
| `packages/shared-web`     | React Query provider, API-client boundary, shared forms, UI primitives, and async-state helpers used by Web and Admin.                                                           |
| `packages/shared-config`  | Shared TypeScript (`tsconfig.base.json`, `tsconfig.nextjs.json`) and ESLint (`eslint.base.mjs`) base configuration consumed by every app and package.                            |

## Running applications

Start only the applications relevant to your task. There is intentionally no one-command
workflow that starts every service.

### Frontend developer

Run the public web application:

```sh
pnpm dev:web
```

Run the admin application when working on administrative workflows:

```sh
pnpm dev:admin
```

Both commands use Turborepo and start their selected Next.js application with hot reload.

### Backend developer

Run the NestJS API:

```sh
pnpm dev:backend
```

The API health endpoint is `http://localhost:4000/v1/health`.

### AI developer

Run Vision & Color:

```sh
pnpm dev:vision
```

Run Recommendation:

```sh
pnpm dev:recommendation
```

Run Try-On Orchestrator:

```sh
pnpm dev:tryon
```

Each command enters its own service directory and runs the existing command pattern:
`uv run uvicorn app.main:app --reload --port <service-port>`.

## Useful commands

Run these from the repository root:

| Command          | What it validates                                                             |
| ---------------- | ----------------------------------------------------------------------------- |
| `pnpm lint`      | ESLint for JavaScript/TypeScript plus Ruff for all Python services.           |
| `pnpm typecheck` | TypeScript compiler checks plus strict mypy checks for all Python services.   |
| `pnpm build`     | Builds workspace applications/packages and Python source/wheel distributions. |
| `pnpm test`      | Runs JavaScript tests plus pytest for all Python services.                    |
| `pnpm format`    | Checks Prettier formatting without changing files.                            |

Useful focused commands that already exist:

```sh
pnpm build:web
pnpm build:admin
pnpm contracts:validate
pnpm python:sync
```

Use `pnpm format:write` only when you want Prettier to rewrite formatting changes.

## Turborepo in simple terms

Turborepo runs JavaScript workspace tasks efficiently. It understands which packages an
application depends on and runs prerequisite builds first. For example, Web depends on
`@aiwardrobe/shared-web`, so Turborepo builds the shared package before building Web.

Turborepo also caches successful task outputs and logs in `.turbo/`:

- A **cache hit** means the task inputs have not changed since the last successful run.
  Turbo replays the previous result instead of rebuilding. For example, a second
  `pnpm build` without source or configuration changes can reuse cached package builds.
- A **cache miss** means Turbo must execute the task. This happens after a relevant source,
  dependency, lockfile, script, or task configuration change; it also happens the first time
  a task runs on a machine.
- Development tasks are intentionally persistent and uncached because their purpose is to
  keep watching source files, not produce a reusable build result.

You do not need to clear the cache for normal work. See troubleshooting if a cached result
appears inconsistent with your local files.

## Python services and uv

The Python services are outside the pnpm workspace because they have independent Python
dependency graphs, virtual environments, and deployment boundaries. Keeping them as uv
projects avoids mixing Python dependencies into Node.js tooling.

- `uv sync` creates or updates the current service's local `.venv` using `pyproject.toml`
  and its committed `uv.lock`.
- `uv run <command>` runs a command inside that service's managed environment. It ensures
  the environment is synchronized before running commands such as `uvicorn`, `ruff`,
  `mypy`, or `pytest`.
- `.venv` is local to a service and ignored by Git. Do not activate or copy another
  service's environment; run commands through `uv run` instead.

For a single service, run these commands from its directory:

```sh
uv sync
uv run ruff check .
uv run mypy app tests
uv run pytest
```

## Daily development workflow

1. Update your branch:

   ```sh
   git pull
   ```

2. Install JavaScript dependencies if `package.json` or `pnpm-lock.yaml` changed:

   ```sh
   pnpm install
   ```

3. Run `uv sync` in a Python service only if its `pyproject.toml` or `uv.lock` changed.

4. Start the one or more services required for the feature.

5. Implement and locally exercise the change.

6. Before committing, run the relevant checks. Use the full repository checks when the
   change spans applications or shared packages:

   ```sh
   pnpm lint
   pnpm typecheck
   pnpm build
   pnpm test
   ```

7. Commit on a short-lived branch and open a pull request using the repository template.

## Troubleshooting

### Port already in use

Another process is already listening on the port. Stop that process, or set the relevant
port variable before starting the service. For example:

```sh
WEB_PORT=3010 pnpm dev:web
```

Use `lsof -nP -iTCP:3000 -sTCP:LISTEN` on macOS/Linux to identify a process using port 3000. On Windows/WSL, use the equivalent Linux command inside WSL.

### Node version mismatch

Use Node 22.x. If you use nvm, run:

```sh
nvm install
nvm use
```

Then reinstall dependencies with `pnpm install`.

### `pnpm` not found

Install or activate pnpm 10.18.2, then reopen the terminal. Confirm with:

```sh
pnpm --version
```

### `uv` not installed

Install uv from the official guide, reopen the terminal, and confirm `uv --version`.
If Python 3.12 is unavailable, run `uv python install 3.12`.

### Missing `.env`

Each app reads its own `.env`, not a shared root file. Identify which
app's dev server is failing to start or read config, then create its `.env`
from that app's own example. For example, for the backend:

```sh
cp apps/backend/.env.example apps/backend/.env
```

Keep secrets local; never commit any `apps/*/.env`.

### Turbo cache looks stale

First confirm that your files are saved and the right command is being run. If a local
cache is genuinely inconsistent, remove the ignored `.turbo` directory and rerun the task:

```sh
rm -rf .turbo
pnpm build
```

### TypeScript cache looks stale

TypeScript creates ignored `tsconfig.tsbuildinfo` files. Stop the affected development
server, remove that app's generated build information if needed, then rerun its typecheck.
For example, for Web:

```sh
rm -f apps/web/tsconfig.tsbuildinfo
pnpm --filter @aiwardrobe/web typecheck
```

### Python virtual-environment issues

Do not manually install packages into a service `.venv`. From the affected service
directory, run:

```sh
uv sync --locked
```

If the environment is corrupted, remove that service's `.venv` and rerun `uv sync`.

### Restart the TypeScript server in VS Code

Open the Command Palette, run **TypeScript: Restart TS Server**, then reopen the affected
TypeScript file. If the issue persists, run the app's `typecheck` command in the terminal.

## Frequently asked questions

### Why is every service not started automatically?

Starting only needed services uses fewer resources, makes logs easier to read, and avoids
running unrelated infrastructure during focused work. It also keeps the independently
deployable FastAPI services separate from the pnpm workspace.

### When should I run `uv sync`?

Run it after the first clone and whenever that service's `pyproject.toml` or `uv.lock`
changes. `uv run` also keeps the environment synchronized before it runs a tool.

### When should I run `pnpm install`?

Run it after the first clone and whenever `package.json` or `pnpm-lock.yaml` changes.

### Can I work only on frontend?

Yes. Run `pnpm dev:web` for public-web work or `pnpm dev:admin` for admin work. Start the
API only when your change needs a running backend endpoint.

### Can I work only on backend?

Yes. Run `pnpm dev:backend`. The current health endpoint is dependency-free, but future
backend features may need the database and other placeholder-backed services configured.

### Can I run multiple services together?

Yes, start each needed command in its own terminal. The default ports are unique, so Web,
Admin, API, Vision, Recommendation, and Try-On can run together without port conflicts.
