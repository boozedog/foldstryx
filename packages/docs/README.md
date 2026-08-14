# @foldstryx/docs

Platform-neutral Foldstryx documentation composition. A Foldkit
`Model` / `Message` / `init` / `update` / `view` application with typed routes,
canonical navigation metadata, and a fixed sidebar shell. No browser globals,
URL history, Tauri, or native APIs — hosts own runtime bootstrap.

```ts
import { Message, Model, init, update, view } from '@foldstryx/docs'
import '@foldstryx/styles/document.global.css'
```

`@foldkit/ui`, `effect`, and `foldkit` are peer dependencies supplied by the
host. See the [root README](../../README.md) for the layer map and packaging
notes.

## Runtime message schema (Foldkit DevTools)

`Message` is both the docs application's typed message union and its runtime
Effect Schema. External hosts (e.g. Taurifold) can pass it to
`Runtime.makeApplication({ devTools: { Message } })` to keep the Foldkit
DevTools overlay and message-dispatch bridge without reconstructing the union.

The nested `Sink.message` payload is intentionally unconstrained (`S.Any`) so
the docs package does not depend on a kitchen-sink runtime schema or any
host-specific schema. `HoverNav` / `OpenNav` ids are JSON-friendly
optional-nullable strings: a missing key or `null` decode. Internal producers
emit `string | undefined`; `undefined` is not JSON-transportable, so external
dispatch should use `null` (or omit the key).

The DevTools overlay is host-owned: `@foldstryx/docs` does not import or depend
on `@foldkit/devtools`.
