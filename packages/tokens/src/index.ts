import * as stylex from '@stylexjs/stylex'

/**
 * Placeholder token surface.
 *
 * Real Astryx-faithful vars land in a follow-up lift from upstream Astryx.
 * This export exists so the package is a valid StyleX token module from day one.
 */
export const tokens = stylex.defineVars({
  /** Scaffold marker — replace with Astryx scales. */
  scaffold: '0',
})
