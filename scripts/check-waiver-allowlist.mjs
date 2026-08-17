/**
 * Frozen waiver ratchet.
 *
 * Source disable comments, oxlint/fallow/changeset exceptions, and the
 * Effect-async allowlist must match this baseline exactly. Growth fails.
 * Shrink also fails until EXPECTED is updated — that is the review signal.
 *
 * Wired through hk pre-commit / pre-push, `nub run check`, and GitHub Actions CI.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', '.hk', '.mise'])

const SOURCE_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
])

const DIRECTIVE =
  /(?:\/\/|\/\*)\s*(oxlint-disable(?:-next-line|-line)?|eslint-disable(?:-next-line|-line)?|prettier-ignore|@ts-expect-error|@ts-ignore|@ts-nocheck)\b([^\n*]*)/g

const EXPECTED = {
  comments: [
    'packages/foldkit/src/stylesStub.ts | oxlint-disable typescript/consistent-type-assertions',
    'packages/foldkit/src/sx.ts | oxlint-disable typescript/consistent-type-assertions',
  ],
  stylex: {
    'stylex/valid-styles': 'error',
    'stylex/valid-shorthands': 'error',
    'stylex/no-unused': 'error',
    'stylex/no-legacy-contextual-styles': 'error',
    'stylex/no-conflicting-props': 'error',
    'stylex/no-nonstandard-styles': 'error',
    'stylex/no-lookahead-selectors': 'error',
    'stylex/sort-keys': 'warn',
    'stylex/enforce-extension': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'typescript/consistent-type-assertions': 'off',
        'lens/no-async-function': 'off',
        'lens/no-await-expression': 'off',
        'lens/no-new-promise': 'off',
      },
    },
    {
      files: ['packages/styles/**', 'packages/tokens/**'],
      rules: { 'stylex/enforce-extension': 'off' },
    },
    {
      files: ['packages/foldkit/src/dialog.ts'],
      rules: { 'foldkit/no-empty-children-array': 'off' },
    },
  ],
  oxlintIgnore: [
    'node_modules/',
    'dist/',
    '**/*.d.ts',
    'packages/oxlint-plugin-foldstryx/',
    'scripts/**',
    '**/vite.config.ts',
    '**/vitest.config.ts',
    '**/vite.aliases.ts',
  ],
  fallowIgnorePatterns: [
    '**/dist/**',
    '**/node_modules/**',
    '**/*.d.ts',
    '**/.changeset/**',
    'scripts/fixtures/**',
    'scripts/check-lint-fixtures.mjs',
    'scripts/check-waiver-allowlist.mjs',
    'packages/oxlint-plugin-foldstryx/**',
  ],
  fallowIgnoreDependencies: [
    '@foldkit/oxlint-plugin',
    '@foldstryx/oxlint-plugin',
  ],
  fallowRules: {
    'unused-files': 'error',
    'unused-exports': 'error',
    'unresolved-imports': 'error',
    'unlisted-dependencies': 'error',
    'circular-dependencies': 'error',
    're-export-cycle': 'warn',
    'duplicate-exports': 'off',
  },
  fallowThresholdFiles: [
    'packages/docs/src/view.ts',
    'packages/foldkit/src/card.ts',
    'packages/foldkit/src/checkbox.ts',
    'packages/foldkit/src/gridFocus.ts',
    'packages/foldkit/src/row.ts',
    'packages/foldkit/src/selector.ts',
    'packages/foldkit/src/sidebar.ts',
    'packages/foldkit/src/switch.ts',
    'packages/foldkit/src/text.ts',
    'packages/kitchen-sink/src/index.ts',
    'packages/oxlint-plugin-foldstryx/src/guards.ts',
    'packages/oxlint-plugin-foldstryx/src/rules/no-await-expression.ts',
    'packages/oxlint-plugin-foldstryx/src/rules/no-hardcoded-styles.ts',
    'packages/oxlint-plugin-foldstryx/src/rules/no-new-promise.ts',
    'packages/oxlint-plugin-foldstryx/src/rules/no-stylex-clobber.ts',
    'packages/oxlint-plugin-foldstryx/src/rules/no-stylex-null-override.ts',
    'packages/oxlint-plugin-foldstryx/src/stylex-ast.ts',
    'scripts/check-demo-smoke.mjs',
    'scripts/check-packed-consumer.mjs',
    'scripts/package-manager-guard.mjs',
  ],
  changesetIgnore: ['@foldstryx/oxlint-plugin', 'sidebar-demo'],
  awaitAllowlist: ['/^(?:Effect|Runtime)\\.runPromise$/'],
}

