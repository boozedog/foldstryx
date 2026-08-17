import type { Html, HtmlBuilder } from 'foldkit/html'

import { layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/**
 * Soft warning-tinted callout for inline notices.
 * Distinct from Alert (role=alert / stronger chrome): use Attention for
 * non-urgent tips; use Alert for errors, warnings that need role=alert.
 */
export type AttentionViewConfig = Readonly<{
  title?: string
  body: string
  children?: ReadonlyArray<Html | string>
}>

/** Non-alert soft callout (warning-tinted surface). */
export const view = <ParentMessage>(
  config: AttentionViewConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  return h.div(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.attentionCard)), [
    ...(config.title !== undefined
      ? [
          h.p(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.attentionTitle)), [
            config.title,
          ]),
        ]
      : []),
    h.p(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.attentionBody)), [
      config.body,
    ]),
    ...(config.children !== undefined ? config.children : []),
  ])
}
