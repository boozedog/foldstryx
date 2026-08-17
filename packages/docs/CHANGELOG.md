# @foldstryx/docs

## 0.4.0

### Minor Changes

- 0f23064: Add GridFocus, ToggleButton, table selection helpers, and an Astryx-style Listbox Selector; remove NativeSelect.

### Patch Changes

- Updated dependencies [0f23064]
  - @foldstryx/foldkit@0.3.0
  - @foldstryx/styles@0.2.0
  - @foldstryx/kitchen-sink@0.3.0

## 0.3.0

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

- Updated dependencies [a604de1]
- Updated dependencies [41f03b8]
- Updated dependencies [321519d]
  - @foldstryx/foldkit@0.2.0
  - @foldstryx/kitchen-sink@0.2.0

## 0.2.0

### Minor Changes

- 80e66fc: Export a runtime `Message` Effect Schema from the docs package entry point,
  alongside the existing `Message` type, so external hosts (e.g. Taurifold) can
  pass it to `Runtime.makeApplication({ devTools: { Message } })` and keep the
  Foldkit DevTools overlay and message-dispatch bridge without reconstructing the
  union.

  The schema covers the docs shell messages (`ToggleSidebar`, `Navigate`,
  `ToggleNav`, `HoverNav`, `OpenNav`, `Noop`) and the kitchen-sink wrapper
  (`Sink`). The nested `Sink.message` payload is unconstrained (`S.Any`) because
  the kitchen-sink catalog does not yet publish a stable runtime message schema
  and the docs package must not depend on host-specific schemas. `HoverNav` /
  `OpenNav` ids decode as JSON-friendly optional-nullable strings (a missing key
  or `null`); `undefined` stays an internal-producer-only value and is not
  JSON-transportable.

## 0.1.0

### Minor Changes

- 1f86af5: Add a platform-neutral Foldstryx documentation composition: a Foldkit
  model/message/update/view application with typed routes, canonical navigation
  metadata, a fixed sidebar shell, and focused documentation pages. The
  kitchen-sink `Mount` stays independently embeddable and is rendered as a
  dedicated docs route. The browser sidebar demo is now a thin runtime bootstrap
  around this composition.
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

### Patch Changes

- 87214e2: Fix the Forms documentation page dispatching `undefined` from its checkbox and
  native-select change handlers. The handlers now dispatch a typed `Noop`
  message, and Scene tests cover the click and change paths.
- Updated dependencies [90771b6]
- Updated dependencies [e8013ac]
- Updated dependencies [8e3a7fa]
- Updated dependencies
- Updated dependencies [fd80796]
- Updated dependencies [b566dcd]
- Updated dependencies [221214c]
- Updated dependencies [854a097]
- Updated dependencies [cc871af]
- Updated dependencies [bf27a0b]
- Updated dependencies [e568d5d]
- Updated dependencies [f04ee8e]
- Updated dependencies [198672c]
- Updated dependencies [175eb17]
- Updated dependencies [1d4c9c5]
  - @foldstryx/styles@0.1.0
  - @foldstryx/kitchen-sink@0.1.0
  - @foldstryx/foldkit@0.1.0
