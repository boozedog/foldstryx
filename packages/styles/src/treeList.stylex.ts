import {
  colorVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const treeListStyles = stylex.create({
  root: {
    position: 'relative',
    width: '100%',
  },
  tree: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  group: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  item: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    fontSize: typeScaleVars['--text-body-size'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
    outline: 'none',
  },
  rowInteractive: {
    backgroundColor: {
      default: null,
      ':hover': colorVars['--color-overlay-hover'],
    },
  },
  rowSelected: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  rowFocused: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-accent']}`,
  },
  chevronButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacingVars['--spacing-4'],
    height: spacingVars['--spacing-4'],
    padding: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-inner'],
    backgroundColor: 'transparent',
    color: colorVars['--color-icon-secondary'],
    cursor: 'pointer',
    flexShrink: 0,
    outline: 'none',
  },
  chevronExpanded: {
    transform: 'rotate(90deg)',
  },
  label: {
    flexGrow: 1,
    minWidth: 0,
    textAlign: 'start',
  },
})

export const treeListDynamicStyles = stylex.create({
  indent: (level: number) => ({
    paddingInlineStart: `calc(${level} * ${spacingVars['--spacing-4']})`,
  }),
})
