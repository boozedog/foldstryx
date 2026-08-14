# Releasing Foldstryx

This documents the repeatable procedure for publishing the coordinated public
Foldstryx package set to npm. It is the canonical reference for issue #26.

## Release set

These five packages publish together as one coordinated release:

- `@foldstryx/tokens`
- `@foldstryx/styles`
- `@foldstryx/foldkit`
- `@foldstryx/kitchen-sink`
- `@foldstryx/docs`

`@foldstryx/oxlint-plugin` stays private (repository tooling, not part of the
public surface). `sidebar-demo` is a private example.

## Prerequisites

- You are authenticated to the npm registry for the `@foldstryx` scope
  (configured locally, never committed). Verify with `npm whoami` and
  `npm config get @foldstryx:registry`.
- Your npm account has publish rights for the `@foldstryx` org scope.
- The working tree is clean on `master` and `origin/master` is up to date.
- All quality gates pass from the prepared release state.

## Procedure

1. **Prepare metadata and Changesets.** Ensure the five packages are not
   `private`, have `publishConfig.access: "public"`, and are not in the
   Changesets `ignore` list. Add a changeset for any package that must bump.

2. **Run the full verification gate.**

   ```sh
   pnpm check
   ```

   This runs format, lint, typecheck, fallow, tests, async/waiver/token/lint
   fixture checks, the demo smoke, the packed-consumer smoke, and the
   changeset status check.

3. **Version the packages.**

   ```sh
   pnpm version-packages   # = pnpm changeset version
   ```

   This bumps the five packages to the next coherent version, writes
   `CHANGELOG.md` files, and consumes the pending changeset files. It does
   **not** rewrite `workspace:*` internal dependencies — those stay in source
   and are rewritten to published semver ranges (e.g. `^0.1.0`) by `pnpm pack`
   / `pnpm publish` at release time.

4. **Review the generated diff.** Inspect every `package.json` version and
   dependency range, the new `CHANGELOG.md` files, and the consumed changeset
   files. Confirm the internal `@foldstryx/*` dependencies still use
   `workspace:*` in source (they resolve to the published ranges when packed
   or published).

5. **Re-run the gate from the versioned state.** The `check:changeset` gate
   (`scripts/check-changeset.mjs`) tolerates the post-version state — no
   pending changesets, versions bumped, changelogs written — so the full gate
   passes before commit. The packed-consumer smoke (`pnpm check:packed`)
   packs the versioned tarballs and installs them into a throwaway consumer,
   proving the published artifacts resolve and render.

   ```sh
   pnpm check
   ```

6. **Commit and push** the release changes through the normal signed workflow
   (propose the commit message, get approval, then commit and push). `master`
   is protected by a PR-required ruleset, so the release commit goes in via a
   pull request (or a bypass actor with the ruleset's bypass mode).

7. **Publish to npm.**

   ```sh
   pnpm release   # = pnpm changeset publish
   ```

   `@changesets/cli` publishes each package with the `access: public` setting
   from `publishConfig`. It does not require credentials in the repository.
   It also creates a git tag per published package (e.g. `@foldstryx/tokens@0.1.0`)
   locally; push those tags to the remote after publishing.

8. **Verify the published packages.**

   ```sh
   npm view @foldstryx/tokens version
   npm view @foldstryx/docs version
   ```

   Confirm versions, exports, and tarball contents. Then install the
   published versions in a clean external consumer and render `@foldstryx/docs`
   with its CSS and font assets (the `pnpm check:packed` harness is the
   template for this).

## Notes

- Never commit or push without explicit approval.
- Never embed credentials or tokens in the repository.
- `pnpm changeset publish` publishes only packages whose version differs from
  the registry; re-running it is safe.
