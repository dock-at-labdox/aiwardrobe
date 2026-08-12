# Shared configuration

Shared TypeScript and ESLint base configuration consumed by every TypeScript
app and package in the workspace, so compiler and lint rules are defined once
instead of duplicated per package.

- `tsconfig.base.json` — the compiler options that are already identical
  across every TypeScript project (`strict`, `skipLibCheck`). Package- and
  app-specific options (module system, JSX, output paths, decorators, etc.)
  stay in each consumer's own `tsconfig.json`, since those legitimately
  differ between a Next.js app, the NestJS API, and library packages.
- `tsconfig.nextjs.json` — extends `tsconfig.base.json` with the compiler
  options shared by both Next.js applications (`apps/web`, `apps/admin`).
- `eslint.base.mjs` — the shared flat ESLint config (`@eslint/js` recommended
  - `typescript-eslint` recommended + the repo-wide `no-explicit-any` ban).
    Consumers spread this array into their own `eslint.config.mjs` and layer
    framework-specific rules (e.g. `next/core-web-vitals`) on top.

This package intentionally does not yet include logger, security, or release
helpers. Those were listed as aspirational scope in an earlier version of this
README; they should be added here only when a real consumer needs them, not
speculatively.
