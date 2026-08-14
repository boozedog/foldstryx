import { spacingVars } from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const gridStyles = stylex.create({
  base: {
    display: 'grid',
  },
  grid2: {
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 768px)': 'repeat(2, 1fr)',
    },
  },
  grid3: {
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 768px)': 'repeat(3, 1fr)',
    },
  },
  grid4: {
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 768px)': 'repeat(2, 1fr)',
      '@media (min-width: 1280px)': 'repeat(4, 1fr)',
    },
  },
  gridSummary: {
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 640px)': 'repeat(2, 1fr)',
    },
  },
  gapSm: {
    gap: spacingVars['--spacing-2'],
  },
  gapMd: {
    gap: spacingVars['--spacing-4'],
  },
  gapLg: {
    gap: spacingVars['--spacing-6'],
  },
  mt2: {
    marginTop: spacingVars['--spacing-2'],
  },
  mt3: {
    marginTop: spacingVars['--spacing-3'],
  },
})
