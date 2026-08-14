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

## Token maintenance

- Astryx-derived StyleX variables live in `packages/tokens/src/index.stylex.ts`.
- Preserve upstream CSS variable names such as `--color-accent` and `--spacing-2`.
- Automated gates (`pnpm check`, CI) MUST stay in-repo. `pnpm check:tokens` reads
  `NOTICE` plus the lifted token module. It does **not** open `../astryx`.
- When lifting tokens by hand, compare a local Astryx checkout, then record that SHA
  in `NOTICE`. Do not add checkout paths to scripts or fallow.

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

## Quality gates

| Gate                   | Source                                                                         | What it catches                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Foldkit MVU            | `@foldkit/oxlint-plugin` `recommended.json` (0.6.0, 25 rules)                  | Headless widget / message / view contracts                                                                                              |
| Effect-async           | `@foldstryx/oxlint-plugin` + `scripts/check-async-allowlist.mjs`               | `async` / `await` / `new Promise` (allowlist must not grow)                                                                             |
| Waiver ratchet         | `scripts/check-waiver-allowlist.mjs` + hk pre-commit / pre-push + `pnpm check` | Disable comments, oxlint/fallow/changeset exceptions, and `AWAIT_ALLOWLIST` cannot grow without updating the frozen baseline            |
| StyleX official        | `@stylexjs/eslint-plugin@0.19.0` via oxlint `jsPlugins` alias `stylex`         | `valid-styles`, `valid-shorthands`, unused, lookahead (error); `sort-keys` warn                                                         |
| Token / null / clobber | `@foldstryx/oxlint-plugin`                                                     | Hex/`14px` in `stylex.create()`, persist-null overrides, `sxAttrs` + raw `h.Class`/`h.Style`                                            |
| Token fidelity         | `pnpm check:tokens`                                                            | In-repo NOTICE pin + lifted token names/values (no `../astryx`)                                                                         |
| Demo smoke             | `pnpm check:demo`                                                              | Fresh Vite preview on an ephemeral port (no reuse of `pnpm dev`); needs `google-chrome` or `CHROME_PATH`. CI sets `CHROME_NO_SANDBOX=1` |
| Still human            | Browser at `http://localhost:5173/`                                            | Astryx _feel_, optional PR screenshots — not pixel diffs                                                                                |

We rely on official StyleX lint + the compiler, not a capabilities matrix. Pin oxlint (`1.78.0`) and `@stylexjs/eslint-plugin` (`0.19.0`); `jsPlugins` is alpha / not semver.

`stylex/enforce-extension` is **off** for `packages/tokens/**` and `packages/styles/**`. Token Defaults + Vars + types stay in one `index.stylex.ts` (Astryx layout). Style modules use the `.stylex.ts` suffix for `stylex.create()`, not `defineVars`. We do **not** explode those files just to satisfy the default. Official `stylex/valid-shorthands` covers multi-value `padding`/`margin`/`font`/`border*`; we did **not** port Astryx `no-border-shorthand` (would double-report).

Official `stylex/no-conflicting-props` is JSX-only. Foldkit uses `sxAttrs` + `h.Class` / `h.Style`; `foldstryx/no-stylex-clobber` is the analogue. Prefer extra styles in `sxAttrs()` — Foldkit last-write-wins on `Style`.

Waivers are frozen. `pnpm check:waivers` (hk pre-commit / pre-push, `pnpm check`, and CI) fails if a new `oxlint-disable` / `@ts-expect-error` / prettier-ignore appears, if oxlint/fallow/changeset exceptions grow, or if `AWAIT_ALLOWLIST` changes. Shrink or growth both require editing `scripts/check-waiver-allowlist.mjs` in the same change. hk is local hooks only; CI runs `pnpm check`.

## Testing

Mirror foldstylex / foldkit: vitest, `@effect/vitest`, happy-dom, `foldkit/test`
Story + Scene. Write failing tests before interactive behavior.

### Minimum test contract for parity components

Every new component that lands in `packages/foldkit` MUST ship with tests that
cover the categories below, mapped to Foldkit APIs (no React / RTL). The
`@foldstryx/styles` module is aliased to `packages/foldkit/src/stylesStub.ts` in
unit tests, so StyleX selection is asserted by the stub's `sx-<key>` class names.

- **Pure / render** (`*.test.ts`): render the view to a VNode and assert tag,
  text, attributes, handlers, slots, and selected StyleX keys. Cover defaults,
  every semantic variant and size, optional content, and omitted content.
- **Accessibility**: assert ARIA roles and relationships (`role`, `aria-*`,
  `aria-describedby` linkage) and that non-urgent surfaces are NOT `role="alert"`.
- **Interactive** (`*.scene.test.ts`): a real `update` + typed message union,
  driven through `Scene.role` / `Scene.selector` / `Scene.click` / focus /
  keyboard. Cover one happy path and one negative/disabled path. Acknowledge
  mounts that fire and unmount with `Scene.Mount.expectEnded`.
- **MVU / submodel / async** (`*.story.test.ts`): state-machine transitions,
  command lifecycle, stale-timer handling, and out-messages without a DOM.
- **Visual slices**: browser verification at `http://localhost:5173/` plus the
  `pnpm check:demo` smoke probe.

The kitchen-sink catalog is covered by the demo smoke probe
(`scripts/check-demo-smoke.mjs`), which asserts the Phase B section headings and
key semantic roles (`role=alert`, `role=switch`, `role=tooltip`). Do not add a
second Scene harness that mounts the full `Submodel.defineView` catalog as a
top-level view — nested submodel mounting is not a supported Scene top-level
shape; extend the smoke probe instead.

## Upstream

A local Astryx checkout may exist at `../astryx` for human lifts. Record the
tracked commit in `NOTICE`. Preserve MIT attribution for substantial adapted
material. Checks and CI must not require that checkout.

## First primitive APIs

- `Button.view({ label, variant, size, onClick, isDisabled })` supports `primary`, `secondary`, `ghost`, and `danger`; sizes are `md`, `sm`, and `icon`.
- `Stack.view` uses `xs`, `sm`, `md`, and `lg` token gaps. `Row.view` uses `between`, `baseline`, `startBetween`, `wrap`, `wrapCenter`, and `center` alignment presets.
- `Text.view` starts with `body`, `bodySm`, `muted`, `mutedSm`, `error`, `success`, `mono`, `sectionTitle`, and `title` variants.
- `Card.root`, `Card.header`, and `Card.content` are composable chrome slots; `Card.section` composes them with optional title and description.
- Interactive controls require a Foldkit Story or Scene test covering messages and disabled behavior.
- Visual changes require browser verification at `http://localhost:5173/`, including computed font family, layout gaps, button states, and shell padding.
