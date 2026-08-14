import type { Html } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import * as Page from './page.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
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

describe('Page.header', () => {
  it('renders a semantic header with title and description', () => {
    const node = asNode(
      Page.header({ title: 'Transactions', description: 'Review activity' }),
    )
    expect(node.sel).toBe('header')
    expect(text(node)).toContain('Transactions')
    expect(text(node)).toContain('Review activity')
    expect(hasSx(node, 'header')).toBe(true)
  })

  it('renders title as an h1 and description as a p', () => {
    const node = asNode(Page.header({ title: 'Items' }))
    const h1 = node.children?.[0] as Node
    expect(h1.sel).toBe('h1')
    expect(text(h1)).toBe('Items')
    expect(hasSx(h1, 'title')).toBe(true)
  })

  it('omits the description paragraph when not provided', () => {
    const node = asNode(Page.header({ title: 'Items' }))
    const hasParagraph = (node.children ?? []).some(
      child => (child as Node).sel === 'p',
    )
    expect(hasParagraph).toBe(false)
  })

  it('wraps in a row with an actions slot when actions are provided', () => {
    const node = asNode(
      Page.header({ title: 'Items', actions: ['Export', 'Import'] }),
    )
    expect(node.sel).toBe('div')
    expect(hasSx(node, 'headerRow')).toBe(true)
    expect(text(node)).toContain('Items')
    expect(text(node)).toContain('Export')
    expect(text(node)).toContain('Import')
  })

  it('keeps a bare header when actions is an empty array', () => {
    const node = asNode(Page.header({ title: 'Items', actions: [] }))
    expect(node.sel).toBe('header')
  })
})

describe('Page.content', () => {
  it('renders children in a content region', () => {
    const node = asNode(Page.content(['Body', 'More']))
    expect(node.sel).toBe('div')
    expect(hasSx(node, 'content')).toBe(true)
    expect(text(node)).toContain('Body')
    expect(text(node)).toContain('More')
  })
})

describe('Page.footer', () => {
  it('renders children in a footer region', () => {
    const node = asNode(Page.footer(['Save', 'Cancel']))
    expect(node.sel).toBe('div')
    expect(hasSx(node, 'footer')).toBe(true)
    expect(text(node)).toContain('Save')
    expect(text(node)).toContain('Cancel')
  })
})

describe('Page.shell', () => {
  it('composes header, content, and footer in order', () => {
    const node = asNode(
      Page.shell({
        header: Page.header({ title: 'Title' }),
        content: ['Body'],
        footer: Page.footer(['Footer']),
      }),
    )
    expect(node.sel).toBe('div')
    expect(hasSx(node, 'shell')).toBe(true)
    const sels = (node.children ?? []).map(child => (child as Node).sel)
    expect(sels).toEqual(['header', 'div', 'div'])
    expect(text(node)).toContain('Title')
    expect(text(node)).toContain('Body')
    expect(text(node)).toContain('Footer')
  })

  it('omits header and footer when not provided', () => {
    const node = asNode(Page.shell({ content: ['Body'] }))
    const sels = (node.children ?? []).map(child => (child as Node).sel)
    expect(sels).toEqual(['div'])
    expect(text(node)).toContain('Body')
  })
})
