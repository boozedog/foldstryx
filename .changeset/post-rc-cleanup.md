---
'@foldstryx/foldkit': minor
'@foldstryx/kitchen-sink': minor
'@foldstryx/docs': minor
---

Move the product graph to the Foldkit 0.147 / Effect rc.109 compatibility line.

- `foldkit`/`@foldkit/ui` 0.147.0, `effect` 4.0.0-rc.109, `@effect/vitest` rc.109, `@foldkit/vite-plugin` 0.14.0 (0.15.0 is npm-deprecated; 0.14.0 is the non-deprecated plugin on the rc.109 line).
- The sidebar demo declares `effect` as a direct dependency so Vite's
  `optimizeDeps.include` resolves the `effect/*` namespaces the plugin lists;
  `pnpm dev` starts without unresolved-dependency warnings.
- Update the Effect Lens documentation to the resolved rc.109 baseline, the
  missing-reference-pack advisory, and the successful CI run `31987528189`.
- Peers move to `foldkit >=0.147.0`, `@foldkit/ui >=0.147.0`, `effect >=4.0.0-rc.109`.
