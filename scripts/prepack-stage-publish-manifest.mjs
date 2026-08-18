#!/usr/bin/env node
/**
 * `prepack` hook: build `dist/` and stage the published manifest on disk.
 */
import { spawnSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { stagePublishManifest } from './workspace-publish-manifest.mjs'

const main = async () => {
  const pkgDir = process.cwd()
  const build = spawnSync('nub', ['run', 'build'], {
    cwd: pkgDir,
    stdio: 'inherit',
  })
  if (build.status !== 0) {
    process.exit(build.status ?? 1)
  }
  const { tarballBase } = await stagePublishManifest(pkgDir)
  const packDestination =
    process.env.npm_config_pack_destination ??
    process.env.NPM_CONFIG_PACK_DESTINATION ??
    null
  await writeFile(
    join(pkgDir, '.foldstryx-pack-marker.json'),
    JSON.stringify({ tarballBase, packDestination }, null, 2) + '\n',
  )
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
