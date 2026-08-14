import { html, submodel } from 'foldkit/html'
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
  type Message,
  type Model,
  PortalMenuBackdrop,
} from '@foldkit/ui/menu'

import * as DropdownMenu from './dropdownMenu.js'

type Item = 'edit' | 'delete'

const DemoMenu = DropdownMenu.create<Item>()

const sceneView = (model: Model) => {
  const h = html<Message>()
  return submodel({
    slotId: model.id,
    model,
    view: DemoMenu.view,
    viewInputs: DropdownMenu.styledViewInputs<Item, Message>({
      items: ['edit', 'delete'],
      buttonContent: h.span([], ['Actions']),
      itemSpec: item =>
        item === 'delete'
          ? { label: 'Delete', variant: 'destructive' }
          : { label: 'Edit' },
      isItemDisabled: item => item === 'delete',
    }),
    toParentMessage: message => message,
  })
}

const trigger = Scene.role('button', { name: 'Actions' })
const editItem = Scene.role('menuitem', { name: 'Edit' })
const deleteItem = Scene.role('menuitem', { name: 'Delete' })
const menu = Scene.selector('[role="menu"]')

const anchor = { placement: 'bottom-start', gap: 4, padding: 8 } as const

const resolveOpen = [
  Scene.Command.resolve(FocusItems({ id: 'menu' }), CompletedFocusItems()),
  Scene.Mount.resolve(
    AnchorMenu({ buttonId: 'menu-button', anchor }),
    CompletedAnchorMenu(),
  ),
  Scene.Mount.resolve(PortalMenuBackdrop, CompletedPortalMenuBackdrop()),
]

const resolveClose = [
  Scene.Command.resolve(FocusButton({ id: 'menu' }), CompletedFocusButton()),
]

describe('DropdownMenu scene', () => {
  it('opens on trigger click and renders items', () => {
    Scene.scene(
      { update: DemoMenu.update, view: sceneView },
      Scene.with(DropdownMenu.init({ id: 'menu' })),
      Scene.click(trigger),
      ...resolveOpen,
      Scene.expect(editItem).toExist(),
      Scene.expect(deleteItem).toExist(),
    )
  })

  it('closes on Escape', () => {
    Scene.scene(
      { update: DemoMenu.update, view: sceneView },
      Scene.with(DropdownMenu.init({ id: 'menu' })),
      Scene.click(trigger),
      ...resolveOpen,
      Scene.keydown(menu, 'Escape'),
      ...resolveClose,
      Scene.Mount.expectEnded(
        AnchorMenu({ buttonId: 'menu-button', anchor }),
        PortalMenuBackdrop,
      ),
      Scene.expect(editItem).toBeAbsent(),
    )
  })

  it('marks a disabled item as disabled', () => {
    Scene.scene(
      { update: DemoMenu.update, view: sceneView },
      Scene.with(DropdownMenu.init({ id: 'menu' })),
      Scene.click(trigger),
      ...resolveOpen,
      Scene.expect(deleteItem).toHaveAttr('aria-disabled', 'true'),
    )
  })
})
