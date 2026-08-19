import { Option } from 'effect'
import * as Calendar from 'foldkit/calendar'
import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { labeledField, styledViewInputs, triggerId } from './dateInput.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
  }>
}>

const asNode = (html: Html): Node => {
  if (html === null) throw new Error('expected VNode')
  return html as Node
}

const collectText = (node: unknown): string => {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node
  const n = node as Node & { text?: string }
  if (n.text !== undefined) return n.text
  if (n.children === undefined) return ''
  return n.children.map(collectText).join('')
}

const hasSx = (node: Node, key: string): boolean =>
  node.data?.class?.[`sx-${key}`] === true

describe('DateInput', () => {
  it('styledViewInputs wires ISO selection into the date picker', () => {
    let inputs!: ReturnType<typeof styledViewInputs>
    renderWithBuilder<never>(h => {
      inputs = styledViewInputs(
        {
          maybeIsoDate: Option.some('2026-08-19'),
          width: 'md',
        },
        h,
      )
      return h.div([])
    })

    const selected = inputs.maybeSelectedDate
    expect(Option.isSome(selected)).toBe(true)
    if (Option.isSome(selected)) {
      expect(
        Calendar.formatShort(selected.value, Calendar.defaultEnglishLocale),
      ).toBeTruthy()
    }
    expect(inputs.panelClassName).toContain('sx-dropdown')
  })

  it('labeledField renders label linked to the trigger id', () => {
    const root = asNode(
      renderWithBuilder(h =>
        labeledField(
          {
            id: 'start-date',
            label: 'Start date',
            description: 'ISO date at the chrome boundary.',
            children: [h.span([], ['picker slot'])],
          },
          h,
        ),
      ),
    )
    expect(collectText(root)).toContain('Start date')
    expect(collectText(root)).toContain('ISO date at the chrome boundary.')
    const label = asNode(root.children?.[0] as Html)
    expect(hasSx(label, 'label')).toBe(true)
    expect(triggerId('start-date')).toBe('start-date-popover-button')
  })
})
