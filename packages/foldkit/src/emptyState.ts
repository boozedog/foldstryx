import type { Html, HtmlBuilder } from 'foldkit/html'

import { cardStyles, layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type EmptyStateViewConfig = Readonly<{
  message: string
  /** Optional title above the message. */
  title?: string
  /** Optional action slot (e.g. Button). Centered at intrinsic width. */
  action?: Html
  /** When true, wrap in card chrome (default true). */
  card?: boolean
}>

/** Centered empty / zero-results panel with optional action. */
export const view = <ParentMessage>(
  config: EmptyStateViewConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const useCard = config.card !== false

  const content = h.div(
    elAttrs<ParentMessage>(
      sxAttrs(h, layoutStyles.loadingPanel, layoutStyles.stackSm),
    ),
    [
      ...(config.title !== undefined
        ? [
            h.p(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.sectionTitle)), [
              config.title,
            ]),
          ]
        : []),
      h.p(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.muted)), [
        config.message,
      ]),
      ...(config.action !== undefined
        ? [
            // Keep action at intrinsic width and centered (stack is stretch by default).
            h.div(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.selfCenter)), [
              config.action,
            ]),
          ]
        : []),
    ],
  )

  if (!useCard) {
    return content
  }

  return h.div(
    elAttrs<ParentMessage>(sxAttrs(h, cardStyles.root, layoutStyles.panelPad)),
    [content],
  )
}
