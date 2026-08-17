import type { Html, HtmlBuilder } from 'foldkit/html'

import { alertStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type AlertVariant = 'default' | 'destructive' | 'warning' | 'success'

export type AlertViewConfig = Readonly<{
  /** Primary message body (always shown). */
  body: string
  title?: string
  variant?: AlertVariant
  /** Compact single-line chrome (no action row layout). */
  compact?: boolean
  /** Optional action slot (e.g. dismiss button). */
  action?: Html
}>

const variantStyle = (variant: AlertVariant) => {
  switch (variant) {
    case 'destructive':
      return alertStyles.variantDestructive
    case 'warning':
      return alertStyles.variantWarning
    case 'success':
      return alertStyles.variantSuccess
    default:
      return alertStyles.variantDefault
  }
}

/** Renders an Astryx-styled alert / banner. */
export const view = <ParentMessage>(
  config: AlertViewConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const variant = config.variant ?? 'default'
  const compact = config.compact === true

  const content =
    config.title !== undefined
      ? [
          h.div(elAttrs<ParentMessage>(sxAttrs(h, alertStyles.body)), [
            h.p(elAttrs<ParentMessage>(sxAttrs(h, alertStyles.title)), [
              config.title,
            ]),
            h.p(elAttrs<ParentMessage>(sxAttrs(h, alertStyles.description)), [
              config.body,
            ]),
          ]),
        ]
      : [config.body]

  const children =
    config.action !== undefined && !compact
      ? [
          ...content,
          h.div(elAttrs<ParentMessage>(sxAttrs(h, alertStyles.actions)), [
            config.action,
          ]),
        ]
      : content

  return h.div(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        alertStyles.base,
        compact ? alertStyles.compact : undefined,
        variantStyle(variant),
      ),
      h.Role('alert'),
    ),
    children,
  )
}
