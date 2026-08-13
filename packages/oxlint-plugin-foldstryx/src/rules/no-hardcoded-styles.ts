import { Effect, Schema } from 'effect'
import { Diagnostic, type ESTree, Rule, RuleContext } from 'effect-oxlint'

import {
  isInsideStylexCreate,
  literalString,
  propertyName,
} from '../stylex-ast.ts'

type StylePropertyRule = Readonly<{
  pattern: RegExp
  tokenVar: string
  message: string
  examples?: ReadonlyArray<string>
}>

const STYLE_PROPERTIES: Readonly<Record<string, StylePropertyRule>> = {
  fontSize: {
    pattern: /^\d+(\.\d+)?(px|rem|em)$/,
    tokenVar: 'textSizeVars',
    message: 'Use textSizeVars token instead of hardcoded fontSize',
    examples: [
      "textSizeVars['--font-size-xs']",
      "textSizeVars['--font-size-base']",
    ],
  },
  fontWeight: {
    pattern: /^\d{3}$/,
    tokenVar: 'fontWeightVars',
    message: 'Use fontWeightVars token instead of hardcoded fontWeight',
    examples: ["fontWeightVars['--font-weight-medium']"],
  },
  lineHeight: {
    pattern: /^\d+(\.\d+)?(px|rem|em)?$/,
    tokenVar: 'typeScaleVars',
    message: 'Consider using a typeScaleVars leading token for consistency',
    examples: ["typeScaleVars['--text-body-leading']"],
  },
  padding: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token instead of hardcoded padding',
    examples: ["spacingVars['--spacing-2']"],
  },
  paddingTop: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  paddingRight: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  paddingBottom: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  paddingLeft: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  paddingBlock: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  paddingInline: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  margin: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  marginTop: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  marginRight: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  marginBottom: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  marginLeft: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  marginBlock: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  marginInline: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  gap: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token',
  },
  borderRadius: {
    pattern: /^\d+(\.\d+)?(px|rem)$/,
    tokenVar: 'radiusVars',
    message: 'Use radiusVars token instead of hardcoded borderRadius',
    examples: ["radiusVars['--radius-element']"],
  },
  color: {
    pattern: /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))$/,
    tokenVar: 'colorVars',
    message: 'Use colorVars token instead of hardcoded color',
    examples: ["colorVars['--color-text-primary']"],
  },
  backgroundColor: {
    pattern: /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))$/,
    tokenVar: 'colorVars',
    message: 'Use colorVars token instead of hardcoded backgroundColor',
    examples: ["colorVars['--color-background-surface']"],
  },
  borderColor: {
    pattern: /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))$/,
    tokenVar: 'colorVars',
    message: 'Use colorVars token instead of hardcoded borderColor',
  },
}

const SKIP_VALUES = new Set([
  '0',
  '0px',
  'inherit',
  'initial',
  'unset',
  'auto',
  'none',
  '100%',
  '50%',
  '0%',
  'transparent',
  'currentColor',
])

const Options = Schema.optional(
  Schema.Struct({
    ignore: Schema.optionalKey(Schema.Array(Schema.String)),
  }),
)

const formatMessage = (rule: StylePropertyRule): string =>
  rule.examples === undefined
    ? rule.message
    : `${rule.message}. Example: ${rule.examples.join(' or ')}`

const collectLiteralValues = (
  node: ESTree.Node,
): ReadonlyArray<{ node: ESTree.Node; value: string }> => {
  const direct = literalString(node)
  if (direct !== null) return [{ node, value: direct }]
  if (node.type !== 'ObjectExpression') return []
  return node.properties.flatMap(prop => {
    if (prop.type !== 'Property') return []
    return collectLiteralValues(prop.value)
  })
}

/**
 * Bans hardcoded spacing / type / radius / color literals inside
 * `stylex.create()`. Tokens (`colorVars`, `spacingVars`, …) stay allowed.
 */
export const noHardcodedStyles = Rule.define({
  name: 'no-hardcoded-styles',
  meta: Rule.meta({
    type: 'suggestion',
    description:
      'Use Foldstryx design tokens instead of hardcoded values in stylex.create()',
  }),
  options: Options,
  create: function* (options) {
    const ctx = yield* RuleContext
    const ignored = new Set(options?.ignore ?? [])
    return {
      Property: (node: ESTree.Node) => {
        if (node.type !== 'Property') return Effect.void
        if (!isInsideStylexCreate(node)) return Effect.void
        const name = propertyName(node)
        if (name === null || ignored.has(name)) return Effect.void
        const rule = STYLE_PROPERTIES[name]
        if (rule === undefined) return Effect.void
        const match = collectLiteralValues(node.value).find(
          candidate =>
            !SKIP_VALUES.has(candidate.value) &&
            rule.pattern.test(candidate.value),
        )
        if (match === undefined) return Effect.void
        return ctx.report(
          Diagnostic.make({
            node: match.node,
            message: formatMessage(rule),
          }),
        )
      },
    }
  },
})
