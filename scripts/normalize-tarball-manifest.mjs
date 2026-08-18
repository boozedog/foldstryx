/**
 * Normalize packed/published `package.json` manifests for registry consumers.
 *
 * Nub `pack` / `publish` ships the workspace manifest as-is. npm and pnpm
 * historically applied two transforms at pack/publish time:
 *   1. Merge `publishConfig` fields (notably `exports` → `dist/`) onto the top
 *      level.
 *   2. Rewrite `workspace:*` sibling dependencies to concrete semver.
 *
 * foldstryx owns this thin adapter until Nub grows equivalent behavior.
 */
import { spawnSync } from 'node:child_process'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..')

const WORKSPACE_PROTOCOL = /^workspace:(?:\*|\^|~)$/

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
]

/** @typedef {Record<string, string>} VersionMap */

/**
 * Collect declared versions for every workspace package under `packages/`.
 *
 * @param {string} [root]
 * @returns {Promise<VersionMap>}
 */
export const readWorkspaceVersions = async (root = repoRoot) => {
  const versions = {}
  const entries = await readdir(join(root, 'packages'), { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const pkgFile = join(root, 'packages', entry.name, 'package.json')
    try {
      const pkg = JSON.parse(await readFile(pkgFile, 'utf8'))
      if (pkg.name !== undefined) versions[pkg.name] = pkg.version
    } catch {
      // not a package directory
    }
  }
  return versions
}

/**
 * @param {string} target
 */
const isForbiddenSourceExport = target =>
  typeof target === 'string' &&
  ((target.endsWith('.ts') && !target.endsWith('.d.ts')) ||
    (target.includes('/src/') && !target.endsWith('.css')))

/**
 * @param {Record<string, unknown>} pkg
 * @param {string} packageName
 */
const assertWorkspaceDeps = (pkg, packageName) => {
  for (const field of DEPENDENCY_FIELDS) {
    const deps = pkg[field]
    if (!deps || typeof deps !== 'object') continue
    for (const [name, spec] of Object.entries(deps)) {
      if (typeof spec === 'string' && WORKSPACE_PROTOCOL.test(spec)) {
        throw new Error(
          `${packageName}: ${field}.${name} still uses workspace protocol (${spec})`,
        )
      }
    }
  }
}

/**
 * @param {string} packageName
 * @param {string} key
 * @param {string | null} cond
 * @param {unknown} target
 */
const assertExportTarget = (packageName, key, cond, target) => {
  if (!isForbiddenSourceExport(target)) return
  const label =
    cond === null
      ? `exports[${JSON.stringify(key)}]`
      : `exports[${JSON.stringify(key)}].${cond}`
  throw new Error(`${packageName}: ${label} points at source (${target})`)
}

/**
 * @param {Record<string, unknown>} pkg
 * @param {string} packageName
 */
const assertExports = (pkg, packageName) => {
  const exports = pkg.exports
  if (!exports || typeof exports !== 'object') return
  for (const [key, value] of Object.entries(exports)) {
    if (typeof value === 'string') {
      assertExportTarget(packageName, key, null, value)
      continue
    }
    if (!value || typeof value !== 'object') continue
    for (const [cond, target] of Object.entries(value)) {
      assertExportTarget(packageName, key, cond, target)
    }
  }
}

/**
 * @param {Record<string, unknown>} pkg
 * @param {string} packageName
 */
const assertPublishableManifest = (pkg, packageName) => {
  assertWorkspaceDeps(pkg, packageName)
  assertExports(pkg, packageName)
}

const normalizePublishedManifest = (pkg, versions) => {
  const publishConfig = pkg.publishConfig ?? {}
  const { access, tag, registry, ...overrides } = publishConfig
  const published = { ...pkg, ...overrides }
  for (const field of DEPENDENCY_FIELDS) {
    const deps = published[field]
    if (!deps || typeof deps !== 'object') continue
    for (const [name, spec] of Object.entries(deps)) {
      if (typeof spec !== 'string' || !WORKSPACE_PROTOCOL.test(spec)) continue
      const version = versions[name]
      if (version === undefined) {
        throw new Error(
          `cannot rewrite workspace dep ${name}: sibling version not found in workspace`,
        )
      }
      deps[name] = version
    }
  }
  return published
}

/**
 * Read `package/package.json` from a tarball and assert publishable shape.
 *
 * @param {string} tarball
 * @param {string} packageName
 */
export const assertTarballManifest = async (tarball, packageName) => {
  const out = spawnSync('tar', ['-xOf', tarball, 'package/package.json'], {
    encoding: 'utf8',
  })
  if (out.status !== 0) {
    throw new Error(
      `could not read manifest from ${tarball} (exit ${out.status})`,
    )
  }
  const pkg = JSON.parse(out.stdout)
  assertPublishableManifest(pkg, packageName)
  return pkg
}

/**
 * Rewrite `package/package.json` inside a tarball to the published shape.
 *
 * @param {string} tarball
 * @param {VersionMap} versions
 */
export const normalizeTarballManifest = async (tarball, versions) => {
  const work = join(dirname(tarball), `manifest-${process.pid}-${Date.now()}`)
  await mkdir(work, { recursive: true })
  try {
    const extract = spawnSync('tar', ['-xzf', tarball, '-C', work], {
      stdio: 'inherit',
    })
    if (extract.status !== 0) {
      throw new Error(
        `tar extract failed for ${tarball} (exit ${extract.status})`,
      )
    }
    const pkgFile = join(work, 'package', 'package.json')
    const pkg = JSON.parse(await readFile(pkgFile, 'utf8'))
    const published = normalizePublishedManifest(pkg, versions)
    assertPublishableManifest(published, pkg.name ?? tarball)
    await writeFile(pkgFile, JSON.stringify(published, null, 2) + '\n')
    const repack = spawnSync('tar', ['-czf', tarball, '-C', work, 'package'], {
      stdio: 'inherit',
    })
    if (repack.status !== 0) {
      throw new Error(
        `tar repack failed for ${tarball} (exit ${repack.status})`,
      )
    }
  } finally {
    await rm(work, { recursive: true, force: true })
  }
}

/**
 * @param {string} output
 */
const tarballNameFromPackOutput = output => {
  const match = output.match(/([^/\s]+\.tgz)/)
  return match?.[1] ?? null
}

/**
 * Resolve the tarball path after `nub pack`.
 *
 * @param {string} output
 * @param {string} cwd
 * @param {string | undefined} packDestination
 */
export const resolvePackedTarball = (output, cwd, packDestination) => {
  const name = tarballNameFromPackOutput(output)
  if (name === null) {
    throw new Error(
      `Could not determine tarball name from pack output:\n${output}`,
    )
  }
  const base = packDestination ?? cwd
  return join(base, name)
}

export { normalizePublishedManifest }
