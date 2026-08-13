import { Match as M, Schema as S } from 'effect'
import { html } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'

import * as Button from './button.js'
import * as Pagination from './pagination.js'

const Next = m('Next')
const Prev = m('Prev')
const Message = S.Union([Next, Prev])
type Message = typeof Message.Type
type Model = Readonly<{ page: number; total: number }>

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<never>]>(),
    M.tagsExhaustive({
      Next: () =>
        model.page >= model.total
          ? [model, []]
          : [{ ...model, page: model.page + 1 }, []],
      Prev: () =>
        model.page <= 1
          ? [model, []]
          : [{ ...model, page: model.page - 1 }, []],
    }),
  )

const view = (model: Model) => {
  const h = html<Message>()
  return h.div(
    [],
    [
      Pagination.view({
        status: `Page ${model.page} of ${model.total}`,
        previous: Button.view({
          label: 'Previous',
          onClick: Prev(),
          isDisabled: model.page <= 1,
        }),
        next: Button.view({
          label: 'Next',
          onClick: Next(),
          isDisabled: model.page >= model.total,
        }),
      }),
      h.span([h.Id('page')], [String(model.page)]),
    ],
  )
}

describe('Pagination scene', () => {
  it('advances to the next page on Next', () => {
    Scene.scene(
      { update, view },
      Scene.with({ page: 1, total: 3 }),
      Scene.click(Scene.role('button', { name: 'Next' })),
      Scene.expect(Scene.selector('#page')).toHaveText('2'),
    )
  })

  it('moves back to the previous page on Previous', () => {
    Scene.scene(
      { update, view },
      Scene.with({ page: 2, total: 3 }),
      Scene.click(Scene.role('button', { name: 'Previous' })),
      Scene.expect(Scene.selector('#page')).toHaveText('1'),
    )
  })

  it('disables Previous on the first page', () => {
    Scene.scene(
      { update, view },
      Scene.with({ page: 1, total: 3 }),
      Scene.expect(Scene.role('button', { name: 'Previous' })).toBeDisabled(),
      Scene.expect(Scene.selector('#page')).toHaveText('1'),
    )
  })

  it('disables Next on the last page', () => {
    Scene.scene(
      { update, view },
      Scene.with({ page: 3, total: 3 }),
      Scene.expect(Scene.role('button', { name: 'Next' })).toBeDisabled(),
      Scene.expect(Scene.selector('#page')).toHaveText('3'),
    )
  })
})
