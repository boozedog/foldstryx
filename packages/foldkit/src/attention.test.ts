import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { view } from './attention.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
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

describe('Attention', () => {
  it('renders title and body', () => {
    const text = collectText(
      asNode(
        renderWithBuilder(h =>
          view(
            {
              title: 'Note',
              body: 'Review optional fields before submit.',
            },
            h,
          ),
        ),
      ),
    )
    expect(text).toContain('Note')
    expect(text).toContain('Review optional fields before submit.')
  })

  it('renders body without a title', () => {
    const text = collectText(
      asNode(renderWithBuilder(h => view({ body: 'Just a tip.' }, h))),
    )
    expect(text).toContain('Just a tip.')
  })

  it('renders children after the body', () => {
    const child = { sel: 'button', children: ['Learn more'] } as unknown as Html
    const root = asNode(
      renderWithBuilder(h => view({ body: 'Tip', children: [child] }, h)),
    )
    const children = root.children as ReadonlyArray<Node>
    expect(children).toHaveLength(2)
    expect(collectText(children[1])).toContain('Learn more')
  })

  it('is not role=alert (soft callout, not urgent)', () => {
    const root = asNode(renderWithBuilder(h => view({ body: 'Tip' }, h)))
    expect(root.data?.attrs?.['role']).toBeUndefined()
  })
})
