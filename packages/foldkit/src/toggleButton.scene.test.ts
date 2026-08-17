import { Match as M, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'

import * as ToggleButton from './toggleButton.js'

const Pressed = m('Pressed', { next: S.Boolean })
const ViewChanged = m('ViewChanged', { value: S.NullOr(S.String) })
const MultiChanged = m('MultiChanged', { value: S.Array(S.String) })
const Message = S.Union([Pressed, ViewChanged, MultiChanged])
type Message = typeof Message.Type
type Model = Readonly<{
  pressed: boolean
  view: string | null
  multi: ReadonlyArray<string>
}>

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<never>]>(),
    M.tagsExhaustive({
      Pressed: ({ next }) => [{ ...model, pressed: next }, []],
      ViewChanged: ({ value }) => [{ ...model, view: value }, []],
      MultiChanged: ({ value }) => [{ ...model, multi: value }, []],
    }),
  )

describe('ToggleButton scene', () => {
  const standaloneView = (model: Model, h: HtmlBuilder<Message>) =>
    h.div(
      [],
      [
        ToggleButton.view(
          {
            label: 'Bold',
            isPressed: model.pressed,
            onPressedChange: next => Pressed({ next }),
          },
          h,
        ),
        h.span([h.Id('state')], [model.pressed ? 'on' : 'off']),
      ],
    )

  it('toggles aria-pressed on click', () => {
    Scene.scene(
      { update, view: standaloneView },
      Scene.given({ pressed: false, view: null, multi: [] }),
      Scene.expect(Scene.role('button', { name: 'Bold' })).toHaveAttr(
        'aria-pressed',
        'false',
      ),
      Scene.click(Scene.role('button', { name: 'Bold' })),
      Scene.expect(Scene.role('button', { name: 'Bold' })).toHaveAttr(
        'aria-pressed',
        'true',
      ),
      Scene.expect(Scene.selector('#state')).toHaveText('on'),
    )
  })

  it('does not toggle when disabled', () => {
    const disabledView = (model: Model, h: HtmlBuilder<Message>) =>
      ToggleButton.view(
        {
          label: 'Bold',
          isPressed: model.pressed,
          onPressedChange: next => Pressed({ next }),
          isDisabled: true,
        },
        h,
      )

    Scene.scene(
      { update, view: disabledView },
      Scene.given({ pressed: false, view: null, multi: [] }),
      Scene.expect(Scene.role('button', { name: 'Bold' })).toBeDisabled(),
      Scene.expect(Scene.role('button', { name: 'Bold' })).toHaveAttr(
        'aria-pressed',
        'false',
      ),
    )
  })

  const groupView = (model: Model, h: HtmlBuilder<Message>) =>
    ToggleButton.groupView(
      {
        label: 'View mode',
        value: model.view,
        onChange: value => ViewChanged({ value }),
        items: [
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' },
        ],
      },
      h,
    )

  it('single-select group updates pressed item', () => {
    Scene.scene(
      { update, view: groupView },
      Scene.given({ pressed: false, view: null, multi: [] }),
      Scene.click(Scene.role('button', { name: 'Grid' })),
      Scene.expect(Scene.role('button', { name: 'Grid' })).toHaveAttr(
        'aria-pressed',
        'true',
      ),
      Scene.click(Scene.role('button', { name: 'Grid' })),
      Scene.expect(Scene.role('button', { name: 'Grid' })).toHaveAttr(
        'aria-pressed',
        'false',
      ),
    )
  })

  const multiView = (model: Model, h: HtmlBuilder<Message>) =>
    ToggleButton.groupView(
      {
        label: 'Filters',
        type: 'multiple',
        value: model.multi,
        onChange: value => MultiChanged({ value }),
        items: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
      h,
    )

  it('multi-select group toggles membership', () => {
    Scene.scene(
      { update, view: multiView },
      Scene.given({ pressed: false, view: null, multi: [] }),
      Scene.click(Scene.role('button', { name: 'A' })),
      Scene.expect(Scene.role('button', { name: 'A' })).toHaveAttr(
        'aria-pressed',
        'true',
      ),
      Scene.click(Scene.role('button', { name: 'B' })),
      Scene.expect(Scene.role('button', { name: 'B' })).toHaveAttr(
        'aria-pressed',
        'true',
      ),
      Scene.expect(Scene.role('button', { name: 'A' })).toHaveAttr(
        'aria-pressed',
        'true',
      ),
    )
  })
})
