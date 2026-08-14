/**
 * Changeset gate that tolerates the post-version (release) state.
 *
 * `changeset status --since=origin/master` fails after `changeset version`
 * because the pending changeset files are consumed and the package versions
 * are bumped, leaving "packages changed but no changesets." That is a release
 * commit, not a missing-changeset error. This script passes in that state
 * while still failing on genuine missing-changeset errors in the dev flow.
 *
 * Wired through `pnpm check:changeset` (and thus `pnpm check`, hk pre-push,
 * and GitHub Actions CI).
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const run = (cmd, args) => {
  const res = spawnSync(cmd, args, { encoding: 'utf8', cwd: root })
  return { status: res.status, stdout: res.stdout, stderr: res.stderr }
}

// 1. Run the real changeset status gate.
const cs = run('pnpm', ['changeset', 'status', '--since=origin/master'])
if (cs.status === 0) {
  console.log('check-changeset: OK (changeset status clean)')
  process.exit(0)
}

// 2. It failed. Distinguish a post-version release state from a genuine
//    missing-changeset error.
const changesetDir = join(root, '.changeset')
let pending = []
try {
  pending = readdirSync(changesetDir).filter(
    f => f.endsWith('.md') && f !== 'config.json' && f !== 'README.md',
  )
} catch {
  // .changeset directory missing — treat as no pending changesets.
}
if (pending.length > 0) {
  // Pending changesets exist but status still failed — real error.
  console.error(cs.stdout || cs.stderr)
  process.exit(cs.status ?? 1)
}

// No pending changesets. A release state has CHANGELOG.md files written and
// at least one package version bumped vs origin/master.
const packagesDir = join(root, 'packages')
const pkgDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
const hasChangelog = pkgDirs.some(d =>
  existsSync(join(packagesDir, d, 'CHANGELOG.md')),
)
if (!hasChangelog) {
  console.error(cs.stdout || cs.stderr)
  process.exit(cs.status ?? 1)
}

let versionBumped = false
for (const d of pkgDirs) {
  const pkgPath = join(packagesDir, d, 'package.json')
  if (!existsSync(pkgPath)) continue
  let current
  try {
    current = JSON.parse(readFileSync(pkgPath, 'utf8')).version
  } catch {
    continue
  }
  const base = run('git', ['show', `origin/master:packages/${d}/package.json`])
  if (base.status !== 0) continue
  let baseVersion
  try {
    baseVersion = JSON.parse(base.stdout).version
  } catch {
    continue
  }
  if (current !== baseVersion) {
    versionBumped = true
    break
  }
}
if (!versionBumped) {
  console.error(cs.stdout || cs.stderr)
  process.exit(cs.status ?? 1)
}

console.log('check-changeset: OK (post-version release state)')
process.exit(0)
