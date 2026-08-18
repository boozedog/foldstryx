import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

export const RELEASE_PACKAGES = [
  '@foldstryx/tokens',
  '@foldstryx/styles',
  '@foldstryx/foldkit',
  '@foldstryx/kitchen-sink',
  '@foldstryx/docs',
]

/** @param {string} name */
export const releasePackageDir = name =>
  resolve(root, 'packages', name.replace('@foldstryx/', ''))
