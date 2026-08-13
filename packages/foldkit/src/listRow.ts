import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/**
 * Responsive list chrome: title (+ optional meta) and actions row.
 * Maps to layoutStyles.listRow / listRowTitle.
 */
export type ListRowViewConfig = Readonly<{
  title: string
  /** Optional secondary content under or beside the title. */
  meta?: ReadonlyArray<Html | string>
  actions?: ReadonlyArray<Html | string>
}>

/** Title + actions list row for responsive list layouts. */
export const view = <ParentMessage>(config: ListRowViewConfig): Html => {
  const h = html<ParentMessage>()

  const titleBlock = h.div(
    [],
    [
      h.p(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.listRowTitle)), [
        config.title,
      ]),
      ...(config.meta !== undefined ? config.meta : []),
    ],
  )

  return h.div(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.listRow)), [
    titleBlock,
    ...(config.actions !== undefined && config.actions.length > 0
      ? [
          h.div(
            elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.rowCenterGap2)),
            config.actions,
          ),
        ]
      : []),
  ])
}
