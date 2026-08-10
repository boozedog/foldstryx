import { describe, expect, it } from 'vitest'

import { elAttrs } from './sx.js'

describe('sx attribute glue', () => {
  it('flattens groups and removes undefined attributes', () => {
    const first = { _tag: 'first' }
    const second = { _tag: 'second' }

    expect(elAttrs(first, undefined, [second, undefined])).toEqual([
      first,
      second,
    ])
  })
})
