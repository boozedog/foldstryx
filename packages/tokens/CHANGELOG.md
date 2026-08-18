# @foldstryx/tokens

## 0.1.1

### Patch Changes

- 177a703: Fix Nub pack and release so registry tarballs expose `dist/` exports and concrete sibling semver instead of `workspace:*`.

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
