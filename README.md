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

> **Machine-readable index:** see [LLMS.txt](./LLMS.txt) for a concise index of the published
> packages, the Foldkit MVU contract, and the host integration path.

## How the layers fit

| Layer                       | Responsibility                                              |
| --------------------------- | ----------------------------------------------------------- |
| **`@foldstryx/tokens`**     | Astryx-faithful theme vars (color, space, type, elevation…) |
| **`@foldstryx/styles`**     | StyleX rules for components + layout (public escape hatch)  |
| **`@foldstryx/foldkit`**    | Named Html helpers: Button, Card, Stack, …                  |
| **`@foldstryx/docs`**       | Platform-neutral routed documentation composition (shell)   |
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
| [`@foldstryx/docs`](./packages/docs)                 | Routed docs composition (shell + routes) |

## Documentation composition

`@foldstryx/docs` owns the canonical Foldstryx documentation site: a Foldkit
`Model` / `Message` / `init` / `update` / `view` application with typed routes,
canonical navigation metadata, and a fixed sidebar shell. It is
**platform-neutral** — no browser globals, URL history, Tauri, or native APIs.
The browser demo (`examples/sidebar-demo`) is a thin runtime bootstrap that
imports the composition and runs it; a future Taurifold desktop host will do
the same through packaged artifacts. Hosts own runtime bootstrap, container
lookup, devtools, and URL integration.

`@foldstryx/kitchen-sink` stays independently embeddable and is rendered as a
dedicated docs route rather than making `Mount` itself route-aware.

## Packaging / external consumption

The five external-consumer packages (`@foldstryx/tokens`, `@foldstryx/styles`,
`@foldstryx/foldkit`, `@foldstryx/kitchen-sink`, `@foldstryx/docs`) build ESM
JavaScript plus TypeScript declarations to `dist/` (`pnpm build`). In the
workspace, `exports` point at `src/` so tests and the demo never depend on a
stale `dist/`; `publishConfig.exports` points at `dist/` so packed and
published artifacts expose the built output. `prepack` rebuilds `dist/` for
`npm publish`. Runtime dependencies live in `dependencies`; `@foldkit/ui`,
`effect`, and `foldkit` are `peerDependencies` where a package imports them
directly, so the host supplies the Foldkit runtime.

`@foldstryx/styles` keeps the stable `@foldstryx/styles/document.global.css`
subpath export and ships the bundled Atkinson Hyperlegible Next / Maple Mono
NL NF font assets with working relative URLs. The `.stylex.js` modules ship
as-is; a consumer's `@stylexjs/unplugin` compiles StyleX CSS at build time
(it auto-discovers packages that depend on `@stylexjs/stylex` and excludes
them from Vite pre-bundling).

```bash
# Build all packages to dist/
pnpm build

# Pack all five external-consumer packages and verify a throwaway Vite
# consumer that installs the tarballs (no workspace links) builds, renders
# the docs shell, transitions routes, and loads the fonts from package assets.
pnpm check:packed
```

`pnpm check:packed` is the external-boundary gate. It packs the five packages,
builds `dist/` first, scaffolds a temporary Vite consumer that installs the
tarballs, builds it, and drives headless Chrome to assert the docs shell, a
route transition, and font loading. It never uses workspace source aliases, so
it catches missing StyleX compiler output, broken relative font URLs, and
incorrect dependency metadata.

The Taurifold desktop host is the next phase ([#25](https://github.com/boozedog/foldstryx/issues/25)):
it will consume these packed artifacts the same way the smoke consumer does,
adding only host-specific runtime bootstrap, container lookup, devtools, and
URL integration.

## Releasing

The five external-consumer packages publish together as one coordinated
release. See [RELEASING.md](./RELEASING.md) for the exact, repeatable
procedure: prepare metadata and Changesets, run `pnpm check`, version with
`pnpm version-packages`, review the generated diff, re-run the gate, then
publish with `pnpm release` (`changeset publish`). Credentials are configured
locally and never committed.

## Develop

Requires Node `>=20.19` or `>=22.12`, [pnpm](https://pnpm.io), and [mise](https://mise.jdx.dev)
(optional but used for task runners).

```bash
pnpm install

mise run typecheck   # tsc across packages
mise run test        # vitest
mise run lint        # oxlint (foldkit MVU + Effect-async + StyleX jsPlugins)
pnpm check:tokens    # in-repo NOTICE pin + lifted token spot-check
pnpm check:demo      # vite preview (ephemeral port) + computed-style smoke
pnpm check:lint-fixtures  # negative StyleX / token / clobber fixtures
pnpm check:waivers   # frozen disable-comment + config waiver ratchet
mise run check       # full gate (format, lint, tsc, fallow, test, tokens, fixtures, demo, waivers)
mise run pre-commit  # hk changed-file hooks (includes waiver ratchet)
```

The visual catalog runs at `http://localhost:5173/`. UI and StyleX changes require a
browser check for computed fonts, layout spacing, button states, and page shell padding.
`pnpm check:demo` builds the demo, starts a fresh Vite preview on an ephemeral port (it does not
reuse `pnpm dev`), and drives headless Chrome (`google-chrome` or `CHROME_PATH`) for the
automated computed-style subset. Astryx _feel_ stays human.

`mise run check` is the authoritative full verifier after implementation work.

Official StyleX rules run through oxlint `jsPlugins` (`@stylexjs/eslint-plugin@0.19.0`,
alias `stylex`) — there is no second ESLint runner. Token-hardcode / null-override /
Foldkit className clobber live in `@foldstryx/oxlint-plugin`.

`pnpm check:waivers` freezes disable comments and oxlint/fallow/changeset exceptions.
Install git hooks with `hk install` (or `hk install --mise` if you use mise tools).
hk is for pre-commit and pre-push only. CI and `mise run check` run `pnpm check`.

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
