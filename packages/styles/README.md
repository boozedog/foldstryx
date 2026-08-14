# @foldstryx/styles

Astryx-inspired component and layout styles for StyleX. Ships typed StyleX
modules (`buttonStyles`, `cardStyles`, `layoutStyles`, …) plus the stable
`document.global.css` subpath export with the bundled Atkinson Hyperlegible
Next / Maple Mono NL NF font assets.

```ts
import { buttonStyles } from '@foldstryx/styles'
import '@foldstryx/styles/document.global.css'
```

The `.stylex.js` modules ship as-is; a consumer's `@stylexjs/unplugin` compiles
the StyleX CSS at build time. See the [root README](../../README.md) for the
layer map and packaging notes.
