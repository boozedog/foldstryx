import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { view } from './attention.js'

type Node = Readonly<{
  children?: ReadonlyArray<unknown> | undefined
  text?: string | undefined
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
        view({
          title: 'Note',
          body: 'Review optional fields before submit.',
        }),
      ),
    )
    expect(text).toContain('Note')
    expect(text).toContain('Review optional fields before submit.')
  })
})
