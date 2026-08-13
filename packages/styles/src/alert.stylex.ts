import {
  borderVars,
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const alertStyles = stylex.create({
  base: {
    alignItems: 'center',
    borderRadius: radiusVars['--radius-container'],
    borderStyle: 'solid',
    borderWidth: borderVars['--border-width'],
    display: 'flex',
    gap: spacingVars['--spacing-4'],
    justifyContent: 'space-between',
    padding: spacingVars['--spacing-4'],
  },
  compact: {
    display: 'block',
    fontSize: typeScaleVars['--text-body-size'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: spacingVars['--spacing-1'],
    minWidth: 0,
  },
  title: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: typeScaleVars['--text-heading-4-leading'],
    margin: 0,
  },
  description: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    margin: 0,
  },
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    gap: spacingVars['--spacing-2'],
  },
  variantDefault: {
    backgroundColor: colorVars['--color-background-card'],
    borderColor: colorVars['--color-border'],
    color: colorVars['--color-text-primary'],
  },
  variantDestructive: {
    backgroundColor: colorVars['--color-error-muted'],
    borderColor: colorVars['--color-error'],
    color: colorVars['--color-error'],
  },
  variantWarning: {
    backgroundColor: colorVars['--color-warning-muted'],
    borderColor: colorVars['--color-warning'],
    color: colorVars['--color-warning'],
  },
  variantSuccess: {
    backgroundColor: colorVars['--color-success-muted'],
    borderColor: colorVars['--color-success'],
    color: colorVars['--color-success'],
  },
})
