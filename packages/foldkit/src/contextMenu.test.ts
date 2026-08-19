import type { Html } from 'foldkit/html'
import * as Scene from 'foldkit/scene'

import { describe, expect, it } from '@effect/vitest'
import type { Message as MenuMessage } from '@foldkit/ui/menu'

import * as ContextMenu from './contextMenu.js'
import * as DropdownMenu from './dropdownMenu.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  data?: Readonly<{
    class?: Readonly<Record<string, boolean>>
    style?: Readonly<Record<string, string>>
  }>
}>

const asNode = (html: Html): Node => {
  if (html === null) throw new Error('expected VNode')
  return html as Node
}

const hasSx = (node: Node, key: string): boolean =>
  node.data?.class?.[`sx-${key}`] === true

const DemoMenu = DropdownMenu.create<'open'>()

type TestMessage =
  | MenuMessage
  | typeof ContextMenu.ContextMenuOpened.Type
  | typeof ContextMenu.CompletedAttachContextMenu.Type

describe('ContextMenu.view', () => {
  it('positions a zero-size anchor inside the trigger', () => {
    const root = asNode(
      renderWithBuilder<TestMessage>(
        h =>
          ContextMenu.view(
            {
              menu: DemoMenu,
              menuModel: DropdownMenu.init({ id: 'ctx' }),
              menuSlotId: 'ctx-menu',
              items: ['open'],
              itemSpec: () => ({ label: 'Open' }),
              anchor: { x: 12, y: 34 },
              toContextMenuOpened: message => message,
              toMenuMessage: message => message,
              trigger: h.div([], ['Trigger']),
            },
            h,
          ),
        Scene.Mount.resolve(
          ContextMenu.attachMount,
          ContextMenu.CompletedAttachContextMenu() as unknown as typeof ContextMenu.ContextMenuOpened.Type,
        ),
      ),
    )

    expect(hasSx(root, 'relative')).toBe(true)
    const anchor = asNode(root.children?.[1] as Html)
    expect(hasSx(anchor, 'contextMenuAnchor')).toBe(true)
    expect(hasSx(anchor, 'contextMenuOffset')).toBe(true)
  })
})
