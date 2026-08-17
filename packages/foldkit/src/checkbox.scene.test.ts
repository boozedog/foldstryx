import { Match as M, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'
import { evo } from 'foldkit/struct'

import { describe, it } from '@effect/vitest'

import { control, view as styledCheckboxView } from './checkbox.js'

const Toggled = m('Toggled', { checked: S.Boolean })
const Message = S.Union([Toggled])
type Message = typeof Message.Type

type Model = Readonly<{ checked: boolean }>

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<never>]>(),
    M.tagsExhaustive({
      Toggled: ({ checked }) => [evo(model, { checked: () => checked }), []],
    }),
  )

const controlView = (model: Model, h: HtmlBuilder<Message>) =>
  h.div(
    [],
    [
      control(
        {
          id: 'agree',
          checked: model.checked,
          label: 'I agree',
          onChange: checked => Toggled({ checked }),
        },
        h,
      ),
      h.span([h.Id('state')], [model.checked ? 'checked' : 'unchecked']),
    ],
  )

describe('Checkbox.control scene', () => {
  it('renders labeled checkbox', () => {
    Scene.scene(
      { update, view: controlView },
      Scene.given({ checked: false }),
      Scene.expect(Scene.role('checkbox', { name: 'I agree' })).toExist(),
      Scene.expect(Scene.selector('#state')).toHaveText('unchecked'),
    )
  })

  it('toggles checked on click', () => {
    Scene.scene(
      { update, view: controlView },
      Scene.given({ checked: false }),
      Scene.click(Scene.role('checkbox', { name: 'I agree' })),
      Scene.expect(Scene.selector('#state')).toHaveText('checked'),
    )
  })
})

describe('Checkbox.view (styled controlled)', () => {
  const styledView = (model: Model, h: HtmlBuilder<Message>) =>
    h.div(
      [],
      [
        styledCheckboxView(
          {
            id: 'agree',
            isChecked: model.checked,
            onToggle: checked => Toggled({ checked }),
            label: 'I agree',
          },
          h,
        ),
        h.span([h.Id('state')], [model.checked ? 'checked' : 'unchecked']),
      ],
    )

  it('renders a labelled checkbox reflecting parent state', () => {
    Scene.scene(
      { update, view: styledView },
      Scene.given({ checked: true }),
      Scene.expect(Scene.role('checkbox', { name: 'I agree' })).toExist(),
      Scene.expect(Scene.role('checkbox')).toHaveAttr('aria-checked', 'true'),
      Scene.expect(Scene.selector('#state')).toHaveText('checked'),
    )
  })

  it('toggles through the parent-owned onToggle message', () => {
    Scene.scene(
      { update, view: styledView },
      Scene.given({ checked: false }),
      Scene.click(Scene.role('checkbox', { name: 'I agree' })),
      Scene.expect(Scene.role('checkbox')).toHaveAttr('aria-checked', 'true'),
      Scene.expect(Scene.selector('#state')).toHaveText('checked'),
      Scene.click(Scene.role('checkbox', { name: 'I agree' })),
      Scene.expect(Scene.role('checkbox')).toHaveAttr('aria-checked', 'false'),
      Scene.expect(Scene.selector('#state')).toHaveText('unchecked'),
    )
  })

  it('disables toggling when isDisabled', () => {
    const disabledView = (model: Model, h: HtmlBuilder<Message>) =>
      h.div(
        [],
        [
          styledCheckboxView(
            {
              id: 'agree',
              isChecked: model.checked,
              onToggle: checked => Toggled({ checked }),
              label: 'I agree',
              isDisabled: true,
            },
            h,
          ),
          h.span([h.Id('state')], [model.checked ? 'checked' : 'unchecked']),
        ],
      )
    Scene.scene(
      { update, view: disabledView },
      Scene.given({ checked: false }),
      Scene.expect(Scene.role('checkbox')).toHaveAttr('aria-disabled', 'true'),
      Scene.expect(Scene.role('checkbox')).toBeDisabled(),
      Scene.expect(Scene.role('checkbox')).not.toHaveHandler('click'),
      Scene.expect(Scene.role('checkbox')).toHaveAttr('aria-checked', 'false'),
      Scene.expect(Scene.selector('#state')).toHaveText('unchecked'),
    )
  })
})
