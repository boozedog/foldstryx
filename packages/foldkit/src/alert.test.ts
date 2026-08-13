import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { view } from './alert.js'

type Node = Readonly<{
  sel?: string | undefined
  children?: ReadonlyArray<unknown> | undefined
  text?: string | undefined
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
  }>
}>

const collectText = (node: unknown): string => {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node
  const n = node as Node
  if (n.text !== undefined) return n.text
  if (n.children === undefined) return ''
  return n.children.map(collectText).join('')
}

const asNode = (html: Html): Node => {
  if (html === null) throw new Error('expected VNode')
  return html as Node
}

const classKeys = (node: Node): ReadonlyArray<string> =>
  Object.keys(node.data?.class ?? {}).filter(
    k => node.data?.class?.[k] === true,
  )

const hasSx = (node: Node, key: string): boolean =>
  classKeys(node).includes(`sx-${key}`)

describe('Alert', () => {
  it('exposes role=alert and the body text', () => {
    const root = asNode(view({ body: 'Something went wrong' }))
    expect(root.data?.attrs?.['role']).toBe('alert')
    expect(collectText(root)).toContain('Something went wrong')
  })

  it('selects the expected StyleX key for every variant', () => {
    const cases: ReadonlyArray<readonly [string, string]> = [
      ['default', 'variantDefault'],
      ['destructive', 'variantDestructive'],
      ['warning', 'variantWarning'],
      ['success', 'variantSuccess'],
    ]
    for (const [variant, key] of cases) {
      const node = asNode(view({ body: 'x', variant: variant as never }))
      expect(hasSx(node, key)).toBe(true)
      expect(hasSx(node, 'base')).toBe(true)
    }
  })

  it('renders title and body in a body block when title is provided', () => {
    const root = asNode(view({ title: 'Error', body: 'Details' }))
    const children = root.children as ReadonlyArray<Node>
    expect(children).toHaveLength(1)
    const bodyBlock = children[0]!
    expect(hasSx(bodyBlock, 'body')).toBe(true)
    expect(collectText(bodyBlock)).toContain('Error')
    expect(collectText(bodyBlock)).toContain('Details')
  })

  it('renders bare body text when no title is provided', () => {
    const root = asNode(view({ body: 'Just a message' }))
    const children = root.children as ReadonlyArray<Node>
    expect(children).toHaveLength(1)
    expect(collectText(children[0])).toBe('Just a message')
  })

  it('renders an action slot in an actions row', () => {
    const action = { sel: 'button', children: ['Dismiss'] } as unknown as Html
    const root = asNode(view({ body: 'Message', action }))
    const children = root.children as ReadonlyArray<Node>
    const actions = children[children.length - 1]!
    expect(hasSx(actions, 'actions')).toBe(true)
    expect(collectText(actions)).toContain('Dismiss')
  })

  it('suppresses the action row in compact mode', () => {
    const action = { sel: 'button', children: ['Dismiss'] } as unknown as Html
    const root = asNode(view({ body: 'Message', action, compact: true }))
    const children = root.children as ReadonlyArray<Node>
    // compact: no actions wrapper — only the message content
    expect(children.some(c => hasSx(c as Node, 'actions'))).toBe(false)
    expect(hasSx(root, 'compact')).toBe(true)
  })
})
