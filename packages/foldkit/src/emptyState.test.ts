import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { view as emptyView } from './emptyState.js'
import { view as loadingView } from './loadingPanel.js'

type Node = Readonly<{
  sel?: string | undefined
  children?: ReadonlyArray<unknown> | undefined
  text?: string | undefined
  data?: Readonly<{ attrs?: Readonly<Record<string, string>> }>
}>

const collectText = (node: unknown): string => {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node
  const n = node as Node
  if (n.text !== undefined) return n.text
  if (n.children === undefined) return ''
  return n.children.map(collectText).join('')
}

const asNode = (html: Html): Node => {
  if (html === null) throw new Error('expected VNode')
  return html as Node
}

describe('LoadingPanel', () => {
  it('renders default and custom message', () => {
    expect(collectText(asNode(loadingView()))).toContain('Loading…')
    expect(
      collectText(asNode(loadingView({ message: 'Fetching rows…' }))),
    ).toContain('Fetching rows…')
  })
})

describe('EmptyState', () => {
  it('renders message and optional title', () => {
    const text = collectText(
      asNode(
        emptyView({
          title: 'No results',
          message: 'Nothing matches your filters.',
        }),
      ),
    )
    expect(text).toContain('No results')
    expect(text).toContain('Nothing matches your filters.')
  })

  it('wraps action in a centered intrinsic-width container', () => {
    const action = { sel: 'button', children: ['Create'] } as unknown as Html
    const root = asNode(
      emptyView({
        message: 'Nothing here',
        action,
        card: false,
      }),
    )
    // content stack: [message p, action wrapper]
    expect(root.sel).toBe('div')
    expect(root.children).toBeDefined()
    const children = root.children as ReadonlyArray<Node>
    const actionWrap = children[children.length - 1]
    expect(actionWrap?.sel).toBe('div')
    expect(actionWrap?.children).toHaveLength(1)
    expect(collectText(actionWrap)).toContain('Create')
    // Action is not a direct flex-stretch sibling of text — nested for self-center.
    expect(children.some(c => c === action)).toBe(false)
  })
})
