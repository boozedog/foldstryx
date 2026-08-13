import {
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const tooltipStyles = stylex.create({
  wrapper: {
    display: 'contents',
  },
  content: {
    backgroundColor: colorVars['--color-background-inverted'],
    borderRadius: radiusVars['--radius-element'],
    boxShadow: shadowVars['--shadow-med'],
    color: colorVars['--color-on-dark'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    maxWidth: '20rem',
    paddingBlock: spacingVars['--spacing-1-5'],
    paddingInline: spacingVars['--spacing-3'],
    pointerEvents: 'none',
    textWrap: 'balance',
    width: 'max-content',
    zIndex: 50,
  },
  contentHidden: {
    display: 'none',
  },
})
