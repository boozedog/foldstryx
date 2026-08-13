import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { badgeStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'

export type BadgeSize = 'default' | 'lg'

export type BadgeViewConfig = Readonly<{
  label: string
  variant?: BadgeVariant
  size?: BadgeSize
}>

const variantStyle = (variant: BadgeVariant) => {
  switch (variant) {
    case 'secondary':
      return badgeStyles.variantSecondary
    case 'destructive':
      return badgeStyles.variantDestructive
    case 'outline':
      return badgeStyles.variantOutline
    case 'success':
      return badgeStyles.variantSuccess
    case 'warning':
      return badgeStyles.variantWarning
    case 'info':
      return badgeStyles.variantInfo
    default:
      return badgeStyles.variantDefault
  }
}

const sizeStyle = (size: BadgeSize) => {
  switch (size) {
    case 'lg':
      return badgeStyles.sizeLg
    default:
      return badgeStyles.sizeDefault
  }
}

/** Renders an Astryx-styled status/metadata badge. */
export const view = <ParentMessage>(config: BadgeViewConfig): Html => {
  const h = html<ParentMessage>()
  const variant = config.variant ?? 'default'
  const size = config.size ?? 'default'

  return h.span(
    elAttrs<ParentMessage>(
      sxAttrs(h, badgeStyles.base, variantStyle(variant), sizeStyle(size)),
    ),
    [config.label],
  )
}
