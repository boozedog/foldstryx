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
