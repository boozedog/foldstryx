#!/usr/bin/env node
/**
 * Gate: `nub run release` must still publish normalized tarballs.
 *
 * 1. Static contract on `changeset-publish.mjs` (rejects directory `nub publish`).
 * 2. Full `changeset-publish.mjs --dry-run` integration (pack + tarball manifest gate).
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { assertReleasePublishesTarballs } from './assert-release-publishes-tarballs.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const main = async () => {
  await assertReleasePublishesTarballs()

  const dryRun = spawnSync(
    process.execPath,
    [resolve(here, 'changeset-publish.mjs'), '--dry-run'],
    { cwd: root, stdio: 'inherit' },
  )
  if (dryRun.error) throw dryRun.error
  if (dryRun.status !== 0) {
    process.exit(dryRun.status ?? 1)
  }

  console.log('check:publish-packument OK (release contract + dry-run)')
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
