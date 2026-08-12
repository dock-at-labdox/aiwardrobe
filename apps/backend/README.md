# API

NestJS modular monolith and the only service permitted to write product data.
Controllers remain thin; module boundaries mirror the backend architecture.

`src/common` contains cross-cutting configuration, logging, validation, and error
handling. `src/modules` is intentionally empty of feature behavior until its
corresponding task begins. `src/prisma` contains Prisma integration placeholders,
not a product schema. Start locally with `pnpm dev:backend`; it listens on port 4000
by default and exposes health at `http://localhost:4000/v1/health`. Set
`API_PORT` to override the default.

## Environment

Copy `apps/backend/.env.example` to `apps/backend/.env` before running locally:

```sh
cp apps/backend/.env.example apps/backend/.env
```

`APP_ENV`, `API_PORT`, and `OTEL_SERVICE_NAME` are validated by
`src/common/config/config.module.ts`'s Joi schema. `DATABASE_URL` is read
by Prisma at runtime (`prisma/schema.prisma`). `REDIS_URL`,
`OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_ENDPOINT`, and `OIDC_ISSUER_URL`
are forward-looking placeholders for future integrations, not yet read by
any code.

## Testing

`pnpm --filter @aiwardrobe/api test` currently runs with `--passWithNoTests`
because no feature module has real behavior yet, so there are no `*.spec.ts`
files to run (see `src/modules/README.md`). `jest.config.ts` is already wired
up (`ts-jest`, `testRegex: '.*\.spec\.ts$'` under `src/`), so specs work
correctly the moment they're added — nothing further to configure.

`--passWithNoTests` must be removed from the `test` script the moment the
first `*.spec.ts` lands, so CI starts actually enforcing test coverage instead
of passing vacuously. Do not add placeholder specs just to make this flag
unnecessary sooner; that would defeat the purpose of the gate.
