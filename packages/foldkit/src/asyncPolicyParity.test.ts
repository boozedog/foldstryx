import { describe, expect, it } from 'vitest'

// Test-policy parity fixture.
//
// This file intentionally uses `async` / `await` / `new Promise` — the exact
// constructs the canonical Effect Lens async-rule family bans in library
// code:
//   - Effect Lens: lens/no-async-function, lens/no-await-expression,
//     lens/no-new-promise
//
// The `.oxlintrc.json` test override disables the lens family for
// `**/*.test.ts` / `**/*.test.tsx`. `nub run lint` MUST accept this file; if the
// lens exemption is removed, lint fails here. The `lens/*` exemption is held
// by the frozen override baseline (`nub run check:waivers`) and by
// `effect-lens check --mode unified`. This file is the parity regression
// guard for the test policy.
describe('async test-policy parity', () => {
  it('exercises the intentional test-only async/await/Promise exception', async () => {
    const value = await new Promise<number>(resolve => resolve(42))
    expect(value).toBe(42)
  })
})
