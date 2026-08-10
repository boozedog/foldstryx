import { colorVars, typographyVars } from '@foldstryx/tokens'
import * as stylex from '@stylexjs/stylex'

/** Document-level styles shared by Foldstryx consumers. */
export const documentStyles = stylex.create({
  root: {
    backgroundColor: colorVars['--color-background-body'],
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
  },
})
