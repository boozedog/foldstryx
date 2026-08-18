# @foldstryx/styles

## 0.2.1

### Patch Changes

- 177a703: Fix Nub pack and release so registry tarballs expose `dist/` exports and concrete sibling semver instead of `workspace:*`.
- Updated dependencies [177a703]
  - @foldstryx/tokens@0.1.1

## 0.2.0

### Minor Changes

- 0f23064: Add GridFocus, ToggleButton, table selection helpers, and an Astryx-style Listbox Selector; remove NativeSelect.

## 0.1.0

### Minor Changes

- e8013ac: Use Atkinson Hyperlegible Next as the default interface font (body and headings) and Maple Mono NL NF as the default monospace font. Vendors the fonts under `packages/styles/src/fonts/` with `@font-face` rules in the document global stylesheet, and makes the `mono` layout style reference the `--font-family-code` token instead of a hardcoded stack.
- fd80796: Lift Astryx-faithful StyleX design tokens and add the light/dark document shell.
- b566dcd: Establish the external package boundary so Foldstryx packages are consumable
  from packed artifacts. Each package now builds ESM JavaScript plus TypeScript
  declarations to `dist/` (via `tsc -p tsconfig.build.json`) and its `exports`
  point at the built output instead of `src/`. Runtime dependencies moved into
  `dependencies` and `@foldkit/ui`/`effect`/`foldkit` are declared as
  `peerDependencies` where the packages import them directly.

  `@foldstryx/styles` keeps the stable `document.global.css` subpath export and
  ships the bundled Atkinson Hyperlegible Next / Maple Mono NL NF font assets
  with working relative URLs. The `.stylex.js` modules ship as-is so a consumer's
  `@stylexjs/unplugin` compiles StyleX CSS at build time.

  Adds `pnpm check:packed`, a smoke harness that packs all five external-consumer
  packages, installs the tarballs into a throwaway Vite consumer (no workspace
  links), builds it, and drives Chrome to verify the docs shell, a route
  transition, and font loading from package assets.

- 221214c: Add Astryx-styled Form core primitives and controlled kitchen-sink examples.
- 854a097: Add Phase B feedback/status primitives: Badge, Alert, EmptyState, LoadingPanel, Attention, and a Foldkit Tooltip submodel, with Astryx-token styles and kitchen-sink catalog sections.
- cc871af: Add Phase C data display primitives: Table, Stat, ListRow, Pagination, and Details, with Astryx-token styles and a kitchen-sink catalog section.
- e568d5d: Add Phase D overlay and navigation primitives: Dialog, Tabs, DropdownMenu, and Toast, with Astryx-token styles, pure/Scene/Story test coverage, and kitchen-sink catalog sections.
- 198672c: Add Phase E page chrome and media primitives: Page (header/content/footer/shell), Grid (token-based columns and gap), and Avatar (sizes, shapes, image, and accessible labeling), with Astryx-token styles, pure test coverage, and kitchen-sink catalog sections.
- 175eb17: Add the first Foldkit composition primitives: StyleX attribute glue, layout, Button, and Card.
- 1d4c9c5: Add the v0 desktop Sidebar, icon shell, and sidebar demo chrome.

### Patch Changes

- 90771b6: Polish catalog typography, button sizing, disabled states, and page shell layout.
- 8e3a7fa: Match the Astryx fill-mode shell scroll contract: bound the sidebar demo shell to `100dvh`, make the rail and inset flex children with `min-height: 0`, and give the nav and main regions independent vertical scroll containers so the rail and inset header stay pinned while content scrolls.
- bf27a0b: Fix Phase C review findings: always apply the controlled Details `open` prop, add a summary click handler with Scene coverage, assert Stat card render text after async transitions, and tighten the Pagination smoke assertion.
- Updated dependencies [e8013ac]
- Updated dependencies [fd80796]
- Updated dependencies [b566dcd]
  - @foldstryx/tokens@0.1.0
