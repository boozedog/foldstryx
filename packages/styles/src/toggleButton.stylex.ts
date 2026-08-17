import {
  colorVars,
  fontWeightVars,
  spacingVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const toggleButtonStyles = stylex.create({
  pressed: {
    backgroundColor: colorVars['--color-overlay-pressed'],
  },
  labelWrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelPressed: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  labelWidthReservation: {
    display: 'block',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    height: 0,
    overflow: 'hidden',
    visibility: 'hidden',
    pointerEvents: 'none',
  },
})

export const toggleButtonGroupStyles = stylex.create({
  group: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  vertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
})
