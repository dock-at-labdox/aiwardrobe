# Security Exception and Remediation Tracking

## Current posture

- 0 critical findings
- 0 moderate findings
- 2 high findings
- Lint, typecheck, build, test, and contract validation pass.
- No dependency changes were made during this investigation.

## sharp

- Current version: `0.34.5`
- Vulnerable range: `<0.35.0`
- Patched range: `>=0.35.0`
- Dependency path: `apps/admin → next@15.5.21 → sharp@0.34.5`

Next.js `15.5.21` declares its optional sharp dependency as `^0.34.3`, which
does not include sharp `0.35.x`. Overriding sharp independently is therefore
not currently considered safe or supported. Remediation requires a compatible
upstream Next.js release that updates its sharp/libvips dependency to sharp
`>=0.35.0`.

Reassess and remediate when a compatible Next.js release contains sharp
`>=0.35.0`.

## deepmerge-ts

- Current version: `7.1.5`
- Vulnerable range: `<8.0.0`
- Patched range: `>=8.0.0`
- Dependency path: `apps/backend → @prisma/client@6.19.3 → prisma@6.19.3 → @prisma/config@6.19.3 → deepmerge-ts@7.1.5`

`deepmerge-ts` is introduced by Prisma configuration/CLI tooling in the
current dependency graph. This reachability assessment does not make an
independent override safe: Prisma currently pins `deepmerge-ts@7.1.5`, so an
override to `>=8.0.0` is not considered supported and could affect Prisma
CLI/config behavior.

Reassess remediation when Prisma provides a compatible release that updates
this dependency.

## Remediation policy

- Do not suppress the dependency audit.
- Do not use `continue-on-error`.
- Do not weaken `--audit-level=high`.
- Reassess both findings whenever Next.js or Prisma receives a compatible
  security or dependency update.
