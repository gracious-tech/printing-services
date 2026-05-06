# Printing Services

## Commands
- `npx tsc` — build to dist/
- `npx tsc --noEmit` — type-check only
- `npx vitest` — run tests
- Must rebuild (`npx tsc`) before running against dist/

## Architecture
- Pure TypeScript library, no framework
- Entry: src/index.ts exports get_service() and list_services()
- src/generic.ts — create_service() builds ServicePublic from ServiceConfig
- src/services/*.ts — one file per printing service
- src/types.ts — all interfaces and type unions
- docs/ — api.md, explanation.md, research.md
