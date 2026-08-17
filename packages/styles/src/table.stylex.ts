import {
  borderVars,
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const tableStyles = stylex.create({
  wrap: {
    backgroundColor: colorVars['--color-background-card'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: `0 0 0 1px ${colorVars['--color-border']}`,
    overflowX: 'auto',
  },
  table: {
    borderCollapse: 'collapse',
    fontSize: typeScaleVars['--text-body-size'],
    minWidth: '100%',
  },
  thead: {
    backgroundColor: colorVars['--color-background-muted'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'left',
  },
  th: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  thRight: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    textAlign: 'right',
  },
  thNarrow: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-2'],
    width: spacingVars['--spacing-8'],
  },
  td: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    verticalAlign: 'top',
  },
  tdRight: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    textAlign: 'right',
    verticalAlign: 'top',
  },
  tdNarrow: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-2'],
    verticalAlign: 'top',
  },
  tdPlain: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  tdPlainRight: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    textAlign: 'right',
  },
  /** Cell tone — destructive (e.g. negative values). */
  toneDestructive: {
    color: colorVars['--color-error'],
  },
  /** Cell tone — success. */
  toneSuccess: {
    color: colorVars['--color-success'],
  },
  /** Cell tone — warning. */
  toneWarning: {
    color: colorVars['--color-warning'],
  },
  /** Row presentation — soft warning wash. */
  rowWarning: {
    backgroundColor: colorVars['--color-warning-muted'],
  },
  /** Row presentation — soft accent wash. */
  rowAccent: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  /** Row presentation — summary emphasis (border + weight). */
  rowSummary: {
    backgroundColor: colorVars['--color-background-muted'],
    borderTopColor: colorVars['--color-border'],
    borderTopStyle: 'solid',
    borderTopWidth: borderVars['--border-width'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  /** Selected row background (Astryx table selection). */
  rowSelected: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  /** Full-bleed interactive cell control at table density. */
  cellInteractive: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    color: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    font: 'inherit',
    height: '100%',
    justifyContent: 'flex-start',
    margin: 0,
    minHeight: spacingVars['--spacing-10'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    textAlign: 'inherit',
    width: '100%',
  },
  cellPressed: {
    backgroundColor: colorVars['--color-overlay-pressed'],
  },
  selectionCell: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-2'],
    verticalAlign: 'middle',
    width: spacingVars['--spacing-8'],
  },
})
