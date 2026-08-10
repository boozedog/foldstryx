import {
  colorVars,
  spacingVars,
  typeScaleVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const layoutStyles = stylex.create({
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
  panelPad: { padding: spacingVars['--spacing-4'] },
  selfStart: { alignSelf: 'flex-start' },
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
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: typeScaleVars['--text-body-weight'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  bodySm: {
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  muted: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  mutedSm: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  errorText: { color: colorVars['--color-error'] },
  successText: { color: colorVars['--color-success'] },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  sectionTitle: {
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-heading-3-size'],
    fontWeight: typeScaleVars['--text-heading-3-weight'],
  },
  title: {
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-heading-1-size'],
    fontWeight: typeScaleVars['--text-heading-1-weight'],
  },
})
