import { describe, expect, it } from 'vitest'

// Test-policy parity fixture.
//
// This file intentionally uses `async` / `await` / `new Promise` — the exact
// constructs both async-rule families ban in library code:
//   - Foldstryx: foldstryx/no-async-function, foldstryx/no-await-expression,
//     foldstryx/no-new-promise
//   - Effect Lens: lens/no-async-function, lens/no-await-expression,
//     lens/no-new-promise
//
// The `.oxlintrc.json` test override disables both families for
// `**/*.test.ts` / `**/*.test.tsx`. `pnpm lint` MUST accept this file; if the
// Foldstryx exemption is removed, lint fails here. The `lens/*` exemption is
// held by the frozen override baseline (`pnpm check:waivers`) and by
// `effect-lens check --mode unified` once that gate is wired (Phase 3/4).
// This file is the parity regression guard for both policies.
describe('async test-policy parity', () => {
  it('exercises the intentional test-only async/await/Promise exception', async () => {
    const value = await new Promise<number>(resolve => resolve(42))
    expect(value).toBe(42)
  })
})
