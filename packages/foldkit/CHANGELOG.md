# @foldstryx/foldkit

## 0.2.0

### Minor Changes

- a604de1: Migrate to the Foldkit 0.145 / Effect rc.108 compatibility line.

  - Thread `HtmlBuilder<Message>` through all composition views (`view(config, h)`).
  - Port Switch, Checkbox, and Tabs to the stateless controlled APIs (parent-owned state and toggle messages).
  - Migrate Scene/Story tests to `given()` and the current step pipeline.
  - Rename tooltip/toast/animation messages to the current vocabulary.
  - Peer ranges move to `foldkit >=0.145.0`, `@foldkit/ui >=0.145.0`, `effect >=4.0.0-rc.108`.

  Effect rc.109 is deferred until Foldkit publishes a compatible release.

- 321519d: Move the product graph to the Foldkit 0.147 / Effect rc.109 compatibility line.

  - `foldkit`/`@foldkit/ui` 0.147.0, `effect` 4.0.0-rc.109, `@effect/vitest` rc.109, `@foldkit/vite-plugin` 0.14.0 (0.15.0 is npm-deprecated; 0.14.0 is the non-deprecated plugin on the rc.109 line).
  - The sidebar demo declares `effect` as a direct dependency so Vite's
    `optimizeDeps.include` resolves the `effect/*` namespaces the plugin lists;
    `pnpm dev` starts without unresolved-dependency warnings.
  - Update the Effect Lens documentation to the resolved rc.109 baseline, the
    missing-reference-pack advisory, and the successful CI run `31987528189`.
  - Peers move to `foldkit >=0.147.0`, `@foldkit/ui >=0.147.0`, `effect >=4.0.0-rc.109`.

### Patch Changes

- 41f03b8: Tooling-only: migrate the repository package manager from pnpm to Nub
  (foldstryx#31). No runtime, API, or behavior change.

## 0.1.0

### Minor Changes

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

- bf27a0b: Fix Phase C review findings: always apply the controlled Details `open` prop, add a summary click handler with Scene coverage, assert Stat card render text after async transitions, and tighten the Pagination smoke assertion.
- f04ee8e: Harden Phase D review findings: use the exported `titleId`/`descriptionId` helpers for Dialog labelling and clear `aria-describedby` when no description is present, add an opt-in Escape-keydown close path with Scene coverage, and add backdrop-click dismissal Scene coverage.
- Updated dependencies [90771b6]
- Updated dependencies [e8013ac]
- Updated dependencies [8e3a7fa]
- Updated dependencies [fd80796]
- Updated dependencies [b566dcd]
- Updated dependencies [221214c]
- Updated dependencies [854a097]
- Updated dependencies [cc871af]
- Updated dependencies [bf27a0b]
- Updated dependencies [e568d5d]
- Updated dependencies [198672c]
- Updated dependencies [175eb17]
- Updated dependencies [1d4c9c5]
  - @foldstryx/styles@0.1.0
