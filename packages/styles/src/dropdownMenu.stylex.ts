import {
  borderVars,
  colorVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const dropdownMenuStyles = stylex.create({
  wrapper: {
    display: 'inline-flex',
    minWidth: 0,
    position: 'relative',
    width: '100%',
  },
  wrapperAction: {
    display: 'contents',
  },
  content: {
    backgroundColor: colorVars['--color-background-popover'],
    borderRadius: radiusVars['--radius-element'],
    boxShadow: shadowVars['--shadow-med'],
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    minWidth: '8rem',
    outlineStyle: 'none',
    overflowX: 'hidden',
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
    zIndex: 50,
  },
  contentWide: {
    minWidth: '14rem',
  },
  backdrop: {
    inset: 0,
    position: 'fixed',
    zIndex: 40,
  },
  item: {
    alignItems: 'center',
    borderRadius: radiusVars['--radius-inner'],
    color: colorVars['--color-text-primary'],
    cursor: 'default',
    display: 'flex',
    gap: spacingVars['--spacing-1-5'],
    outlineStyle: 'none',
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1-5'],
    position: 'relative',
    userSelect: 'none',
  },
  itemSpacious: {
    gap: spacingVars['--spacing-2'],
    padding: spacingVars['--spacing-2'],
  },
  itemInteractive: {
    backgroundColor: {
      default: 'transparent',
      ':hover': colorVars['--color-overlay-hover'],
    },
    cursor: 'pointer',
  },
  itemActive: {
    backgroundColor: colorVars['--color-overlay-hover'],
    color: colorVars['--color-text-primary'],
  },
  itemDisabled: {
    color: colorVars['--color-text-disabled'],
    opacity: 0.5,
    pointerEvents: 'none',
  },
  itemDestructive: {
    backgroundColor: {
      default: 'transparent',
      ':hover': colorVars['--color-error-muted'],
    },
    color: colorVars['--color-error'],
  },
  itemIcon: {
    color: colorVars['--color-icon-secondary'],
    flexShrink: 0,
    height: '1rem',
    width: '1rem',
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-inner'],
    borderStyle: 'solid',
    borderWidth: borderVars['--border-width'],
    display: 'flex',
    flexShrink: 0,
    height: '1.5rem',
    justifyContent: 'center',
    width: '1.5rem',
  },
  iconInBox: {
    flexShrink: 0,
    height: '0.875rem',
    width: '0.875rem',
  },
  iconInBoxLg: {
    flexShrink: 0,
    height: '1rem',
    width: '1rem',
  },
  itemLabel: {
    flexGrow: 1,
    minWidth: 0,
  },
  itemLabelMuted: {
    color: colorVars['--color-text-secondary'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  label: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1-5'],
  },
  separator: {
    backgroundColor: colorVars['--color-border'],
    height: '1px',
    marginBlock: spacingVars['--spacing-1'],
    marginInline: '-0.25rem',
  },
  shortcut: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    letterSpacing: '0.05em',
    marginLeft: 'auto',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
  itemInner: {
    alignItems: 'center',
    display: 'flex',
    gap: spacingVars['--spacing-1-5'],
    width: '100%',
  },
})
