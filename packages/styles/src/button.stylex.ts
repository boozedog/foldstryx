import {
  borderVars,
  colorVars,
  radiusVars,
  shadowVars,
  sizeVars,
  spacingVars,
  typeScaleVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const buttonStyles = stylex.create({
  base: {
    alignItems: 'center',
    borderRadius: radiusVars['--radius-element'],
    borderStyle: 'solid',
    borderWidth: borderVars['--border-width'],
    cursor: 'pointer',
    display: 'inline-flex',
    gap: spacingVars['--spacing-2'],
    justifyContent: 'center',
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: typeScaleVars['--text-label-weight'],
    lineHeight: typeScaleVars['--text-label-leading'],
    outline: 'none',
    whiteSpace: 'nowrap',
    ':focus-visible': { boxShadow: shadowVars['--shadow-inset-selected'] },
    ':disabled': { cursor: 'not-allowed', opacity: 0.5 },
    '[data-disabled]': { cursor: 'not-allowed', opacity: 0.5 },
    '[aria-disabled="true"]': { cursor: 'not-allowed', opacity: 0.5 },
  },
  variantPrimary: {
    backgroundColor: colorVars['--color-accent'],
    borderColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  variantSecondary: {
    backgroundColor: colorVars['--color-neutral'],
    borderColor: colorVars['--color-border'],
    color: colorVars['--color-text-primary'],
  },
  variantGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: colorVars['--color-text-primary'],
  },
  variantDanger: {
    backgroundColor: colorVars['--color-error'],
    borderColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
  sizeMd: {
    minHeight: sizeVars['--size-element-md'],
    paddingBlock: spacingVars['--spacing-1-5'],
    paddingInline: spacingVars['--spacing-4'],
  },
  sizeSm: {
    minHeight: sizeVars['--size-element-sm'],
    paddingBlock: spacingVars['--spacing-0-5'],
    paddingInline: spacingVars['--spacing-3'],
  },
  sizeIcon: {
    minHeight: sizeVars['--size-element-md'],
    minWidth: sizeVars['--size-element-md'],
    padding: spacingVars['--spacing-1'],
  },
})
