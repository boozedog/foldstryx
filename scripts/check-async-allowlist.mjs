/**
 * Guard script for the async/await allowlist.
 *
 * Reads `packages/oxlint-plugin-foldstryx/src/async-allowlist.ts` and
 * enforces that the allowlist is EXACTLY the baseline pattern set:
 *
 *   - every entry must be a RegExp literal (a shape/pattern), never a path;
 *   - the set must not grow AND must not be widened (a single mega-regex
 *     like `/^[\s\S]*$/` still fails because the content is compared exactly).
 *
 * The only way to change the allowlist is to update BOTH this script's
 * EXPECTED_PATTERNS and the allowlist module, which forces an intentional,
 * reviewed change.
 *
 * Exit code 0 = allowlist OK. Non-zero = violation.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** The exact, allowed allowlist contents (baseline). Do not widen. */
const EXPECTED_PATTERNS = ['/^(?:Effect|Runtime)\\.runPromise$/']

const here = dirname(fileURLToPath(import.meta.url))
const allowlistFile = resolve(
  here,
  '../packages/oxlint-plugin-foldstryx/src/async-allowlist.ts',
)

const src = readFileSync(allowlistFile, 'utf8')

// Match the exported array literal. Prettier runs with `semi: false`, so the
// closing `]` has no trailing semicolon — do not require one.
const arrayMatch = src.match(
  /export\s+const\s+AWAIT_ALLOWLIST\s*:\s*ReadonlyArray<RegExp>\s*=\s*\[([\s\S]*?)\]\s*(?:\n|$)/,
)
if (!arrayMatch) {
  console.error(
    'check-async-allowlist: could not locate AWAIT_ALLOWLIST array in ' +
      allowlistFile,
  )
  process.exit(1)
}

const entries = arrayMatch[1]
  .split(',')
  .map(entry => entry.trim())
  .filter(Boolean)

// Content must match the baseline EXACTLY (order-sensitive). This catches
// growth, removal, and widening (e.g. replacing a pattern with `/^[\s\S]*$/`).
if (
  entries.length !== EXPECTED_PATTERNS.length ||
  entries.some((entry, i) => entry !== EXPECTED_PATTERNS[i])
) {
  console.error(
    'check-async-allowlist: allowlist does not match the baseline exactly.\n' +
      `  found:    ${entries.length === 0 ? '(empty)' : entries.join(', ')}\n` +
      `  expected: ${EXPECTED_PATTERNS.join(', ')}\n` +
      'Do not add, remove, or widen patterns to add exceptions — rewrite the ' +
      '`await` call site to compose with Effect instead. To change the baseline, ' +
      'update BOTH the allowlist module and this script intentionally.',
  )
  process.exit(1)
}

console.log(
  `check-async-allowlist: OK (${entries.length} pattern(s) match baseline)`,
)
