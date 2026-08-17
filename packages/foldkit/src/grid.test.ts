import type { Html } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import * as Grid from './grid.js'
import { renderWithBuilder } from './renderHelper.js'

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

describe('Grid.view', () => {
  it('renders children in a div with the base grid style', () => {
    const node = asNode(
      renderWithBuilder(h => Grid.view({ children: ['A', 'B'] }, h)),
    )
    expect(node.sel).toBe('div')
    expect(hasSx(node, 'base')).toBe(true)
    expect(text(node)).toContain('A')
    expect(text(node)).toContain('B')
  })

  it('defaults to two columns and md gap', () => {
    const node = asNode(
      renderWithBuilder(h => Grid.view({ children: ['A'] }, h)),
    )
    expect(hasSx(node, 'grid2')).toBe(true)
    expect(hasSx(node, 'gapMd')).toBe(true)
  })

  it('selects the expected column style for every preset', () => {
    const cases: ReadonlyArray<readonly [Grid.GridColumns, string]> = [
      [2, 'grid2'],
      [3, 'grid3'],
      [4, 'grid4'],
      ['summary', 'gridSummary'],
    ]
    for (const [columns, key] of cases) {
      const node = asNode(
        renderWithBuilder(h => Grid.view({ columns, children: ['A'] }, h)),
      )
      expect(hasSx(node, key)).toBe(true)
    }
  })

  it('selects the expected gap style for every gap', () => {
    const cases: ReadonlyArray<readonly [Grid.GridGap, string]> = [
      ['sm', 'gapSm'],
      ['md', 'gapMd'],
      ['lg', 'gapLg'],
    ]
    for (const [gap, key] of cases) {
      const node = asNode(
        renderWithBuilder(h => Grid.view({ gap, children: ['A'] }, h)),
      )
      expect(hasSx(node, key)).toBe(true)
    }
  })

  it('applies the top margin style when mt is provided', () => {
    const node = asNode(
      renderWithBuilder(h => Grid.view({ mt: '2', children: ['A'] }, h)),
    )
    expect(hasSx(node, 'mt2')).toBe(true)
  })
})
