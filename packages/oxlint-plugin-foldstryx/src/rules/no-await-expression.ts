import { Effect } from 'effect'
import {
  Diagnostic,
  type ESTree,
  Rule,
  RuleContext,
  SourceCode,
} from 'effect-oxlint'

import { AWAIT_ALLOWLIST } from '../async-allowlist.ts'
import { isEffectPackageImport, staticMemberChain } from '../guards.ts'

const MESSAGE =
  'Avoid `await`; Foldstryx is Effect-first. `await` is only allowed on the ' +
  'allowlisted Effect bridge calls (Effect.runPromise / Runtime.runPromise) where ' +
  'the receiver is imported from the effect package. See AWAIT_ALLOWLIST in ' +
  'packages/oxlint-plugin-foldstryx/src/async-allowlist.ts.'

/**
 * Bans `AwaitExpression`, except when the awaited value is `Effect.runPromise`
 * or `Runtime.runPromise` where the receiver is the real Effect import.
 *
 * The allowlist is BIND-AWARE: the awaited object must resolve to an import
 * binding from the `effect` package, so a locally-declared `const Effect = { runPromise }`
 * (or a shadowed `Runtime`) cannot bypass the ban.
 */
export const noAwaitExpression = Rule.define({
  name: 'no-await-expression',
  meta: Rule.meta({
    type: 'suggestion',
    description: MESSAGE,
  }),
  create: function* () {
    const ctx = yield* RuleContext
    const report = (node: ESTree.Node): Effect.Effect<void> =>
      ctx.report(Diagnostic.make({ node, message: MESSAGE }))
    return {
      AwaitExpression: (node: ESTree.Node) =>
        Effect.gen(function* () {
          if (node.type !== 'AwaitExpression') return
          const argument = node.argument
          if (argument.type !== 'CallExpression') {
            yield* report(node)
            return
          }
          const callee = argument.callee
          if (callee.type !== 'MemberExpression') {
            yield* report(node)
            return
          }
          const chain = staticMemberChain(callee)
          if (chain === null) {
            yield* report(node)
            return
          }
          const obj = callee.object
          if (obj.type !== 'Identifier') {
            yield* report(node)
            return
          }
          const scope = yield* SourceCode.getScope(obj)
          const allowlisted = AWAIT_ALLOWLIST.some(pattern =>
            pattern.test(chain),
          )
          if (allowlisted && isEffectPackageImport(obj.name, scope)) {
            return
          }
          yield* report(node)
        }),
    }
  },
})
