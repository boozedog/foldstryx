import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { renderWithBuilder } from './renderHelper.js'
import { view } from './spinner.js'

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

describe('Spinner', () => {
  it('renders role=status with default accessible name', () => {
    const root = asNode(renderWithBuilder(h => view({}, h)))
    expect(root.data?.attrs?.['role']).toBe('status')
    expect(root.data?.attrs?.['aria-label']).toBe('Loading')
  })

  it('uses explicit ariaLabel and string label', () => {
    const labeled = asNode(
      renderWithBuilder(h => view({ label: 'Fetching rows…' }, h)),
    )
    expect(collectText(labeled)).toContain('Fetching rows…')
    const status = (labeled.children as ReadonlyArray<Node>)[0]!
    expect(status.data?.attrs?.['aria-label']).toBe('Fetching rows…')

    const custom = asNode(
      renderWithBuilder(h =>
        view({ ariaLabel: 'Syncing', size: 'lg', shade: 'subtle' }, h),
      ),
    )
    expect(custom.data?.attrs?.['aria-label']).toBe('Syncing')
    expect(hasSx(custom, 'sizeLg')).toBe(true)
    expect(hasSx(custom, 'shadeSubtle')).toBe(true)
  })

  it('applies size and shade style keys', () => {
    const node = asNode(
      renderWithBuilder(h => view({ size: 'xl', shade: 'onMedia' }, h)),
    )
    expect(hasSx(node, 'sizeXl')).toBe(true)
    expect(hasSx(node, 'shadeOnMedia')).toBe(true)
    expect(hasSx(node, 'shadeDefault')).toBe(false)
  })

  it('is not role=alert', () => {
    const root = asNode(renderWithBuilder(h => view({}, h)))
    expect(root.data?.attrs?.['role']).not.toBe('alert')
  })
})
