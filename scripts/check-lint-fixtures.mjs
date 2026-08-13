/**
 * Negative fixtures for official StyleX + foldstryx token/clobber rules.
 * These files are ignored by the main oxlint run so they do not fail `pnpm lint`.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const oxlint = resolve(root, 'node_modules/.bin/oxlint')
const pluginDist = resolve(
  root,
  'packages/oxlint-plugin-foldstryx/dist/index.js',
)

const waitForPluginDist = async () => {
  const started = Date.now()
  while (!existsSync(pluginDist)) {
    if (Date.now() - started > 30_000) {
      throw new Error(
        `timed out waiting for ${pluginDist}. Run pnpm --filter @foldstryx/oxlint-plugin build first.`,
      )
    }
    await delay(100)
  }
}

const cases = [
  {
    file: 'scripts/fixtures/stylex-hardcoded.ts',
    mustInclude: [
      'foldstryx(no-hardcoded-styles)',
      'hardcoded color',
      'hardcoded fontSize',
      'hardcoded padding',
    ],
  },
  {
    file: 'scripts/fixtures/stylex-shorthands.ts',
    mustInclude: ['stylex(valid-shorthands)', 'stylex(valid-styles)'],
  },
  {
    file: 'scripts/fixtures/stylex-null-override.ts',
    mustInclude: ['foldstryx(no-stylex-null-override)'],
  },
  {
    file: 'scripts/fixtures/stylex-clobber.ts',
    mustInclude: ['foldstryx(no-stylex-clobber)'],
  },
]

let failed = false

await waitForPluginDist()

for (const testCase of cases) {
  const result = spawnSync(
    oxlint,
    [
      '--config',
      'scripts/fixtures/.oxlintrc.json',
      '--deny-warnings',
      testCase.file,
    ],
    { cwd: root, encoding: 'utf8' },
  )
  const output = `${result.stdout}\n${result.stderr}`
  if (result.status === 0) {
    console.error(`check-lint-fixtures: expected ${testCase.file} to fail`)
    failed = true
    continue
  }
  const missing = testCase.mustInclude.filter(
    needle => !output.includes(needle),
  )
  if (missing.length > 0) {
    console.error(
      `check-lint-fixtures: ${testCase.file} missing diagnostics:\n  ${missing.join('\n  ')}\n--- output ---\n${output}`,
    )
    failed = true
    continue
  }
  console.log(`check-lint-fixtures: ${testCase.file} OK`)
}

if (failed) process.exit(1)
console.log('check-lint-fixtures: all negative fixtures failed as expected')
