import {
  borderVars,
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const cardStyles = stylex.create({
  root: {
    backgroundColor: colorVars['--color-background-card'],
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    borderStyle: 'solid',
    borderWidth: borderVars['--border-width'],
    boxShadow: shadowVars['--shadow-low'],
    color: colorVars['--color-text-primary'],
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    padding: spacingVars['--spacing-4'],
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-4'],
    padding: spacingVars['--spacing-4'],
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-4'],
    padding: spacingVars['--spacing-4'],
  },
  title: {
    color: colorVars['--color-text-primary'],
    fontWeight: '600',
    margin: 0,
  },
  description: { color: colorVars['--color-text-secondary'], margin: 0 },
})
