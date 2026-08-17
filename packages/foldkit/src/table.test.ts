import type { Html } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'

import { describe, expect, it } from '@effect/vitest'

import {
  CompletedSyncCheckboxIndeterminate,
  syncIndeterminateMount,
} from './checkbox.js'
import { renderWithBuilder } from './renderHelper.js'
import * as TableBase from './table.js'

const Table = {
  wrap: (config: Parameters<typeof TableBase.wrap>[0]) =>
    renderWithBuilder(h => TableBase.wrap(config, h)),
  table: (config: Parameters<typeof TableBase.table>[0]) =>
    renderWithBuilder(h => TableBase.table(config, h)),
  thead: (config: Parameters<typeof TableBase.thead>[0]) =>
    renderWithBuilder(h => TableBase.thead(config, h)),
  tbody: (config: Parameters<typeof TableBase.tbody>[0]) =>
    renderWithBuilder(h => TableBase.tbody(config, h)),
  th: (config: Parameters<typeof TableBase.th>[0]) =>
    renderWithBuilder(h => TableBase.th(config, h)),
  td: (config: Parameters<typeof TableBase.td>[0]) =>
    renderWithBuilder(h => TableBase.td(config, h)),
  tr: (config: Parameters<typeof TableBase.tr>[0]) =>
    renderWithBuilder(h => TableBase.tr(config, h)),
  selectionHeader: (
    config: Parameters<typeof TableBase.selectionHeader>[0],
    toSyncParent: Parameters<typeof TableBase.selectionHeader>[2] = message =>
      message,
  ) =>
    renderWithBuilder(h => TableBase.selectionHeader(config, h, toSyncParent)),
  selectionCell: (
    config: Parameters<typeof TableBase.selectionCell>[0],
    toSyncParent: Parameters<typeof TableBase.selectionCell>[2] = message =>
      message,
  ) => renderWithBuilder(h => TableBase.selectionCell(config, h, toSyncParent)),
}

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
  }>
}>
const asNode = (value: Html): Node => value as Node
const text = (value: unknown): string => {
  if (typeof value === 'string') return value
  const node = value as Node & { text?: string }
  if (node.text) return node.text
  return node.children?.map(text).join('') ?? ''
}
const classKeys = (node: Node): ReadonlyArray<string> =>
  Object.keys(node.data?.class ?? {}).filter(
    k => node.data?.class?.[k] === true,
  )
const hasSx = (node: Node, key: string): boolean =>
  classKeys(node).includes(`sx-${key}`)