const readJson = path => JSON.parse(readFileSync(path, 'utf8'))

const walk = dir => {
  const out = []
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      out.push(...walk(full))
      continue
    }
    const ext = entry.slice(entry.lastIndexOf('.'))
    if (SOURCE_EXT.has(ext)) out.push(full)
  }
  return out
}

const collectComments = () => {
  const found = []
  for (const file of walk(root)) {
    const rel = relative(root, file).replaceAll('\\', '/')
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(DIRECTIVE)) {
      const kind = match[1]
      const rest = (match[2] ?? '').replace(/\*\/.*$/, '').trim()
      found.push(`${rel} | ${kind}${rest === '' ? '' : ` ${rest}`}`)
    }
  }
  return found.sort()
}

const severity = value => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0]
  return value
}

const collectAwaitAllowlist = () => {
  const src = readFileSync(
    resolve(root, 'packages/oxlint-plugin-foldstryx/src/async-allowlist.ts'),
    'utf8',
  )
  const arrayMatch = src.match(
    /export\s+const\s+AWAIT_ALLOWLIST\s*:\s*ReadonlyArray<RegExp>\s*=\s*\[([\s\S]*?)\]\s*(?:\n|$)/,
  )
  if (!arrayMatch) {
    throw new Error('could not locate AWAIT_ALLOWLIST')
  }
  return arrayMatch[1]
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
}

const sameList = (label, found, expected) => {
  const a = [...found]
  const b = [...expected]
  if (a.length === b.length && a.every((item, i) => item === b[i])) return
  console.error(`check-waivers: ${label} drifted`)
  console.error(
    `  found:    ${a.length === 0 ? '(empty)' : a.join('\n            ')}`,
  )
  console.error(
    `  expected: ${b.length === 0 ? '(empty)' : b.join('\n            ')}`,
  )
  console.error(
    'Update BOTH the live config/source and EXPECTED in scripts/check-waiver-allowlist.mjs.',
  )
  process.exitCode = 1
}

const sameJson = (label, found, expected) => {
  const left = JSON.stringify(found)
  const right = JSON.stringify(expected)
  if (left === right) return
  console.error(`check-waivers: ${label} drifted`)
  console.error(`  found:    ${left}`)
  console.error(`  expected: ${right}`)
  console.error(
    'Update BOTH the live config and EXPECTED in scripts/check-waiver-allowlist.mjs.',
  )
  process.exitCode = 1
}

const oxlint = readJson(resolve(root, '.oxlintrc.json'))
const fallow = readJson(resolve(root, '.fallowrc.json'))
const changeset = readJson(resolve(root, '.changeset/config.json'))

const stylex = Object.fromEntries(
  Object.entries(oxlint.rules)
    .filter(([name]) => name.startsWith('stylex/'))
    .map(([name, value]) => [name, severity(value)]),
)

const fallowThresholdFiles = [
  ...new Set(
    (fallow.health?.thresholdOverrides ?? []).flatMap(
      entry => entry.files ?? [],
    ),
  ),
].sort()

sameList('disable comments', collectComments(), EXPECTED.comments)
sameJson('stylex severities', stylex, EXPECTED.stylex)
sameJson('oxlint overrides', oxlint.overrides, EXPECTED.overrides)
sameList('oxlint ignorePatterns', oxlint.ignorePatterns, EXPECTED.oxlintIgnore)
sameList(
  'fallow ignorePatterns',
  fallow.ignorePatterns,
  EXPECTED.fallowIgnorePatterns,
)
sameList(
  'fallow ignoreDependencies',
  fallow.ignoreDependencies,
  EXPECTED.fallowIgnoreDependencies,
)
sameJson('fallow rules', fallow.rules, EXPECTED.fallowRules)
sameList(
  'fallow threshold files',
  fallowThresholdFiles,
  EXPECTED.fallowThresholdFiles,
)
sameList('changeset ignore', changeset.ignore, EXPECTED.changesetIgnore)
sameList('AWAIT_ALLOWLIST', collectAwaitAllowlist(), EXPECTED.awaitAllowlist)

if (process.exitCode) process.exit(process.exitCode)
console.log(
  `check-waivers: OK (${EXPECTED.comments.length} comments, ${EXPECTED.fallowThresholdFiles.length} fallow overrides)`,
)
