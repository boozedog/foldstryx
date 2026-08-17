import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { view } from './loadingPanel.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  sel?: string | undefined
  children?: ReadonlyArray<unknown> | undefined
  text?: string | undefined
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
  }>
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

const classKeys = (node: Node): ReadonlyArray<string> =>
  Object.keys(node.data?.class ?? {}).filter(
    k => node.data?.class?.[k] === true,
  )

const hasSx = (node: Node, key: string): boolean =>
  classKeys(node).includes(`sx-${key}`)

describe('LoadingPanel', () => {
  it('renders default and custom message', () => {
    expect(collectText(asNode(renderWithBuilder(h => view({}, h))))).toContain(
      'Loading…',
    )
    expect(
      collectText(
        asNode(renderWithBuilder(h => view({ message: 'Fetching rows…' }, h))),
      ),
    ).toContain('Fetching rows…')
  })

  it('marks the body as busy and polite-live', () => {
    const body = asNode(renderWithBuilder(h => view({ card: false }, h)))
    expect(body.data?.attrs?.['aria-busy']).toBe('true')
    expect(body.data?.attrs?.['aria-live']).toBe('polite')
  })

  it('wraps in card chrome by default', () => {
    const root = asNode(renderWithBuilder(h => view({}, h)))
    expect(root.sel).toBe('div')
    expect(hasSx(root, 'root')).toBe(true)
    // body is nested inside the card root
    const body = (root.children as ReadonlyArray<Node>)[0]!
    expect(body.data?.attrs?.['aria-busy']).toBe('true')
  })

  it('returns the bare body when card is false', () => {
    const body = asNode(renderWithBuilder(h => view({ card: false }, h)))
    expect(body.sel).toBe('div')
    expect(hasSx(body, 'root')).toBe(false)
    expect(hasSx(body, 'loadingPanel')).toBe(true)
  })
})
