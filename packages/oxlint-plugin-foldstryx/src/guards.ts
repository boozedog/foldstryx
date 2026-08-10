import { Option } from 'effect'
import {
  type ESTree,
  type OxlintScope,
  Scope,
  type Variable,
} from 'effect-oxlint'

/**
 * Reconstruct a static member chain, e.g. `a.b.c` -> `'a.b.c'`.
 * Returns `null` for computed / private member access.
 */
export const staticMemberChain = (
  node: ESTree.MemberExpression,
): string | null => {
  if (node.computed) return null
  if (node.property.type === 'PrivateIdentifier') return null
  const propName = node.property.name
  const obj = node.object
  if (obj.type === 'Identifier') return `${obj.name}.${propName}`
  if (obj.type === 'MemberExpression') {
    const inner = staticMemberChain(obj)
    return inner === null ? null : `${inner}.${propName}`
  }
  return null
}

/** The import source if `name` resolves, in `scope`, to an import binding. */
const importSourceOf = (
  name: string,
  scope: OxlintScope,
): Option.Option<string> =>
  Option.flatMap(Scope.findVariableUp(scope, name), (variable: Variable) => {
    const def = variable.defs.find(d => d.type === 'ImportBinding')
    if (def === undefined) return Option.none()
    const parent = def.parent
    if (parent === null || parent.type !== 'ImportDeclaration') {
      return Option.none()
    }
    const source = parent.source
    return source.type === 'Literal' && typeof source.value === 'string'
      ? Option.some(source.value)
      : Option.none()
  })

/**
 * True if `name` (resolved in `scope`) is imported from the Effect package
 * (`effect` or an `effect/...` subpath). Bind-aware, so a locally-declared
 * `Effect`/`Runtime` object does not satisfy the check.
 */
export const isEffectPackageImport = (
  name: string,
  scope: OxlintScope,
): boolean =>
  Option.exists(
    importSourceOf(name, scope),
    source => source === 'effect' || source.startsWith('effect/'),
  )

/**
 * True if `name` (resolved in `scope`) refers to the `Promise` global or to an
 * alias of it (e.g. `const P = Promise`). Used to ban `new Promise` / `new P(...)`
 * even when the constructor is spelled differently or aliased.
 */
export const isPromiseReference = (
  name: string,
  scope: OxlintScope,
): boolean => {
  if (name === 'Promise') return true
  return Option.exists(
    Scope.findVariableUp(scope, name),
    (variable: Variable) =>
      variable.defs.some(def => {
        if (def.type !== 'Variable') return false
        const declarator = def.node
        if (declarator.type !== 'VariableDeclarator') return false
        const init = declarator.init
        if (init === null || init === undefined) return false
        if (init.type === 'Identifier') return init.name === 'Promise'
        if (init.type === 'MemberExpression') {
          const chain = staticMemberChain(init)
          return chain === 'Promise' || chain === 'globalThis.Promise'
        }
        return false
      }),
  )
}
