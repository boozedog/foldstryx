#!/usr/bin/env node
/**
 * Nub pack wrapper that normalizes the emitted tarball manifest.
 *
 * Forwards all arguments to `nub pack`, then applies the shared publish-time
 * transforms (merge `publishConfig`, rewrite `workspace:*` siblings).
 */
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  normalizeTarballManifest,
  readWorkspaceVersions,
  resolvePackedTarball,
} from './normalize-tarball-manifest.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const runCapture = (command, args, options = {}) =>
  new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    })
    let output = ''
    child.stdout.on('data', chunk => {
      output += chunk.toString()
    })
    child.stderr.on('data', chunk => {
      output += chunk.toString()
    })
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolveRun(output)
      else
        reject(
          new Error(`${command} ${args.join(' ')} exited ${code}\n${output}`),
        )
    })
  })

const packDestinationFromArgs = args => {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pack-destination') return args[i + 1]
    const eq = args[i].match(/^--pack-destination=(.+)$/)
    if (eq) return eq[1]
  }
  return undefined
}

/**
 * @param {string} cwd
 * @param {string[]} packArgs
 * @param {{ echoOutput?: boolean }} [options]
 * @returns {Promise<string>} absolute path to the normalized tarball
 */
export const packNormalized = async (cwd, packArgs, options = {}) => {
  const output = await runCapture('nub', ['pack', ...packArgs], { cwd })
  if (options.echoOutput === true) process.stdout.write(output)
  const tarball = resolvePackedTarball(
    output,
    cwd,
    packDestinationFromArgs(packArgs),
  )
  const versions = await readWorkspaceVersions(root)
  await normalizeTarballManifest(tarball, versions)
  return tarball
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  packNormalized(process.cwd(), process.argv.slice(2), {
    echoOutput: true,
  }).catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
