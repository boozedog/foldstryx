import type { Html } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import * as Badge from './badge.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  data?: Readonly<{ attrs?: Readonly<Record<string, string>> }>
}>
const asNode = (value: Html): Node => value as Node
const text = (value: unknown): string => {
  if (typeof value === 'string') return value
  const node = value as Node & { text?: string }
  if (node.text) return node.text
  return node.children?.map(text).join('') ?? ''
}

describe('Badge', () => {
  it('renders its label in a span', () => {
    const node = asNode(Badge.view({ label: 'New' }))
    expect(node.sel).toBe('span')
    expect(text(node)).toContain('New')
  })

  it('renders every variant and size without throwing', () => {
    const variants = [
      'default',
      'secondary',
      'destructive',
      'outline',
      'success',
      'warning',
      'info',
    ] as const
    for (const variant of variants) {
      expect(() => Badge.view({ label: 'x', variant })).not.toThrow()
    }
    expect(() => Badge.view({ label: 'x', size: 'lg' })).not.toThrow()
  })
})
