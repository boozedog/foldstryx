import type { Html } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import { renderWithBuilder } from './renderHelper.js'
import * as ToggleButton from './toggleButton.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
  }>
}>
const asNode = (value: Html): Node => value as Node
const classKeys = (node: Node): ReadonlyArray<string> =>
  Object.keys(node.data?.class ?? {}).filter(
    k => node.data?.class?.[k] === true,
  )
const hasSx = (node: Node, key: string): boolean =>
  classKeys(node).includes(`sx-${key}`)

describe('ToggleButton.view', () => {
  it('renders aria-pressed and pressed chrome when active', () => {
    const node = asNode(
      renderWithBuilder(h =>
        ToggleButton.view(
          {
            label: 'Bold',
            isPressed: true,
            onPressedChange: next => ({ _tag: 'Pressed', next }),
          },
          h,
        ),
      ),
    )
    expect(node.sel).toBe('button')
    expect(node.data?.attrs?.['aria-pressed']).toBe('true')
    expect(hasSx(node, 'pressed')).toBe(true)
    const findSpan = (node: Node): Node | undefined => {
      if (node.sel === 'span' && hasSx(node, 'labelWidthReservation')) {
        return node
      }
      for (const child of node.children ?? []) {
        const found = findSpan(child as Node)
        if (found !== undefined) return found
      }
      return undefined
    }
    expect(findSpan(node)).toBeDefined()
  })

  it('defaults to ghost variant styling', () => {
    const node = asNode(
      renderWithBuilder(h =>
        ToggleButton.view({ label: 'Italic', isPressed: false }, h),
      ),
    )
    expect(hasSx(node, 'variantGhost')).toBe(true)
  })
})

describe('ToggleButton.groupView', () => {
  it('renders a labelled group with item toggles', () => {
    const node = asNode(
      renderWithBuilder(h =>
        ToggleButton.groupView(
          {
            label: 'View',
            value: 'grid',
            onChange: value => ({ _tag: 'View', value }),
            items: [
              { value: 'list', label: 'List' },
              { value: 'grid', label: 'Grid' },
            ],
          },
          h,
        ),
      ),
    )
    expect(node.sel).toBe('div')
    expect(node.data?.attrs?.['role']).toBe('group')
    expect(node.data?.attrs?.['aria-label']).toBe('View')
    expect(hasSx(node, 'group')).toBe(true)
    expect(node.children?.length).toBe(2)
  })
})
