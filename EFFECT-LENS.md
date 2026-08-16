# Effect Lens adoption baseline

Reviewed, human-readable audit baseline for the Effect Lens adoption
([foldstryx#29](https://github.com/boozedog/foldstryx/issues/29)). It records the
Phase 1 audit facts and the completed Phase 2–4 behavior (policy cleanup, unified
CI gate, scoped hk pre-commit gate) against the pinned baseline HEAD, plus the
decisions that keep the gate workspace-scoped.

Baseline HEAD: `3b5eee9` (Phase 4a scoped hook). Verified 2026-08-16 with
`@boozedog/effect-lens@0.1.0`. Every command below is read-only; the adoption made
no changes to CI, hooks, config, or dependencies beyond the documented Phases 2–4
commits already on master.

## Artifact pin

| Item               | Value                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Package            | `@boozedog/effect-lens@0.1.0`, exact pin in root `devDependencies`                        |
| CLI                | `effect-lens`                                                                             |
| oxlint provider    | `lens` — `@boozedog/effect-lens/dist/plugin/index.js` (root `.oxlintrc.json` `jsPlugins`) |
| Node engine (tool) | `>=22.6` (declared in the package `engines`)                                              |

The published package is the only source; no local tarball or packed artifact is in
use.

## Effect resolution and reference-pack status

| Field              | Value                                                        |
| ------------------ | ------------------------------------------------------------ |
| Effect (lockfile)  | `4.0.0-beta.83`                                              |
| Effect (installed) | `4.0.0-beta.83`                                              |
| Reference pack     | none (missing)                                               |
| Diagnostic         | `[warning] no reference pack found for effect 4.0.0-beta.83` |

Resolution is per workspace: the external-consumer packages (including
`packages/foldkit`) resolve `4.0.0-beta.83`. The `packages/oxlint-plugin-foldstryx`
tooling workspace resolves `4.0.0-beta.100` in the lockfile; it is excluded from
lint and is not part of the Lens pilot.

`effect-lens doctor --project . --workspace packages/foldkit` reports the
workspace's lockfile version, installed version, and reference-pack status. The
missing pack is advisory: it appears in `doctor` and `adoption audit` output, is
not a `check` finding, and acquisition stays explicit (`effect-lens packs fetch`,
review, then record the catalog) — the pack is never fetched implicitly. From the
repo root without `--workspace`, `doctor` cannot find a workspace Effect
declaration and exits with `[error] no effect dependency declared in lockfile or
package.json`; always use the scoped form.

## Gate layout

| Gate           | Command / scope                                                                                        | Notes                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI (mandatory) | `pnpm check:effect-lens` — `effect-lens check --project . --workspace packages/foldkit --mode unified` | Dedicated "Effect Lens (foldkit)" job, independent of the `pnpm check` job; whole `packages/foldkit` workspace                                     |
| hk pre-commit  | `effect-lens check --mode unified --changed --workspace packages/foldkit`                              | Staged changed files only, scoped to `packages/foldkit`; runs on every commit (no glob)                                                            |
| `pnpm check`   | unchanged                                                                                              | Does not itself run the Lens check                                                                                                                 |
| hk pre-push    | unchanged `prePushGate`                                                                                | format, lint, typecheck, fallow, test, async-allowlist, waivers, tokens, lint-fixtures, demo, packed, changeset-since; does not run the Lens check |

The unified Lens gate runs at CI (whole workspace) and pre-commit (changed files).
The full pre-push gate keeps its existing validation scope; the Lens check is not
duplicated there.

## Providers (unified mode)

| Provider    | Plugin                                       | Active rules (severity)                                                                                                                                                                                                   | Owns                          |
| ----------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `lens`      | `@boozedog/effect-lens/dist/plugin/index.js` | `lens/no-async-function`, `lens/no-await-expression`, `lens/no-new-promise` (error)                                                                                                                                       | Effect-async policy           |
| `foldstryx` | `@foldstryx/oxlint-plugin`                   | `foldstryx/no-hardcoded-styles`, `foldstryx/no-stylex-null-override`, `foldstryx/no-stylex-clobber` (error)                                                                                                               | token / null / clobber policy |
| `stylex`    | `@stylexjs/eslint-plugin@0.19.0`             | `stylex/valid-styles`, `valid-shorthands`, `no-unused`, `no-legacy-contextual-styles`, `no-conflicting-props`, `no-nonstandard-styles`, `no-lookahead-selectors` (error); `sort-keys` (warn); `enforce-extension` (error) | official StyleX policy        |

`@foldkit/oxlint-plugin` recommended rules stay active through the root config
`extends`. Unified mode aggregates all three providers plus the Foldkit MVU rules
over the selected workspace and preserves the project's raw oxlint severities.

## Overlap disposition (Phase 2)

- The Effect Lens async family (`lens/no-async-function`, `lens/no-await-expression`,
  `lens/no-new-promise`) replaces the retired `@foldstryx/oxlint-plugin` async
  duplicates in the active config.
- The retired rule implementations stay in `packages/oxlint-plugin-foldstryx/` as
  frozen baseline; the directory is excluded from oxlint and fallow analysis, and
  `pnpm check:waivers` pins the config. Removing them later is a separate,
  deliberate cleanup.
- The async `AWAIT_ALLOWLIST` (`/^(?:Effect|Runtime)\.runPromise$/`) stays frozen by
  `scripts/check-async-allowlist.mjs`.
- `packages/foldkit/src/asyncPolicyParity.test.ts` is the regression guard for the
  test exemption: it intentionally uses `async`/`await`/`new Promise` and MUST keep
  passing `pnpm lint` and `pnpm check:effect-lens`.

## Overrides and path exclusions

| Scope                                      | Override                                                        | Rationale                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `**/*.test.ts`, `**/*.test.tsx`            | `lens/*` family and `typescript/consistent-type-assertions` off | test code may use async helpers; the parity fixture guards the exemption                     |
| `packages/styles/**`, `packages/tokens/**` | `stylex/enforce-extension` off                                  | single `index.stylex.ts` module convention for tokens; `.stylex.ts` style modules for styles |
| `packages/foldkit/src/dialog.ts`           | `foldkit/no-empty-children-array` off                           | intentional widget edge case                                                                 |

Root oxlint `ignorePatterns` (unchanged by the adoption): `node_modules/`, `dist/`,
`**/*.d.ts`, `packages/oxlint-plugin-foldstryx/`, `scripts/**`, `**/vite.config.ts`,
`**/vitest.config.ts`, `**/vite.aliases.ts`.

## Scope decisions (Phase 1 evaluation)

| Workspace                                | Status                            | Rationale                                                                                                                                                                                                                               |
| ---------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/foldkit`                       | primary unified gate target       | interactive MVU widgets; the async / command risk surface                                                                                                                                                                               |
| `packages/docs`, `packages/kitchen-sink` | evaluated, excluded from the gate | Effect usage is `Schema` / `Command` / `Runtime` at the Foldkit boundary; zero `async`/`await`/`new Promise` in non-test library code; still covered by `pnpm lint` project-wide. Revisit when the docs composition grows async surface |
| `packages/styles`, `packages/tokens`     | excluded from the gate            | pure StyleX modules, no Effect code; StyleX policy stays enforced by the `stylex` provider, `pnpm check:tokens`, and the lint fixtures                                                                                                  |

## Workspace evaluation results (closeout)

Re-verified at closeout with `@boozedog/effect-lens@0.1.0`, unified mode,
project config (the docs/kitchen-sink runs additionally pass `--json` to
record machine-readable results):

| Workspace               | Command                                                                                 | Result                                             |
| ----------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `packages/foldkit`      | `pnpm check:effect-lens` (CI gate)                                                      | 71 files linted, 0 findings, exit 0                |
| `packages/docs`         | `effect-lens check --project . --workspace packages/docs --mode unified --json`         | 16 files linted, 0 findings, exit 0                |
| `packages/kitchen-sink` | `effect-lens check --project . --workspace packages/kitchen-sink --mode unified --json` | 1 file linted (`src/index.ts`), 0 findings, exit 0 |

The docs and kitchen-sink unified checks pass at baseline HEAD `2e4886b` with
zero findings. This confirms the Phase 1 exclusion decision: both workspaces
are still clean under the full unified provider set (lens + foldstryx + stylex

- Foldkit MVU), so keeping the mandatory gate foldkit-only remains correct.
  Kitchen-sink lint counts one file because its `vitest.config.ts` falls under
  the root `**/vitest.config.ts` ignore pattern, matching project-wide
  `pnpm lint`. These checks are evaluation-only; neither workspace is part of the
  gate and no workspace-scoped CI or hook step was added for them.

Residual risk: GitHub Actions on `master` had not executed the dedicated Lens
step for any Phase 3–5 push at closeout — the `pnpm check` job fails before it
at the pre-existing `check:demo` stage (`vite preview did not report a URL`),
an unrelated flake that predates the adoption. The gate is evidenced locally
(this document and the closeout re-verification); Actions will exercise the
Lens step once the `check:demo` flake is fixed.

## Baseline result

`effect-lens adoption audit --project . --workspace packages/foldkit` at baseline:

- effect: `4.0.0-beta.83` (lockfile); reference pack missing; oxlint
  `.oxlintrc.json` configured; 3 override blocks; all providers above active.
- unified gate: 0 findings (0 errors, 0 warnings).
- recommendations: `[fetch-pack]` — advisory, the missing reference pack.
- audit is read-only; no files were changed.

`pnpm check:effect-lens` at baseline: linted 71 files (config: project),
findings 0 (0 errors, 0 warnings), exit 0.

Exit model, check gate: any finding fails automation — `Ok = 0`, `Warning = 1`
(warnings), `Error = 2` (errors). `pnpm check:effect-lens` exits 0 at baseline
because there are no findings.

Diagnostic commands: the missing-pack advisory is not a `check` finding, but
`doctor` and `adoption audit` surface it as a non-zero diagnostic — both exit 1
(`Warning`) at this baseline even though `pnpm check:effect-lens` exits 0. The
unified CI/hook gate relies on the check, not on doctor/audit.

## Node requirement

The Lens CLI tool declares `node >=22.6`. CI pins Node 22 (`actions/setup-node`
`node-version: 22`). Of the repository's supported engine branches
(`>=20.19 || >=22.12`), only the `>=22.12` branch satisfies the Lens tool; a Node
20.x runtime does not run it.

## Reproduce (read-only)

```sh
pnpm check:effect-lens                # unified gate over packages/foldkit; exit 0
pnpm exec effect-lens doctor --project . --workspace packages/foldkit  # exit 1 = advisory warning
pnpm exec effect-lens adoption audit --project . --workspace packages/foldkit  # exit 1 = advisory warning
```

None of these write to the repository.
