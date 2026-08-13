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

export const layoutStyles = stylex.create({
  checkbox: {
    width: '16px',
    height: '16px',
  },
  checkboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  stackXs: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
  stackSm: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-4'],
  },
  stackLg: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
  },
  catalogShell: {
    boxSizing: 'border-box',
    marginInline: 'auto',
    maxWidth: '72rem',
    minHeight: 0,
    paddingBlock: spacingVars['--spacing-8'],
    paddingInline: spacingVars['--spacing-6'],
    width: '100%',
  },
  panelPad: { padding: spacingVars['--spacing-4'] },
  selfStart: { alignSelf: 'flex-start' },
  selfCenter: { alignSelf: 'center' },
  loadingPanel: {
    color: colorVars['--color-text-secondary'],
    padding: spacingVars['--spacing-4'],
    textAlign: 'center',
  },
  attentionCard: {
    backgroundColor: colorVars['--color-warning-muted'],
    borderColor: colorVars['--color-warning'],
    borderRadius: radiusVars['--radius-container'],
    borderStyle: 'solid',
    borderWidth: borderVars['--border-width'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  attentionTitle: {
    color: colorVars['--color-warning'],
    fontFamily: typographyVars['--font-family-heading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    margin: 0,
  },
  attentionBody: {
    color: colorVars['--color-warning'],
    fontSize: typeScaleVars['--text-body-size'],
    margin: 0,
  },
  mt2: { marginTop: spacingVars['--spacing-2'] },
  mt3: { marginTop: spacingVars['--spacing-3'] },
  rowBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-4'],
  },
  rowBaseline: {
    display: 'flex',
    alignItems: 'baseline',
    gap: spacingVars['--spacing-4'],
  },
  rowStartBetween: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
  },
  rowGap2: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
  },
  rowGap3: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
  },
  rowCenterGap2: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  body: {
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: typeScaleVars['--text-body-weight'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  bodySm: {
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  muted: {
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  mutedSm: {
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  errorText: {
    color: colorVars['--color-error'],
    fontFamily: typographyVars['--font-family-body'],
  },
  successText: {
    color: colorVars['--color-success'],
    fontFamily: typographyVars['--font-family-body'],
  },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  sectionTitle: {
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typeScaleVars['--text-heading-3-size'],
    fontWeight: typeScaleVars['--text-heading-3-weight'],
  },
  title: {
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typeScaleVars['--text-heading-1-size'],
    fontWeight: typeScaleVars['--text-heading-1-weight'],
  },
})
