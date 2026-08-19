import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { renderWithBuilder } from './renderHelper.js'
import { view } from './textArea.js'

type Node = Readonly<{
  sel?: string | undefined
  children?: ReadonlyArray<unknown> | undefined
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    props?: Readonly<Record<string, unknown>>
    class?: Readonly<Record<string, boolean>>
    on?: Readonly<Record<string, unknown>>
  }>
}>

const asNode = (html: Html): Node => {
  if (html === null) throw new Error('expected VNode')
  return html as Node
}

const findDescendant = (
  node: Node,
  predicate: (node: Node) => boolean,
): Node | undefined => {
  if (predicate(node)) return node
  if (node.children === undefined) return undefined
  for (const child of node.children) {
    const found = findDescendant(child as Node, predicate)
    if (found !== undefined) return found
  }
  return undefined
}

const classKeys = (node: Node): ReadonlyArray<string> =>
  Object.keys(node.data?.class ?? {}).filter(
    k => node.data?.class?.[k] === true,
  )

const hasSx = (node: Node, key: string): boolean =>
  classKeys(node).includes(`sx-${key}`)

const collectText = (node: unknown): string => {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node
  const n = node as Node & { text?: string }
  if (n.text !== undefined) return n.text
  if (n.children === undefined) return ''
  return n.children.map(collectText).join('')
}

describe('TextArea', () => {
  it('renders labeled textarea with description', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view(
          {
            id: 'notes',
            label: 'Notes',
            value: 'Hello',
            description: 'Optional context.',
            rows: 5,
          },
          h,
        ),
      ),
    )
    const textarea = findDescendant(root, n => n.sel === 'textarea')
    expect(textarea).toBeDefined()
    expect(textarea?.data?.props?.['id']).toBe('notes')
    expect(textarea?.data?.props?.['rows']).toBe(5)
    const label = findDescendant(root, n => n.sel === 'label')
    expect(collectText(label)).toContain('Notes')
  })

  it('wires onInput and marks invalid state', () => {
    const message = { _tag: 'Changed' as const }
    const root = asNode(
      renderWithBuilder(h =>
        view(
          {
            id: 'bio',
            label: 'Bio',
            value: '',
            onInput: () => message,
            isInvalid: true,
          },
          h,
        ),
      ),
    )
    const textarea = findDescendant(root, n => n.sel === 'textarea')!
    expect(Object.keys(textarea.data?.on ?? {})).toContain('input')
    expect(textarea.data?.attrs?.['aria-invalid']).toBe('true')
    expect(hasSx(textarea, 'textarea')).toBe(true)
  })

  it('omits input handler when disabled', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view(
          {
            id: 'locked',
            label: 'Locked',
            value: 'x',
            isDisabled: true,
            onInput: () => ({ _tag: 'Noop' }),
          },
          h,
        ),
      ),
    )
    const textarea = findDescendant(root, n => n.sel === 'textarea')!
    expect(Object.keys(textarea.data?.on ?? {})).not.toContain('input')
    expect(
      textarea.data?.props?.['disabled'] === true ||
        textarea.data?.attrs?.['data-disabled'] === '',
    ).toBe(true)
  })
})
