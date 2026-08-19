import { Option } from 'effect'
import * as Calendar from 'foldkit/calendar'
import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'
import * as UiCalendar from '@foldkit/ui/calendar'
import type { Message as CalendarMessage } from '@foldkit/ui/calendar'

import { toView } from './calendar.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  children?: ReadonlyArray<unknown>
  data?: Readonly<{
    class?: Readonly<Record<string, boolean>>
  }>
}>

const asNode = (html: Html): Node => {
  if (html === null) throw new Error('expected VNode')
  return html as Node
}

const hasSx = (node: Node, key: string): boolean =>
  node.data?.class?.[`sx-${key}`] === true

const collectWithSx = (node: Node, key: string): ReadonlyArray<Node> => {
  const out: Array<Node> = []
  if (hasSx(node, key)) out.push(node)
  for (const child of node.children ?? []) {
    out.push(...collectWithSx(child as Node, key))
  }
  return out
}

describe('Calendar chrome', () => {
  it('uses display-contents week rows inside the 7-column day grid', () => {
    const today = Calendar.make(2026, 8, 19)
    const model = UiCalendar.init({ id: 'calendar-test', today })
    const root = asNode(
      renderWithBuilder<CalendarMessage>(h =>
        UiCalendar.view(
          model,
          {
            maybeSelectedDate: Option.none(),
            toView: attributes => toView(attributes, h),
          },
          h,
        ),
      ),
    )

    const weekRows = collectWithSx(root, 'weekRow')
    expect(weekRows.length).toBeGreaterThan(0)
    for (const row of weekRows) {
      expect(hasSx(row, 'grid')).toBe(false)
    }
    expect(collectWithSx(root, 'grid').length).toBeGreaterThan(0)
  })
})
