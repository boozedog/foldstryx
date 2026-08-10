import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@foldstryx/styles': fileURLToPath(
        new URL('./src/stylesStub.ts', import.meta.url),
      ),
    },
  },
  test: { environment: 'happy-dom', setupFiles: ['./src/vitest-setup.ts'] },
})
