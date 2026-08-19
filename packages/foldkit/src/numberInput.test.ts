import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { view } from './numberInput.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  sel?: string | undefined
  children?: ReadonlyArray<unknown> | undefined
  text?: string | undefined
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    props?: Readonly<Record<string, unknown>>
    class?: Readonly<Record<string, boolean>>
    on?: Readonly<Record<string, unknown>>
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

const attr = (node: Node, name: string): string | undefined =>
  node.data?.attrs?.[name] ?? (node.data?.props?.[name] as string | undefined)

const classKeys = (node: Node): ReadonlyArray<string> =>
  Object.keys(node.data?.class ?? {}).filter(
    k => node.data?.class?.[k] === true,
  )

const hasSx = (node: Node, key: string): boolean =>
  classKeys(node).includes(`sx-${key}`)

describe('NumberInput', () => {
  it('keeps the field border on the wrapper and the inner control borderless', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view(
          {
            id: 'qty',
            label: 'Quantity',
            value: '1',
            units: 'kg',
          },
          h,
        ),
      ),
    )
    const input = findDescendant(root, n => n.sel === 'input')!
    const wrapper = findDescendant(
      root,
      n => n.sel === 'div' && hasSx(n, 'base'),
    )!
    expect(hasSx(wrapper, 'base')).toBe(true)
    expect(hasSx(input, 'input')).toBe(true)
    expect(hasSx(input, 'inputDisabled')).toBe(false)
    expect(input).toBe(wrapper.children?.[0])
  })

  it('renders native number input with min, max, and step', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view(
          {
            id: 'qty',
            label: 'Quantity',
            value: '3',
            min: 0,
            max: 10,
            step: 1,
          },
          h,
        ),
      ),
    )
    const input = findDescendant(root, n => n.sel === 'input')!
    expect(input.data?.props?.['type']).toBe('number')
    expect(attr(input, 'min')).toBe('0')
    expect(attr(input, 'max')).toBe('10')
    expect(attr(input, 'step')).toBe('1')
    expect(input.data?.props?.['value']).toBe('3')
  })

  it('wires onInput and optional units', () => {
    const message = { _tag: 'Changed' as const }
    const root = asNode(
      renderWithBuilder(h =>
        view(
          {
            id: 'weight',
            label: 'Weight',
            value: '1.5',
            units: 'kg',
            onInput: () => message,
          },
          h,
        ),
      ),
    )
    const input = findDescendant(root, n => n.sel === 'input')!
    expect(Object.keys(input.data?.on ?? {})).toContain('input')
    expect(collectText(root)).toContain('kg')
  })

  it('omits input handler when disabled', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view(
          {
            id: 'locked',
            label: 'Locked',
            value: '2',
            isDisabled: true,
            onInput: () => ({ _tag: 'Noop' }),
          },
          h,
        ),
      ),
    )
    const input = findDescendant(root, n => n.sel === 'input')!
    expect(Object.keys(input.data?.on ?? {})).not.toContain('input')
    expect(
      input.data?.props?.['disabled'] === true ||
        input.data?.attrs?.['data-disabled'] === '',
    ).toBe(true)
  })
})
