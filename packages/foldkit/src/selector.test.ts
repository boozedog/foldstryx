import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { renderWithBuilder } from './renderHelper.js'
import { styledViewInputs } from './selector.js'

type Node = Readonly<{
  sel?: string
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

const options = [
  { value: 'all', label: 'All kinds' },
  { value: 'active', label: 'Active' },
]

describe('Selector.styledViewInputs', () => {
  it('builds trigger chrome matching Astryx Selector layout', () => {
    const trigger = asNode(
      renderWithBuilder(h => {
        const inputs = styledViewInputs(
          {
            options,
            selectedValue: 'all',
            density: 'compact',
            width: 'sm',
            ariaLabel: 'Kind',
          },
          h,
        )
        return inputs.buttonContent as Html
      }),
    )
    expect(trigger.sel).toBe('div')
    expect(hasSx(trigger, 'triggerInner')).toBe(true)

    const label = asNode(trigger.children?.[0] as Html)
    expect(hasSx(label, 'triggerLabel')).toBe(true)

    const chevron = asNode(trigger.children?.[1] as Html)
    expect(hasSx(chevron, 'triggerChevron')).toBe(true)
    expect(asNode(chevron.children?.[0] as Html).sel).toBe('svg')
  })

  it('applies compact density and sm width style keys on the wrapper', () => {
    const wrapper = asNode(
      renderWithBuilder(h => {
        const inputs = styledViewInputs(
          {
            options,
            selectedValue: 'active',
            density: 'compact',
            width: 'sm',
            ariaLabel: 'Kind',
          },
          h,
        )
        return h.div(inputs.attributes ?? [], [])
      }),
    )
    expect(hasSx(wrapper, 'base')).toBe(true)
    expect(hasSx(wrapper, 'inputCompact')).toBe(true)
    expect(hasSx(wrapper, 'inputWidthSm')).toBe(true)
  })

  it('uses placeholder tone when the value is unknown', () => {
    const trigger = asNode(
      renderWithBuilder(h => {
        const inputs = styledViewInputs(
          {
            options,
            selectedValue: 'missing',
            placeholder: 'Pick one',
            ariaLabel: 'Kind',
          },
          h,
        )
        return inputs.buttonContent as Html
      }),
    )
    const label = asNode(trigger.children?.[0] as Html)
    expect(hasSx(label, 'triggerPlaceholder')).toBe(true)
  })
})
