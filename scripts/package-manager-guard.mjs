#!/usr/bin/env node
/**
 * Package-manager guard (foldstryx#31).
 *
 * Deterministically rejects accidental active references to pnpm as a
 * required tool across this repository's active project/CI workflow surface
 * — `package.json`, GitHub Actions workflows, `README.md`, `AGENTS.md`,
 * `EFFECT-LENS.md`, `RELEASING.md`, `LLMS.txt`, `mise.toml`, `hk.pkl`, and
 * `scripts/*`. The migration (foldstryx#31) makes Nub the exclusive package
 * manager, so an active pnpm tool reference is a regression.
 *
 * The guard is intentionally narrow:
 *  - It scans only active project/CI workflow files, not `src/`/`test/` (the
 *    product's supported-lockfile logic legitimately names `pnpm-lock`) and
 *    not historical changelog text (CHANGELOG.md files are excluded).
 *  - It rejects pnpm used as a *tool* (a pnpm command invocation — including
 *    flag-first forms, where a pnpm is followed by a CLI option — a pnpm
 *    `packageManager` declaration, or a pnpm GitHub Actions setup/cache
 *    step), while allowing `pnpm-lock.yaml` / `pnpm-lock` (a lockfile format
 *    Nub reads directly) and descriptive product text (e.g. "pnpm detected"
 *    or a `pnpm@…` example value).
 *
 * Exits 0 when no active pnpm tool reference is found, 1 otherwise.
 *
 * Usage:
 *   node scripts/package-manager-guard.mjs [--repo <dir>]
 *
 * @since 0.0.0
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const defaultRepoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * A pnpm command invocation: `pnpm <verb>` where `<verb>` is a pnpm CLI verb
 * or one of this project's own script names. This intentionally excludes
 * `pnpm-lock.yaml` / `pnpm-lock` (a format Nub reads directly) and descriptive
 * prose like "pnpm detected", `pnpm@…`, or "npm and pnpm are supported".
 *
 * @since 0.0.0
 */
const PNPM_COMMAND =
  /\bpnpm\s+(?:add|install|i|remove|rm|update|up|run|r|exec|dlx|dev|build|format|format:check|check|lint|lint:ci|typecheck|test|test:watch|check:async-allowlist|check:waivers|check:lint-fixtures|check:effect-lens|check:demo|check:packed|check:fallow|check:tokens|check:changeset|check:changeset:pre-push|changeset|version-packages|release|prepare|pre-push|rebuild|rb|dedupe|prune|link|unlink|patch|pack|publish|version|config|store|env|import|recursive|filter|list|ls|why|outdated|audit|licenses|sbom|help)\b/

/**
 * A pnpm invocation with a leading CLI flag (flag-first forms the verb list
 * above cannot catch): a pnpm followed by a `-`/`--` option is a tool
 * invocation.
 *
 * @since 0.0.0
 */
const PNPM_FLAG = /\bpnpm\s+(?:-[a-z]|--[a-z])/i

/** A pnpm `packageManager` declaration in `package.json`. */
const PNPM_PACKAGE_MANAGER = /"packageManager"\s*:\s*"pnpm@/

/** A pnpm GitHub Actions reference: the `pnpm/action-setup` action. */
const PNPM_ACTION_SETUP = /pnpm\/action-setup/

/** A GitHub Actions `cache:` step that caches the store of the pnpm toolchain. */
const PNPM_CACHE = /\bcache\s*:\s*pnpm\b/

/**
 * The active project/CI workflow files the guard scans. Product code
 * (`src/`/`test/`) and historical changelogs are intentionally excluded: they
 * document pnpm as a lockfile format or a past release, not as a tool this
 * repository requires.
 *
 * @since 0.0.0
 */
