# Web

Next.js App Router foundation for the accessible, public AI Wardrobe PWA.
The browser owns presentation, safe drafts, and API interaction only; authorization,
consent, quota, and provider decisions remain server-side. `src/app` contains route
groups, `components` shared UI/layout, `providers` client providers, and `lib` API/
form boundaries. Admin routes live in `apps/admin`. No business pages are implemented
in this scaffold.

Run `pnpm dev:web` from the repository root. It serves on port 3000 by default;
set `WEB_PORT` to override it. The browser API client uses
`NEXT_PUBLIC_API_BASE_URL`, which defaults to `http://localhost:4000/v1` in
`apps/web/.env.example`.

## Environment

Copy `apps/web/.env.example` to `apps/web/.env` before running locally:

```sh
cp apps/web/.env.example apps/web/.env
```

It defines `NEXT_PUBLIC_API_BASE_URL` (used by the shared API client),
`WEB_PORT` (dev/start server port), and `NEXT_PUBLIC_APP_NAME` (reserved for
future branding use; not yet read by application code).
