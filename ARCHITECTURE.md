# Architecture

A browser-based **3D furniture configurator** built with **Next.js 16** (App Router), **React Three Fiber** for real-time 3D rendering, and **Zustand** for global state.

The codebase separates concerns into three axes:

- **UI** — Atomic Design (`src/ui/`) — HTML panels, layout, checkout, home
- **Domain & state** — Zustand stores, app hooks, shared types (`src/store/`, `src/hooks/`, `src/types/`)
- **3D module** — isolated under `src/configurator/` (implementation TBD; not documented here)

> **Rule of thumb:** R3F components and 3D runtime logic **do not** live in Atomic organisms. The 3D mount point in organisms is a thin re-export of the configurator public API.

---

## Table of contents

1. [Repository layout](#repository-layout)
2. [UI layer (Atomic Design)](#ui-layer-atomic-design)
3. [Non-UI layers](#non-ui-layers)
4. [Next.js routing](#nextjs-routing)
5. [Technology stack](#technology-stack)
6. [Scripts & tooling](#scripts--tooling)
7. [Path aliases](#path-aliases)
8. [Conventions](#conventions)

---

## Repository layout

```
furniture/
├── app/                    # Next.js App Router — thin route files, no business logic
├── public/                 # Static assets: GLTF models, textures, images 
├── src/
│   ├── configurator/       # 3D module (implementation TBD)
│   ├── constants/          # Immutable configuration values
│   ├── data/               # Product JSON catalogs and content
│   ├── fonts/              # UI fonts
│   ├── hooks/              # App-level React hooks (non-3D)
│   ├── providers/          # App-level React context
│   ├── shopify/            # Shopify Storefront / Admin API integration
│   ├── store/              # Zustand stores (global state)
│   ├── types/              # Shared TypeScript types (entities, UI, cart, …)
│   ├── ui/                 # UI components (Atomic Design)
│   └── utils/              # App utilities (catalog, checkout, routes)
└── ARCHITECTURE.md         # This document
```

---

## UI layer (Atomic Design)

All UI lives under `src/ui/` and follows Atomic Design tiers.

| Layer         | Path                                  | Alias        | Responsibility                                              |
| ------------- | ------------------------------------- | ------------ | ----------------------------------------------------------- |
| **Atoms**     | `src/ui/components/atomic/atoms/`     | `@atoms`     | Smallest blocks: `Button`, `AtomInput`, `ColorPicker`, …    |
| **Molecules** | `src/ui/components/atomic/molecules/` | `@molecules` | Step panels, form groups, configuration controls            |
| **Organisms** | `src/ui/components/atomic/organisms/` | `@organisms` | `AsideConfiguration`, `ConfiguratorView`, header/footer     |
| **Templates** | `src/ui/components/atomic/templates/` | `@templates` | Page layouts without data coupling                          |
| **Pages**     | `src/ui/components/atomic/pages/`     | `@pages`     | `HomePage`, `ConfiguratorPage`, `CheckoutPage`              |
| **Shared**    | `src/ui/components/shared/`           | `@shared`    | shadcn/Radix primitives (`Dialog`, `Accordion`, …)          |
| **Skeletons** | `src/ui/components/skeletons/`        | `@skeletons` | Loading skeletons mirroring configurator/checkout layouts     |

### UI conventions

1. **`app/` routes** only import from `@pages` — no business logic in route files.
2. **Atoms** are presentational: props only; no store, API, or 3D dependencies.
3. **Molecules** may read stores and use hooks from `@hooks`.
4. **Organisms** compose molecules/atoms; the 3D organism does **not** embed scene code.
5. **Skeletons** match target layouts; visibility via dedicated skeleton hooks.
6. **HTML component prop types** live in `src/types/ui/`.
7. **Every component** uses folder + `index.ts` barrel: `ComponentName/ComponentName.tsx` + `index.ts`.

---

## Non-UI layers

### `src/hooks/` (`@hooks`)

App-level React hooks (navigation, checkout, cart sync, skeletons, catalog preload).  
3D hooks live in `@configurator/hooks` only.

> Zustand stores in `src/store/` are named `use*` but are **not** React hooks.

### `src/store/` (`@store`)

Domain-scoped Zustand stores — one store per domain concern:

| Store                      | Responsibility (scaffold)        |
| -------------------------- | -------------------------------- |
| `useConfiguratorProduct`   | Active catalog product           |
| `useConfigurationControl`  | Wizard steps and navigation      |
| `useConfigurationCart`     | Session configuration cart       |
| `useFurnitureMaterial`     | Material / finish selection      |
| `useFurniturePart`         | Part-level configuration         |
| `useConfiguratorSceneLoad` | 3D scene loading state           |
| `useCheckout`              | Checkout rows and pricing        |
| `useInfoDialog`            | Info modal state                 |

Each store is a folder: `useStoreName/useStoreName.ts` + `index.ts`. Helpers live in **their own subfolders** with `index.ts` — not as loose files next to sibling subfolders.

### `src/types/` (`@types`)

Shared types not owned by the 3D module:

```
src/types/
├── cart/           # Cart items, configuration snapshots
├── checkout/       # Checkout table, summary
├── entities/       # Types derived from JSON catalogs (source of truth)
│   ├── catalog/    # modelId, collection summaries
│   └── furniture/  # furnitureConfigType, business data
├── furniture/      # Runtime furniture types composed from entities
│   ├── material/
│   └── part/
├── ui/             # HTML component props, variant unions
└── index.ts
```

### `src/utils/` (`@utils`)

App-wide pure utilities: catalog accessors, checkout dates, route helpers.  
3D utilities live in `@configurator/utils` only.

### `src/shopify/` (`@shopify`)

Shopify Storefront / Admin GraphQL, collection and product resolution, checkout cart creation.

### `src/constants/` (`@constants`)

Single barrel file `index.ts` — catalog, UI copy, checkout labels, palette.  
3D pipeline values live in `@configurator/constants`.

### `src/providers/` (`@providers`)

App-level React context: embedded mode (`EmbeddedProvider`), shared context helpers.

### `src/data/` (`@data`)

JSON product catalogs and modal info content. Catalog accessors live in `@utils`.

### `src/fonts/` (`@fonts`)

UI fonts and CSS `@font-face` rules.

---

## Next.js routing

```
app/
├── layout.tsx              # Root: fonts, EmbeddedProvider, global styles
└── page.tsx                # / → HomePage (import from @pages only)
```

**Thin routes:** `page.tsx` files import from `@pages` only. Layouts may use `@templates`, `@shopify`, `@providers` for shells and data loading.

Route structure will expand as shop and configurator pages are added.

---

## Technology stack

| Library                      | Role                                  |
| ---------------------------- | ------------------------------------- |
| **Next.js 16**               | SSR/SSG, App Router, routing          |
| **React 19**                 | UI runtime                            |
| **TypeScript 5**             | Static typing                         |
| **Tailwind CSS 4**           | Styling                               |
| **Zustand**                  | Global client state                   |
| **React Three Fiber + drei** | 3D canvas, GLTF loading, controls   |
| **Three.js**                 | Rendering, textures, custom shaders   |
| **Radix UI / Base UI**       | Accessible primitives (shadcn)        |
| **Motion**                   | UI animations                         |
| **ESLint + Prettier**        | Linting, formatting                   |

> Format-specific libraries (PDF/EPS/TIFF conversion) are **not** included in this project — furniture assets use different import pipelines.

---

## Scripts & tooling

| Script                    | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| `dev` / `build` / `start` | Next.js development and production                                       |
| `lint` / `lint:fix`       | ESLint over `src/` and `scripts/`                                        |
| `format` / `format:check` | Prettier                                                                 |
| `validate`                | format + lint + `typecheck` + `verify:architecture`                      |
| `typecheck`               | `tsc --noEmit`                                                           |
| `verify:architecture`     | Import boundaries + module folder structure (`scripts/verify-architecture.mjs`) |
| `scan:module-structure`   | Standalone check for module folder pattern                               |

---

## Path aliases

Defined in `tsconfig.json`:

| Alias                | Path                           |
| -------------------- | ------------------------------ |
| `@atoms` … `@pages`  | `src/ui/components/atomic/*` |
| `@shared`            | `src/ui/components/shared`     |
| `@skeletons`         | `src/ui/components/skeletons`  |
| `@styles`            | `src/ui/styles/globals.css`    |
| `@hooks`             | `src/hooks`                    |
| `@store`             | `src/store`                    |
| `@types`             | `src/types`                    |
| `@utils`             | `src/utils`                    |
| `@data`              | `src/data`                     |
| `@constants`         | `src/constants`                |
| `@providers`         | `src/providers`                |
| `@fonts`             | `src/fonts`                    |
| `@shopify`           | `src/shopify`                  |
| `@configurator`      | `src/configurator`             |
| `@configurator/*`    | `src/configurator/*` layers    |

**Wildcard subpaths** (sibling modules within the same alias root):

| Pattern          | Example                              |
| ---------------- | ------------------------------------ |
| `@molecules/*`   | `@molecules/ConfigurationTools/…`    |
| `@store/*`       | `@store/useFurnitureMaterial`        |
| `@utils/*`       | `@utils/furnitureCatalog`            |
| `@data/*`        | `@data/products/chair.json`          |

---

## Conventions

### Import rules

| From            | Import via                                      |
| --------------- | ----------------------------------------------- |
| User config     | `@store`                                        |
| Shared types    | `@types`                                        |
| UI components   | `@atoms`, `@molecules`, `@organisms`, `@pages`  |
| App utilities   | `@utils`                                        |
| 3D types (UI)   | `@configurator/types` only from molecules       |

**Cross-module imports:** use **`@` path aliases** (layer barrels or wildcard subpaths). Relative `import … from '../…'` / `import … from './…'` is **not allowed** in implementation files. **`index.ts` barrel re-exports** may still use `export { X } from './X'`.

ESLint `no-restricted-imports` enforces layer boundaries. `verify:architecture` blocks relative imports, legacy folder paths, and module folder structure violations.

### Module folder pattern

Every exportable unit in `src/` follows Atomic-style folders. **Enforced by `verify:architecture`** (`scripts/lib/scan-module-structure.mjs`).

#### Single module

```
FeatureName/
├── FeatureName.ts(x)   # primary implementation (name matches folder)
└── index.ts            # export { FeatureName } from './FeatureName'
```

#### Section folder (only subfolders + one barrel)

At layer roots (`shopify/`, `hooks/`, `store/`, …):

- **Only** `index.ts` and named subfolder-modules — no loose `.ts`/`.tsx` next to subfolders.
- `index.ts` re-exports public API from child modules.

#### Module with helpers

When a module has both a primary file and helpers, helpers get **their own subfolders** (same pattern), not loose siblings.

#### Container-only folder

Folders that contain **only** subfolders (no primary file) must have `index.ts` that re-exports children.

**Exceptions (no `index.ts` required):** organizational roots `src/ui`, `src/ui/components`, `src/ui/components/atomic` — they group atomic layers, not exportable modules. Config files (`config.ts`) and ambient `.d.ts` are exempt.

Applies to: UI components, stores, hooks, Shopify clients, utils, types submodules.

**Store → configurator:** `@store` may import `@configurator/mappers`, `@configurator/constants`, and the **bootstrap facade** from `@configurator`. It must not import `@configurator/utils`, `@configurator/scene`, `runtime`, or `canvas` directly.

**Reverse boundaries:** `@configurator` must not import `@utils`. `@molecules` may import `@configurator/types` only (no runtime/configurator barrels).

**Sibling modules** within the same alias root use **wildcard subpaths** such as `@hooks/useAppNavigate` or `@molecules/ConfigurationTools/ColorControl` — not `../` chains.
