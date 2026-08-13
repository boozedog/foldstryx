import { Plugin } from 'effect-oxlint'

import { noAsyncFunction } from './rules/no-async-function.ts'
import { noAwaitExpression } from './rules/no-await-expression.ts'
import { noHardcodedStyles } from './rules/no-hardcoded-styles.ts'
import { noNewPromise } from './rules/no-new-promise.ts'
import { noStylexClobber } from './rules/no-stylex-clobber.ts'
import { noStylexNullOverride } from './rules/no-stylex-null-override.ts'

/**
 * Foldstryx oxlint plugin: Effect-first async/await/Promise ban plus Astryx-style
 * StyleX token / null-override / Foldkit className-clobber rules.
 *
 * - `no-async-function` — bans `async` functions (custom `Rule.define` visitor).
 * - `no-await-expression` — bans `AwaitExpression` except the allowlisted,
 *   bind-aware `Effect.runPromise` / `Runtime.runPromise` bridges (custom visitor).
 * - `no-new-promise` — bans `new Promise` / `new globalThis.Promise` / aliased
 *   constructors (custom bind-aware `Rule.define` visitor; no stock `banNewExpr`
 *   factory can catch `globalThis.Promise` or `const P = Promise; new P(...)`).
 * - `no-hardcoded-styles` — bans hex/`14px` literals inside `stylex.create()`.
 * - `no-stylex-null-override` — bans persist-null override objects.
 * - `no-stylex-clobber` — bans raw `h.Class`/`h.Style` next to `sxAttrs()`.
 */
const plugin = Plugin.define({
  name: 'foldstryx',
  specifier: '@foldstryx/oxlint-plugin',
  rules: {
    'no-async-function': noAsyncFunction,
    'no-await-expression': noAwaitExpression,
    'no-new-promise': noNewPromise,
    'no-hardcoded-styles': noHardcodedStyles,
    'no-stylex-null-override': noStylexNullOverride,
    'no-stylex-clobber': noStylexClobber,
  },
})

export default plugin
