import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { view } from './listRow.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  text?: string
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
  }>
}>
const asNode = (value: Html): Node => value as Node
const text = (value: unknown): string => {
  if (typeof value === 'string') return value
  const node = value as Node & { text?: string }
  if (node.text) return node.text
  return node.children?.map(text).join('') ?? ''
}
const classKeys = (node: Node): ReadonlyArray<string> =>
  Object.keys(node.data?.class ?? {}).filter(
    k => node.data?.class?.[k] === true,
  )
const hasSx = (node: Node, key: string): boolean =>
  classKeys(node).includes(`sx-${key}`)

describe('ListRow', () => {
  it('renders title, meta, and actions', () => {
    const node = asNode(
      renderWithBuilder(h =>
        view(
          {
            title: 'Item one',
            meta: ['Secondary'],
            actions: ['Edit', 'Delete'],
          },
          h,
        ),
      ),
    )
    expect(hasSx(node, 'listRow')).toBe(true)
    expect(text(node)).toContain('Item one')
    expect(text(node)).toContain('Secondary')
    expect(text(node)).toContain('Edit')
    expect(text(node)).toContain('Delete')
  })

  it('omits the actions row when no actions are provided', () => {
    const node = asNode(renderWithBuilder(h => view({ title: 'Item one' }, h)))
    expect(hasSx(node, 'listRow')).toBe(true)
    expect(text(node)).toContain('Item one')
    const children = node.children as ReadonlyArray<Node>
    expect(children.some(c => hasSx(c, 'rowCenterGap2'))).toBe(false)
  })

  it('renders the title with the listRowTitle style key', () => {
    const node = asNode(renderWithBuilder(h => view({ title: 'Item one' }, h)))
    const children = node.children as ReadonlyArray<Node>
    const titleBlock = children[0] as Node
    const title = titleBlock.children?.[0] as Node
    expect(hasSx(title, 'listRowTitle')).toBe(true)
  })
})
