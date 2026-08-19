import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import * as DateRangeInput from './dateRangeInput.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  children?: ReadonlyArray<unknown>
  data?: Readonly<{
    class?: Readonly<Record<string, boolean>>
  }>
}>

const asNode = (html: Html): Node => {
  if (html === null) throw new Error('expected VNode')
  return html as Node
}

const hasSx = (node: Node, key: string): boolean =>
  node.data?.class?.[`sx-${key}`] === true

const findFirstWithSx = (node: Node, key: string): Node | undefined => {
  if (hasSx(node, key)) return node
  for (const child of node.children ?? []) {
    const found = findFirstWithSx(child as Node, key)
    if (found !== undefined) return found
  }
  return undefined
}

describe('DateRangeInput', () => {
  it('lays out start and end fields in range chrome', () => {
    const root = asNode(
      renderWithBuilder(h =>
        DateRangeInput.view(
          {
            id: 'stay',
            label: 'Stay dates',
            description: 'Two DateInput fields.',
            startField: h.span([], ['start']),
            endField: h.span([], ['end']),
          },
          h,
        ),
      ),
    )

    expect(findFirstWithSx(root, 'rangeRow')).toBeDefined()
    expect(findFirstWithSx(root, 'rangeField')).toBeDefined()
    expect(findFirstWithSx(root, 'rangeSeparator')).toBeDefined()
  })
})
