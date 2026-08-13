import type { Html } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import * as Badge from './badge.js'

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

describe('Badge', () => {
  it('renders its label in a span', () => {
    const node = asNode(Badge.view({ label: 'New' }))
    expect(node.sel).toBe('span')
    expect(text(node)).toContain('New')
  })

  // Kept as a smoke guard: every variant/size renders without throwing.
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

  it('selects the expected StyleX key for every variant', () => {
    const cases: ReadonlyArray<readonly [Badge.BadgeVariant, string]> = [
      ['default', 'variantDefault'],
      ['secondary', 'variantSecondary'],
      ['destructive', 'variantDestructive'],
      ['outline', 'variantOutline'],
      ['success', 'variantSuccess'],
      ['warning', 'variantWarning'],
      ['info', 'variantInfo'],
    ]
    for (const [variant, key] of cases) {
      const node = asNode(Badge.view({ label: 'x', variant }))
      expect(hasSx(node, key)).toBe(true)
      expect(hasSx(node, 'base')).toBe(true)
    }
  })

  it('selects the expected StyleX key for each size', () => {
    const def = asNode(Badge.view({ label: 'x' }))
    expect(hasSx(def, 'sizeDefault')).toBe(true)
    expect(hasSx(def, 'sizeLg')).toBe(false)

    const lg = asNode(Badge.view({ label: 'x', size: 'lg' }))
    expect(hasSx(lg, 'sizeLg')).toBe(true)
    expect(hasSx(lg, 'sizeDefault')).toBe(false)
  })
})
