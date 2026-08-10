import { Plugin } from 'effect-oxlint'

import { noAsyncFunction } from './rules/no-async-function.ts'
import { noAwaitExpression } from './rules/no-await-expression.ts'
import { noNewPromise } from './rules/no-new-promise.ts'

/**
 * Foldstryx oxlint plugin: enforces the async/await/Promise ban with a
 * pattern-based, bind-aware allowlist. Foldstryx is an Effect-first styling
 * library; asynchronous work is expressed with Effect, not async/await/Promise.
 *
 * - `no-async-function` — bans `async` functions (custom `Rule.define` visitor).
 * - `no-await-expression` — bans `AwaitExpression` except the allowlisted,
 *   bind-aware `Effect.runPromise` / `Runtime.runPromise` bridges (custom visitor).
 * - `no-new-promise` — bans `new Promise` / `new globalThis.Promise` / aliased
 *   constructors (custom bind-aware `Rule.define` visitor; no stock `banNewExpr`
 *   factory can catch `globalThis.Promise` or `const P = Promise; new P(...)`).
 */
const plugin = Plugin.define({
  name: 'foldstryx',
  specifier: '@foldstryx/oxlint-plugin',
  rules: {
    'no-async-function': noAsyncFunction,
    'no-await-expression': noAwaitExpression,
    'no-new-promise': noNewPromise,
  },
})

export default plugin
