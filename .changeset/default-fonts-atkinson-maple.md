---
'@foldstryx/tokens': minor
'@foldstryx/styles': minor
---

Use Atkinson Hyperlegible Next as the default interface font (body and headings) and Maple Mono NL NF as the default monospace font. Vendors the fonts under `packages/styles/src/fonts/` with `@font-face` rules in the document global stylesheet, and makes the `mono` layout style reference the `--font-family-code` token instead of a hardcoded stack.
