import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { fieldStyles, formDensityStyles, inputStyles } from '@foldstryx/styles'

import type { InputDensity, InputWidth } from './input.js'
import { elAttrs, sxAttrs } from './sx.js'

/**
 * Native `<select>` with the same form axes as Input: density and width are
 * independent. Use for short closed option lists; prefer a combobox for
 * searchable / large option sets.
 */
export type NativeSelectOption = Readonly<{
  value: string
  label: string
}>

export type NativeSelectViewConfig<ParentMessage> = Readonly<{
  id?: string
  value: string
  options: ReadonlyArray<NativeSelectOption>
  onChange: (value: string) => ParentMessage
  isDisabled?: boolean
  /** Shared form density (default | compact). Independent of width. */
  density?: InputDensity
  /** Shared form width axis. Independent of density. Overrides base width 100%. */
  width?: InputWidth
  /** Accessible name when no associated label element. */
  ariaLabel?: string
  label?: string
}>

const densityStyle = (density: InputDensity | undefined) => {
  switch (density) {
    case 'compact':
      return formDensityStyles.inputCompact
    default:
      return undefined
  }
}

const widthStyles = {
  auto: formDensityStyles.inputWidthAuto,
  sm: formDensityStyles.inputWidthSm,
  md: formDensityStyles.inputWidthMd,
  full: formDensityStyles.inputWidthFull,
} as const
const widthStyle = (width: InputWidth | undefined) =>
  width === undefined ? undefined : widthStyles[width]

/** Renders a styled native `<select>` (pragmatic v1 — no combobox). */
export const view = <ParentMessage>(
  config: NativeSelectViewConfig<ParentMessage>,
): Html => {
  const h = html<ParentMessage>()

  const select = h.select(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        inputStyles.input,
        densityStyle(config.density),
        widthStyle(config.width),
      ),
      ...(config.id !== undefined ? [h.Id(config.id)] : []),
      ...(config.ariaLabel !== undefined
        ? [h.AriaLabel(config.ariaLabel)]
        : []),
      ...(config.isDisabled === true ? [h.Disabled(true)] : []),
      h.Value(config.value),
      h.OnChange(config.onChange),
    ),
    config.options.map(option =>
      h.option(
        [
          h.Value(option.value),
          ...(option.value === config.value ? [h.Selected(true)] : []),
        ],
        [option.label],
      ),
    ),
  )
  return config.label === undefined
    ? select
    : h.div(elAttrs<ParentMessage>(sxAttrs(h, fieldStyles.field)), [
        h.label(
          elAttrs<ParentMessage>(
            sxAttrs(h, fieldStyles.label),
            ...(config.id !== undefined ? [h.For(config.id)] : []),
          ),
          [config.label],
        ),
        select,
      ])
}
