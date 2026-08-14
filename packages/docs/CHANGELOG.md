# @foldstryx/docs

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
