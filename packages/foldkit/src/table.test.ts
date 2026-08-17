import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

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

  it('renders a native table with thead/tbody structure', () => {
    const table = asNode(
      Table.table([
        Table.thead([Table.tr({ children: [Table.th('H')] })]),
        Table.tbody([Table.tr({ children: [Table.td('D')] })]),
      ]),
    )
    expect(table.sel).toBe('table')
    expect(hasSx(table, 'table')).toBe(true)
    const thead = table.children?.[0] as Node
    expect(thead.sel).toBe('thead')
    expect(hasSx(thead, 'thead')).toBe(true)
    const tbody = table.children?.[1] as Node
    expect(tbody.sel).toBe('tbody')
  })
})
