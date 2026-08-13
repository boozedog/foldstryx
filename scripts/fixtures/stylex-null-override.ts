import * as stylex from '@stylexjs/stylex'

export const nullOverride = stylex.create({
  disabled: {
    transform: {
      default: null,
      ':active': null,
    },
  },
})
