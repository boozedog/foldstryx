import type { Html, HtmlBuilder } from 'foldkit/html'

import { spinnerStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerShade = 'default' | 'onMedia' | 'subtle' | 'inherit'

export type SpinnerViewConfig = Readonly<{
  size?: SpinnerSize
  shade?: SpinnerShade
  /** Visible label below the spinner. */
  label?: string
  ariaLabel?: string
}>

const sizeStyle = (size: SpinnerSize) => {
  switch (size) {
    case 'sm':
      return spinnerStyles.sizeSm
    case 'lg':
      return spinnerStyles.sizeLg
    case 'xl':
      return spinnerStyles.sizeXl
    default:
      return spinnerStyles.sizeMd
  }
}

const shadeStyle = (shade: SpinnerShade) => {
  switch (shade) {
    case 'onMedia':
      return spinnerStyles.shadeOnMedia
    case 'subtle':
      return spinnerStyles.shadeSubtle
    case 'inherit':
      return spinnerStyles.shadeInherit
    default:
      return spinnerStyles.shadeDefault
  }
}

/** CSS ring loading indicator (Astryx Spinner visuals without canvas). */
export const view = <ParentMessage>(
  config: SpinnerViewConfig = {},
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const size = config.size ?? 'md'
  const shade = config.shade ?? 'default'
  const resolvedAriaLabel = config.ariaLabel ?? config.label ?? 'Loading'

  const spinner = h.span(
    elAttrs<ParentMessage>(
      sxAttrs(h, spinnerStyles.spinner, sizeStyle(size), shadeStyle(shade)),
      h.Role('status'),
      h.AriaLabel(resolvedAriaLabel),
    ),
  )

  if (config.label === undefined) {
    return spinner
  }

  return h.div(elAttrs<ParentMessage>(sxAttrs(h, spinnerStyles.wrapper)), [
    spinner,
    h.span(elAttrs<ParentMessage>(sxAttrs(h, spinnerStyles.label)), [
      config.label,
    ]),
  ])
}
