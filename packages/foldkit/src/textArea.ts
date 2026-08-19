import type { Html, HtmlBuilder } from 'foldkit/html'

import { Textarea as UiTextarea } from '@foldkit/ui'
import {
  fieldStyles,
  formDensityStyles,
  inputWrapperStyles,
  textareaStyles,
} from '@foldstryx/styles'

import type { InputDensity, InputWidth } from './input.js'
import { elAttrs, sxAttrs } from './sx.js'

export type TextAreaViewConfig<M> = Readonly<{
  id: string
  label: string
  value?: string
  onInput?: (value: string) => M
  placeholder?: string
  description?: string
  error?: string
  rows?: number
  isDisabled?: boolean
  isInvalid?: boolean
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

/** Labeled multi-line field wrapping Foldkit Textarea with Astryx chrome. */
export const view = <M>(
  config: TextAreaViewConfig<M>,
  h: HtmlBuilder<M>,
): Html =>
  UiTextarea.view<M>(
    {
      id: config.id,
      ...(config.value !== undefined ? { value: config.value } : {}),
      ...(config.onInput ? { onInput: config.onInput } : {}),
      ...(config.placeholder ? { placeholder: config.placeholder } : {}),
      ...(config.isDisabled ? { isDisabled: true } : {}),
      ...(config.isInvalid ? { isInvalid: true } : {}),
      ...(config.rows !== undefined ? { rows: config.rows } : {}),
      toView: a =>
        h.div(
          elAttrs<M>(sxAttrs(h, fieldStyles.field, widthStyle(config.width))),
          [
            h.label(elAttrs<M>(a.label, sxAttrs(h, fieldStyles.label)), [
              config.label,
            ]),
            h.div(
              elAttrs<M>(
                sxAttrs(
                  h,
                  inputWrapperStyles.base,
                  textareaStyles.wrapper,
                  config.density === 'compact'
                    ? formDensityStyles.inputCompact
                    : undefined,
                  config.isDisabled === true
                    ? inputWrapperStyles.disabled
                    : undefined,
                ),
              ),
              [
                h.textarea(
                  elAttrs<M>(
                    a.textarea,
                    sxAttrs(
                      h,
                      textareaStyles.textarea,
                      config.isDisabled === true
                        ? textareaStyles.textareaDisabled
                        : undefined,
                    ),
                  ),
                ),
              ],
            ),
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
