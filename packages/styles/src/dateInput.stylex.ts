import { colorVars, spacingVars } from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const dateInputStyles = stylex.create({
  triggerPlaceholder: {
    color: colorVars['--color-text-secondary'],
  },
  rangeRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: spacingVars['--spacing-2'],
    width: '100%',
  },
  rangeField: {
    flexGrow: 1,
    minWidth: 0,
  },
  rangeSeparator: {
    paddingBottom: spacingVars['--spacing-2'],
    color: colorVars['--color-text-secondary'],
  },
})
