import { describe, expect, it } from 'vitest'

import {
  deselectAll,
  getIsAllSelected,
  getIsIndeterminate,
  selectAll,
  toggleItem,
} from './tableSelection.js'

const items = [
  { id: 'a' },
  { id: 'b' },
  { id: 'c', isEnabled: false },
  { id: 'd', isSelectable: false },
]

describe('tableSelection helpers', () => {
  it('getIsAllSelected is false with zero actionable rows', () => {
    expect(
      getIsAllSelected([{ id: 'x', isSelectable: false }], new Set(['x'])),
    ).toBe(false)
  })

  it('selectAll preserves frozen disabled-but-selected ids', () => {
    const selected = selectAll(items, new Set(['c']))
    expect(selected.has('a')).toBe(true)
    expect(selected.has('b')).toBe(true)
    expect(selected.has('c')).toBe(true)
    expect(selected.has('d')).toBe(false)
  })

  it('deselectAll keeps frozen ids only', () => {
    const selected = deselectAll(items, new Set(['a', 'b', 'c']))
    expect(selected.has('c')).toBe(true)
    expect(selected.has('a')).toBe(false)
  })

  it('getIsIndeterminate when partially selected', () => {
    expect(getIsIndeterminate(items, new Set(['a']))).toBe(true)
    expect(getIsIndeterminate(items, new Set(['a', 'b']))).toBe(false)
  })

  it('toggleItem adds and removes membership', () => {
    const added = toggleItem(new Set(['a']), 'b', true)
    expect(added.has('b')).toBe(true)
    const removed = toggleItem(added, 'a', false)
    expect(removed.has('a')).toBe(false)
  })
})
