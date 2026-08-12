# Shared schemas

Language-neutral OpenAPI/JSON Schema, DTO, event, and validation source of
truth (`schemas/openapi/v1.yaml`, `schemas/events/*.schema.json`), consumed
by both the Node and Python sides of the workspace.

This package is also, for now, the single home for **hand-maintained shared
TypeScript types** (`src/index.ts` — e.g. `ErrorEnvelope`, `JobStatus`). A
sibling `packages/shared-types` package previously existed to hold generated
TypeScript client types, but it had no real content and no consumers, while
this package was already hand-writing the types it was meant to own. Rather
than leave two packages with overlapping responsibility, `shared-types` was
removed and this package absorbed both jobs explicitly:

1. Schema source of truth (OpenAPI/JSON Schema files under `schemas/`).
2. The TypeScript representation of those contracts (`src/index.ts`), until
   an OpenAPI-to-TypeScript codegen step is introduced. When that codegen
   pipeline exists, generated types should replace the hand-written ones in
   `src/index.ts` rather than reviving a separate package — do not hand-edit
   generated output once that exists.

`pnpm contracts:validate` (`scripts/validate-contracts.mjs`) checks that the
JSON Schema files parse; it is not a full contract-vs-type consistency check.
