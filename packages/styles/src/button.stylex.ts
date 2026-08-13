import {
  borderVars,
  colorVars,
  radiusVars,
  shadowVars,
  sizeVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const buttonStyles = stylex.create({
  base: {
    alignItems: 'center',
    borderRadius: radiusVars['--radius-element'],
    borderStyle: 'solid',
    borderWidth: borderVars['--border-width'],
    display: 'inline-flex',
    gap: spacingVars['--spacing-2'],
    justifyContent: 'center',
    fontSize: typeScaleVars['--text-label-size'],
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: typeScaleVars['--text-label-weight'],
    lineHeight: typeScaleVars['--text-label-leading'],
    outline: 'none',
    whiteSpace: 'nowrap',
    boxShadow: {
      default: 'none',
      ':focus-visible': shadowVars['--shadow-inset-selected'],
    },
    cursor: {
      default: 'pointer',
      ':disabled': 'not-allowed',
      '[data-disabled]': 'not-allowed',
      '[aria-disabled="true"]': 'not-allowed',
    },
    opacity: {
      default: 1,
      ':disabled': 0.5,
      '[data-disabled]': 0.5,
      '[aria-disabled="true"]': 0.5,
    },
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
    height: sizeVars['--size-element-md'],
    minHeight: sizeVars['--size-element-md'],
    paddingBlock: spacingVars['--spacing-1-5'],
    paddingInline: spacingVars['--spacing-4'],
  },
  sizeSm: {
    height: sizeVars['--size-element-sm'],
    minHeight: sizeVars['--size-element-sm'],
    paddingBlock: spacingVars['--spacing-0-5'],
    paddingInline: spacingVars['--spacing-3'],
  },
  sizeIcon: {
    height: sizeVars['--size-element-md'],
    minHeight: sizeVars['--size-element-md'],
    minWidth: sizeVars['--size-element-md'],
    padding: spacingVars['--spacing-1'],
  },
})
