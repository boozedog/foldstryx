import * as stylex from '@stylexjs/stylex'

export const hardcoded = stylex.create({
  bad: {
    color: '#ff0000',
    fontSize: '14px',
    padding: '8px',
  },
  nested: {
    color: { default: '#00ff00', ':hover': '#0000ff' },
    fontSize: { default: '14px' },
    padding: { default: '8px' },
  },
})
