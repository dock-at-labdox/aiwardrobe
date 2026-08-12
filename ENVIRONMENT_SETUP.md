# Environment setup

## Strategy

Every deployable application in this monorepo owns its own environment
configuration. There is no shared root `.env` or `.env.example`. Each app's
`.env.example` lives in that app's own directory, alongside the code that
reads those variables.

This keeps each app's runtime configuration self-contained: a change to one
service's variables never touches a file every other service also depends
on, and no service's local values can leak into another service's build or
deploy artifact. It also matches how each app's tooling already resolves
configuration today — see [How each app loads its file](#how-each-app-loads-its-file)
below.

## Environment file location for every service

| Service             | Directory                 | Env file                                                                     |
| ------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| Public web          | `apps/web`                | `apps/web/.env` (from `apps/web/.env.example`)                               |
| Admin               | `apps/admin`              | `apps/admin/.env` (from `apps/admin/.env.example`)                           |
| NestJS API          | `apps/backend`            | `apps/backend/.env` (from `apps/backend/.env.example`)                       |
| Vision & Color      | `apps/vision-color`       | `apps/vision-color/.env` (from `apps/vision-color/.env.example`)             |
| Recommendation      | `apps/recommendation`     | `apps/recommendation/.env` (from `apps/recommendation/.env.example`)         |
| Try-On Orchestrator | `apps/tryon-orchestrator` | `apps/tryon-orchestrator/.env` (from `apps/tryon-orchestrator/.env.example`) |

## Variables owned by each service

### `apps/web/.env.example`

| Variable                   | Purpose                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL the browser API client uses for requests (read by `packages/shared-web/src/api-client.ts`). |
| `NEXT_PUBLIC_APP_NAME`     | Reserved for future branding use; not yet read by application code.                                  |
| `WEB_PORT`                 | Overrides the default dev/start port (`apps/web/package.json`). Default `3000`.                      |

### `apps/admin/.env.example`

| Variable                   | Purpose                                                                           |
| -------------------------- | --------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL the browser API client uses for requests (same shared client as Web).    |
| `ADMIN_PORT`               | Overrides the default dev/start port (`apps/admin/package.json`). Default `3001`. |

### `apps/backend/.env.example`

| Variable                                                                           | Purpose                                                                                                                                    |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `APP_ENV`                                                                          | Validated by `src/common/config/config.module.ts` (Joi schema). Default `development`.                                                     |
| `API_PORT`                                                                         | Validated by the same Joi schema; read via `ConfigService.getOrThrow('API_PORT')` in `src/main.ts`. Default `4000`.                        |
| `OTEL_SERVICE_NAME`                                                                | Validated by the same Joi schema. Default `aiwardrobe-api`.                                                                                |
| `DATABASE_URL`                                                                     | Read by Prisma at runtime (`prisma/schema.prisma`: `url = env("DATABASE_URL")`). Not yet validated by the Joi schema — a pre-existing gap. |
| `REDIS_URL`, `OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_ENDPOINT`, `OIDC_ISSUER_URL` | Forward-looking placeholders for future cache, object storage, and auth integrations; not yet read by any code.                            |

### `apps/vision-color/.env.example`, `apps/recommendation/.env.example`, `apps/tryon-orchestrator/.env.example`

Each of the three FastAPI services owns an identical pair of variables:

| Variable                                             | Purpose                                                                                                                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_ENV`                                            | Read by `app/infrastructure/settings.py` (`Settings.app_env`). Default `development`.                                                                             |
| `VISION_PORT` / `RECOMMENDATION_PORT` / `TRYON_PORT` | Overrides the default uvicorn port used by the root `package.json`'s `dev:vision` / `dev:recommendation` / `dev:tryon` script. Defaults `8001` / `8002` / `8003`. |

## Developer setup instructions

Copy the `.env.example` file for each service you plan to run — you do not
need to create a `.env` for services you aren't starting:

```sh
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/backend/.env.example apps/backend/.env
cp apps/vision-color/.env.example apps/vision-color/.env
cp apps/recommendation/.env.example apps/recommendation/.env
cp apps/tryon-orchestrator/.env.example apps/tryon-orchestrator/.env
```

`.env` files are git-ignored (`.env`, `.env.*`) while `.env.example` files are
explicitly tracked (`!.env.example`), so your local values never get
committed. Frontend apps use `.env.local`/`.env` conventions native to
Next.js; the backend and Python services use a plain `.env` in their own
directory. No manual `source`/export step is required — each app loads its
own file automatically.

## How each app loads its file

- **Next.js (`apps/web`, `apps/admin`)** auto-loads `.env`/`.env.local` from
  its own app directory at build/dev time — this is Next.js's built-in
  behavior, unrelated to any monorepo tooling.
- **NestJS (`apps/backend`)**'s `ConfigModule.forRoot()` in
  `src/common/config/config.module.ts` has no `envFilePath` override, so it
  defaults to loading `.env` from `process.cwd()`. Turborepo always runs
  each package's task with cwd set to that package's own directory, so this
  already resolves to `apps/backend/.env`.
- **The three FastAPI services** set `model_config =
SettingsConfigDict(env_file=".env", ...)` in
  `app/infrastructure/settings.py`. The root `package.json`'s `dev:vision`,
  `dev:recommendation`, and `dev:tryon` scripts `cd` into that service's own
  directory before invoking `uvicorn`, so `.env` resolves relative to each
  service's own directory too.

See [docs/TURBOREPO.md](docs/TURBOREPO.md) for more on Turbo's per-package
cwd behavior, and [docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md) for the
full onboarding guide.

## Deployment recommendations

`.env` and `.env.example` files are for local development only. In staging
and production, each app's platform deployment target should inject
variables directly through its own secret store — never through a
committed or shared file:

- **`apps/web`, `apps/admin`** — the hosting platform's project-level
  environment variable configuration (e.g. Vercel Project Environment
  Variables).
- **`apps/backend`, `apps/vision-color`, `apps/recommendation`,
  `apps/tryon-orchestrator`** — the container platform's secret manager or
  equivalent runtime environment injection.

Never put real credentials in a `.env.example` file; each one exists only to
document the variable names, defaults, and placeholders a new contributor
needs.

## Adding a new variable

1. Add it to the owning app's `.env.example`, with a comment describing what
   reads it and whether it's currently consumed by code or reserved for
   future use.
2. Update that app's `README.md` if the variable is user-facing.
3. Update the ownership table in this document.
