import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

/** Combobox input chrome aligned with Astryx Typeahead (borderless inner input). */
export const typeaheadStyles = stylex.create({
  input: {
    display: 'block',
    flexGrow: 1,
    minWidth: '60px',
    width: '100%',
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
  emptyState: {
    padding: spacingVars['--spacing-3'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
})
