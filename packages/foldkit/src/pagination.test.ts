import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { view } from './pagination.js'

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

describe('Pagination', () => {
  it('renders status between previous and next', () => {
    const node = asNode(
      view({
        status: 'Page 2 of 10',
        previous: 'Prev',
        next: 'Next',
      }),
    )
    expect(hasSx(node, 'pagination')).toBe(true)
    expect(text(node)).toContain('Prev')
    expect(text(node)).toContain('Page 2 of 10')
    expect(text(node)).toContain('Next')
  })

  it('exposes navigation semantics with an accessible label', () => {
    const node = asNode(
      view({ status: 'Page 1 of 1', previous: 'Prev', next: 'Next' }),
    )
    expect(node.data?.attrs?.['role']).toBe('navigation')
    expect(node.data?.attrs?.['aria-label']).toBe('Pagination')
  })

  it('renders the status with the muted style key', () => {
    const node = asNode(
      view({ status: 'Page 1 of 1', previous: 'Prev', next: 'Next' }),
    )
    const children = node.children as ReadonlyArray<Node>
    const status = children[1] as Node
    expect(hasSx(status, 'muted')).toBe(true)
  })
})
