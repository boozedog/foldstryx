import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/**
 * Prev/next + status text layout primitive.
 * Messages and labels stay in the app (pass Button.view or text as children).
 */
export type PaginationViewConfig = Readonly<{
  /** Status text (e.g. "Page 2 of 10" or "1–20 of 200"). */
  status: string
  /** Typically a Button.view previous control (or text in tests). */
  previous: Html | string
  /** Typically a Button.view next control (or text in tests). */
  next: Html | string
}>

/** Pagination bar: previous | status | next. */
export const view = <ParentMessage>(config: PaginationViewConfig): Html => {
  const h = html<ParentMessage>()

  return h.div(
    elAttrs<ParentMessage>(
      sxAttrs(h, layoutStyles.pagination),
      h.Role('navigation'),
      h.AriaLabel('Pagination'),
    ),
    [
      config.previous,
      h.span(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.muted)), [
        config.status,
      ]),
      config.next,
    ],
  )
}
