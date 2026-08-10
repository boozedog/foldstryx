import { tokens } from '@foldstryx/tokens'
import * as stylex from '@stylexjs/stylex'

/**
 * Placeholder style surface.
 *
 * Component StyleX modules land with the first primitives.
 */
export const scaffoldStyles = stylex.create({
  root: {
    // Keep styles→tokens edge real for the package graph (not a public API promise).
    opacity: tokens.scaffold,
  },
})
