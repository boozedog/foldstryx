# @foldstryx/kitchen-sink

Self-contained, mountable Foldkit submodel kitchen sink for the Foldstryx
primitives. Exposes `Mount` (a `Model` / `Message` / `init` / `update` /
`view` submodel) that renders the full catalog.

```ts
import { Mount } from '@foldstryx/kitchen-sink'
```

`effect` and `foldkit` are peer dependencies supplied by the host. See the
[root README](../../README.md) for the layer map and packaging notes.
