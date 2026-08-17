import { Match as M, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'

import {
  CompletedSyncCheckboxIndeterminate,
  syncIndeterminateMount,
} from './checkbox.js'
import * as Table from './table.js'
import {
  deselectAll,
  getIsAllSelected,
  getIsIndeterminate,
  selectAll,
  toggleItem,
} from './tableSelection.js'

const RowToggled = m('RowToggled', { id: S.String, checked: S.Boolean })
const SelectAllToggled = m('SelectAllToggled', { checked: S.Boolean })
const Message = S.Union([
  RowToggled,
  SelectAllToggled,
  CompletedSyncCheckboxIndeterminate,
])
type Message = typeof Message.Type

type Row = Readonly<{ id: string; label: string; isEnabled?: boolean }>

type Model = Readonly<{
  rows: ReadonlyArray<Row>
  selected: ReadonlySet<string>
}>

const rowItems = (rows: ReadonlyArray<Row>) =>
  rows.map(row => ({
    id: row.id,
    isEnabled: row.isEnabled ?? true,
  }))

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<never>]>(),
    M.tagsExhaustive({
      RowToggled: ({ id, checked }) => [
        {
          ...model,
          selected: toggleItem(model.selected, id, checked),
        },
        [],
      ],
      SelectAllToggled: ({ checked }) => [
        {
          ...model,
          selected: checked
            ? selectAll(rowItems(model.rows), model.selected)
            : deselectAll(rowItems(model.rows), model.selected),
        },
        [],
      ],
      CompletedSyncCheckboxIndeterminate: () => [model, []],
    }),
  )

const mapSyncCheckbox = (
  message: typeof CompletedSyncCheckboxIndeterminate.Type,
): Message => message

const rows: ReadonlyArray<Row> = [
  { id: 'alpha', label: 'Alpha' },
  { id: 'beta', label: 'Beta' },
  { id: 'gamma', label: 'Gamma', isEnabled: false },
]

const view = (model: Model, h: HtmlBuilder<Message>) => {
  const items = rowItems(model.rows)
  const allSelected = getIsAllSelected(items, model.selected)
  const indeterminate = getIsIndeterminate(items, model.selected)

  return Table.wrap(
    [
      Table.table(
        [
          Table.thead(
            [
              Table.tr(
                {
                  children: [
                    Table.selectionHeader(
                      {
                        checked: allSelected,
                        isIndeterminate: indeterminate,
                        onChange: checked => SelectAllToggled({ checked }),
                      },
                      h,
                      mapSyncCheckbox,
                    ),
                    Table.th('Name', h),
                  ],
                },
                h,
              ),
            ],
            h,
          ),
          Table.tbody(
            model.rows.map(row =>
              Table.tr(
                {
                  isSelected: model.selected.has(row.id),
                  children: [
                    Table.selectionCell(
                      {
                        rowId: row.id,
                        rowLabel: row.label,
                        checked: model.selected.has(row.id),
                        onChange: checked =>
                          RowToggled({ id: row.id, checked }),
                        isDisabled: row.isEnabled === false,
                      },
                      h,
                      mapSyncCheckbox,
                    ),
                    Table.td(row.label, h),
                  ],
                },
                h,
              ),
            ),
            h,
          ),
        ],
        h,
      ),
    ],
    h,
  )
}

const acknowledgeSelectionMounts = Scene.Mount.resolveAll(
  [syncIndeterminateMount, CompletedSyncCheckboxIndeterminate()],
  [syncIndeterminateMount, CompletedSyncCheckboxIndeterminate()],
  [syncIndeterminateMount, CompletedSyncCheckboxIndeterminate()],
  [syncIndeterminateMount, CompletedSyncCheckboxIndeterminate()],
)

describe('Table selection scene', () => {
  it('selects a row with aria-selected and checkbox', () => {
    Scene.scene(
      { update, view },
      Scene.given({ rows, selected: new Set() }),
      acknowledgeSelectionMounts,
      Scene.click(Scene.role('checkbox', { name: 'Select Alpha' })),
      Scene.expect(Scene.role('row', { selected: true })).toExist(),
    )
  })

  it('does not toggle disabled row checkbox', () => {
    Scene.scene(
      { update, view },
      Scene.given({ rows, selected: new Set() }),
      acknowledgeSelectionMounts,
      Scene.expect(
        Scene.role('checkbox', { name: 'Select Gamma' }),
      ).toBeDisabled(),
    )
  })

  it('shows mixed select-all when one row is selected', () => {
    Scene.scene(
      { update, view },
      Scene.given({ rows, selected: new Set(['alpha']) }),
      acknowledgeSelectionMounts,
      Scene.expect(Scene.role('checkbox', { name: 'Select all' })).toHaveAttr(
        'aria-checked',
        'mixed',
      ),
    )
  })
})
