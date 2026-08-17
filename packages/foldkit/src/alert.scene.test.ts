import { Match as M, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'

import { view } from './alert.js'
import * as Button from './button.js'

const Dismissed = m('Dismissed')
const Message = S.Union([Dismissed])
type Message = typeof Message.Type

type Model = Readonly<{ open: boolean }>

const update = (
  _model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<never>]>(),
    M.tagsExhaustive({
      Dismissed: () => [{ open: false }, []],
    }),
  )

const alertView = (model: Model, h: HtmlBuilder<Message>) => {
  if (!model.open) {
    return h.div([], ['closed'])
  }

  return view<Message>(
    {
      variant: 'destructive',
      body: 'Something went wrong',
      title: 'Error',
      action: Button.view(
        {
          label: 'Dismiss',
          onClick: Dismissed(),
          variant: 'ghost',
          size: 'sm',
        },
        h,
      ),
    },
    h,
  )
}

describe('Alert scene', () => {
  it('exposes alert role and body text', () => {
    Scene.scene(
      { update, view: alertView },
      Scene.given({ open: true }),
      Scene.expect(Scene.role('alert')).toExist(),
      Scene.expect(Scene.text('Something went wrong')).toExist(),
      Scene.expect(Scene.text('Error')).toExist(),
    )
  })

  it('renders compact destructive without action layout', () => {
    const compactView = (_model: Model, h: HtmlBuilder<Message>) =>
      view<Message>(
        {
          variant: 'warning',
          body: 'Review required',
          compact: true,
        },
        h,
      )

    Scene.scene(
      {
        update: () => [{ open: true }, []],
        view: compactView,
      },
      Scene.given({ open: true }),
      Scene.expect(Scene.role('alert')).toExist(),
      Scene.expect(Scene.text('Review required')).toExist(),
    )
  })

  it('fires action message when dismiss is clicked', () => {
    Scene.scene(
      { update, view: alertView },
      Scene.given({ open: true }),
      Scene.click(Scene.role('button', { name: 'Dismiss' })),
      Scene.expect(Scene.text('closed')).toExist(),
    )
  })

  it('renders success variant body', () => {
    const successView = (_model: Model, h: HtmlBuilder<Message>) =>
      view<Message>(
        {
          variant: 'success',
          body: 'Import complete',
        },
        h,
      )

    Scene.scene(
      {
        update: () => [{ open: true }, []],
        view: successView,
      },
      Scene.given({ open: true }),
      Scene.expect(Scene.role('alert')).toExist(),
      Scene.expect(Scene.text('Import complete')).toExist(),
    )
  })
})
