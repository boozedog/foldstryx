import type { Html, HtmlBuilder } from 'foldkit/html'

import { skeletonDynamicStyles, skeletonStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type SkeletonRadius = 'none' | 0 | 1 | 2 | 3 | 4 | 'rounded'

export type SkeletonViewConfig = Readonly<{
  width?: number | string
  height?: number | string
  radius?: SkeletonRadius
  index?: number
}>

const radiusStyle = (radius: SkeletonRadius) => {
  switch (radius) {
    case 'none':
      return skeletonStyles.radiusNone
    case 0:
      return skeletonStyles.radius0
    case 1:
      return skeletonStyles.radius1
    case 2:
      return skeletonStyles.radius2
    case 4:
      return skeletonStyles.radius4
    case 'rounded':
      return skeletonStyles.radiusRounded
    default:
      return skeletonStyles.radius3
  }
}

/** Pulsing placeholder block with staggered animation support. */
export const view = <ParentMessage>(
  config: SkeletonViewConfig = {},
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const width = config.width ?? '100%'
  const height = config.height ?? '100%'
  const radius = config.radius ?? 3
  const index = config.index ?? 0

  return h.div(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        skeletonStyles.root,
        skeletonStyles.animate,
        radiusStyle(radius),
        skeletonDynamicStyles.dimensions(width, height),
        skeletonDynamicStyles.animationDelay(index),
      ),
      h.AriaHidden(true),
    ),
  )
}
