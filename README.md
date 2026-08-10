# foldstryx

**Astryx-inspired styling for [Foldkit](https://github.com/Tylian/foldkit), powered by [StyleX](https://stylexjs.com).**

foldstryx turns [Astryx](https://github.com/facebook/astryx)’s StyleX-native design tokens and
component language into **named composition primitives** so Foldkit apps can build
intent-shaped UI with a token-faithful Astryx look.

```ts
// Prefer named primitives (Foldkit governs the API)…
Button.view({ label: 'Save', variant: 'primary' })
Stack.view({
  gap: 'md',
  children: [
    Text.view({ variant: 'heading', children: 'Overview' }),
    Card.view({ children: […] }),
  ],
})

// …not React JSX and not anonymous StyleX key salads on every div
```

> **Sit beside [foldstylex](https://github.com/boozedog/foldstylex).** Same Foldkit + StyleX
> layering and anti–div-soup philosophy; different visual system (Astryx-faithful tokens
> instead of shadcn-inspired). May replace foldstylex later if this kit wins on real apps
> (e.g. taurifold). Not a product/domain UI kit.

## How the layers fit

| Layer                       | Responsibility                                              |
| --------------------------- | ----------------------------------------------------------- |
| **`@foldstryx/tokens`**     | Astryx-faithful theme vars (color, space, type, elevation…) |
| **`@foldstryx/styles`**     | StyleX rules for components + layout (public escape hatch)  |
| **`@foldstryx/foldkit`**    | Named Html helpers: Button, Card, Stack, …                  |
| **Foldkit / `@foldkit/ui`** | MVU runtime, headless behavior, a11y                        |
| **Product apps**            | Domain models, formatting, workflows                        |

## Status

Greenfield scaffold. Packages exist as placeholders; first real work is token lift from
upstream Astryx and a small kitchen-sink catalog.

## Packages

| Package                                              | Role                                     |
| ---------------------------------------------------- | ---------------------------------------- |
| [`@foldstryx/tokens`](./packages/tokens)             | StyleX theme variables (Astryx-faithful) |
| [`@foldstryx/styles`](./packages/styles)             | Component + layout StyleX modules        |
| [`@foldstryx/foldkit`](./packages/foldkit)           | Named primitives + StyleX attribute glue |
| [`@foldstryx/kitchen-sink`](./packages/kitchen-sink) | Mountable catalog submodel               |

## Develop

Requires Node `>=20.19` or `>=22.12`, [pnpm](https://pnpm.io), and [mise](https://mise.jdx.dev)
(optional but used for task runners).

```bash
pnpm install

mise run typecheck   # tsc across packages
mise run test        # vitest
mise run check       # full typecheck + tests + lint + fallow
mise run pre-commit  # hk changed-file hooks
```

`mise run check` is the authoritative full verifier after implementation work.

## Effect

This repo targets **Effect v4** (`effect@4.0.0-beta.x`), same lineage as foldstylex / foldkit.
Effect usage stays at the Foldkit boundary: `Schema` for models, `Match` for updates.

## Upstream / license

- Foldstryx code: MIT (see [LICENSE](./LICENSE)).
- Design tokens and style intent are adapted from [Astryx](https://github.com/facebook/astryx)
  (MIT, Copyright Meta Platforms, Inc.). See [NOTICE](./NOTICE).
- This project is not affiliated with or endorsed by Meta.
