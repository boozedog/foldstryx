#!/usr/bin/env node
/**
 * `postpack` hook: restore the workspace manifest after pack or publish.
 *
 * `nub pack` runs `postpack` before the `.tgz` exists, so pack restores via a
 * short-lived watcher. `nub publish` sets `FOLDSTRYX_NUB_PUBLISH` and restores
 * immediately.
 */
import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

import {
  isNubPublishLifecycle,
  restoreWorkspaceManifestIfStaged,
  spawnRestoreAfterPack,
} from './workspace-publish-manifest.mjs'

const main = async () => {
  const pkgDir = process.cwd()
  const marker = join(pkgDir, '.foldstryx-pack-marker.json')
  const markerData = JSON.parse(await readFile(marker, 'utf8'))
  await rm(marker, { force: true })
  if (isNubPublishLifecycle()) {
    await restoreWorkspaceManifestIfStaged(pkgDir)
    return
  }
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
