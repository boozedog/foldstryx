import { Match as M, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'

import * as Grid from './grid.js'
import { CompletedGridFocus, mount as gridFocusMount } from './gridFocus.js'
import * as ToggleButton from './toggleButton.js'

const CellPressed = m('CellPressed', { index: S.Finite, next: S.Boolean })
const Message = S.Union([CellPressed, CompletedGridFocus])
type Message = typeof Message.Type

type Model = Readonly<{
  pressed: ReadonlyArray<boolean>
  disabled: ReadonlyArray<boolean>
}>

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<never>]>(),
    M.tagsExhaustive({
      CellPressed: ({ index, next }) => [
        {
          ...model,
          pressed: model.pressed.map((value, i) =>
            i === index ? next : value,
          ),
        },
        [],
      ],
      CompletedGridFocus: () => [model, []],
    }),
  )

const acknowledgeGridFocus = Scene.Mount.resolve(
  gridFocusMount,
  CompletedGridFocus(),
)

const matrixView = (model: Model, h: HtmlBuilder<Message>) =>
  Grid.matrix(
    {
      columns: 3,
      ariaLabel: 'Matrix',
      children: model.pressed.map((isPressed, index) =>
        Grid.gridcell(
          [
            ToggleButton.view(
              {
                label: `Cell ${index}`,
                isPressed,
                isDisabled: model.disabled[index] === true,
                onPressedChange: next => CellPressed({ index, next }),
              },
              h,
            ),
          ],
          h,
        ),
      ),
    },
    h,
    message => message,
  )

const cell0 = Scene.role('button', { name: 'Cell 0' })
const cell1 = Scene.role('button', { name: 'Cell 1' })
const grid = Scene.role('grid', { name: 'Matrix' })

describe('GridFocus scene', () => {
  it('renders role=grid with keyboard navigation mount', () => {
    Scene.scene(
      { update, view: matrixView },
      Scene.given({
        pressed: [true, false, false, false, false, false, false, false, false],
        disabled: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
      }),
      Scene.expect(grid).toExist(),
      Scene.expect(grid).toHaveHook('insert'),
      Scene.expect(grid).toHaveHandler('keydown'),
      Scene.expect(cell0).toHaveAttr('aria-pressed', 'true'),
      acknowledgeGridFocus,
    )
  })

  it('consumes ArrowRight on the grid without dispatching a Message', () => {
    Scene.scene(
      { update, view: matrixView },
      Scene.given({
        pressed: [true, false, false, false, false, false, false, false, false],
        disabled: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
      }),
      acknowledgeGridFocus,
      Scene.keydown(grid, 'ArrowRight'),
      Scene.expectIgnored(),
      Scene.expect(cell0).toHaveAttr('aria-pressed', 'true'),
    )
  })

  it('ignores ArrowRight when the next cell is disabled', () => {
    Scene.scene(
      { update, view: matrixView },
      Scene.given({
        pressed: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        disabled: [
          false,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
      }),
      acknowledgeGridFocus,
      Scene.click(cell0),
      Scene.keydown(grid, 'ArrowRight'),
      Scene.expectIgnored(),
      Scene.expect(cell1).toBeDisabled(),
    )
  })
})
