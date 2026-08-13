import { Effect } from 'effect'
import { Diagnostic, type ESTree, Rule, RuleContext } from 'effect-oxlint'

import {
  isHtmlClassCall,
  isHtmlStyleCall,
  isStylexPropsCall,
  isSxAttrsCall,
} from '../stylex-ast.ts'

const CLASS_MESSAGE =
  'Do not mix sxAttrs() / stylex.props() with a raw h.Class() on the same element. ' +
  'Pass extra StyleX styles into sxAttrs() so class names merge correctly.'

const STYLE_MESSAGE =
  'Do not mix sxAttrs() / stylex.props() with a raw h.Style() on the same element. ' +
  'Foldkit last-write-wins on Style attributes; keep StyleX output in sxAttrs().'

const collectArrayElements = (
  node: ESTree.Node,
  acc: Array<ESTree.Node>,
): void => {
  if (node.type === 'ArrayExpression') {
    for (const element of node.elements) {
      if (element === null) continue
      if (element.type === 'SpreadElement') {
        collectArrayElements(element.argument, acc)
        continue
      }
      collectArrayElements(element, acc)
    }
    return
  }
  if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
    if (node.callee.name === 'elAttrs' || node.callee.name === 'attrs') {
      for (const argument of node.arguments) {
        if (argument.type === 'SpreadElement') {
          collectArrayElements(argument.argument, acc)
          continue
        }
        collectArrayElements(argument, acc)
      }
      return
    }
  }
  acc.push(node)
}

const flagClobber = (
  ctx: RuleContext['Service'],
  nodes: ReadonlyArray<ESTree.Node>,
): Effect.Effect<void> => {
  let hasStylex = false
  let classNode: ESTree.Node | undefined
  let styleNode: ESTree.Node | undefined
  for (const node of nodes) {
    if (isSxAttrsCall(node) || isStylexPropsCall(node)) hasStylex = true
    if (isHtmlClassCall(node)) classNode = node
    if (isHtmlStyleCall(node)) styleNode = node
  }
  if (!hasStylex) return Effect.void
  const reports: Array<Effect.Effect<void>> = []
  if (classNode !== undefined) {
    reports.push(
      ctx.report(Diagnostic.make({ node: classNode, message: CLASS_MESSAGE })),
    )
  }
  if (styleNode !== undefined) {
    reports.push(
      ctx.report(Diagnostic.make({ node: styleNode, message: STYLE_MESSAGE })),
    )
  }
  return reports.length === 0
    ? Effect.void
    : Effect.forEach(reports, report => report).pipe(Effect.asVoid)
}

/**
 * Foldkit analogue of Astryx `no-classname-clobber`.
 * Official `stylex/no-conflicting-props` only walks JSX.
 */
export const noStylexClobber = Rule.define({
  name: 'no-stylex-clobber',
  meta: Rule.meta({
    type: 'problem',
    description:
      'Disallow raw h.Class/h.Style alongside sxAttrs() / stylex.props() on the same Foldkit element',
  }),
  create: function* () {
    const ctx = yield* RuleContext
    return {
      CallExpression: (node: ESTree.Node) => {
        if (node.type !== 'CallExpression') return Effect.void
        const callee = node.callee
        if (
          callee.type !== 'MemberExpression' ||
          callee.computed ||
          callee.property.type !== 'Identifier'
        ) {
          return Effect.void
        }
        if (callee.object.type !== 'Identifier' || callee.object.name !== 'h') {
          return Effect.void
        }
        const first = node.arguments[0]
        if (first === undefined || first.type === 'SpreadElement')
          return Effect.void
        const collected: Array<ESTree.Node> = []
        collectArrayElements(first, collected)
        return flagClobber(ctx, collected)
      },
    }
  },
})
