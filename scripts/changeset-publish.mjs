#!/usr/bin/env node
/**
 * Publish the coordinated Foldstryx public package set with Nub.
 *
 * Runs `nub publish` for the five external-consumer packages (prepack stages
 * the published manifest), then `changeset tag` for per-package git tags.
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  NUB_PUBLISH_ENV,
  restoreWorkspaceManifestIfStaged,
} from './workspace-publish-manifest.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const RELEASE_PACKAGES = [
  '@foldstryx/tokens',
  '@foldstryx/styles',
  '@foldstryx/foldkit',
  '@foldstryx/kitchen-sink',
  '@foldstryx/docs',
]

const releasePackageDir = name =>
  resolve(root, 'packages', name.replace('@foldstryx/', ''))

const run = (command, args, extraEnv = {}) => {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  })
  if (result.error) throw result.error
  return result.status ?? 1
}

const hasDryRun = args => args.includes('--dry-run')

const rejectsIgnoreScripts = args =>
  args.some(
    arg => arg === '--ignore-scripts' || arg.startsWith('--ignore-scripts='),
  )

const restoreStagedPackages = async () => {
  for (const name of RELEASE_PACKAGES) {
    await restoreWorkspaceManifestIfStaged(releasePackageDir(name))
  }
}

const main = async () => {
  const forwarded = process.argv.slice(2)
  if (rejectsIgnoreScripts(forwarded)) {
    console.error(
      'nub run release: --ignore-scripts is not allowed (prepack must stage the published manifest)',
    )
    process.exit(1)
  }

  const publishArgs = [
    'publish',
    '--access',
    'public',
    ...RELEASE_PACKAGES.flatMap(name => ['--filter', name]),
    ...forwarded,
  ]

  const publishStatus = run('nub', publishArgs, { [NUB_PUBLISH_ENV]: '1' })
  await restoreStagedPackages()
  if (publishStatus !== 0) process.exit(publishStatus)

  if (hasDryRun(forwarded)) process.exit(0)

  process.exit(run('nub', ['exec', 'changeset', 'tag']))
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
