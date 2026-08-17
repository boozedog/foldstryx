import type { HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'
import {
  AnchorListbox,
  CompletedAnchorListbox,
  CompletedFocusButton,
  CompletedFocusItems,
  CompletedPortalListboxBackdrop,
  FocusButton,
  FocusItems,
  type Message,
  type Model,
  PortalListboxBackdrop,
} from '@foldkit/ui/listbox'

import * as Selector from './selector.js'

type Kind = 'all' | 'active'

const KindSelector = Selector.create<Kind>()

const options: ReadonlyArray<Selector.SelectorOption<Kind>> = [
  { value: 'all', label: 'All kinds' },
  { value: 'active', label: 'Active' },
]

const sceneView = (model: Model, h: HtmlBuilder<Message>) =>
  h.submodel({
    slotId: model.id,
    model,
    view: KindSelector.view,
    viewInputs: Selector.styledViewInputs<Kind, Message>(
      {
        options,
        selectedValue: 'all' as Kind,
        density: 'compact',
        width: 'sm',
        ariaLabel: 'Kind',
      },
      h,
    ),
    toParentMessage: message => message,
  })

const trigger = Scene.role('button', { name: 'Kind' })
const allOption = Scene.role('option', { name: 'All kinds' })
const listbox = Scene.selector('[role="listbox"]')

const anchor = { placement: 'bottom-start', gap: 4, padding: 8 } as const

const resolveOpen = [
  Scene.Command.resolve(FocusItems({ id: 'kind' }), CompletedFocusItems()),
  Scene.Mount.resolve(
    AnchorListbox({ buttonId: 'kind-button', anchor }),
    CompletedAnchorListbox(),
  ),
  Scene.Mount.resolve(PortalListboxBackdrop, CompletedPortalListboxBackdrop()),
]

const resolveClose = [
  Scene.Command.resolve(FocusButton({ id: 'kind' }), CompletedFocusButton()),
]

describe('Selector scene', () => {
  it('opens on trigger click and renders options', () => {
    Scene.scene(
      { update: KindSelector.update, view: sceneView },
      Scene.given(Selector.init({ id: 'kind' })),
      Scene.click(trigger),
      ...resolveOpen,
      Scene.expect(allOption).toExist(),
    )
  })

  it('closes on Escape', () => {
    Scene.scene(
      { update: KindSelector.update, view: sceneView },
      Scene.given(Selector.init({ id: 'kind' })),
      Scene.click(trigger),
      ...resolveOpen,
      Scene.keydown(listbox, 'Escape'),
      ...resolveClose,
      Scene.Mount.expectEnded(
        AnchorListbox({ buttonId: 'kind-button', anchor }),
        PortalListboxBackdrop,
      ),
      Scene.expect(allOption).toBeAbsent(),
    )
  })
})
