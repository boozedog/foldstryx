import assert from 'node:assert/strict'
import fs from 'node:fs'

const noticePath = new URL('../NOTICE', import.meta.url)
const localPath = new URL(
  '../packages/tokens/src/index.stylex.ts',
  import.meta.url,
)
const notice = fs.readFileSync(noticePath, 'utf8')
const local = fs.readFileSync(localPath, 'utf8')

const pin = notice.match(
  /Astryx source pin used for the lifted token module:\n([0-9a-f]{40})/,
)
assert.ok(pin, 'NOTICE must record a 40-character Astryx source pin')
assert.ok(
  notice.includes('Source path: packages/core/src/theme/tokens.stylex.ts'),
  'NOTICE must record the Astryx token source path',
)

for (const token of [
  "'--color-accent': 'light-dark(#0064E0, #2694FE)'",
  "'--color-background-body': 'light-dark(#F1F4F7, #111112)'",
  "'--color-text-primary': 'light-dark(#0A1317, #DFE2E5)'",
  "'--spacing-1': '4px'",
  "'--radius-element': '8px'",
  "'--duration-fast': '175ms'",
  "'--font-size-base': '0.875rem'",
  "'--text-heading-1-size': 'var(--font-size-2xl)'",
]) {
  assert.ok(local.includes(token), `missing lifted token: ${token}`)
}

assert.doesNotMatch(local, /scaffold/)
console.log(`Astryx token fidelity spot-check passed (pin ${pin[1]})`)
