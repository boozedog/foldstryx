/**
 * Locate the real npm CLI (not a foldstryx shim on PATH).
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

/**
 * @returns {string}
 */
export const resolveRealNpm = () => {
  const fromEnv = process.env.FOLDSTRYX_REAL_NPM
  if (fromEnv) {
    const resolved = resolve(fromEnv)
    if (!resolved.endsWith('resolve-real-npm.mjs')) return resolved
  }
  const pathWithoutScripts = (process.env.PATH ?? '')
    .split(':')
    .filter(entry => entry.length > 0 && resolve(entry) !== here)
    .join(':')
  const result = spawnSync('command', ['-v', 'npm'], {
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, PATH: pathWithoutScripts },
  })
  if (result.status !== 0 || !result.stdout.trim()) {
    throw new Error('could not locate real npm outside scripts/')
  }
  return result.stdout.trim()
}
