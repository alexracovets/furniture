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
├── .vscode/                # Editor: Tailwind v4 CSS lint, IntelliSense
├── app/                    # Next.js App Router — thin route files
│   ├── layout.tsx          # Root layout, fonts, metadata, favicon
│   └── page.tsx            # / → HomePage
├── public/
│   └── favicon.ico         # Static favicon (referenced via metadata.icons)
├── scripts/                # Architecture guard, module-structure scanner
├── src/
│   ├── configurator/       # 3D module scaffold (types only for now)
│   │   ├── index.ts
│   │   └── types/
│   ├── constants/          # Immutable configuration values (empty barrel)
│   ├── data/               # Product JSON catalogs (.gitkeep)
│   ├── fonts/              # UI fonts (fonts.css + barrel)
│   ├── hooks/              # App-level React hooks (empty barrel)
│   ├── providers/          # App-level React context (empty barrel)
│   ├── shopify/            # Shopify integration (empty barrel)
│   ├── store/              # Zustand stores (empty barrel)
│   ├── types/              # Shared TypeScript types (scaffold)
│   ├── ui/
│   │   ├── components/
│   │   │   ├── atomic/     # atoms, molecules, organisms, templates, pages
│   │   │   ├── shared/     # shadcn/Radix primitives (empty barrel)
│   │   │   └── skeletons/  # Loading skeletons (empty barrel)
│   │   └── styles/
│   │       └── globals.css # Tailwind v4 + shadcn theme
│   └── utils/
│       └── cn/             # clsx + tailwind-merge helper
├── AGENTS.md
└── ARCHITECTURE.md
```

---

## UI layer (Atomic Design)

All UI lives under `src/ui/` and follows Atomic Design tiers.

| Layer         | Path                                  | Alias        | Current state                                                |
| ------------- | ------------------------------------- | ------------ | ------------------------------------------------------------ |
| **Atoms**     | `src/ui/components/atomic/atoms/`     | `@atoms`     | Empty barrel                                                 |
| **Molecules** | `src/ui/components/atomic/molecules/` | `@molecules` | Empty barrel                                                 |
| **Organisms** | `src/ui/components/atomic/organisms/` | `@organisms` | Empty barrel                                                 |
| **Templates** | `src/ui/components/atomic/templates/` | `@templates` | Empty barrel                                                 |
| **Pages**     | `src/ui/components/atomic/pages/`     | `@pages`     | `HomePage`                                                   |
| **Shared**    | `src/ui/components/shared/`           | `@shared`    | Empty barrel                                                 |
| **Skeletons** | `src/ui/components/skeletons/`        | `@skeletons` | Empty barrel                                                 |

### UI conventions

1. **`app/` routes** only import from `@pages` — no business logic in route files.
2. **Atoms** are presentational: props only; no store, API, or 3D dependencies.
3. **Molecules** may read stores and use hooks from `@hooks`.
4. **Organisms** compose molecules/atoms; the 3D organism does **not** embed scene code.
5. **Skeletons** match target layouts; visibility via dedicated skeleton hooks.
6. **HTML component prop types** live in `src/types/ui/` and follow [Type naming](#type-naming).
7. **Every component** uses folder + `index.ts` barrel: `ComponentName/ComponentName.tsx` + `index.ts`.

---

## Non-UI layers

### `src/hooks/` (`@hooks`)

App-level React hooks (navigation, checkout, cart sync, skeletons, catalog preload).  
3D hooks live in `@configurator/hooks` only.

Currently an **empty barrel** — add hooks as `useHookName/useHookName.ts` + `index.ts`.

> Zustand stores in `src/store/` are named `use*` but are **not** React hooks.

### `src/store/` (`@store`)

Domain-scoped Zustand stores — one store per domain concern.

Currently an **empty barrel** — planned stores include `useConfiguratorProduct`, `useConfigurationCart`, `useFurnitureMaterial`, `useFurniturePart`, `useCheckout`, etc.

Each store is a folder: `useStoreName/useStoreName.ts` + `index.ts`. Helpers live in **their own subfolders** with `index.ts`.

### `src/types/` (`@types`)

Shared types not owned by the 3D module:

```
src/types/
├── cart/                   # CartItemType, ConfigurationSnapshotType
├── checkout/               # CheckoutRowType, CheckoutSummaryType
├── entities/
│   ├── catalog/            # ModelIdType, CollectionSummaryType
│   └── furniture/          # FurnitureConfigType, FurnitureBusinessType
├── furniture/
│   ├── material/           # MaterialInstanceType
│   └── part/               # PartInstanceType
├── ui/
│   └── ChildrenType/       # ChildrenType
└── index.ts
```

3D-specific types live in `@configurator/types` (e.g. `ConfiguratorSceneStateType`).

### `src/utils/` (`@utils`)

App-wide pure utilities. Currently exports `cn` from `utils/cn/`.  
3D utilities live in `@configurator/utils` only.

### `src/shopify/` (`@shopify`)

Shopify Storefront / Admin GraphQL — empty barrel for now.

### `src/constants/` (`@constants`)

Single barrel `index.ts` — catalog, UI copy, checkout labels, palette.  
3D pipeline values live in `@configurator/constants`.

### `src/providers/` (`@providers`)

App-level React context — empty barrel for now.

### `src/data/` (`@data`)

JSON product catalogs and modal info content. Catalog accessors will live in `@utils`.

### `src/fonts/` (`@fonts`)

UI fonts: `fonts.css` + barrel. Imported from `globals.css`.

### `src/configurator/`

3D module scaffold. Public API: `src/configurator/index.ts` re-exports types.  
Runtime layers (`canvas/`, `scene/`, `runtime/`, …) will be added when the furniture 3D pipeline is implemented.

---

## Next.js routing

```
app/
├── layout.tsx    # Geist font, @styles, metadata + favicon (/favicon.ico from public/)
└── page.tsx      # / → HomePage (import from @pages only)
```

**Thin routes:** `page.tsx` files import from `@pages` only. Layouts may use `@templates`, `@shopify`, `@providers` for shells and data loading.

---

## Technology stack

| Library                      | Role                                |
| ---------------------------- | ----------------------------------- |
| **Next.js 16**               | SSR/SSG, App Router, routing        |
| **React 19**                 | UI runtime                          |
| **TypeScript 5**             | Static typing                       |
| **Tailwind CSS 4**           | Styling (`@theme`, shadcn)          |
| **Zustand**                  | Global client state                 |
| **React Three Fiber + drei** | 3D canvas, GLTF loading, controls |
| **Three.js**                 | Rendering, textures, shaders        |
| **Radix UI / Base UI**       | Accessible primitives (shadcn)      |
| **Motion**                   | UI animations                       |
| **ESLint + Prettier**        | Linting, formatting                 |

> Format-specific libraries (PDF/EPS/TIFF conversion) are **not** included — furniture assets use different import pipelines.

---

## Scripts & tooling

| Script                    | Description                                                         |
| ------------------------- | ------------------------------------------------------------------- |
| `dev` / `build` / `start` | Next.js development and production                                  |
| `lint` / `lint:fix`       | ESLint over `src/` and `scripts/`                                   |
| `format` / `format:check` | Prettier                                                            |
| `validate`                | format + lint + `typecheck` + `verify:architecture`                 |
| `typecheck`               | `tsc --noEmit`                                                      |
| `verify:architecture`     | Import boundaries + module folders + type naming                    |
| `scan:module-structure`   | Standalone module folder pattern check                              |

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

---

## Conventions

### Type naming

All exported **type aliases** and **interfaces** in `src/types/` and `src/configurator/types/` must:

1. Use **PascalCase**
2. End with the **`Type`** suffix

| Valid               | Invalid              |
| ------------------- | -------------------- |
| `CartItemType`      | `cartItemType`       |
| `ChildrenType`      | `childrenType`       |
| `FurnitureConfigType` | `FurnitureConfig`  |
| `ConfiguratorSceneStateType` | `ConfiguratorSceneState` |

Enforced by:

- ESLint `@typescript-eslint/naming-convention` (scoped to `src/types/**`, `src/configurator/types/**`)
- `pnpm verify:architecture` (declared type names in those folders)

Component prop types follow the same rule: `HomePagePropsType`, `AsideConfigurationPropsType`, etc.

### Import rules

| From            | Import via                                     |
| --------------- | ---------------------------------------------- |
| User config     | `@store`                                       |
| Shared types    | `@types`                                       |
| UI components   | `@atoms`, `@molecules`, `@organisms`, `@pages` |
| App utilities   | `@utils`                                       |
| 3D types (UI)   | `@configurator/types` only from molecules        |

**Cross-module imports:** use **`@` path aliases**. Relative `import … from '../…'` is **not allowed** in implementation files. **`index.ts` barrel re-exports** may use `export { X } from './X'`.

### Module folder pattern

Every exportable unit in `src/` follows:

```
FeatureName/
├── FeatureName.ts(x)   # primary implementation (name matches folder, or section file matches folder name)
└── index.ts            # export { FeatureName } from './FeatureName'
```

Section folders (`cart/`, `hooks/`, `store/`) contain only `index.ts` + named subfolder-modules — no loose `.ts` next to subfolders.

**Exceptions (no `index.ts` required):** `src/ui`, `src/ui/components`, `src/ui/components/atomic`.

Enforced by `pnpm verify:architecture` (`scripts/lib/scan-module-structure.mjs`).

**Store → configurator:** `@store` may import `@configurator/mappers`, `@configurator/constants`, and the bootstrap facade from `@configurator` — not layer subpaths.

**Reverse boundaries:** `@configurator` must not import `@utils`. `@molecules` may import `@configurator/types` only.
