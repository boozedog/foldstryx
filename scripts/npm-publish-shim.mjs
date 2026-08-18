#!/usr/bin/env node
/**
 * npm publish shim for `nub run release`.
 *
 * `@changesets/cli` publishes with `npm publish <package-dir>`. npm packs that
 * directory in memory and uploads workspace metadata. Intercept directory
 * publishes, pack a normalized tarball with `scripts/nub-pack.mjs`, and
 * publish the `.tgz` so registry consumers receive `dist/` exports and
 * concrete sibling semver.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { packNormalized } from './nub-pack.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const shimNpm = resolve(here, 'npm')

/**
 * Resolve the real npm binary. Never trust `FOLDSTRYX_REAL_NPM` or `command -v
 * npm` while `scripts/` is on PATH — both can point back at this shim.
 */
export const resolveRealNpm = () => {
  const fromEnv = process.env.FOLDSTRYX_REAL_NPM
  if (fromEnv) {
    const resolved = resolve(fromEnv)
    if (resolved !== shimNpm && !resolved.endsWith('npm-publish-shim.mjs')) {
      return resolved
    }
  }
  const pathWithoutShim = (process.env.PATH ?? '')
    .split(':')
    .filter(entry => entry.length > 0 && resolve(entry) !== here)
    .join(':')
  const result = spawnSync('command', ['-v', 'npm'], {
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, PATH: pathWithoutShim },
  })
  if (result.status !== 0 || !result.stdout.trim()) {
    throw new Error('could not locate real npm outside scripts/ shim')
  }
  const candidate = result.stdout.trim()
  if (resolve(candidate) === shimNpm) {
    throw new Error('npm shim resolved to itself; aborting to avoid recursion')
  }
  return candidate
}

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options })
  if (result.error) throw result.error
  return result.status ?? 1
}

const isDirectoryPublishTarget = value =>
  typeof value === 'string' &&
  value.length > 0 &&
  !value.startsWith('-') &&
  !value.endsWith('.tgz') &&
  existsSync(resolve(value))

const main = async () => {
  if (process.env.FOLDSTRYX_NPM_SHIM_ACTIVE === '1') {
    throw new Error('npm publish shim re-entered; aborting to avoid recursion')
  }
  const realNpm = resolveRealNpm()
  const args = process.argv.slice(2)
  if (args[0] === 'publish' && isDirectoryPublishTarget(args[1])) {
    const pkgDir = resolve(args[1])
    const build = run('nub', ['run', 'build'], { cwd: pkgDir })
    if (build !== 0) process.exit(build)
    const tarball = await packNormalized(pkgDir, ['--ignore-scripts'])
    const publishArgs = ['publish', tarball, ...args.slice(2)]
    process.exit(
      run(realNpm, publishArgs, {
        env: { ...process.env, FOLDSTRYX_NPM_SHIM_ACTIVE: '1' },
      }),
    )
  }
  process.exit(
    run(realNpm, args, {
      env: { ...process.env, FOLDSTRYX_NPM_SHIM_ACTIVE: '1' },
    }),
  )
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
