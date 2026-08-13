import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { Failed, Loading, Ready, card } from './stat.js'

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

describe('Stat', () => {
  it('tags Loading, Failed, Ready correctly', () => {
    expect(new Loading()._tag).toBe('Loading')
    expect(new Failed({ message: 'boom' })._tag).toBe('Failed')
    expect(new Failed({ message: 'boom' }).message).toBe('boom')
    expect(new Ready({ value: '12' })._tag).toBe('Ready')
    expect(new Ready({ value: '12' }).value).toBe('12')
  })

  it('renders Ready value as string', () => {
    const node = asNode(
      card({ label: 'Pending', state: new Ready({ value: '12' }) }),
    )
    expect(text(node)).toContain('Pending')
    expect(text(node)).toContain('12')
  })

  it('renders Failed message', () => {
    const node = asNode(
      card({ label: 'Pending', state: new Failed({ message: 'Unavailable' }) }),
    )
    expect(text(node)).toContain('Pending')
    expect(text(node)).toContain('Unavailable')
  })

  it('renders Loading placeholder', () => {
    const node = asNode(card({ label: 'Pending', state: new Loading() }))
    expect(text(node)).toContain('Pending')
    expect(text(node)).toContain('…')
  })

  it('uses a custom loading placeholder when provided', () => {
    const node = asNode(
      card({ label: 'Pending', state: new Loading(), loadingText: 'Loading' }),
    )
    expect(text(node)).toContain('Loading')
  })

  it('exposes a polite live region on Loading and Failed, not Ready', () => {
    const loading = asNode(card({ label: 'L', state: new Loading() }))
    const loadingChildren = loading.children as ReadonlyArray<Node>
    const loadingValue = loadingChildren[1] as Node
    expect(loadingValue.data?.attrs?.['aria-live']).toBe('polite')
    expect(loadingValue.data?.attrs?.['role']).not.toBe('alert')

    const failed = asNode(
      card({ label: 'L', state: new Failed({ message: 'x' }) }),
    )
    const failedChildren = failed.children as ReadonlyArray<Node>
    const failedValue = failedChildren[1] as Node
    expect(failedValue.data?.attrs?.['aria-live']).toBe('polite')
    expect(failedValue.data?.attrs?.['role']).not.toBe('alert')

    const ready = asNode(card({ label: 'L', state: new Ready({ value: '1' }) }))
    const readyChildren = ready.children as ReadonlyArray<Node>
    const readyValue = readyChildren[1] as Node
    expect(readyValue.data?.attrs?.['aria-live']).toBeUndefined()
  })

  it('selects the expected StyleX keys for each state', () => {
    const ready = asNode(card({ label: 'L', state: new Ready({ value: '1' }) }))
    expect(hasSx(ready, 'root')).toBe(true)
    expect(hasSx(ready, 'panelPad')).toBe(true)
    const readyChildren = ready.children as ReadonlyArray<Node>
    expect(hasSx(readyChildren[0] as Node, 'metricLabel')).toBe(true)
    expect(hasSx(readyChildren[1] as Node, 'metricValue')).toBe(true)

    const failed = asNode(
      card({ label: 'L', state: new Failed({ message: 'x' }) }),
    )
    const failedChildren = failed.children as ReadonlyArray<Node>
    expect(hasSx(failedChildren[1] as Node, 'metricError')).toBe(true)
    expect(hasSx(failedChildren[1] as Node, 'metricValue')).toBe(false)

    const loading = asNode(card({ label: 'L', state: new Loading() }))
    const loadingChildren = loading.children as ReadonlyArray<Node>
    expect(hasSx(loadingChildren[1] as Node, 'metricValue')).toBe(true)
  })
})
