/**
 * Pattern-based allowlist for `await` expressions.
 *
 * Each entry is a RegExp matched against the awaited expression's
 * member-call chain (e.g. `Effect.runPromise(...)` -> `Effect.runPromise`).
 *
 * This is a PATTERN allowlist, not a path list: entries describe shapes of
 * Effect calls that legitimately bridge the synchronous world back into
 * `Promise` (e.g. exposing an Effect to a non-Effect host). The guard script
 * `scripts/check-async-allowlist.mjs` verifies every entry is a RegExp and
 * that the allowlist does not grow.
 *
 * Add a pattern only when Effect offers no synchronous / declarative
 * alternative for the bridge call. Do NOT add file paths or growing path
 * lists here.
 *
 * The growth baseline is enforced by `scripts/check-async-allowlist.mjs`
 * (kept there so this module stays a pure pattern list).
 */
export const AWAIT_ALLOWLIST: ReadonlyArray<RegExp> = [
  /^(?:Effect|Runtime)\.runPromise$/,
]
