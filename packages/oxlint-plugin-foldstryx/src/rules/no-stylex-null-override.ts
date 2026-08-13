import { Effect } from 'effect'
import { Diagnostic, type ESTree, Rule, RuleContext } from 'effect-oxlint'

import { isInsideStylexCreate, propertyName } from '../stylex-ast.ts'

const MESSAGE =
  "Avoid null style overrides in stylex.create(). Use an explicit value like 'none' instead. " +
  'Null overrides prevent the build from inlining style objects into class name strings.'

const isNullLiteral = (node: ESTree.Node): boolean =>
  node.type === 'Literal' && node.value === null

const isFullNullOverride = (node: ESTree.Node): boolean => {
  if (node.type !== 'ObjectExpression') return false
  const properties = node.properties.filter(
    property =>
      property.type === 'Property' && propertyName(property) !== '$$css',
  )
  return (
    properties.length > 0 &&
    properties.every(
      property => property.type === 'Property' && isNullLiteral(property.value),
    )
  )
}

/**
 * Bans persist-null override objects in `stylex.create()`.
 * `{ default: null, ':hover': value }` stays allowed.
 */
export const noStylexNullOverride = Rule.define({
  name: 'no-stylex-null-override',
  meta: Rule.meta({
    type: 'problem',
    description:
      'Disallow null values as style overrides in stylex.create() — use explicit values instead',
  }),
  create: function* () {
    const ctx = yield* RuleContext
    return {
      Property: (node: ESTree.Node) => {
        if (node.type !== 'Property') return Effect.void
        if (!isInsideStylexCreate(node)) return Effect.void
        if (node.value.type !== 'ObjectExpression') return Effect.void
        if (!isFullNullOverride(node.value)) return Effect.void
        return ctx.report(Diagnostic.make({ node, message: MESSAGE }))
      },
    }
  },
})
