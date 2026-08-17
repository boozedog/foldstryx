import type { Html, HtmlBuilder } from 'foldkit/html'

import { gridStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type GridColumns = 2 | 3 | 4 | 'summary'
export type GridGap = 'sm' | 'md' | 'lg'

export type GridViewConfig = Readonly<{
  columns?: GridColumns
  gap?: GridGap
  children: ReadonlyArray<Html | string>
  /** Optional top margin: `'2'` → 0.5rem, `'3'` → 0.75rem. */
  mt?: '2' | '3'
}>

const columnsStyle = (columns: GridColumns) => {
  switch (columns) {
    case 2:
      return gridStyles.grid2
    case 3:
      return gridStyles.grid3
    case 4:
      return gridStyles.grid4
    case 'summary':
      return gridStyles.gridSummary
  }
}

const gapStyle = (gap: GridGap) => {
  switch (gap) {
    case 'sm':
      return gridStyles.gapSm
    case 'lg':
      return gridStyles.gapLg
    default:
      return gridStyles.gapMd
  }
}

const mtStyle = (mt: '2' | '3' | undefined) => {
  if (mt === '2') return gridStyles.mt2
  if (mt === '3') return gridStyles.mt3
  return undefined
}

/** Responsive CSS grid over closed column presets and a token gap scale. */
export const view = <ParentMessage>(
  config: GridViewConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const columns = config.columns ?? 2
  const gap = config.gap ?? 'md'

  return h.div(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        gridStyles.base,
        columnsStyle(columns),
        gapStyle(gap),
        mtStyle(config.mt),
      ),
    ),
    config.children,
  )
}
