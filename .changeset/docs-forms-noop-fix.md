---
'@foldstryx/docs': patch
---

Fix the Forms documentation page dispatching `undefined` from its checkbox and
native-select change handlers. The handlers now dispatch a typed `Noop`
message, and Scene tests cover the click and change paths.
