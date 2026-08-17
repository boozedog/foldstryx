import type { Html, HtmlBuilder } from 'foldkit/html'

import { layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/**
 * Horizontal layout variants covering existing `layoutStyles.row*` keys.
 * Prefer option objects over one function per key.
 */
export type RowAlign =
  'between' | 'baseline' | 'startBetween' | 'wrap' | 'wrapCenter' | 'center'

export type RowViewConfig = Readonly<{
  align?: RowAlign
  children: ReadonlyArray<Html | string>
  /** Optional top margin: `'2'` → 0.5rem, `'3'` → 0.75rem. */
  mt?: '2' | '3'
  /** Align this row as flex-start within a parent flex container. */
  selfStart?: boolean
}>

const alignStyle = (align: RowAlign) => {
  switch (align) {
    case 'between':
      return layoutStyles.rowBetween
    case 'baseline':
      return layoutStyles.rowBaseline
    case 'startBetween':
      return layoutStyles.rowStartBetween
    case 'wrap':
      return layoutStyles.rowGap2
    case 'wrapCenter':
      return layoutStyles.rowGap3
    case 'center':
      return layoutStyles.rowCenterGap2
  }
}

const mtStyle = (mt: '2' | '3' | undefined) => {
  if (mt === '2') return layoutStyles.mt2
  if (mt === '3') return layoutStyles.mt3
  return undefined
}

/** Horizontal flex row with closed align variants. Prefer over raw layoutStyles.row*. */
export const view = <ParentMessage>(
  config: RowViewConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const align = config.align ?? 'between'

  return h.div(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        alignStyle(align),
        mtStyle(config.mt),
        config.selfStart === true ? layoutStyles.selfStart : undefined,
      ),
    ),
    config.children,
  )
}
