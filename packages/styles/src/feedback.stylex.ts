import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

const spinnerRotation = stylex.keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
})

const skeletonFade = stylex.keyframes({
  '0%': { opacity: 0.25 },
  '100%': { opacity: 1 },
})

const indeterminateSlide = stylex.keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(250%)' },
})

export const spinnerStyles = stylex.create({
  wrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  spinner: {
    display: 'inline-grid',
    placeItems: 'center',
    overflow: 'hidden',
    verticalAlign: 'middle',
    borderRadius: radiusVars['--radius-full'],
    animationName: spinnerRotation,
    animationDuration: {
      default: durationVars['--duration-slow-min'],
      '@media (prefers-reduced-motion: reduce)': '3s',
    },
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  sizeSm: {
    width: '10px',
    height: '10px',
    borderWidth: '2px',
  },
  sizeMd: {
    width: '14px',
    height: '14px',
    borderWidth: '2px',
  },
  sizeLg: {
    width: '18px',
    height: '18px',
    borderWidth: '3px',
  },
  sizeXl: {
    width: '28px',
    height: '28px',
    borderWidth: '3px',
  },
  shadeDefault: {
    borderStyle: 'solid',
    borderColor: colorVars['--color-track'],
    borderTopColor: colorVars['--color-accent'],
  },
  shadeOnMedia: {
    borderStyle: 'solid',
    borderColor: `color-mix(in srgb, ${colorVars['--color-on-dark']} 30%, transparent)`,
    borderTopColor: colorVars['--color-on-dark'],
  },
  shadeSubtle: {
    borderStyle: 'solid',
    borderColor: colorVars['--color-track'],
    borderTopColor: colorVars['--color-text-secondary'],
  },
  shadeInherit: {
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, currentColor 30%, transparent)',
    borderTopColor: 'currentColor',
  },
  label: {
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: typeScaleVars['--text-body-weight'],
    color: colorVars['--color-text-primary'],
  },
})

export const progressBarStyles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    width: '100%',
    minWidth: '48px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: typeScaleVars['--text-label-weight'],
    color: colorVars['--color-text-primary'],
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
  },
  valueLabel: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-secondary'],
  },
  valueLabelDisabled: {
    color: colorVars['--color-text-disabled'],
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  track: {
    width: '100%',
    height: '8px',
    backgroundColor: colorVars['--color-background-muted'],
    borderRadius: radiusVars['--radius-full'],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radiusVars['--radius-full'],
    transitionProperty: 'width',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  indeterminateFill: {
    height: '100%',
    width: '40%',
    borderRadius: radiusVars['--radius-full'],
    animationName: indeterminateSlide,
    animationDuration: {
      default: '1.5s',
      '@media (prefers-reduced-motion: reduce)': '3s',
    },
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  variantAccent: {
    backgroundColor: colorVars['--color-accent'],
  },
  variantSuccess: {
    backgroundColor: colorVars['--color-success'],
  },
  variantWarning: {
    backgroundColor: colorVars['--color-warning'],
  },
  variantError: {
    backgroundColor: colorVars['--color-error'],
  },
  variantNeutral: {
    backgroundColor: colorVars['--color-text-disabled'],
  },
  variantDisabled: {
    backgroundColor: colorVars['--color-text-disabled'],
  },
})

export const progressBarDynamicStyles = stylex.create({
  fillWidth: (percentage: number) => ({
    width: `${percentage}%`,
  }),
})

export const skeletonStyles = stylex.create({
  root: {
    backgroundColor: {
      default: colorVars['--color-skeleton'],
      '@media (prefers-contrast: more)': `color-mix(in srgb, ${colorVars['--color-skeleton']}, ${colorVars['--color-text-primary']} 30%)`,
    },
    opacity: 0.25,
  },
  animate: {
    animationDirection: 'alternate',
    animationDuration: durationVars['--duration-medium-max'],
    animationIterationCount: 'infinite',
    animationName: {
      default: skeletonFade,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: 'steps(10, end)',
  },
  radiusNone: { borderRadius: 0 },
  radius0: { borderRadius: radiusVars['--radius-none'] },
  radius1: { borderRadius: radiusVars['--radius-inner'] },
  radius2: { borderRadius: radiusVars['--radius-element'] },
  radius3: { borderRadius: radiusVars['--radius-container'] },
  radius4: { borderRadius: radiusVars['--radius-container'] },
  radiusRounded: { borderRadius: radiusVars['--radius-full'] },
})

export const skeletonDynamicStyles = stylex.create({
  animationDelay: (index: number) => ({
    animationDelay: `${1000 + 100 * index}ms`,
  }),
  dimensions: (width: number | string, height: number | string) => ({
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }),
})
