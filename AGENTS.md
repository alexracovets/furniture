<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project conventions

- **Module folders:** every exportable unit uses `ModuleName/ModuleName.ts(x)` + `index.ts`. Helpers and section files never sit loose next to subfolders. Enforced by `pnpm verify:architecture`. Full rules: [ARCHITECTURE.md](./ARCHITECTURE.md) § Module folder pattern.
- **Type naming:** all exported `type` aliases and `interface` declarations in `src/types/` and `src/configurator/types/` use **PascalCase** and end with **`Type`** (e.g. `CartItemType`, `ChildrenType`). Enforced by ESLint and `verify:architecture`.
