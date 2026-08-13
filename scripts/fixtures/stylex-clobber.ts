import { html } from 'foldkit/html'

import * as stylex from '@stylexjs/stylex'

import { elAttrs, sxAttrs } from '../../packages/foldkit/src/sx.ts'

const styles = stylex.create({
  root: { display: 'flex' },
})

export const clobber = () => {
  const h = html<never>()
  return h.div(
    elAttrs(
      sxAttrs(h, styles.root),
      h.Class('extra'),
      h.Style({ color: 'red' }),
    ),
    ['x'],
  )
}
