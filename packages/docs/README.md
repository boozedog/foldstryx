# @foldstryx/docs

Platform-neutral Foldstryx documentation composition. A Foldkit
`Model` / `Message` / `init` / `update` / `view` application with typed routes,
canonical navigation metadata, and a fixed sidebar shell. No browser globals,
URL history, Tauri, or native APIs — hosts own runtime bootstrap.

```ts
import { Model, init, update, view } from '@foldstryx/docs'
import '@foldstryx/styles/document.global.css'
```

`@foldkit/ui`, `effect`, and `foldkit` are peer dependencies supplied by the
host. See the [root README](../../README.md) for the layer map and packaging
notes.
