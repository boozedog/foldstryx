import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { cardStyles, layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type LoadingPanelViewConfig = Readonly<{
  message?: string
  /** When true, wrap in card chrome (default true). */
  card?: boolean
}>

/** Centered muted loading panel for async regions. */
export const view = <ParentMessage>(
  config: LoadingPanelViewConfig = {},
): Html => {
  const h = html<ParentMessage>()
  const message = config.message ?? 'Loading…'
  const useCard = config.card !== false

  const body = h.div(
    elAttrs<ParentMessage>(
      sxAttrs(h, layoutStyles.loadingPanel),
      h.AriaBusy(true),
      h.AriaLive('polite'),
    ),
    [message],
  )

  if (!useCard) {
    return body
  }

  return h.div(elAttrs<ParentMessage>(sxAttrs(h, cardStyles.root)), [body])
}
