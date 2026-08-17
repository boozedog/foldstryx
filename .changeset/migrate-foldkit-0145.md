---
'@foldstryx/foldkit': minor
'@foldstryx/kitchen-sink': minor
'@foldstryx/docs': minor
---

Migrate to the Foldkit 0.145 / Effect rc.108 compatibility line.

- Thread `HtmlBuilder<Message>` through all composition views (`view(config, h)`).
- Port Switch, Checkbox, and Tabs to the stateless controlled APIs (parent-owned state and toggle messages).
- Migrate Scene/Story tests to `given()` and the current step pipeline.
- Rename tooltip/toast/animation messages to the current vocabulary.
- Peer ranges move to `foldkit >=0.145.0`, `@foldkit/ui >=0.145.0`, `effect >=4.0.0-rc.108`.

Effect rc.109 is deferred until Foldkit publishes a compatible release.
