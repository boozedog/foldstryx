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

const focus = { boxShadow: shadowVars['--shadow-inset-selected'] } as const
export const inputStyles = stylex.create({
  input: {
    boxSizing: 'border-box',
    display: 'flex',
    width: '100%',
    minWidth: 0,
    height: sizeVars['--size-element-md'],
    borderRadius: radiusVars['--radius-element'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    backgroundColor: 'transparent',
    paddingInline: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-1'],
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    outline: 'none',
    ':focus-visible': focus,
    '::placeholder': { color: colorVars['--color-text-secondary'] },
    ':disabled': { cursor: 'not-allowed', opacity: 0.5 },
  },
})
export const formDensityStyles = stylex.create({
  inputCompact: {
    height: 'auto',
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
  },
  inputWidthAuto: { width: 'auto' },
  inputWidthSm: { width: '7rem' },
  inputWidthMd: { width: '12rem' },
  inputWidthFull: { width: '100%' },
  inputAlignStart: { textAlign: 'start' },
  inputAlignEnd: { textAlign: 'end' },
})
export const fieldStyles = stylex.create({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    width: '100%',
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  fieldContent: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    lineHeight: 1.375,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: typeScaleVars['--text-label-weight'],
    userSelect: 'none',
  },
  description: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: 1.25,
  },
  error: {
    color: colorVars['--color-error'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
})
export const checkboxStyles = stylex.create({
  root: {
    display: 'flex',
    width: sizeVars['--size-element-sm'],
    height: sizeVars['--size-element-sm'],
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusVars['--radius-inner'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    backgroundColor: 'transparent',
    padding: 0,
    color: colorVars['--color-on-accent'],
    cursor: 'pointer',
    ':focus-visible': focus,
    ':disabled': { cursor: 'not-allowed', opacity: 0.5 },
  },
  rootChecked: {
    borderColor: colorVars['--color-accent'],
    backgroundColor: colorVars['--color-accent'],
  },
  rootIndeterminate: {
    borderColor: colorVars['--color-accent'],
    backgroundColor: colorVars['--color-accent'],
  },
  indicator: { width: '14px', height: '14px' },
})
export const switchStyles = stylex.create({
  root: {
    display: 'inline-flex',
    width: '32px',
    height: '20px',
    flexShrink: 0,
    alignItems: 'center',
    borderRadius: radiusVars['--radius-full'],
    border: 0,
    backgroundColor: colorVars['--color-track'],
    padding: 0,
    cursor: 'pointer',
    ':focus-visible': focus,
    ':disabled': { opacity: 0.5 },
  },
  rootChecked: { backgroundColor: colorVars['--color-accent'] },
  thumb: {
    display: 'block',
    width: '16px',
    height: '16px',
    marginInline: spacingVars['--spacing-0-5'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-surface'],
    transition: 'transform 150ms ease',
    transform: 'translateX(0)',
  },
  thumbChecked: { transform: 'translateX(12px)' },
})
export const separatorStyles = stylex.create({
  horizontal: {
    width: '100%',
    height: borderVars['--border-width'],
    flexShrink: 0,
    backgroundColor: colorVars['--color-border'],
  },
  vertical: {
    width: borderVars['--border-width'],
    height: sizeVars['--size-element-md'],
    flexShrink: 0,
    backgroundColor: colorVars['--color-border'],
  },
})
