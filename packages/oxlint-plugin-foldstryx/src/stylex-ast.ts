import type { ESTree } from 'effect-oxlint'

export const propertyName = (node: ESTree.Node): string | null => {
  if (node.type !== 'Property' || node.computed) return null
  if (node.key.type === 'Identifier') return node.key.name
  if (node.key.type === 'Literal' && typeof node.key.value === 'string') {
    return node.key.value
  }
  return null
}

export const literalString = (node: ESTree.Node): string | null => {
  if (node.type === 'Literal') {
    if (node.value === null) return null
    if (typeof node.value === 'string') return node.value
    if (typeof node.value === 'number' || typeof node.value === 'boolean') {
      return String(node.value)
    }
    return null
  }
  if (
    node.type === 'TemplateLiteral' &&
    node.expressions.length === 0 &&
    node.quasis.length === 1
  ) {
    return node.quasis[0]?.value.cooked ?? node.quasis[0]?.value.raw ?? null
  }
  return null
}

const calleeLooksLikeStylexMember = (
  callee: ESTree.Expression | ESTree.Super,
  method: string,
): boolean => {
  if (callee.type !== 'MemberExpression' || callee.computed) return false
  if (callee.property.type !== 'Identifier') return false
  if (callee.property.name !== method) return false
  return callee.object.type === 'Identifier'
}

const isStylexCreateCall = (node: ESTree.Node): boolean =>
  node.type === 'CallExpression' &&
  calleeLooksLikeStylexMember(node.callee, 'create')

export const isStylexPropsCall = (node: ESTree.Node): boolean =>
  node.type === 'CallExpression' &&
  calleeLooksLikeStylexMember(node.callee, 'props')

export const isInsideStylexCreate = (node: ESTree.Node): boolean => {
  let current: ESTree.Node | null | undefined = node.parent
  while (current) {
    if (isStylexCreateCall(current)) return true
    current = current.parent
  }
  return false
}

export const isSxAttrsCall = (node: ESTree.Node): boolean => {
  if (node.type !== 'CallExpression') return false
  const callee = node.callee
  return callee.type === 'Identifier' && callee.name === 'sxAttrs'
}

export const isHtmlClassCall = (node: ESTree.Node): boolean => {
  if (node.type !== 'CallExpression') return false
  const callee = node.callee
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'Class'
  )
}

export const isHtmlStyleCall = (node: ESTree.Node): boolean => {
  if (node.type !== 'CallExpression') return false
  const callee = node.callee
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'Style'
  )
}
