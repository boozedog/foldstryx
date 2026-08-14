import {
  colorVars,
  fontWeightVars,
  radiusVars,
  sizeVars,
  typeScaleVars,
} from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export const avatarStyles = stylex.create({
  root: {
    borderRadius: radiusVars['--radius-full'],
    display: 'flex',
    flexShrink: 0,
    overflow: 'hidden',
    position: 'relative',
    userSelect: 'none',
  },
  rootRounded: {
    borderRadius: radiusVars['--radius-element'],
  },
  sizeSm: {
    height: sizeVars['--size-element-sm'],
    width: sizeVars['--size-element-sm'],
  },
  sizeDefault: {
    height: sizeVars['--size-element-md'],
    width: sizeVars['--size-element-md'],
  },
  sizeLg: {
    height: sizeVars['--size-element-lg'],
    width: sizeVars['--size-element-lg'],
  },
  image: {
    aspectRatio: '1',
    borderRadius: 'inherit',
    height: '100%',
    inset: 0,
    objectFit: 'cover',
    position: 'absolute',
    width: '100%',
  },
  fallback: {
    alignItems: 'center',
    backgroundColor: colorVars['--color-neutral'],
    borderRadius: 'inherit',
    color: colorVars['--color-text-primary'],
    display: 'flex',
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  fallbackSm: {
    fontSize: typeScaleVars['--text-supporting-size'],
  },
})
