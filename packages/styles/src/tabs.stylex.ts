import {
  colorVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  spacingVars,
  typeScaleVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const tabsStyles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
  },
  list: {
    alignItems: 'center',
    backgroundColor: colorVars['--color-background-muted'],
    borderRadius: radiusVars['--radius-element'],
    color: colorVars['--color-text-secondary'],
    display: 'inline-flex',
    height: '2rem',
    justifyContent: 'center',
    padding: spacingVars['--spacing-0-5'],
    width: 'fit-content',
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: radiusVars['--radius-inner'],
    borderStyle: 'solid',
    borderWidth: 1,
    boxShadow: {
      default: 'none',
      ':focus-visible': shadowVars['--shadow-inset-selected'],
    },
    color: {
      default: colorVars['--color-text-secondary'],
      ':hover': colorVars['--color-text-primary'],
      ':disabled': colorVars['--color-text-disabled'],
    },
    cursor: {
      default: 'pointer',
      ':disabled': 'default',
    },
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    gap: spacingVars['--spacing-1-5'],
    height: 'calc(100% - 1px)',
    justifyContent: 'center',
    lineHeight: typeScaleVars['--text-body-leading'],
    opacity: {
      default: 1,
      ':disabled': 0.5,
    },
    outlineColor: {
      default: 'transparent',
      ':focus-visible': colorVars['--color-accent'],
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineWidth: {
      default: 0,
      ':focus-visible': 1,
    },
    paddingBlock: spacingVars['--spacing-0-5'],
    paddingInline: spacingVars['--spacing-1-5'],
    pointerEvents: {
      default: 'auto',
      ':disabled': 'none',
    },
    whiteSpace: 'nowrap',
  },
  triggerActive: {
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: shadowVars['--shadow-low'],
    color: colorVars['--color-text-primary'],
  },
  content: {
    color: colorVars['--color-text-primary'],
    flexGrow: 1,
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    outlineStyle: 'none',
  },
})
