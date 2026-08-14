import {
  borderVars,
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const pageStyles = stylex.create({
  shell: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
    minWidth: 0,
    width: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1-5'],
  },
  headerRow: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-4'],
    justifyContent: 'space-between',
  },
  title: {
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typeScaleVars['--text-heading-1-size'],
    fontWeight: typeScaleVars['--text-heading-1-weight'],
    lineHeight: typeScaleVars['--text-heading-1-leading'],
    margin: 0,
  },
  description: {
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    margin: 0,
  },
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-4'],
    minWidth: 0,
  },
  footer: {
    alignItems: 'center',
    borderBlockStartColor: colorVars['--color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: borderVars['--border-width'],
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-3'],
    paddingBlockStart: spacingVars['--spacing-4'],
  },
})
