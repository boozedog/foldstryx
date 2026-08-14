import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { init, styledViewInputs, update, view } from './dialog.js'
import { renderSubmodel } from './renderHelper.js'

type Node = Readonly<{
  sel?: string | undefined
  children?: ReadonlyArray<unknown> | undefined
  text?: string | undefined
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    props?: Readonly<Record<string, string>>
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

const render = (config: Parameters<typeof styledViewInputs>[0]) => {
  const model = init({ id: config.id, isOpen: true })
  return asNode(
    renderSubmodel(m => view(m, styledViewInputs(config)), model, update),
  )
}

const find = (node: Node, sel: string): Node | undefined => {
  if (node.sel === sel) return node
  for (const child of node.children ?? []) {
    const found = find(child as Node, sel)
    if (found !== undefined) return found
  }
  return undefined
}

const findByProp = (
  node: Node,
  prop: string,
  value: string,
): Node | undefined => {
  if (node.data?.props?.[prop] === value) return node
  for (const child of node.children ?? []) {
    const found = findByProp(child as Node, prop, value)
    if (found !== undefined) return found
  }
  return undefined
}

describe('Dialog', () => {
  it('renders a dialog element with the open style when visible', () => {
    const root = render({ id: 'd', title: 'Confirm' })
    expect(root.sel).toBe('dialog')
    expect(hasSx(root, 'dialog')).toBe(true)
    expect(hasSx(root, 'dialogOpen')).toBe(true)
  })

  it('renders title and description with labelledby/describedby ids', () => {
    const root = render({ id: 'd', title: 'Confirm', description: 'Details' })
    const title = find(root, 'h2')
    const description = find(root, 'p')
    expect(title?.data?.props?.['id']).toBe('d-title')
    expect(description?.data?.props?.['id']).toBe('d-description')
    expect(root.data?.attrs?.['aria-labelledby']).toBe('d-title')
    expect(root.data?.attrs?.['aria-describedby']).toBe('d-description')
    expect(collectText(root)).toContain('Confirm')
    expect(collectText(root)).toContain('Details')
  })

  it('does not point aria-describedby at a missing node when title-only', () => {
    const root = render({ id: 'd', title: 'Confirm' })
    expect(find(root, 'p')).toBeUndefined()
    expect(root.data?.attrs?.['aria-labelledby']).toBe('d-title')
    expect(root.data?.attrs?.['aria-describedby']).toBe('')
  })

  it('renders a close button with aria-label when showClose is true', () => {
    const root = render({ id: 'd', title: 'Confirm', showClose: true })
    const close = find(root, 'button')
    expect(close?.data?.attrs?.['aria-label']).toBe('Close')
    expect(hasSx(close as Node, 'close')).toBe(true)
  })

  it('omits the close button when showClose is false', () => {
    const root = render({ id: 'd', title: 'Confirm' })
    expect(find(root, 'button')).toBeUndefined()
  })

  it('applies the sm panel size style', () => {
    const root = render({ id: 'd', title: 'Confirm', panelSize: 'sm' })
    const panel = findByProp(root, 'id', 'd-panel')
    expect(hasSx(panel as Node, 'panelSm')).toBe(true)
  })

  it('renders body and footer slots', () => {
    const body = { sel: 'p', children: ['Body'] } as unknown as Html
    const footer = { sel: 'button', children: ['OK'] } as unknown as Html
    const root = render({
      id: 'd',
      title: 'Confirm',
      body: [body],
      footer: [footer],
    })
    expect(collectText(root)).toContain('Body')
    expect(collectText(root)).toContain('OK')
  })
})
