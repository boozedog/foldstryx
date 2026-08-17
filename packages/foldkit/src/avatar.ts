import type { Html, HtmlBuilder } from 'foldkit/html'

import { avatarStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type AvatarSize = 'sm' | 'default' | 'lg'
export type AvatarShape = 'circle' | 'rounded'

export type AvatarViewConfig = Readonly<{
  /** Text shown when no image is present (or while it loads). */
  fallback: string
  imageSrc?: string
  /** Accessible name for the image. Defaults to `fallback`. */
  imageAlt?: string
  size?: AvatarSize
  shape?: AvatarShape
  /**
   * Accessible label for the avatar. When provided, the root is exposed as
   * `role="img"` with this `aria-label`. When omitted, the image `alt` (or the
   * fallback text) supplies the accessible name.
   */
  label?: string
}>

const sizeStyle = (size: AvatarSize) => {
  switch (size) {
    case 'sm':
      return avatarStyles.sizeSm
    case 'lg':
      return avatarStyles.sizeLg
    default:
      return avatarStyles.sizeDefault
  }
}

/** Semantic media primitive with token-faithful sizes and accessible labeling. */
export const view = <ParentMessage>(
  config: AvatarViewConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const size = config.size ?? 'default'
  const shape = config.shape ?? 'circle'

  const rootAttrs = elAttrs<ParentMessage>(
    ...(config.label !== undefined
      ? [h.Role('img'), h.AriaLabel(config.label)]
      : []),
    sxAttrs(
      h,
      avatarStyles.root,
      sizeStyle(size),
      shape === 'rounded' ? avatarStyles.rootRounded : undefined,
    ),
  )

  return h.div(rootAttrs, [
    ...(config.imageSrc !== undefined
      ? [
          h.img([
            ...elAttrs<ParentMessage>(sxAttrs(h, avatarStyles.image)),
            h.Src(config.imageSrc),
            h.Alt(config.imageAlt ?? config.fallback),
          ]),
        ]
      : []),
    h.div(
      elAttrs<ParentMessage>(
        sxAttrs(
          h,
          avatarStyles.fallback,
          size === 'sm' ? avatarStyles.fallbackSm : undefined,
        ),
      ),
      [config.fallback],
    ),
  ])
}
