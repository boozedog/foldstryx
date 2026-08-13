import {
  borderVars,
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const badgeStyles = stylex.create({
  base: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: radiusVars['--radius-full'],
    borderStyle: 'solid',
    borderWidth: borderVars['--border-width'],
    display: 'inline-flex',
    flexShrink: 0,
    gap: spacingVars['--spacing-1'],
    justifyContent: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    width: 'fit-content',
  },
  variantDefault: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  variantSecondary: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-primary'],
  },
  variantDestructive: {
    backgroundColor: colorVars['--color-error-muted'],
    color: colorVars['--color-error'],
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderColor: colorVars['--color-border'],
    color: colorVars['--color-text-primary'],
  },
  variantSuccess: {
    backgroundColor: colorVars['--color-success-muted'],
    color: colorVars['--color-success'],
  },
  variantWarning: {
    backgroundColor: colorVars['--color-warning-muted'],
    color: colorVars['--color-warning'],
  },
  variantInfo: {
    backgroundColor: colorVars['--color-background-blue'],
    color: colorVars['--color-text-blue'],
  },
  sizeDefault: {
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    height: '1.25rem',
    lineHeight: typeScaleVars['--text-supporting-leading'],
    paddingBlock: spacingVars['--spacing-0-5'],
    paddingInline: spacingVars['--spacing-2'],
  },
  sizeLg: {
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    height: 'auto',
    lineHeight: typeScaleVars['--text-body-leading'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-3'],
  },
})
