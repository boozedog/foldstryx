import { Effect } from 'effect'
import {
  Diagnostic,
  type ESTree,
  Rule,
  RuleContext,
  SourceCode,
} from 'effect-oxlint'

import { isPromiseReference, staticMemberChain } from '../guards.ts'

const MESSAGE =
  'Avoid constructing Promises; Foldstryx is Effect-first. Use Effect ' +
  '(Deferred, Effect.acquireRelease, Effect.async) instead of manual Promise ' +
  'construction. This covers `new Promise`, `new globalThis.Promise`, and ' +
  'aliased constructors (e.g. `const P = Promise; new P(...)`).'

/**
 * Bans `new Promise(...)` and its equivalents (`new globalThis.Promise(...)`,
 * `const P = Promise; new P(...)`). Bind-aware: aliases of the Promise global
 * are resolved through the scope so the ban cannot be bypassed by renaming.
 */
export const noNewPromise = Rule.define({
  name: 'no-new-promise',
  meta: Rule.meta({
    type: 'suggestion',
    description: MESSAGE,
  }),
  create: function* () {
    const ctx = yield* RuleContext
    const report = (node: ESTree.Node): Effect.Effect<void> =>
      ctx.report(Diagnostic.make({ node, message: MESSAGE }))
    return {
      NewExpression: (node: ESTree.Node) =>
        Effect.gen(function* () {
          if (node.type !== 'NewExpression') return
          const callee = node.callee
          if (callee.type === 'Identifier') {
            const scope = yield* SourceCode.getScope(callee)
            if (isPromiseReference(callee.name, scope)) {
              yield* report(node)
            }
          } else if (callee.type === 'MemberExpression') {
            const chain = staticMemberChain(callee)
            if (chain === 'Promise' || chain === 'globalThis.Promise') {
              yield* report(node)
            }
          }
        }),
    }
  },
})
