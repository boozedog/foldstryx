import type { Html, HtmlBuilder } from 'foldkit/html'

import { layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/**
 * Styled disclosure block (`<details>` / `<summary>`).
 * Maps to layoutStyles.detailsBox / detailsSummary.
 */
export type DetailsViewConfig<Message> = Readonly<{
  summary: string
  children: ReadonlyArray<Html | string>
  /** Controlled open state. Applied on every render; the app keeps it in sync via onToggle. */
  open?: boolean
  /**
   * Emitted with the new open state when the native `<details>` toggles.
   * Apps use this to keep their model in sync with the disclosure.
   */
  onToggle?: (isOpen: boolean) => Message
}>

/** Styled details/summary disclosure. */
export const view = <Message>(
  config: DetailsViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html => {
  return h.details(
    elAttrs<Message>(
      sxAttrs(h, layoutStyles.detailsBox),
      h.Open(config.open === true),
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
