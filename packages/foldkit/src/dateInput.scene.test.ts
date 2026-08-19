import { Option } from 'effect'
import * as Calendar from 'foldkit/calendar'
import type { HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import * as Story from 'foldkit/story'

import { describe, it } from '@effect/vitest'
import {
  type Message,
  type Model,
  RequestedSelectDate,
  SelectedDate,
} from '@foldkit/ui/datePicker'
import {
  AnchorPopover,
  CompletedAnchorPopover,
  CompletedPortalPopoverBackdrop,
  PortalPopoverBackdrop,
} from '@foldkit/ui/popover'

import * as DateInput from './dateInput.js'

const today = Calendar.make(2026, 8, 19)
const anchor = { placement: 'bottom-start', gap: 4, padding: 8 } as const

const sceneView = (model: Model, h: HtmlBuilder<Message>) =>
  h.submodel({
    slotId: 'picker',
    model,
    view: DateInput.view,
    viewInputs: DateInput.styledViewInputs(
      {
        maybeIsoDate: Option.none(),
        placeholder: 'Select date…',
      },
      h,
    ),
    toParentMessage: message => message,
  })

const trigger = Scene.role('button', { name: 'Select date…' })

const resolveOpen = [
  Scene.Mount.resolve(
    AnchorPopover({
      buttonId: 'picker-popover-button',
      anchor,
      focusSelector: '#picker-calendar-grid',
    }),
    CompletedAnchorPopover(),
  ),
  Scene.Mount.resolve(PortalPopoverBackdrop, CompletedPortalPopoverBackdrop()),
]

describe('DateInput scene', () => {
  it('opens from the trigger and renders the calendar grid', () => {
    Scene.scene(
      { update: DateInput.update, view: sceneView },
      Scene.given(DateInput.init({ id: 'picker', today })),
      Scene.click(trigger),
      ...resolveOpen,
      Scene.expect(Scene.role('grid', { name: /August/i })).toExist(),
    )
  })

  it('emits SelectedDate as ISO at the boundary', () => {
    Story.story(
      DateInput.update,
      Story.given(DateInput.init({ id: 'picker', today })),
      Story.message(RequestedSelectDate({ date: today })),
      Story.expectOutMessage(SelectedDate({ date: today })),
    )
  })
})
