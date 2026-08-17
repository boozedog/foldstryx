import { Features } from 'lightningcss'
import { defineConfig } from 'vite'

import { foldkit } from '@foldkit/vite-plugin'
import stylex from '@stylexjs/unplugin'

/**
 * `foldkit/*` subpaths that `@foldkit/ui`'s dist imports directly but the
 * Foldkit Vite plugin's `optimizeDeps.include` list does not cover (the
 * plugin only pre-includes `effect/*` namespaces). Without them, the first
 * dev request discovers them after the initial pre-bundle, forcing one
 * re-optimization cycle: in-flight requests get `504 (Outdated Optimize
 * Dep)` and the browser chases stale hashed files in `.vite/deps/` until the
 * auto-reload lands. Pre-including them makes the first pass complete.
 */
const foldkitSubpathDeps = [
  'foldkit/brand',
  'foldkit/calendar',
  'foldkit/command',
  'foldkit/dom',
  'foldkit/file',
  'foldkit/html',
  'foldkit/message',
  'foldkit/mount',
  'foldkit/render',
  'foldkit/schema',
  'foldkit/story',
  'foldkit/struct',
  'foldkit/submodel',
  'foldkit/subscription',
  'foldkit/update',
]

export default defineConfig({
  plugins: [
    stylex.vite({ lightningcssOptions: { exclude: Features.LightDark } }),
    foldkit(),
  ],
  optimizeDeps: {
    include: [...foldkitSubpathDeps],
  },
})