const activeFiles = repoRoot => {
  const files = []
  const add = p => {
    if (existsSync(p)) files.push(p)
  }
  add(join(repoRoot, 'package.json'))
  add(join(repoRoot, 'README.md'))
  add(join(repoRoot, 'AGENTS.md'))
  add(join(repoRoot, 'EFFECT-LENS.md'))
  add(join(repoRoot, 'RELEASING.md'))
  add(join(repoRoot, 'LLMS.txt'))
  add(join(repoRoot, 'mise.toml'))
  add(join(repoRoot, 'hk.pkl'))
  for (const name of readdirSync(join(repoRoot, 'packages'))) {
    const pkgFile = join(repoRoot, 'packages', name, 'package.json')
    if (existsSync(pkgFile)) add(pkgFile)
  }
  for (const name of readdirSync(join(repoRoot, 'examples'))) {
    const pkgFile = join(repoRoot, 'examples', name, 'package.json')
    if (existsSync(pkgFile)) add(pkgFile)
  }
  const workflows = join(repoRoot, '.github', 'workflows')
  if (existsSync(workflows)) {
    for (const name of readdirSync(workflows)) {
      if (/\.ya?ml$/.test(name)) add(join(workflows, name))
    }
  }
  const scripts = join(repoRoot, 'scripts')
  if (existsSync(scripts)) {
    for (const name of readdirSync(scripts)) {
      const full = join(scripts, name)
      if (/\.(?:mjs|ts|d\.mts)$/.test(name) && statSync(full).isFile()) {
        add(full)
      }
    }
  }
  return files
}

/**
 * Runs the package-manager guard over a repository's active project/CI
 * workflow surface and returns the aggregate outcome.
 *
 * @since 0.0.0
 */
export const runPackageManagerGuard = (args = {}) => {
  const repoRoot = resolve(args.repoRoot ?? defaultRepoRoot)
  const problems = []
  const checked = []
  for (const file of activeFiles(repoRoot)) {
    const rel = file.slice(repoRoot.length + 1)
    let content
    try {
      content = readFileSync(file, 'utf8')
    } catch {
      problems.push(`${rel}: unreadable`)
      continue
    }
    checked.push(rel)
    const isPackageJson = rel.endsWith('package.json')
    const isWorkflow = /^\.github\/workflows\/.+\.ya?ml$/.test(rel)
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const at = `${rel}:${i + 1}`
      if (isPackageJson && PNPM_PACKAGE_MANAGER.test(line)) {
        problems.push(`${at}: pnpm packageManager declaration`)
        continue
      }
      if (
        isWorkflow &&
        (PNPM_ACTION_SETUP.test(line) || PNPM_CACHE.test(line))
      ) {
        problems.push(`${at}: pnpm GitHub Actions reference`)
        continue
      }
      if (PNPM_COMMAND.test(line)) {
        problems.push(`${at}: pnpm command invocation`)
        continue
      }
      if (PNPM_FLAG.test(line)) {
        problems.push(`${at}: pnpm flag-first invocation`)
      }
    }
  }
  const ok = problems.length === 0
  return {
    ok,
    detail: ok
      ? `${checked.length} active file(s) scanned, no pnpm tool references`
      : `${problems.length} active pnpm reference(s)`,
    checked,
    problems,
  }
}

/**
 * Renders the guard summary to stdout and returns the process exit code.
 *
 * @since 0.0.0
 */
const render = result => {
  process.stdout.write('foldstryx package-manager guard\n')
  for (const rel of result.checked) {
    process.stdout.write(`  ok: ${rel}\n`)
  }
  for (const problem of result.problems) {
    process.stdout.write(`  FAILED: ${problem}\n`)
  }
  if (result.ok) {
    process.stdout.write('package-manager guard passed\n')
    return 0
  }
  process.stdout.write('package-manager guard FAILED\n')
  return 1
}

// CLI entry: parse optional overrides and run the guard.
const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const argv = process.argv.slice(2)
  const repo =
    argv.indexOf('--repo') !== -1 ? argv[argv.indexOf('--repo') + 1] : undefined
  process.exitCode = render(runPackageManagerGuard({ repoRoot: repo }))
}
