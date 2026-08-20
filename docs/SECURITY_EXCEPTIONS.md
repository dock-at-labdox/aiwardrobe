# Security Exception and Remediation Tracking

## Current posture

- 0 critical findings
- 0 moderate findings
- 1 explicitly ignored high finding (`GHSA-ggr8-5vv4-36mx`)
- Lint, typecheck, build, test, and contract validation pass.

## sharp

- Advisory: `GHSA-f88m-g3jw-g9cj`
- Patched by upgrading both Next.js applications to `next@16.3.1`, which
  declares optional `sharp@^0.35.3`.

Do not independently override sharp under Next.js 15: its `^0.34.3` constraint
does not support sharp 0.35.x. The supported remediation is the aligned Next.js
upgrade in `apps/admin` and `apps/web`.

## deepmerge-ts

- Advisory: `GHSA-ggr8-5vv4-36mx`
- Current version: `7.1.5`
- Vulnerable range: `<8.0.0`
- Patched range: `>=8.0.0`
- Dependency path: `apps/backend → @prisma/client@6.19.3 → prisma@6.19.3 → @prisma/config@6.19.3 → deepmerge-ts@7.1.5`

`deepmerge-ts` is introduced by Prisma configuration/CLI tooling in the current
dependency graph. An independent override is unsafe: Prisma pins
`deepmerge-ts@7.1.5`, while version 8 contains breaking API and behavior
changes that could affect Prisma CLI/config behavior. Prisma 7.9.1 still pins
the same version.

`pnpm-workspace.yaml` ignores only this GHSA while retaining the production
audit at high severity. Reassess when Prisma provides a compatible release that
updates this dependency.

## Remediation policy

- Do not suppress the dependency audit.
- Do not use `continue-on-error`.
- Do not weaken `--audit-level=high`.
- Reassess both findings whenever Next.js or Prisma receives a compatible
  security or dependency update.
