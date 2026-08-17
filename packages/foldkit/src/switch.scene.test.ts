import { Match as M, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'
import { evo } from 'foldkit/struct'

import { describe, it } from '@effect/vitest'

import * as Switch from './switch.js'

const Toggled = m('Toggled', { isChecked: S.Boolean })
const Message = S.Union([Toggled])
type Message = typeof Message.Type

type Model = Readonly<{ enabled: boolean }>

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<never>]>(),
    M.tagsExhaustive({
      Toggled: ({ isChecked }) => [
        evo(model, { enabled: () => isChecked }),
        [],
      ],
    }),
  )

const switchView = (model: Model, h: HtmlBuilder<Message>) =>
  h.div(
    [],
    [
      Switch.view(
        {
          id: 'notifications',
          isChecked: model.enabled,
          onToggle: isChecked => Toggled({ isChecked }),
          label: 'Notifications',
        },
        h,
      ),
      h.span([h.Id('state')], [model.enabled ? 'on' : 'off']),
    ],
  )

describe('Switch scene', () => {
  it('renders a labelled switch reflecting parent state', () => {
    Scene.scene(
      { update, view: switchView },
      Scene.given({ enabled: true }),
      Scene.expect(Scene.role('switch', { name: 'Notifications' })).toExist(),
      Scene.expect(Scene.role('switch')).toHaveAttr('aria-checked', 'true'),
      Scene.expect(Scene.selector('#state')).toHaveText('on'),
    )
  })

  it('toggles through the parent-owned onToggle message', () => {
    Scene.scene(
      { update, view: switchView },
      Scene.given({ enabled: false }),
      Scene.expect(Scene.role('switch')).toHaveAttr('aria-checked', 'false'),
      Scene.click(Scene.role('switch', { name: 'Notifications' })),
      Scene.expect(Scene.role('switch')).toHaveAttr('aria-checked', 'true'),
      Scene.expect(Scene.selector('#state')).toHaveText('on'),
      Scene.click(Scene.role('switch', { name: 'Notifications' })),
      Scene.expect(Scene.role('switch')).toHaveAttr('aria-checked', 'false'),
      Scene.expect(Scene.selector('#state')).toHaveText('off'),
    )
  })

  it('disables toggling when isDisabled', () => {
    const disabledView = (model: Model, h: HtmlBuilder<Message>) =>
      h.div(
        [],
        [
          Switch.view(
            {
              id: 'notifications',
              isChecked: model.enabled,
              onToggle: isChecked => Toggled({ isChecked }),
              label: 'Notifications',
              isDisabled: true,
            },
            h,
          ),
          h.span([h.Id('state')], [model.enabled ? 'on' : 'off']),
        ],
      )
    Scene.scene(
      { update, view: disabledView },
      Scene.given({ enabled: false }),
      Scene.expect(Scene.role('switch')).toHaveAttr('aria-disabled', 'true'),
      Scene.expect(Scene.role('switch')).toBeDisabled(),
      Scene.expect(Scene.role('switch')).not.toHaveHandler('click'),
      Scene.expect(Scene.role('switch')).toHaveAttr('aria-checked', 'false'),
      Scene.expect(Scene.selector('#state')).toHaveText('off'),
    )
  })
})
