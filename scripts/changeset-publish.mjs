#!/usr/bin/env node
/**
 * Publish Foldstryx packages with normalized registry tarballs.
 *
 * Wraps `changeset publish` and prepends `scripts/npm` to PATH so directory
 * publishes become `npm publish <normalized.tgz>`.
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveRealNpm } from './npm-publish-shim.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const main = () => {
  const realNpm = resolveRealNpm()
  const pathPrefix = `${here}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH ?? ''}`
  const result = spawnSync(
    'nub',
    ['exec', 'changeset', 'publish', ...process.argv.slice(2)],
    {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        PATH: pathPrefix,
        FOLDSTRYX_REAL_NPM: realNpm,
      },
    },
  )
  if (result.error) throw result.error
  process.exit(result.status ?? 1)
}

main()
