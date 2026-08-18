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
   nub run check
   ```

   This runs format, lint, typecheck, fallow, tests, async/waiver/token/lint
   fixture checks, the demo smoke, the packed-consumer smoke, the release
   packument gate (`check:publish-packument`), and the changeset status check.

3. **Version the packages.**

   ```sh
   nub run version-packages   # = changeset version
   ```

   This bumps the five packages to the next coherent version, writes
   `CHANGELOG.md` files, and consumes the pending changeset files. Internal
   `@foldstryx/*` dependencies stay `workspace:*` in source; the Nub pack/publish
   adapter (`scripts/nub-pack.mjs`, `scripts/workspace-publish-manifest.mjs`,
   and `scripts/changeset-publish.mjs`) merges `publishConfig.exports` onto
   `exports` and rewrites sibling `workspace:*` ranges to concrete semver in
   packed tarballs. Plain `nub pack` stages the published manifest during
   `prepack` and restores the workspace file after the tarball lands; `nub run release`
   packs normalized `.tgz` files and publishes them with `npm publish` so the
   registry packument matches the tarball (not the workspace directory).

4. **Review the generated diff.** Inspect every `package.json` version and
   dependency range, the new `CHANGELOG.md` files, and the consumed changeset
   files. Confirm the internal `@foldstryx/*` dependencies still use
   `workspace:*` in source (they resolve to the published ranges when packed
   or published).

5. **Re-run the gate from the versioned state.** The `check:changeset` gate
   (`scripts/check-changeset.mjs`) tolerates the post-version state — no
   pending changesets, versions bumped, changelogs written — so the full gate
   passes before commit. The packed-consumer smoke (`nub run check:packed`)
   packs the versioned tarballs and installs them into a throwaway consumer,
   proving the published artifacts resolve and render.

   ```sh
   nub run check
   ```

6. **Commit and push** the release changes through the normal signed workflow
   (propose the commit message, get approval, then commit and push). `master`
   is protected by a PR-required ruleset, so the release commit goes in via a
   pull request (or a bypass actor with the ruleset's bypass mode).

7. **Publish to npm.**

   ```sh
   nub run release
   ```

   `nub run release` packs normalized tarballs for the five public packages (via
   `scripts/changeset-publish.mjs`), asserts each tarball manifest is
   publishable (`dist/` exports, no `workspace:*`), then uploads with
   `npm publish <tarball>`. Pass `--dry-run` to preview without uploading;
   `--otp` and `--tag` forward to `npm publish`. Versions already on the
   registry are skipped (pass `--force` to re-PUT). To dry-run locally:

   ```sh
   nub run check:publish-packument
   ```

   It does not require credentials in the repository. After a successful
   publish, `changeset tag` creates a git tag per published package (e.g.
   `@foldstryx/tokens@0.1.0`) locally; push those tags to the remote after
   publishing.

8. **Verify the published packages.**

   ```sh
   npm view @foldstryx/foldkit version exports dependencies
   npm view @foldstryx/styles version exports dependencies
   npm view @foldstryx/tokens version exports dependencies
   ```

   Confirm versions, `exports` pointing at `dist/` (CSS subpaths such as
   `@foldstryx/styles/document.global.css` may remain on a published `src/`
   path), and no `workspace:*` in `dependencies`. Then install from the registry
   in a clean directory (not this repo; bypass project `.npmrc` if needed):

   ```sh
   cd /tmp
   npm install @foldstryx/foldkit@<version> @foldstryx/styles@<version> @foldstryx/tokens@<version> --userconfig /dev/null
   ```

   The `nub run check:packed` harness proves tarball shape; the clean-directory
   `npm install` proves the registry packument.

## Notes

- Never commit or push without explicit approval.
- Never embed credentials or tokens in the repository.
- Do not publish public packages with directory `nub publish`; use
  `nub run release` (`scripts/changeset-publish.mjs` uploads normalized
  `.tgz` files via `npm publish`).
- `nub run release` skips versions already on the registry unless `--force` is
  passed; re-running after a partial OTP failure is safe.
