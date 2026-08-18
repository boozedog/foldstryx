#!/usr/bin/env node
/**
 * `postpack` hook: Nub runs this before `pack`, so restore after the tarball
 * lands via a detached watcher (see `workspace-publish-manifest.mjs`).
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
