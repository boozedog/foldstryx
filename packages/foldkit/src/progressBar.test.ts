import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { view } from './progressBar.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  sel?: string | undefined
  children?: ReadonlyArray<unknown> | undefined
  text?: string | undefined
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
    props?: Readonly<Record<string, unknown>>
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

const findByRole = (node: Node, role: string): Node | undefined => {
  if (node.data?.attrs?.['role'] === role) return node
  if (node.children === undefined) return undefined
  for (const child of node.children) {
    const found = findByRole(child as Node, role)
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

describe('ProgressBar', () => {
  it('renders determinate progress with aria values', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view({ label: 'Upload', value: 75, max: 100, variant: 'success' }, h),
      ),
    )
    const bar = findByRole(root, 'progressbar')
    expect(bar).toBeDefined()
    expect(bar?.data?.attrs?.['aria-valuenow']).toBe('75')
    expect(bar?.data?.attrs?.['aria-valuemax']).toBe('100')
    expect(collectText(root)).toContain('Upload')
  })

  it('renders value label when requested', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view({ label: 'Disk', value: 30, hasValueLabel: true }, h),
      ),
    )
    expect(collectText(root)).toContain('30%')
  })

  it('renders indeterminate mode without aria-valuenow', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view(
          { label: 'Loading', isIndeterminate: true, variant: 'warning' },
          h,
        ),
      ),
    )
    const bar = findByRole(root, 'progressbar')!
    expect(bar.data?.attrs?.['aria-valuenow']).toBeUndefined()
    const fill = (bar.children as ReadonlyArray<Node>)[0]!
    expect(hasSx(fill, 'indeterminateFill')).toBe(true)
    expect(hasSx(fill, 'variantWarning')).toBe(true)
  })

  it('clamps value and handles disabled variant styling', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view({ label: 'Canceled', value: 200, max: 100, isDisabled: true }, h),
      ),
    )
    const bar = findByRole(root, 'progressbar')!
    expect(bar.data?.attrs?.['aria-valuenow']).toBe('100')
    const fill = (bar.children as ReadonlyArray<Node>)[0]!
    expect(hasSx(fill, 'variantDisabled')).toBe(true)
  })
})
