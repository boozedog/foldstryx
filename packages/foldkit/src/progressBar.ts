import type { Html, HtmlBuilder } from 'foldkit/html'

import { progressBarDynamicStyles, progressBarStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type ProgressBarVariant =
  'accent' | 'success' | 'warning' | 'neutral' | 'error'

export type ProgressBarViewConfig = Readonly<{
  value?: number
  max?: number
  label: string
  isLabelHidden?: boolean
  hasValueLabel?: boolean
  formatValueLabel?: (value: number, max: number) => string
  variant?: ProgressBarVariant
  isIndeterminate?: boolean
  isDisabled?: boolean
}>

const defaultFormatValueLabel = (value: number, max: number): string => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return `${pct}%`
}

const variantStyle = (variant: ProgressBarVariant, isDisabled: boolean) => {
  if (isDisabled) {
    return progressBarStyles.variantDisabled
  }
  switch (variant) {
    case 'success':
      return progressBarStyles.variantSuccess
    case 'warning':
      return progressBarStyles.variantWarning
    case 'error':
      return progressBarStyles.variantError
    case 'neutral':
      return progressBarStyles.variantNeutral
    default:
      return progressBarStyles.variantAccent
  }
}

/** Determinate or indeterminate progress bar with Astryx token variants. */
export const view = <ParentMessage>(
  config: ProgressBarViewConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const max = Number.isFinite(config.max ?? 100) ? (config.max ?? 100) : 100
  const rawValue = Number.isFinite(config.value ?? 0) ? (config.value ?? 0) : 0
  const clampedValue = Math.min(Math.max(0, rawValue), max)
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0
  const variant = config.variant ?? 'accent'
  const isDisabled = config.isDisabled === true
  const isIndeterminate = config.isIndeterminate === true
  const formatValueLabel = config.formatValueLabel ?? defaultFormatValueLabel
  const valueText = formatValueLabel(clampedValue, max)
  const showValueLabel = config.hasValueLabel === true && !isIndeterminate
  const isLabelHidden = config.isLabelHidden === true
  const labelId = `${config.label.replace(/\s+/g, '-').toLowerCase()}-label`

  const labelNode = h.span(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        progressBarStyles.label,
        isLabelHidden ? progressBarStyles.visuallyHidden : undefined,
        isDisabled ? progressBarStyles.labelDisabled : undefined,
      ),
      h.Id(labelId),
    ),
    [config.label],
  )

  const header =
    !isLabelHidden || showValueLabel
      ? h.div(elAttrs<ParentMessage>(sxAttrs(h, progressBarStyles.header)), [
          labelNode,
          ...(showValueLabel
            ? [
                h.span(
                  elAttrs<ParentMessage>(
                    sxAttrs(
                      h,
                      progressBarStyles.valueLabel,
                      isDisabled
                        ? progressBarStyles.valueLabelDisabled
                        : undefined,
                    ),
                  ),
                  [valueText],
                ),
              ]
            : []),
        ])
      : h.span(
          elAttrs<ParentMessage>(
            sxAttrs(h, progressBarStyles.visuallyHidden),
            h.Id(labelId),
          ),
          [config.label],
        )

  const fillStyle = variantStyle(variant, isDisabled)

  return h.div(
    elAttrs<ParentMessage>(sxAttrs(h, progressBarStyles.container)),
    [
      header,
      h.div(
        elAttrs<ParentMessage>(
          sxAttrs(h, progressBarStyles.track),
          h.Role('progressbar'),
          ...(isIndeterminate
            ? []
            : [
                h.AriaValuenow(clampedValue),
                h.AriaValuemin(0),
                h.AriaValuemax(max),
                h.AriaValuetext(valueText),
              ]),
          h.AriaLabelledBy(labelId),
        ),
        [
          isIndeterminate
            ? h.div(
                elAttrs<ParentMessage>(
                  sxAttrs(h, progressBarStyles.indeterminateFill, fillStyle),
                ),
              )
            : h.div(
                elAttrs<ParentMessage>(
                  sxAttrs(
                    h,
                    progressBarStyles.fill,
                    fillStyle,
                    progressBarDynamicStyles.fillWidth(percentage),
                  ),
                ),
              ),
        ],
      ),
    ],
  )
}
