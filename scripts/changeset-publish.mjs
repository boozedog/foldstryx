#!/usr/bin/env node
/**
 * Publish the coordinated Foldstryx public package set.
 *
 * Packs normalized `.tgz` artifacts (dist exports + concrete sibling semver),
 * asserts each tarball manifest is publishable, then uploads with `npm publish
 * <tarball>` so the registry packument matches the tarball. `changeset tag`
 * runs after a successful non-dry-run publish.
 */
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { assertTarballManifest } from './normalize-tarball-manifest.mjs'
import { packNormalized } from './nub-pack.mjs'
import { RELEASE_PACKAGES, releasePackageDir } from './release-packages.mjs'
import { resolveRealNpm } from './resolve-real-npm.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

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
const hasForce = args => args.includes('--force')

const rejectsIgnoreScripts = args =>
  args.some(
    arg => arg === '--ignore-scripts' || arg.startsWith('--ignore-scripts='),
  )

const forwardedNpmPublishArgs = args => {
  const forwarded = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--filter' || arg.startsWith('--filter=')) {
      if (arg === '--filter') i += 1
      continue
    }
    if (arg === '-F') {
      i += 1
      continue
    }
    forwarded.push(arg)
  }
  return forwarded
}

const buildReleasePackages = () =>
  run('nub', [
    'run',
    '-r',
    ...RELEASE_PACKAGES.flatMap(name => ['--filter', name]),
    '--if-present',
    'build',
  ])

/**
 * @param {string} realNpm
 * @param {string} name
 * @param {string} version
 */
const versionOnRegistry = (realNpm, name, version) => {
  const result = spawnSync(realNpm, ['view', `${name}@${version}`, 'version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return result.status === 0
}

const main = async () => {
  const forwarded = process.argv.slice(2)
  if (rejectsIgnoreScripts(forwarded)) {
    console.error(
      'nub run release: --ignore-scripts is not allowed (tarballs must be normalized)',
    )
    process.exit(1)
  }

  const packDir = await mkdtemp(join(tmpdir(), 'foldstryx-publish-'))
  const realNpm = resolveRealNpm()
  const npmPublishArgs = [
    '--access',
    'public',
    ...forwardedNpmPublishArgs(forwarded),
  ]
  const force = hasForce(forwarded)

  try {
    const buildStatus = buildReleasePackages()
    if (buildStatus !== 0) process.exit(buildStatus)

    const tarballs = []
    for (const name of RELEASE_PACKAGES) {
      const pkgDir = releasePackageDir(name)
      const tarball = await packNormalized(pkgDir, [
        '--ignore-scripts',
        '--pack-destination',
        packDir,
      ])
      const manifest = await assertTarballManifest(tarball, name)
      tarballs.push({ name, tarball, version: manifest.version })
    }

    let publishFailed = false
    for (const { name, tarball, version } of tarballs) {
      if (!force && versionOnRegistry(realNpm, name, version)) {
        console.log(`skip ${name}@${version} (already on registry)`)
        continue
      }
      const status = run(realNpm, ['publish', tarball, ...npmPublishArgs])
      if (status !== 0) publishFailed = true
    }

    if (publishFailed) process.exit(1)
    if (hasDryRun(forwarded)) process.exit(0)

    process.exit(run('nub', ['exec', 'changeset', 'tag']))
  } finally {
    await rm(packDir, { recursive: true, force: true })
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
