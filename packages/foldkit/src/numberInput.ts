import type { Html, HtmlBuilder } from 'foldkit/html'

import { Input as UiInput } from '@foldkit/ui'
import {
  fieldStyles,
  formDensityStyles,
  inputWrapperStyles,
  numberInputStyles,
} from '@foldstryx/styles'

import type { InputDensity, InputWidth } from './input.js'
import { elAttrs, sxAttrs } from './sx.js'

export type NumberInputViewConfig<M> = Readonly<{
  id: string
  label: string
  value?: string
  onInput?: (value: string) => M
  placeholder?: string
  description?: string
  error?: string
  min?: number
  max?: number
  step?: number
  units?: string
  isDisabled?: boolean
  density?: InputDensity
  width?: InputWidth
}>

const widthStyle = (width: InputWidth | undefined) => {
  switch (width) {
    case 'auto':
      return formDensityStyles.inputWidthAuto
    case 'sm':
      return formDensityStyles.inputWidthSm
    case 'md':
      return formDensityStyles.inputWidthMd
    case 'full':
      return formDensityStyles.inputWidthFull
    default:
      return undefined
  }
}

const numberInputControl = <M>(
  config: NumberInputViewConfig<M>,
  a: Readonly<{ input: ReadonlyArray<unknown> }>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    elAttrs<M>(
      sxAttrs(
        h,
        inputWrapperStyles.base,
        config.density === 'compact'
          ? formDensityStyles.inputCompact
          : undefined,
        config.isDisabled === true ? inputWrapperStyles.disabled : undefined,
      ),
    ),
    [
      h.input(
        elAttrs<M>(
          a.input,
          sxAttrs(
            h,
            numberInputStyles.input,
            config.isDisabled === true
              ? numberInputStyles.inputDisabled
              : undefined,
          ),
          h.Type('number'),
          ...(config.min !== undefined ? [h.Min(String(config.min))] : []),
          ...(config.max !== undefined ? [h.Max(String(config.max))] : []),
          ...(config.step !== undefined ? [h.Step(String(config.step))] : []),
        ),
      ),
      ...(config.units
        ? [
            h.span(elAttrs<M>(sxAttrs(h, numberInputStyles.units)), [
              config.units,
            ]),
          ]
        : []),
    ],
  )

/** Labeled native number field with optional units suffix. */
export const view = <M>(
  config: NumberInputViewConfig<M>,
  h: HtmlBuilder<M>,
): Html =>
  UiInput.view<M>(
    {
      id: config.id,
      type: 'number',
      ...(config.value !== undefined ? { value: config.value } : {}),
      ...(config.onInput ? { onInput: config.onInput } : {}),
      ...(config.placeholder ? { placeholder: config.placeholder } : {}),
      ...(config.isDisabled ? { isDisabled: true } : {}),
      toView: a =>
        h.div(
          elAttrs<M>(sxAttrs(h, fieldStyles.field, widthStyle(config.width))),
          [
            h.label(elAttrs<M>(a.label, sxAttrs(h, fieldStyles.label)), [
              config.label,
            ]),
            numberInputControl(config, a, h),
            ...(config.description
              ? [
                  h.p(
                    elAttrs<M>(
                      a.description,
                      sxAttrs(h, fieldStyles.description),
                    ),
                    [config.description],
                  ),
                ]
              : []),
            ...(config.error
              ? [h.p(elAttrs<M>(sxAttrs(h, fieldStyles.error)), [config.error])]
              : []),
          ],
        ),
    },
    h,
  )
