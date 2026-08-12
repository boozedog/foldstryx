/* oxlint-disable typescript/consistent-type-assertions */
import type * as stylex from '@stylexjs/stylex'

const make = new Proxy(
  {},
  {
    get: (_target, key) => ({
      $$css: true,
      [String(key)]: `sx-${String(key)}`,
    }),
  },
) as unknown as Record<string, stylex.StyleXStyles>
export const buttonStyles = make
export const layoutStyles = make
export const cardStyles = make
export const inputStyles = { input: make['input'] }
export const formDensityStyles = make
export const fieldStyles = make
export const checkboxStyles = make
export const switchStyles = make
export const separatorStyles = make
