import { Match as M, Schema as S } from 'effect'
import { html } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'
import * as Story from 'foldkit/story'

import { describe, expect, it } from '@effect/vitest'

import * as Details from './details.js'

type Model = Readonly<{ open: boolean }>
const Toggled = m('Toggled', { isOpen: S.Boolean })
const Message = S.Union([Toggled])
type Message = typeof Message.Type

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<never>]>(),
    M.tagsExhaustive({
      Toggled: ({ isOpen }) => [{ ...model, open: isOpen }, []],
    }),
  )

const view = (model: Model) => {
  const h = html<Message>()
  return h.div(
    [],
    [
      Details.view({
        summary: 'More info',
        children: ['Hidden details'],
        open: model.open,
        onToggle: isOpen => Toggled({ isOpen }),
      }),
    ],
  )
}

describe('Details scene', () => {
  it('renders the disclosure open when open is true', () => {
    Scene.scene(
      { update, view },
      Scene.with({ open: true }),
      Scene.expect(Scene.selector('details')).toHaveAttr('open'),
      Scene.expect(Scene.selector('details')).toContainText('Hidden details'),
    )
  })

  it('renders the disclosure closed by default', () => {
    Scene.scene(
      { update, view },
      Scene.with({ open: false }),
      Scene.expect(Scene.selector('details')).not.toHaveAttr('open'),
    )
  })

  it('wires the OnToggle handler on the mounted details element', () => {
    Scene.scene(
      { update, view },
      Scene.with({ open: false }),
      Scene.expect(Scene.selector('details')).toHaveHandler('toggle'),
    )
  })

  it('drives open/closed from the OnToggle message', () => {
    Story.story(
      update,
      Story.with({ open: false }),
      Story.message(Toggled({ isOpen: true })),
      Story.model(model => {
        expect(model.open).toBe(true)
      }),
      Story.message(Toggled({ isOpen: false })),
      Story.model(model => {
        expect(model.open).toBe(false)
      }),
      Story.Command.expectNone(),
    )
  })
})
