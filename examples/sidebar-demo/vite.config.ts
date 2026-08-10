import { Features } from 'lightningcss'
import { defineConfig } from 'vite'

import { foldkit } from '@foldkit/vite-plugin'
import stylex from '@stylexjs/unplugin'

export default defineConfig({
  plugins: [
    stylex.vite({ lightningcssOptions: { exclude: Features.LightDark } }),
    foldkit(),
  ],
})
