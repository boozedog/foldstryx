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
    Text.view({ variant: 'title', children: 'Overview' }),
    Card.section({ children: [Text.view({ children: 'Content' })] }),
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

Token foundations are lifted from Astryx at the pinned revision in `NOTICE`. The first
composition primitives and kitchen-sink catalog are available on the issue #2 branch.

```ts
Button.view({ label: 'Save', variant: 'primary', onClick: Saved() })
Stack.view({ gap: 'md', children: [Text.view({ children: 'Body' })] })
Card.section({ title: 'Details', children: ['Content'] })
```

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

The visual catalog runs at `http://localhost:5173/`. UI and StyleX changes require a
browser check for computed fonts, layout spacing, button states, and page shell padding.

`mise run check` is the authoritative full verifier after implementation work.

## Effect

This repo targets **Effect v4** (`effect@4.0.0-beta.x`), same lineage as foldstylex / foldkit.
Effect usage stays at the Foldkit boundary: `Schema` for models, `Match` for updates.

## Upstream / license

- Foldstryx code: MIT (see [LICENSE](./LICENSE)).
- Design tokens and style intent are adapted from [Astryx](https://github.com/facebook/astryx)
  (MIT, Copyright Meta Platforms, Inc.). See [NOTICE](./NOTICE) for the exact source pin.
- Astryx CSS variable names are public contract: use names such as `--color-accent` and
  `--spacing-2`; do not rename them to product or shadcn-style aliases.
- This project is not affiliated with or endorsed by Meta.
