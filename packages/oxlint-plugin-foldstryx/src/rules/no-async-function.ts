import { Effect } from 'effect'
import { Diagnostic, type ESTree, Rule, RuleContext } from 'effect-oxlint'

const MESSAGE =
  'Avoid async functions; Foldstryx is Effect-first, so compose with Effect ' +
  '(Effect.gen, Effect.forEach, services) instead of async/await.'

const isAsyncFunction = (node: ESTree.Node): boolean => {
  switch (node.type) {
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      return node.async === true
    default:
      return false
  }
}

/**
 * Bans `async` functions entirely. Effect has synchronous composition
 * primitives, so an async function is always a smell here.
 */
export const noAsyncFunction = Rule.define({
  name: 'no-async-function',
  meta: Rule.meta({
    type: 'suggestion',
    description: MESSAGE,
  }),
  create: function* () {
    const ctx = yield* RuleContext
    const report = (node: ESTree.Node): Effect.Effect<void> =>
      ctx.report(Diagnostic.make({ node, message: MESSAGE }))
    return {
      FunctionDeclaration: (node: ESTree.Node) =>
        isAsyncFunction(node) ? report(node) : Effect.void,
      FunctionExpression: (node: ESTree.Node) =>
        isAsyncFunction(node) ? report(node) : Effect.void,
      ArrowFunctionExpression: (node: ESTree.Node) =>
        isAsyncFunction(node) ? report(node) : Effect.void,
    }
  },
})
