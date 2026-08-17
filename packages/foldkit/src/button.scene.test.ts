import { Match as M, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'

import * as Button from './button.js'

const Clicked = m('Clicked')
const Message = S.Union([Clicked])
type Message = typeof Message.Type
type Model = Readonly<{ clicked: boolean }>

const update = (
  _model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<never>]>(),
    M.tagsExhaustive({ Clicked: () => [{ clicked: true }, []] }),
  )

const view = (model: Model, h: HtmlBuilder<Message>, disabled = false) => {
  return h.div(
    [],
    [
      Button.view(
        {
          label: disabled ? 'Disabled' : 'Save',
          onClick: Clicked(),
          isDisabled: disabled,
        },
        h,
      ),
      h.span([h.Id('state')], [model.clicked ? 'clicked' : 'idle']),
    ],
  )
}

describe('Button scene', () => {
  it('delivers click messages', () => {
    Scene.scene(
      { update, view: (model, h) => view(model, h) },
      Scene.given({ clicked: false }),
      Scene.click(Scene.role('button', { name: 'Save' })),
      Scene.expect(Scene.selector('#state')).toHaveText('clicked'),
    )
  })

  it('does not deliver click messages when disabled', () => {
    Scene.scene(
      { update, view: (model, h) => view(model, h, true) },
      Scene.given({ clicked: false }),
      Scene.expect(Scene.role('button', { name: 'Disabled' })).toBeDisabled(),
      Scene.expect(Scene.selector('#state')).toHaveText('idle'),
    )
  })
})
