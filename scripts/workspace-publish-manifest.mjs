/**
 * Stage and restore workspace `package.json` for Nub pack/publish lifecycle.
 *
 * `prepack` stages the published manifest on disk. `postpack` spawns a watcher
 * that restores once the `.tgz` lands under the package dir or an explicit
 * pack destination. Public releases publish normalized tarballs via
 * `scripts/changeset-publish.mjs`; do not use directory `nub publish`.
 */
import { spawn } from 'node:child_process'
import {
  access,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  normalizePublishedManifest,
  readWorkspaceVersions,
} from './normalize-tarball-manifest.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..')
const backupName = '.foldstryx-package-workspace.json'

/**
 * @param {string} pkgDir
 */
const backupPath = pkgDir => join(pkgDir, backupName)

/**
 * @param {Record<string, unknown>} pkg
 */
const tarballBaseName = pkg =>
  `${String(pkg.name).replace(/^@/, '').replace('/', '-')}-${pkg.version}.tgz`

/**
 * @param {string} pkgDir
 */
export const stagePublishManifest = async pkgDir => {
  const pkgFile = join(pkgDir, 'package.json')
  const backup = backupPath(pkgDir)
  try {
    await access(backup)
    await restoreWorkspaceManifest(pkgDir)
  } catch (error) {
    if (!(error && typeof error === 'object' && error.code === 'ENOENT')) {
      throw error
    }
  }
  const pkg = JSON.parse(await readFile(pkgFile, 'utf8'))
  const versions = await readWorkspaceVersions(repoRoot)
  const published = normalizePublishedManifest(pkg, versions)
  await rename(pkgFile, backup)
  await writeFile(pkgFile, JSON.stringify(published, null, 2) + '\n')
  return { pkg, tarballBase: tarballBaseName(pkg) }
}

/**
 * @param {string} pkgDir
 */
const restoreWorkspaceManifest = async pkgDir => {
  const pkgFile = join(pkgDir, 'package.json')
  const backup = backupPath(pkgDir)
  try {
    await access(backup)
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT')
      return false
    throw error
  }
  await rm(pkgFile, { force: true })
  await rename(backup, pkgFile)
  return true
}

/**
 * @param {string} tarballBase
 * @param {number} startedAt
 * @param {string[]} roots
 */
const findFreshTarball = async (tarballBase, startedAt, roots) => {
  const matches = []
  const walk = async (dir, depth) => {
    if (depth > 2 || matches.length > 4) return
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full, depth + 1)
        continue
      }
      if (entry.name !== tarballBase) continue
      try {
        const { mtimeMs } = await stat(full)
        if (mtimeMs + 50 >= startedAt) matches.push(full)
      } catch {
        // ignore races
      }
    }
  }
  for (const root of roots) {
    if (typeof root !== 'string' || root.length === 0) continue
    await walk(root, 0)
  }
  return matches[0]
}

/**
 * @param {string} pkgDir
 * @param {string} tarballBase
 * @param {string | null | undefined} packDestination
 * @param {number} [startedAt]
 */
const waitForTarballAndRestore = async (
  pkgDir,
  tarballBase,
  packDestination,
  startedAt = Date.now(),
) => {
  const roots = [pkgDir, packDestination].filter(
    (value, index, all) =>
      typeof value === 'string' &&
      value.length > 0 &&
      all.indexOf(value) === index,
  )
  const deadline = startedAt + 120_000
  while (Date.now() < deadline) {
    if ((await findFreshTarball(tarballBase, startedAt, roots)) !== undefined) {
      await restoreWorkspaceManifest(pkgDir)
      return
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 50))
  }
  await restoreWorkspaceManifest(pkgDir)
  throw new Error(
    `timed out waiting for ${tarballBase} before restoring workspace manifest in ${pkgDir}`,
  )
}

/**
 * @param {string} pkgDir
 * @param {string} tarballBase
 * @param {string | null | undefined} [packDestination]
 */
export const spawnRestoreAfterPack = (pkgDir, tarballBase, packDestination) => {
  const startedAt = Date.now()
  const child = spawn(
    process.execPath,
    [
      join(here, 'workspace-publish-manifest.mjs'),
      '--restore-after-pack',
      pkgDir,
      tarballBase,
      packDestination ?? '',
      String(startedAt),
    ],
    { detached: true, stdio: 'ignore' },
  )
  child.unref()
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  const [mode, pkgDir, tarballBase, packDestination, startedAtRaw] =
    process.argv.slice(2)
  if (mode === '--restore-after-pack') {
    waitForTarballAndRestore(
      pkgDir,
      tarballBase,
      packDestination === '' ? undefined : packDestination,
      Number(startedAtRaw),
    ).catch(error => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
  }
}
