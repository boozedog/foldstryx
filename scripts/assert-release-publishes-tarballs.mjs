import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const releaseScript = join(here, 'changeset-publish.mjs')

/**
 * Fail when `changeset-publish.mjs` regresses to directory `nub publish`.
 *
 * @param {string} [source]
 */
export const assertReleasePublishesTarballs = async source => {
  const text = source ?? (await readFile(releaseScript, 'utf8'))

  if (/\bnub\s*,\s*\[\s*['"]publish['"]/.test(text)) {
    throw new Error(
      'changeset-publish.mjs must not call nub publish (directory publish uploads workspace packuments)',
    )
  }

  if (!text.includes('resolveRealNpm')) {
    throw new Error(
      'changeset-publish.mjs must publish through resolveRealNpm()',
    )
  }

  if (!/\[\s*['"]publish['"],\s*tarball/.test(text)) {
    throw new Error(
      'changeset-publish.mjs must call npm publish with a tarball path',
    )
  }

  if (!text.includes('assertTarballManifest')) {
    throw new Error(
      'changeset-publish.mjs must assert tarball manifests before publish',
    )
  }
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  assertReleasePublishesTarballs().catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
