import type { Html } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import * as Icon from './icon.js'
import { renderWithBuilder } from './renderHelper.js'
import * as Sidebar from './sidebar.js'

type Node = Readonly<{
  children?: ReadonlyArray<unknown>
  data?: Readonly<{ attrs?: Readonly<Record<string, string>> }>
}>

const asNode = (value: Html): Node => value as Node
const descendants = (value: unknown): Node[] => {
  if (typeof value !== 'object' || value === null) return []
  const node = value as Node
  return [node, ...(node.children?.flatMap(descendants) ?? [])]
}

describe('Sidebar', () => {
  it('renders active and expanded navigation semantics', () => {
    const node = asNode(
      renderWithBuilder(h =>
        Sidebar.desktop(
          {
            brand: { name: 'App' },
            activeItemId: 'child',
            expandedItemIds: ['parent'],
            onToggleItem: id => ({ _tag: 'Toggle', id }),
            groups: [
              {
                label: 'Main',
                items: [
                  {
                    id: 'parent',
                    label: 'Parent',
                    icon: Icon.folder,
                    onClick: { _tag: 'Navigate', id: 'parent' },
                    children: [{ id: 'child', label: 'Child' }],
                  },
                ],
              },
            ],
          },
          {},
          h,
        ),
      ),
    )
    const nodes = descendants(node)
    expect(
      nodes.some(item => item.data?.attrs?.['aria-current'] === 'page'),
    ).toBe(true)
    expect(
      nodes.some(item => item.data?.attrs?.['aria-expanded'] === 'true'),
    ).toBe(true)
    expect(nodes.some(item => item.data?.attrs?.['role'] === 'group')).toBe(
      true,
    )
    expect(
      nodes.some(item => item.data?.attrs?.['aria-labelledby'] !== undefined),
    ).toBe(true)
  })

  it('expands a parent from the row when it has no onClick', () => {
    const node = asNode(
      renderWithBuilder(h =>
        Sidebar.desktop(
          {
            brand: { name: 'App' },
            expandedItemIds: [],
            onToggleItem: id => ({ _tag: 'Toggle', id }),
            groups: [
              {
                label: 'Main',
                items: [
                  {
                    id: 'parent',
                    label: 'Parent',
                    icon: Icon.folder,
                    children: [
                      {
                        id: 'child',
                        label: 'Child',
                        onClick: { _tag: 'Navigate', id: 'child' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {},
          h,
        ),
      ),
    )
    const nodes = descendants(node)
    const parent = nodes.find(
      item => item.data?.attrs?.['aria-label'] === 'Parent',
    )
    expect(parent?.data?.attrs?.['aria-expanded']).toBe('false')
  })

  it('hides iconless items when collapsed', () => {
    const node = asNode(
      renderWithBuilder(h =>
        Sidebar.desktop(
          {
            brand: { name: 'App' },
            groups: [
              {
                label: 'Main',
                items: [
                  {
                    id: 'parent',
                    label: 'Parent',
                    icon: Icon.folder,
                    children: [{ id: 'child', label: 'Child' }],
                  },
                ],
              },
            ],
          },
          { isCollapsed: true },
          h,
        ),
      ),
    )
    const nodes = descendants(node)
    expect(
      nodes.some(item => item.data?.attrs?.['aria-label'] === 'Parent'),
    ).toBe(true)
    expect(
      nodes.some(item => item.data?.attrs?.['aria-label'] === 'Child'),
    ).toBe(false)
  })

  it('opens a flyout for a hovered collapsed parent', () => {
    const node = asNode(
      renderWithBuilder(h =>
        Sidebar.desktop(
          {
            brand: { name: 'App' },
            hoveredItemId: 'parent',
            onHoverItem: id => ({ _tag: 'Hover', id }),
            openItemId: 'parent',
            onOpenItem: id => ({ _tag: 'Open', id }),
            groups: [
              {
                label: 'Main',
                items: [
                  {
                    id: 'parent',
                    label: 'Parent',
                    icon: Icon.folder,
                    children: [
                      {
                        id: 'child',
                        label: 'Child',
                        onClick: { _tag: 'Navigate', id: 'child' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { isCollapsed: true },
          h,
        ),
      ),
    )
    const nodes = descendants(node)
    expect(
      nodes.some(item => item.data?.attrs?.['aria-label'] === 'Child'),
    ).toBe(true)
  })
})
