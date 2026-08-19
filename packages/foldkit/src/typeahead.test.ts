import { Option } from 'effect'

import { describe, expect, it } from '@effect/vitest'

import { renderWithBuilder } from './renderHelper.js'
import { noMatchesItem, styledViewInputs } from './typeahead.js'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
] as const

type TestItem = 'apple' | 'banana' | ReturnType<typeof noMatchesItem>

describe('Typeahead.styledViewInputs', () => {
  it('builds combobox chrome with typeahead input styles', () => {
    let inputs!: ReturnType<typeof styledViewInputs<TestItem, never>>
    renderWithBuilder<never>(h => {
      inputs = styledViewInputs<TestItem, never>(
        {
          items: ['apple'],
          options,
          maybeSelectedValue: Option.none(),
          inputValue: 'ap',
          ariaLabel: 'Fruit',
          width: 'full',
        },
        h,
      )
      return h.div([])
    })

    expect(inputs.inputClassName).toContain('sx-input')
    expect(inputs.inputWrapperClassName).toContain('sx-base')
    expect(inputs.itemsClassName).toContain('sx-dropdown')
  })

  it('marks the no-matches sentinel as disabled', () => {
    let inputs!: ReturnType<typeof styledViewInputs<TestItem, never>>
    renderWithBuilder<never>(h => {
      inputs = styledViewInputs<TestItem, never>(
        {
          items: [noMatchesItem()],
          options,
          maybeSelectedValue: Option.none(),
          inputValue: 'zzz',
          emptyLabel: 'Nothing found',
        },
        h,
      )
      return h.div([])
    })

    expect(inputs.isItemDisabled?.(noMatchesItem(), 0)).toBe(true)
    const emptyConfig = inputs.itemToConfig(noMatchesItem(), {
      isActive: false,
      isDisabled: true,
      isSelected: false,
      isReadOnly: false,
    })
    expect(emptyConfig.className).toContain('emptyState')
  })
})
