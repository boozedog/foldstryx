import type { HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'
import {
  AnchorMenu,
  CompletedAnchorMenu,
  CompletedFocusButton,
  CompletedFocusItems,
  CompletedPortalMenuBackdrop,
  FocusButton,
  FocusItems,
  type Message as MenuMessage,
  type Model as MenuModel,
  PortalMenuBackdrop,
} from '@foldkit/ui/menu'

import * as ContextMenu from './contextMenu.js'
import * as DropdownMenu from './dropdownMenu.js'

type Item = 'open'

const DemoMenu = DropdownMenu.create<Item>()

type Model = Readonly<{
  menu: MenuModel
  anchor: ContextMenu.ContextMenuAnchor
}>

type Message =
  | typeof ContextMenu.ContextMenuOpened.Type
  | typeof ContextMenu.CompletedAttachContextMenu.Type
  | MenuMessage

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReturnType<typeof DemoMenu.update>[1]] => {
  switch (message._tag) {
    case 'CompletedAttachContextMenu':
      return [model, []]
    case 'ContextMenuOpened': {
      const [menu, commands] = DemoMenu.open(model.menu)
      return [
        {
          menu,
          anchor: { x: message.offsetX, y: message.offsetY },
        },
        commands,
      ]
    }
    default: {
      const [menu, commands] = DemoMenu.update(model.menu, message)
      return [{ ...model, menu }, commands]
    }
  }
}

const sceneView = (model: Model, h: HtmlBuilder<Message>) =>
  ContextMenu.view<Item, Message>(
    {
      menu: DemoMenu,
      menuModel: model.menu,
      menuSlotId: 'ctx-menu',
      items: ['open'],
      itemSpec: () => ({ label: 'Open' }),
      anchor: model.anchor,
      toContextMenuOpened: message => message,
      toMenuMessage: message => message,
      trigger: h.div([], ['Surface']),
    },
    h,
  )

const openItem = Scene.role('menuitem', { name: 'Open' })
const menu = Scene.selector('[role="menu"]')
const anchor = { placement: 'bottom-start', gap: 0, padding: 8 } as const

const acknowledgeAttachMount = Scene.Mount.resolve(
  ContextMenu.attachMount,
  ContextMenu.CompletedAttachContextMenu() as unknown as typeof ContextMenu.ContextMenuOpened.Type,
)

const resolveOpen = [
  Scene.Command.resolve(FocusItems({ id: 'ctx-menu' }), CompletedFocusItems()),
  Scene.Mount.resolve(
    AnchorMenu({ buttonId: 'ctx-menu-button', anchor }),
    CompletedAnchorMenu(),
  ),
  Scene.Mount.resolve(PortalMenuBackdrop, CompletedPortalMenuBackdrop()),
]

const resolveClose = [
  Scene.Command.resolve(
    FocusButton({ id: 'ctx-menu' }),
    CompletedFocusButton(),
  ),
]

describe('ContextMenu scene', () => {
  it('opens at the cursor offset and renders a menu item', () => {
    Scene.scene(
      { update, view: sceneView },
      Scene.given({
        menu: DropdownMenu.init({ id: 'ctx-menu' }),
        anchor: { x: 0, y: 0 },
      }),
      acknowledgeAttachMount,
      Scene.Subscription.emit(
        ContextMenu.ContextMenuOpened({ offsetX: 12, offsetY: 34 }),
      ),
      ...resolveOpen,
      Scene.expect(Scene.selector('#ctx-menu-button')).toHaveAttr(
        'aria-hidden',
        'true',
      ),
      Scene.expect(Scene.selector('#ctx-menu-button')).toHaveAttr(
        'tabIndex',
        '-1',
      ),
      Scene.expect(openItem).toExist(),
    )
  })

  it('closes on Escape', () => {
    Scene.scene(
      { update, view: sceneView },
      Scene.given({
        menu: DropdownMenu.init({ id: 'ctx-menu' }),
        anchor: { x: 0, y: 0 },
      }),
      acknowledgeAttachMount,
      Scene.Subscription.emit(
        ContextMenu.ContextMenuOpened({ offsetX: 8, offsetY: 8 }),
      ),
      ...resolveOpen,
      Scene.keydown(menu, 'Escape'),
      ...resolveClose,
      Scene.Mount.expectEnded(
        AnchorMenu({ buttonId: 'ctx-menu-button', anchor }),
        PortalMenuBackdrop,
      ),
      Scene.expect(openItem).toBeAbsent(),
    )
  })
})
