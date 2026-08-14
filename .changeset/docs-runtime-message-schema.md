---
'@foldstryx/docs': minor
---

Export a runtime `Message` Effect Schema from the docs package entry point,
alongside the existing `Message` type, so external hosts (e.g. Taurifold) can
pass it to `Runtime.makeApplication({ devTools: { Message } })` and keep the
Foldkit DevTools overlay and message-dispatch bridge without reconstructing the
union.

The schema covers the docs shell messages (`ToggleSidebar`, `Navigate`,
`ToggleNav`, `HoverNav`, `OpenNav`, `Noop`) and the kitchen-sink wrapper
(`Sink`). The nested `Sink.message` payload is unconstrained (`S.Any`) because
the kitchen-sink catalog does not yet publish a stable runtime message schema
and the docs package must not depend on host-specific schemas. `HoverNav` /
`OpenNav` ids decode as JSON-friendly optional-nullable strings (a missing key
or `null`); `undefined` stays an internal-producer-only value and is not
JSON-transportable.
