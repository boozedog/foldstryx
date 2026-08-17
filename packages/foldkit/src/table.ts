import { Predicate } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { tableStyles } from '@foldstryx/styles'

import * as Checkbox from './checkbox.js'
import { elAttrs, sxAttrs } from './sx.js'

/** Scrollable card chrome around a table. */
export const wrap = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  return h.div(elAttrs<ParentMessage>(sxAttrs(h, tableStyles.wrap)), children)
}

/** Native `<table>` element with table styles. */
export const table = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  return h.table(
    elAttrs<ParentMessage>(sxAttrs(h, tableStyles.table)),
    children,
  )
}

/** Styled `<thead>`. */
export const thead = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  return h.thead(
    elAttrs<ParentMessage>(sxAttrs(h, tableStyles.thead)),
    children,
  )
}

/** Styled `<tbody>`. */
export const tbody = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
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
  h: HtmlBuilder<ParentMessage>,
): Html => {
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

export type TdConfig<ParentMessage = never> = Readonly<{
  align?: TdAlign
  /** Presentation tone (color). Independent of alignment. */
  tone?: TdTone
  children: ReadonlyArray<Html | string> | string
  onClick?: ParentMessage
  isPressed?: boolean
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

const normalizeTd = <ParentMessage>(
  config: TdConfig<ParentMessage> | string | ReadonlyArray<Html | string>,
): TdConfig<ParentMessage> => {
  if (typeof config === 'string') return { children: config }
  if (isArray(config)) return { children: config }
  return config
}

/** Styled table data cell. */
export const td = <ParentMessage>(
  config: TdConfig<ParentMessage> | string | ReadonlyArray<Html | string>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const normalized = normalizeTd(config)
  const children =
    typeof normalized.children === 'string'
      ? [normalized.children]
      : normalized.children

  const interactive =
    normalized.onClick !== undefined
      ? h.button(
          elAttrs<ParentMessage>(
            sxAttrs(
              h,
              tableStyles.cellInteractive,
              normalized.isPressed === true
                ? tableStyles.cellPressed
                : undefined,
            ),
            h.Type('button'),
            ...(normalized.isPressed !== undefined
              ? [h.AriaPressed(normalized.isPressed ? 'true' : 'false')]
              : []),
            ...(Predicate.isNotUndefined(normalized.onClick)
              ? [h.OnClick(normalized.onClick)]
              : []),
          ),
          children,
        )
      : undefined

  return h.td(
    elAttrs<ParentMessage>(
      sxAttrs(h, tdStyle(normalized.align), tdToneStyle(normalized.tone)),
    ),
    interactive !== undefined ? [interactive] : children,
  )
}

/** Generic row presentation — consumers map domain meaning onto these axes. */
export type TrPresentation = 'warning' | 'accent' | 'summary'

export type TrConfig = Readonly<{
  presentation?: TrPresentation
  isSelected?: boolean
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
export const tr = <ParentMessage>(
  config: TrConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const isSelected = config.isSelected === true
  return h.tr(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        trStyle(config.presentation),
        isSelected ? tableStyles.rowSelected : undefined,
      ),
      ...(isSelected ? [h.AriaSelected(true)] : []),
    ),
    config.children,
  )
}

export type SelectionHeaderConfig<ParentMessage> = Readonly<{
  checked: boolean
  isIndeterminate?: boolean
  onChange: (checked: boolean) => ParentMessage
  ariaLabel?: string
  isDisabled?: boolean
}>

/** Select-all checkbox header cell (dense). */
export const selectionHeader = <ParentMessage>(
  config: SelectionHeaderConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
  toSyncParent: (
    message: typeof Checkbox.CompletedSyncCheckboxIndeterminate.Type,
  ) => ParentMessage,
): Html => {
  return h.th(elAttrs<ParentMessage>(sxAttrs(h, tableStyles.selectionCell)), [
    Checkbox.control(
      {
        checked: config.checked,
        onChange: config.onChange,
        ariaLabel: config.ariaLabel ?? 'Select all',
        ...(config.isDisabled === true ? { isDisabled: true } : {}),
        ...(config.isIndeterminate === true ? { isIndeterminate: true } : {}),
      },
      h,
      toSyncParent,
    ),
  ])
}

export type SelectionCellConfig<ParentMessage> = Readonly<{
  rowId: string
  rowLabel: string
  checked: boolean
  onChange: (checked: boolean) => ParentMessage
  isSelectable?: boolean
  isDisabled?: boolean
}>

/** Per-row selection checkbox cell (dense). */
export const selectionCell = <ParentMessage>(
  config: SelectionCellConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
  toSyncParent: (
    message: typeof Checkbox.CompletedSyncCheckboxIndeterminate.Type,
  ) => ParentMessage,
): Html => {
  const isSelectable = config.isSelectable ?? true
  if (!isSelectable) {
    return h.td(elAttrs<ParentMessage>(sxAttrs(h, tableStyles.selectionCell)))
  }

  return h.td(elAttrs<ParentMessage>(sxAttrs(h, tableStyles.selectionCell)), [
    Checkbox.control(
      {
        id: `select-${config.rowId}`,
        checked: config.checked,
        onChange: config.onChange,
        ariaLabel: `Select ${config.rowLabel}`,
        ...(config.isDisabled === true ? { isDisabled: true } : {}),
      },
      h,
      toSyncParent,
    ),
  ])
}
