#!/usr/bin/env node
/**
 * `postpack` hook: restore the workspace manifest after pack.
 *
 * `nub pack` runs `postpack` before the `.tgz` exists, so restore is deferred
 * via a short-lived watcher. Release publishes normalized tarballs through
 * `scripts/changeset-publish.mjs` (`npm publish <tarball>`); do not use
 * directory `nub publish` for public packages.
 */
import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

import { spawnRestoreAfterPack } from './workspace-publish-manifest.mjs'

const main = async () => {
  const pkgDir = process.cwd()
  const marker = join(pkgDir, '.foldstryx-pack-marker.json')
  const markerData = JSON.parse(await readFile(marker, 'utf8'))
  await rm(marker, { force: true })
  spawnRestoreAfterPack(
    pkgDir,
    markerData.tarballBase,
    markerData.packDestination,
  )
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
