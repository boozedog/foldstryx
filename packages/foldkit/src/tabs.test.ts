import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { renderSubmodel } from './renderHelper.js'
import * as Tabs from './tabs.js'

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

const findAll = (node: Node, sel: string): ReadonlyArray<Node> => {
  const out: Array<Node> = []
  if (node.sel === sel) out.push(node)
  for (const child of node.children ?? []) {
    out.push(...findAll(child as Node, sel))
  }
  return out
}

const findByAttr = (
  node: Node,
  attr: string,
  value: string,
): Node | undefined => {
  if (node.data?.attrs?.[attr] === value) return node
  for (const child of node.children ?? []) {
    const found = findByAttr(child as Node, attr, value)
    if (found !== undefined) return found
  }
  return undefined
}

type TabValue = 'overview' | 'details'

const DemoTabs = Tabs.create<TabValue>()

const render = (activeIndex = 0) => {
  const model = Tabs.init({ id: 't' })
  const selectedValue = ['overview', 'details'][activeIndex] as TabValue
  return asNode(
    renderSubmodel(
      (m, h) =>
        DemoTabs.view(
          m,
          DemoTabs.styledViewInputs(
            {
              selectedValue,
              tabs: ['overview', 'details'],
              ariaLabel: 'Demo tabs',
              renderPanel: value => value as unknown as Html,
            },
            h,
          ),
          h,
        ),
      model,
      DemoTabs.update,
    ),
  )
}

describe('Tabs', () => {
  it('renders a tablist with role=tablist and aria-label', () => {
    const root = render()
    const tablist = findByAttr(root, 'role', 'tablist')
    expect(tablist?.data?.attrs?.['role']).toBe('tablist')
    expect(tablist?.data?.attrs?.['aria-label']).toBe('Demo tabs')
    expect(hasSx(tablist as Node, 'list')).toBe(true)
  })

  it('renders one tab button per value with role=tab', () => {
    const root = render()
    const tabs = findAll(root, 'button')
    expect(tabs).toHaveLength(2)
    expect(tabs[0]?.data?.attrs?.['role']).toBe('tab')
    expect(collectText(tabs[0] as Node)).toBe('overview')
    expect(collectText(tabs[1] as Node)).toBe('details')
  })

  it('marks the active tab with the active style', () => {
    const root = render(1)
    const tabs = findAll(root, 'button')
    expect(hasSx(tabs[0] as Node, 'trigger')).toBe(true)
    expect(hasSx(tabs[0] as Node, 'triggerActive')).toBe(false)
    expect(hasSx(tabs[1] as Node, 'triggerActive')).toBe(true)
  })

  it('renders only the active panel', () => {
    const root = render(1)
    const panel = findByAttr(root, 'role', 'tabpanel')
    expect(collectText(panel as Node)).toContain('details')
    expect(collectText(panel as Node)).not.toContain('overview')
  })

  it('renders the panel with role=tabpanel', () => {
    const root = render(0)
    const panels = findAll(root, 'div').filter(
      n => n.data?.attrs?.['role'] === 'tabpanel',
    )
    expect(panels).toHaveLength(1)
    expect(hasSx(panels[0] as Node, 'content')).toBe(true)
  })
})
