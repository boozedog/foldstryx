# foldstryx

Astryx-inspired styling for Foldkit, powered by StyleX.

Named **composition primitives** sit on top of StyleX so product apps rarely invent
layout/chrome by hand. Visual system aims to be **token-faithful to Astryx**; runtime
and public APIs are **Foldkit-first**.

Sits beside [foldstylex](https://github.com/boozedog/foldstylex) (shadcn-inspired). Do not
depend on `@foldstylex/*` — steal patterns, keep lifecycles independent. Replace-if-we-like-it
is a later product decision, not a day-1 merge.

## Stack

- **Foldkit** — MVU UI (`Runtime`, `Schema`, `Match`, view helpers)
- **Effect v4** — `effect@4.0.0-beta.x`
- **StyleX** — component styles and design tokens (Astryx-faithful)
- **Vite** — demo / kitchen-sink bundler (when examples land)

## Non-negotiables

1. **Foldkit governs.** No React components, hooks, or context as the public surface.
   Astryx source is a **donor** for tokens, visual intent, and sometimes prop _names_ —
   not for JSX shapes.
2. **Token-faithful.** Prefer lifting Astryx scales/roles over inventing foldstryx-only
   tokens. Component styles reference tokens, not magic numbers.
3. **Anti–div soup.** Named primitives for common patterns (`Stack`, `Row`, `Card`, …).
   Residual `h.div` is fine for true one-offs.
4. **Zero domain.** No product vocabulary in this repo.
5. **Effect-first.** No `async`/`await`/`new Promise` in library code (oxlint plugin).
6. **TDD for interactive/MVU.** Story/Scene tests via foldkit/test when behavior lands.

## Layer map

| Layer                   | Owns                                 |
| ----------------------- | ------------------------------------ |
| `@foldstryx/tokens`     | Astryx-faithful StyleX vars / themes |
| `@foldstryx/styles`     | Typed component + layout styles      |
| Foldkit (`@foldkit/ui`) | Headless behavior, a11y, state       |
| `@foldstryx/foldkit`    | Named chrome + layout primitives     |
| Product apps            | Domain models, formatting, workflows |

Styles stay **public** as an escape hatch. Package exports are **consumer contracts**.

## Role-based APIs

Do **not** force every export to look like `X.view(config)`. Role determines shape
(same philosophy as foldstylex): layout `view`, controls, fields, chrome slots,
stateful Foldkit widgets, async display with tagged state + `Match`.

## Kill criteria (honest exit)

Consider stopping or narrowing foldstryx if:

- Token-faithful styles keep needing React-only tricks that do not map cleanly.
- Interactive half stays worse than foldstylex for real app chrome.
- Upstream token sync is high churn with no consumer payoff.
- The kit is only “foldstylex with different colors.”

## Testing

Mirror foldstylex / foldkit: vitest, `@effect/vitest`, happy-dom, `foldkit/test`
Story + Scene. Write failing tests before interactive behavior.

## Upstream

Local Astryx checkout often at `../astryx`. Record the tracked commit when lifting
tokens. Preserve MIT attribution in NOTICE for substantial adapted material.
