import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { tableStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/** Scrollable card chrome around a table. */
export const wrap = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
): Html => {
  const h = html<ParentMessage>()
  return h.div(elAttrs<ParentMessage>(sxAttrs(h, tableStyles.wrap)), children)
}

/** Native `<table>` element with table styles. */
export const table = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
): Html => {
  const h = html<ParentMessage>()
  return h.table(
    elAttrs<ParentMessage>(sxAttrs(h, tableStyles.table)),
    children,
  )
}

/** Styled `<thead>`. */
export const thead = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
): Html => {
  const h = html<ParentMessage>()
  return h.thead(
    elAttrs<ParentMessage>(sxAttrs(h, tableStyles.thead)),
    children,
  )
}

/** Styled `<tbody>`. */
export const tbody = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
): Html => {
  const h = html<ParentMessage>()
  return h.tbody([], children)
}

export type ThAlign = 'left' | 'right' | 'narrow'

export type ThConfig = Readonly<{
  align?: ThAlign
  children: ReadonlyArray<Html | string> | string
}>

const thStyle = (align: ThAlign = 'left') => {
  switch (align) {
    case 'right':
      return tableStyles.thRight
    case 'narrow':
      return tableStyles.thNarrow
    default:
      return tableStyles.th
  }
}

const isArray = (value: unknown): value is ReadonlyArray<unknown> =>
  Array.isArray(value)

const normalizeTh = (
  config: ThConfig | string | ReadonlyArray<Html | string>,
): ThConfig => {
  if (typeof config === 'string') return { children: config }
  if (isArray(config)) return { children: config }
  return config
}

/** Styled table header cell. */
export const th = <ParentMessage>(
  config: ThConfig | string | ReadonlyArray<Html | string>,
): Html => {
  const h = html<ParentMessage>()
  const normalized = normalizeTh(config)
  const children =
    typeof normalized.children === 'string'
      ? [normalized.children]
      : normalized.children

  return h.th(
    elAttrs<ParentMessage>(sxAttrs(h, thStyle(normalized.align))),
    children,
  )
}

export type TdAlign = 'left' | 'right' | 'narrow' | 'plain' | 'plainRight'

/** Generic cell tone — consumers map domain meaning onto these axes. */
export type TdTone = 'destructive' | 'success' | 'warning'

export type TdConfig = Readonly<{
  align?: TdAlign
  /** Presentation tone (color). Independent of alignment. */
  tone?: TdTone
  children: ReadonlyArray<Html | string> | string
}>

const tdStyle = (align: TdAlign = 'left') => {
  switch (align) {
    case 'right':
      return tableStyles.tdRight
    case 'narrow':
      return tableStyles.tdNarrow
    case 'plain':
      return tableStyles.tdPlain
    case 'plainRight':
      return tableStyles.tdPlainRight
    default:
      return tableStyles.td
  }
}

const tdToneStyle = (tone: TdTone | undefined) => {
  switch (tone) {
    case 'destructive':
      return tableStyles.toneDestructive
    case 'success':
      return tableStyles.toneSuccess
    case 'warning':
      return tableStyles.toneWarning
    default:
      return undefined
  }
}

const normalizeTd = (
  config: TdConfig | string | ReadonlyArray<Html | string>,
): TdConfig => {
  if (typeof config === 'string') return { children: config }
  if (isArray(config)) return { children: config }
  return config
}

/** Styled table data cell. */
export const td = <ParentMessage>(
  config: TdConfig | string | ReadonlyArray<Html | string>,
): Html => {
  const h = html<ParentMessage>()
  const normalized = normalizeTd(config)
  const children =
    typeof normalized.children === 'string'
      ? [normalized.children]
      : normalized.children

  return h.td(
    elAttrs<ParentMessage>(
      sxAttrs(h, tdStyle(normalized.align), tdToneStyle(normalized.tone)),
    ),
    children,
  )
}

/** Generic row presentation — consumers map domain meaning onto these axes. */
export type TrPresentation = 'warning' | 'accent' | 'summary'

export type TrConfig = Readonly<{
  presentation?: TrPresentation
  children: ReadonlyArray<Html | string>
}>

const trStyle = (presentation: TrPresentation | undefined) => {
  switch (presentation) {
    case 'warning':
      return tableStyles.rowWarning
    case 'accent':
      return tableStyles.rowAccent
    case 'summary':
      return tableStyles.rowSummary
    default:
      return undefined
  }
}

/** Styled table row with optional presentation axis. */
export const tr = <ParentMessage>(config: TrConfig): Html => {
  const h = html<ParentMessage>()
  return h.tr(
    elAttrs<ParentMessage>(sxAttrs(h, trStyle(config.presentation))),
    config.children,
  )
}
