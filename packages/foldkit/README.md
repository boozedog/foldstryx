# @foldstryx/foldkit

Astryx-styled Foldkit view helpers. Named composition primitives (`Button`,
`Card`, `Stack`, `Row`, `Text`, `Sidebar`, `Dialog`, `Tabs`, …) that pair
Foldkit headless behavior with `@foldstryx/styles` visuals.

```ts
import { Button, Stack, Text } from '@foldstryx/foldkit'
```

`@foldkit/ui`, `effect`, and `foldkit` are peer dependencies supplied by the
host. See the [root README](../../README.md) for the layer map and packaging
notes.

## Compatibility

Requires the Foldkit 0.147 / Effect RC compatibility line:

- `foldkit@>=0.147.0`, `@foldkit/ui@>=0.147.0`
- `effect@>=4.0.0-rc.109`

Since Foldkit 0.145, `foldkit/html` threads an `HtmlBuilder<Message>` into
every view instead of exposing an `html<Message>()` factory. Foldstryx
composition views mirror that: views take the frame's builder as their last
parameter (`Button.view(config, h)`). Switch, Checkbox, and Tabs are
stateless controlled views with parent-owned state and toggle messages.