describe('Table', () => {
  it('maps th/td align options to distinct style keys', () => {
    expect(
      hasSx(asNode(Table.th({ align: 'left', children: 'N' })), 'th'),
    ).toBe(true)
    expect(
      hasSx(asNode(Table.th({ align: 'right', children: 'N' })), 'thRight'),
    ).toBe(true)
    expect(
      hasSx(asNode(Table.th({ align: 'narrow', children: 'N' })), 'thNarrow'),
    ).toBe(true)
    expect(
      hasSx(asNode(Table.td({ align: 'right', children: '1' })), 'tdRight'),
    ).toBe(true)
    expect(
      hasSx(asNode(Table.td({ align: 'plain', children: '1' })), 'tdPlain'),
    ).toBe(true)
    expect(
      hasSx(
        asNode(Table.td({ align: 'plainRight', children: '1' })),
        'tdPlainRight',
      ),
    ).toBe(true)
    expect(
      hasSx(asNode(Table.td({ align: 'narrow', children: '1' })), 'tdNarrow'),
    ).toBe(true)
  })

  it('applies row presentation and cell tone as distinct style keys', () => {
    expect(
      hasSx(
        asNode(
          Table.tr({ presentation: 'warning', children: [Table.td('x')] }),
        ),
        'rowWarning',
      ),
    ).toBe(true)
    expect(
      hasSx(
        asNode(Table.tr({ presentation: 'accent', children: [Table.td('x')] })),
        'rowAccent',
      ),
    ).toBe(true)
    expect(
      hasSx(
        asNode(
          Table.tr({ presentation: 'summary', children: [Table.td('x')] }),
        ),
        'rowSummary',
      ),
    ).toBe(true)

    expect(
      hasSx(
        asNode(Table.td({ tone: 'destructive', children: '-1' })),
        'toneDestructive',
      ),
    ).toBe(true)
    expect(
      hasSx(
        asNode(Table.td({ tone: 'success', children: 'ok' })),
        'toneSuccess',
      ),
    ).toBe(true)
    expect(
      hasSx(
        asNode(Table.td({ tone: 'warning', children: 'w' })),
        'toneWarning',
      ),
    ).toBe(true)
  })

  it('renders structure with generic presentation and tones', () => {
    const node = asNode(
      Table.wrap([
        Table.table([
          Table.thead([
            Table.tr({
              children: [
                Table.th('Name'),
                Table.th({ align: 'right', children: 'Value' }),
              ],
            }),
          ]),
          Table.tbody([
            Table.tr({
              children: [
                Table.td('Alpha'),
                Table.td({ align: 'right', children: '10.00' }),
              ],
            }),
            Table.tr({
              presentation: 'summary',
              children: [
                Table.td('Total'),
                Table.td({
                  align: 'right',
                  tone: 'success',
                  children: '8.50',
                }),
              ],
            }),
          ]),
        ]),
      ]),
    )
    expect(node.sel).toBe('div')
    expect(hasSx(node, 'wrap')).toBe(true)
    expect(text(node)).toContain('Alpha')
    expect(text(node)).toContain('Total')
    expect(text(node)).toContain('8.50')
  })

  it('applies rowSelected and aria-selected when isSelected', () => {
    const row = asNode(
      renderWithBuilder(h =>
        TableBase.tr({ isSelected: true, children: [TableBase.td('x', h)] }, h),
      ),
    )
    expect(hasSx(row, 'rowSelected')).toBe(true)
    expect(row.data?.attrs?.['aria-selected']).toBe('true')
  })

  it('renders a native table with thead/tbody structure', () => {
    const table = asNode(
      Table.table([
        Table.thead([Table.tr({ children: [Table.th('H')] })]),
        Table.tbody([Table.tr({ children: [Table.td('D')] })]),
      ]),
    )
    expect(table.sel).toBe('table')
    expect(hasSx(table, 'table')).toBe(true)
  })

  it('renders selection header and cell chrome', () => {
    const acknowledgeSync = Scene.Mount.resolve(
      syncIndeterminateMount({ indeterminate: true }),
      CompletedSyncCheckboxIndeterminate(),
    )
    const header = asNode(
      renderWithBuilder(
        h =>
          TableBase.selectionHeader(
            {
              checked: false,
              isIndeterminate: true,
              onChange: () => CompletedSyncCheckboxIndeterminate(),
            },
            h,
            message => message,
          ),
        acknowledgeSync,
      ),
    )
    expect(header.sel).toBe('th')
    expect(hasSx(header, 'selectionCell')).toBe(true)
    const checkbox = asNode(header.children?.[0] as Html)
    expect(checkbox.data?.attrs?.['aria-checked']).toBe('mixed')

    const cell = asNode(
      renderWithBuilder(
        h =>
          TableBase.selectionCell(
            {
              rowId: 'alpha',
              rowLabel: 'Alpha',
              checked: true,
              onChange: () => CompletedSyncCheckboxIndeterminate(),
            },
            h,
            message => message,
          ),
        Scene.Mount.resolve(
          syncIndeterminateMount({ indeterminate: false }),
          CompletedSyncCheckboxIndeterminate(),
        ),
      ),
    )
    expect(cell.sel).toBe('td')
    expect(hasSx(cell, 'selectionCell')).toBe(true)
  })

  it('sets aria-pressed on interactive td buttons', () => {
    const Pressed = m('Pressed')
    const cell = asNode(
      renderWithBuilder(h =>
        TableBase.td(
          {
            children: 'Open',
            onClick: Pressed(),
            isPressed: true,
          },
          h,
        ),
      ),
    )
    const button = asNode(cell.children?.[0] as Html)
    expect(button.sel).toBe('button')
    expect(button.data?.attrs?.['aria-pressed']).toBe('true')
    expect(hasSx(button, 'cellPressed')).toBe(true)
  })
})
