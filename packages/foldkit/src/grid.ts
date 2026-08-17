import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Mount from 'foldkit/mount'

import { gridDynamicStyles, gridStyles } from '@foldstryx/styles'

import {
  CompletedGridFocus,
  type GridFocusMountConfig,
  keyDownHandler,
  mountFromConfig,
} from './gridFocus.js'
import { elAttrs, sxAttrs } from './sx.js'

export type GridLegacyColumns = 2 | 3 | 4 | 'summary'

export type GridResponsiveColumns = Readonly<{
  minWidth: number
  max?: number
  repeat?: 'fill' | 'fit'
}>

export type GridColumns = GridLegacyColumns | number | GridResponsiveColumns

export type GridGap = 'sm' | 'md' | 'lg'
export type GridAlignment = 'start' | 'center' | 'end' | 'stretch'

export type GridViewConfig = Readonly<{
  columns?: GridColumns
  gap?: GridGap
  align?: GridAlignment
  justify?: GridAlignment
  children: ReadonlyArray<Html | string>
  /** Optional top margin: `'2'` → 0.5rem, `'3'` → 0.75rem. */
  mt?: '2' | '3'
}>

const isLegacyColumns = (columns: GridColumns): columns is GridLegacyColumns =>
  columns === 2 || columns === 3 || columns === 4 || columns === 'summary'

const isResponsiveColumns = (
  columns: GridColumns,
): columns is GridResponsiveColumns =>
  typeof columns === 'object' && columns !== null && 'minWidth' in columns

const spacingVarNames: Record<GridGap, string> = {
  sm: '--spacing-2',
  md: '--spacing-4',
  lg: '--spacing-6',
}

/**
 * Caps column count while letting present tracks stretch (Astryx `buildCappedTemplate`).
 */
export const buildCappedTemplate = (
  minWidth: number,
  maxCols: number,
  repeatMode: 'auto-fill' | 'auto-fit',
  gap: GridGap,
): string => {
  const gapVar = spacingVarNames[gap]
  const perColumn = `calc((100% - ${maxCols - 1} * var(${gapVar})) / ${maxCols})`
  const trackMin = `min(100%, max(${minWidth}px, ${perColumn}))`
  return `repeat(${repeatMode}, minmax(${trackMin}, 1fr))`
}

const resolveTemplateColumns = (
  columns: GridColumns,
  gap: GridGap,
): string | undefined => {
  if (isLegacyColumns(columns)) {
    return undefined
  }
  if (isResponsiveColumns(columns)) {
    const repeatMode = columns.repeat === 'fit' ? 'auto-fit' : 'auto-fill'
    if (columns.max !== undefined && columns.max > 0) {
      return buildCappedTemplate(columns.minWidth, columns.max, repeatMode, gap)
    }
    return `repeat(${repeatMode}, minmax(${columns.minWidth}px, 1fr))`
  }
  if (typeof columns === 'number' && columns >= 1) {
    return `repeat(${columns}, 1fr)`
  }
  return undefined
}

/** Resolves the CSS `grid-template-columns` value for a columns config. */
export const templateColumnsFor = (
  columns: GridColumns,
  gap: GridGap = 'md',
): string | undefined => resolveTemplateColumns(columns, gap)

const legacyColumnsStyle = (columns: GridLegacyColumns) => {
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

const alignStyle = (align: GridAlignment | undefined) => {
  switch (align) {
    case 'start':
      return gridStyles.alignStart
    case 'center':
      return gridStyles.alignCenter
    case 'end':
      return gridStyles.alignEnd
    case 'stretch':
      return gridStyles.alignStretch
    default:
      return undefined
  }
}

const justifyStyle = (justify: GridAlignment | undefined) => {
  switch (justify) {
    case 'start':
      return gridStyles.justifyStart
    case 'center':
      return gridStyles.justifyCenter
    case 'end':
      return gridStyles.justifyEnd
    case 'stretch':
      return gridStyles.justifyStretch
    default:
      return undefined
  }
}

const mtStyle = (mt: '2' | '3' | undefined) => {
  if (mt === '2') return gridStyles.mt2
  if (mt === '3') return gridStyles.mt3
  return undefined
}

const columnsStyle = (columns: GridColumns) => {
  if (isLegacyColumns(columns)) {
    return legacyColumnsStyle(columns)
  }
  return undefined
}

/** Responsive CSS grid with Astryx-aligned column configuration. */
export const view = <ParentMessage>(
  config: GridViewConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const columns = config.columns ?? 2
  const gap = config.gap ?? 'md'
  const templateColumns = resolveTemplateColumns(columns, gap)

  return h.div(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        gridStyles.base,
        columnsStyle(columns),
        templateColumns !== undefined
          ? gridDynamicStyles.templateColumns(templateColumns)
          : undefined,
        gapStyle(gap),
        alignStyle(config.align),
        justifyStyle(config.justify),
        mtStyle(config.mt),
      ),
    ),
    config.children,
  )
}

export type GridMatrixConfig = Readonly<{
  columns: number
  gap?: GridGap
  ariaLabel?: string
  children: ReadonlyArray<Html | string>
  gridFocus?: GridFocusMountConfig
}>

/** `role="gridcell"` wrapper for matrix children. */
export const gridcell = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<ParentMessage>,
): Html => h.div(elAttrs<ParentMessage>(h.Role('gridcell')), children)

/** Matrix grid root with `role="grid"` and keyboard navigation mount. */
export const matrix = <ParentMessage>(
  config: GridMatrixConfig,
  h: HtmlBuilder<ParentMessage>,
  toGridFocusParent: (message: typeof CompletedGridFocus.Type) => ParentMessage,
): Html => {
  const gap = config.gap ?? 'md'
  const focusConfig: GridFocusMountConfig = config.gridFocus ?? {
    columns: config.columns,
    cellSelector: '[role="gridcell"]',
    hasRovingTabIndex: true,
  }
  const templateColumns = `repeat(${config.columns}, 1fr)`

  return h.div(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        gridStyles.base,
        gridDynamicStyles.templateColumns(templateColumns),
        gapStyle(gap),
      ),
      h.Role('grid'),
      ...(config.ariaLabel !== undefined
        ? [h.AriaLabel(config.ariaLabel)]
        : []),
      h.OnKeyDownPreventDefault(keyDownHandler(focusConfig)),
      h.OnMount(
        Mount.mapMessage(mountFromConfig(focusConfig), toGridFocusParent),
      ),
    ),
    config.children,
  )
}
