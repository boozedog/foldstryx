import type { Html } from 'foldkit/html'
import * as Scene from 'foldkit/scene'

import { describe, expect, it } from '@effect/vitest'
import {
  AnchorMenu,
  CompletedAnchorMenu,
  CompletedPortalMenuBackdrop,
  Message,
  PortalMenuBackdrop,
} from '@foldkit/ui/menu'

import * as DropdownMenu from './dropdownMenu.js'

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

type Item = 'edit' | 'delete'

const DemoMenu = DropdownMenu.create<Item>()

const render = () => {
  const closed = DropdownMenu.init({ id: 'm' })
  const [model] = DemoMenu.open(closed)
  let result: Html = null
  Scene.scene(
    {
      update: DemoMenu.update,
      view: (m, h) =>
        DemoMenu.view(
          m,
          DropdownMenu.styledViewInputs<Item, Message>(
            {
              items: ['edit', 'delete'],
              buttonContent: 'Actions' as unknown as Html,
              itemSpec: item =>
                item === 'delete'
                  ? { label: 'Delete', variant: 'destructive' }
                  : { label: 'Edit' },
            },
            h,
          ),
          h,
        ),
    },
    Scene.given(model),
    Scene.Mount.resolve(
      AnchorMenu({
        buttonId: 'm-button',
        anchor: { placement: 'bottom-start', gap: 4, padding: 8 },
      }),
      CompletedAnchorMenu(),
    ),
    Scene.Mount.resolve(PortalMenuBackdrop, CompletedPortalMenuBackdrop()),
    Scene.tap(simulation => {
      result = simulation.html
    }),
  )
  return asNode(result)
}

describe('DropdownMenu', () => {
  it('renders the trigger button with the provided content', () => {
    const root = render()
    const buttons = findAll(root, 'button')
    expect(buttons.length).toBeGreaterThan(0)
    expect(collectText(buttons[0] as Node)).toBe('Actions')
  })

  it('renders menu items with role=menuitem and labels', () => {
    const root = render()
    const items = findAll(root, 'div').filter(
      n => n.data?.attrs?.['role'] === 'menuitem',
    )
    expect(items.length).toBeGreaterThan(0)
    expect(collectText(root)).toContain('Edit')
    expect(collectText(root)).toContain('Delete')
  })

  it('applies the destructive variant style to destructive items', () => {
    const root = render()
    const items = findAll(root, 'div').filter(
      n => n.data?.attrs?.['role'] === 'menuitem',
    )
    const deleteItem = items.find(n => collectText(n).includes('Delete'))
    expect(hasSx(deleteItem as Node, 'itemDestructive')).toBe(true)
  })
})
