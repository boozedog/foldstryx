import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { view } from './details.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  text?: string
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
    props?: Readonly<Record<string, unknown>>
    on?: Readonly<Record<string, unknown>>
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

describe('Details', () => {
  it('renders summary and body', () => {
    const node = asNode(
      view({
        summary: 'More info',
        children: ['Hidden details'],
        open: true,
      }),
    )
    expect(node.sel).toBe('details')
    expect(hasSx(node, 'detailsBox')).toBe(true)
    expect(text(node)).toContain('More info')
    expect(text(node)).toContain('Hidden details')
  })

  it('sets the open prop when open is true', () => {
    const node = asNode(
      view({ summary: 'More info', children: ['Body'], open: true }),
    )
    expect(node.data?.props?.['open']).toBe(true)
  })

  it('forces the open prop to false when closed (controlled close)', () => {
    const node = asNode(view({ summary: 'More info', children: ['Body'] }))
    expect(node.data?.props?.['open']).toBe(false)
  })

  it('renders the summary with the detailsSummary style key', () => {
    const node = asNode(view({ summary: 'More info', children: ['Body'] }))
    const summary = node.children?.[0] as Node
    expect(summary.sel).toBe('summary')
    expect(hasSx(summary, 'detailsSummary')).toBe(true)
  })

  it('attaches an OnToggle handler to the details element when provided', () => {
    const node = asNode(
      view({
        summary: 'More info',
        children: ['Body'],
        onToggle: isOpen => ({ _tag: 'T', isOpen }),
      }),
    )
    expect(Object.keys(node.data?.on ?? {})).toContain('toggle')
  })

  it('omits the OnToggle handler when not provided', () => {
    const node = asNode(view({ summary: 'More info', children: ['Body'] }))
    expect(Object.keys(node.data?.on ?? {})).not.toContain('toggle')
  })
})
