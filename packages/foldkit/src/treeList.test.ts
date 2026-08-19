import { Schema as S } from 'effect'
import type { Html } from 'foldkit/html'
import { m } from 'foldkit/message'

import { describe, expect, it } from '@effect/vitest'

import { renderWithBuilder } from './renderHelper.js'
import { treeListKeyDown, view } from './treeList.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    on?: Readonly<Record<string, unknown>>
  }>
}>

const asNode = (html: Html): Node => {
  if (html === null) throw new Error('expected VNode')
  return html as Node
}

const findAllByRole = (node: Node, role: string): ReadonlyArray<Node> => {
  const out: Array<Node> = []
  if (node.data?.attrs?.['role'] === role) out.push(node)
  for (const child of node.children ?? []) {
    out.push(...findAllByRole(child as Node, role))
  }
  return out
}

const Focused = m('Focused', { id: S.String })

describe('TreeList', () => {
  it('renders tree roles and expanded state', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view(
          {
            items: [
              {
                id: 'projects',
                label: 'Projects',
                children: [{ id: 'foldstryx', label: 'Foldstryx' }],
              },
            ],
            expandedIds: new Set(['projects']),
            selectedId: 'foldstryx',
            focusedId: 'foldstryx',
            ariaLabel: 'Projects',
            onToggle: () => Focused({ id: 'projects' }),
            onSelect: () => Focused({ id: 'foldstryx' }),
            onFocus: id => Focused({ id }),
          },
          h,
        ),
      ),
    )

    const tree = findAllByRole(root, 'tree')[0]
    expect(tree).toBeDefined()
    expect(tree?.data?.attrs?.['aria-label']).toBe('Projects')

    const selected = findAllByRole(root, 'treeitem').find(
      item => item.data?.attrs?.['aria-selected'] === 'true',
    )
    expect(selected).toBeDefined()
    expect(selected?.data?.attrs?.['aria-expanded']).toBeUndefined()
  })

  it('is not role=alert', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view(
          {
            items: [{ id: 'only', label: 'Only' }],
            expandedIds: new Set<string>(),
            onToggle: () => Focused({ id: 'only' }),
            onSelect: () => Focused({ id: 'only' }),
            onFocus: () => Focused({ id: 'only' }),
          },
          h,
        ),
      ),
    )
    expect(findAllByRole(root, 'alert')).toHaveLength(0)
  })

  it('steps focus with ArrowDown, Home, and End', () => {
    const rows = [
      {
        id: 'projects',
        label: 'Projects',
        level: 0,
        hasChildren: true,
        isExpanded: true,
      },
      {
        id: 'foldstryx',
        label: 'Foldstryx',
        level: 1,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'astryx',
        label: 'Astryx',
        level: 1,
        hasChildren: false,
        isExpanded: false,
      },
    ] as const
    const handlers = {
      onToggle: () => Focused({ id: 'projects' }),
      onSelect: () => Focused({ id: 'foldstryx' }),
      onFocus: (id: string) => Focused({ id }),
    }

    expect(treeListKeyDown(rows, 0, 'ArrowDown', handlers)).toEqual(
      Focused({ id: 'foldstryx' }),
    )
    expect(treeListKeyDown(rows, 0, 'End', handlers)).toEqual(
      Focused({ id: 'astryx' }),
    )
    expect(treeListKeyDown(rows, 2, 'Home', handlers)).toEqual(
      Focused({ id: 'projects' }),
    )
  })
})
