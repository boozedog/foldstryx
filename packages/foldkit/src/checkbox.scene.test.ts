import { Match as M, Schema as S } from 'effect'
import { html } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'
import { evo } from 'foldkit/struct'

import { describe, it } from '@effect/vitest'

import { control } from './checkbox.js'

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

const controlView = (model: Model) => {
  const h = html<Message>()

  return h.div(
    [],
    [
      control({
        id: 'agree',
        checked: model.checked,
        label: 'I agree',
        onChange: checked => Toggled({ checked }),
      }),
      h.span([h.Id('state')], [model.checked ? 'checked' : 'unchecked']),
    ],
  )
}

describe('Checkbox.control scene', () => {
  it('renders labeled checkbox', () => {
    Scene.scene(
      { update, view: controlView },
      Scene.with({ checked: false }),
      Scene.expect(Scene.role('checkbox', { name: 'I agree' })).toExist(),
      Scene.expect(Scene.selector('#state')).toHaveText('unchecked'),
    )
  })

  it('toggles checked on click', () => {
    Scene.scene(
      { update, view: controlView },
      Scene.with({ checked: false }),
      Scene.click(Scene.role('checkbox', { name: 'I agree' })),
      Scene.expect(Scene.selector('#state')).toHaveText('checked'),
    )
  })
})
