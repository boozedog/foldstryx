import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/**
 * Styled disclosure block (`<details>` / `<summary>`).
 * Maps to layoutStyles.detailsBox / detailsSummary.
 */
export type DetailsViewConfig<Message> = Readonly<{
  summary: string
  children: ReadonlyArray<Html | string>
  /** When true, the disclosure starts open. */
  open?: boolean
  /**
   * Emitted with the new open state when the native `<details>` toggles.
   * Apps use this to keep their model in sync with the disclosure.
   */
  onToggle?: (isOpen: boolean) => Message
}>

/** Styled details/summary disclosure. */
export const view = <Message>(config: DetailsViewConfig<Message>): Html => {
  const h = html<Message>()

  return h.details(
    elAttrs<Message>(
      sxAttrs(h, layoutStyles.detailsBox),
      ...(config.open === true ? [h.Open(true)] : []),
      ...(config.onToggle !== undefined ? [h.OnToggle(config.onToggle)] : []),
    ),
    [
      h.summary(elAttrs<Message>(sxAttrs(h, layoutStyles.detailsSummary)), [
        config.summary,
      ]),
      ...config.children,
    ],
  )
}
