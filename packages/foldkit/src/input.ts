import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { Input as UiInput } from '@foldkit/ui'
import { fieldStyles, formDensityStyles, inputStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type InputDensity = 'default' | 'compact'
export type InputWidth = 'auto' | 'sm' | 'md' | 'full'
export type InputAlign = 'start' | 'end'
export type InputControlConfig<M> = Readonly<{
  id?: string
  value?: string
  onInput?: (value: string) => M
  onBlur?: M
  placeholder?: string
  isDisabled?: boolean
  type?: string
  density?: InputDensity
  width?: InputWidth
  align?: InputAlign
  ariaLabel?: string
  name?: string
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
const alignStyle = (align: InputAlign | undefined) => {
  switch (align) {
    case 'start':
      return formDensityStyles.inputAlignStart
    case 'end':
      return formDensityStyles.inputAlignEnd
    default:
      return undefined
  }
}
const axis = (d: InputDensity, w?: InputWidth, a?: InputAlign) =>
  [
    inputStyles.input,
    d === 'compact' ? formDensityStyles.inputCompact : undefined,
    widthStyle(w),
    alignStyle(a),
  ] as const
export const control = <M>(c: InputControlConfig<M>): Html => {
  const h = html<M>()
  return h.input(
    elAttrs<M>(
      sxAttrs(h, ...axis(c.density ?? 'default', c.width, c.align)),
      h.Type(c.type ?? 'text'),
      ...(c.id ? [h.Id(c.id)] : []),
      ...(c.name ? [h.Name(c.name)] : []),
      ...(c.value !== undefined ? [h.Value(c.value)] : []),
      ...(c.placeholder ? [h.Placeholder(c.placeholder)] : []),
      ...(c.ariaLabel ? [h.AriaLabel(c.ariaLabel)] : []),
      ...(c.isDisabled ? [h.Disabled(true), h.AriaDisabled(true)] : []),
      ...(c.onInput && !c.isDisabled ? [h.OnInput(c.onInput)] : []),
      ...(c.onBlur ? [h.OnBlur(c.onBlur)] : []),
    ),
  )
}
export const view = <M>(
  c: Readonly<{
    id: string
    label: string
    value?: string
    onInput?: (value: string) => M
    placeholder?: string
    description?: string
    isDisabled?: boolean
    type?: string
    density?: InputDensity
    width?: InputWidth
    align?: InputAlign
  }>,
): Html => {
  const h = html<M>()
  return UiInput.view<M>({
    id: c.id,
    ...(c.value !== undefined ? { value: c.value } : {}),
    ...(c.onInput ? { onInput: c.onInput } : {}),
    ...(c.placeholder ? { placeholder: c.placeholder } : {}),
    ...(c.isDisabled ? { isDisabled: true } : {}),
    ...(c.type ? { type: c.type } : {}),
    toView: a =>
      h.div(elAttrs<M>(sxAttrs(h, fieldStyles.field)), [
        h.label(elAttrs<M>(a.label, sxAttrs(h, fieldStyles.label)), [c.label]),
        h.input(
          elAttrs<M>(
            a.input,
            sxAttrs(h, ...axis(c.density ?? 'default', c.width, c.align)),
          ),
        ),
        ...(c.description
          ? [
              h.p(
                elAttrs<M>(a.description, sxAttrs(h, fieldStyles.description)),
                [c.description],
              ),
            ]
          : []),
      ]),
  })
}
