---
'@foldstryx/tokens': minor
'@foldstryx/styles': minor
'@foldstryx/foldkit': minor
'@foldstryx/docs': minor
---

Establish the external package boundary so Foldstryx packages are consumable
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
