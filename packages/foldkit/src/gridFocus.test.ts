import { describe, expect, it } from 'vitest'

import { gridFocusStep } from './gridFocus.js'

describe('gridFocusStep', () => {
  it('moves across a 3×3 grid with arrow keys', () => {
    expect(
      gridFocusStep({
        columns: 3,
        cellCount: 9,
        currentIndex: 0,
        direction: 'ArrowRight',
      }),
    ).toBe(1)
    expect(
      gridFocusStep({
        columns: 3,
        cellCount: 9,
        currentIndex: 0,
        direction: 'ArrowDown',
      }),
    ).toBe(3)
  })

  it('skips non-focusable cells without collapsing geometry', () => {
    const isFocusable = (index: number) => index !== 1
    expect(
      gridFocusStep({
        columns: 3,
        cellCount: 9,
        currentIndex: 0,
        direction: 'ArrowRight',
        isCellFocusable: isFocusable,
      }),
    ).toBe(2)
  })

  it('swaps horizontal direction under RTL', () => {
    expect(
      gridFocusStep({
        columns: 3,
        cellCount: 9,
        currentIndex: 1,
        direction: 'ArrowLeft',
        isRtl: true,
      }),
    ).toBe(2)
  })

  it('Home/End and Ctrl+Home/Ctrl+End boundaries', () => {
    expect(
      gridFocusStep({
        columns: 3,
        cellCount: 9,
        currentIndex: 5,
        direction: 'Home',
      }),
    ).toBe(3)
    expect(
      gridFocusStep({
        columns: 3,
        cellCount: 9,
        currentIndex: 5,
        direction: 'Home',
        ctrlKey: true,
      }),
    ).toBe(0)
    expect(
      gridFocusStep({
        columns: 3,
        cellCount: 9,
        currentIndex: 2,
        direction: 'End',
        ctrlKey: true,
      }),
    ).toBe(8)
  })
})
