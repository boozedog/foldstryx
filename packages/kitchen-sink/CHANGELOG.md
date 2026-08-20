# @foldstryx/kitchen-sink

## 0.4.0

### Minor Changes

- 5e0e314: Add Phase F primitives: typeahead, dates, number/textarea, tree list, context menu, and inline loading feedback.

### Patch Changes

- Updated dependencies [5e0e314]
- Updated dependencies [9e4661e]
  - @foldstryx/styles@0.3.0
  - @foldstryx/foldkit@0.4.0

## 0.3.2

### Patch Changes

- Publish registry packuments from normalized tarballs so `npm install @foldstryx/foldkit` resolves without `workspace:*` overrides.
- Updated dependencies
  - @foldstryx/styles@0.2.2
  - @foldstryx/foldkit@0.3.2

## 0.3.1

### Patch Changes

- 177a703: Fix Nub pack and release so registry tarballs expose `dist/` exports and concrete sibling semver instead of `workspace:*`.
- Updated dependencies [177a703]
  - @foldstryx/styles@0.2.1
  - @foldstryx/foldkit@0.3.1

## 0.3.0

### Minor Changes

- 0f23064: Add GridFocus, ToggleButton, table selection helpers, and an Astryx-style Listbox Selector; remove NativeSelect.

### Patch Changes

- Updated dependencies [0f23064]
  - @foldstryx/foldkit@0.3.0
  - @foldstryx/styles@0.2.0

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

- Updated dependencies [a604de1]
- Updated dependencies [41f03b8]
- Updated dependencies [321519d]
  - @foldstryx/foldkit@0.2.0

## 0.1.0

### Minor Changes

- Make `@foldstryx/kitchen-sink` a publishable external package. It is removed
  from the Changesets ignore list and now ships built ESM JavaScript plus
  TypeScript declarations to `dist/` with public scoped-package access, so
  `@foldstryx/docs` can depend on a published version rather than an unpublished
  private package.

### Patch Changes

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
- Updated dependencies [f04ee8e]
- Updated dependencies [198672c]
- Updated dependencies [175eb17]
- Updated dependencies [1d4c9c5]
  - @foldstryx/styles@0.1.0
  - @foldstryx/foldkit@0.1.0
