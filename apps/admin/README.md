# Admin

Independent Next.js App Router foundation for authenticated AI Wardrobe administrative
workflows. It uses the shared web provider and API client package, while all admin
business routes, authorization, and data handling remain future task work.

Run `pnpm dev:admin` from the repository root to start it on port 3001. Set
`ADMIN_PORT` to override the default.

## Environment

Copy `apps/admin/.env.example` to `apps/admin/.env` before running locally:

```sh
cp apps/admin/.env.example apps/admin/.env
```

It defines `NEXT_PUBLIC_API_BASE_URL` (used by the shared API client, same
package Web uses) and `ADMIN_PORT` (dev/start server port).
