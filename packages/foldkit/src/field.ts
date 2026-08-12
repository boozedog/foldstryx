import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { fieldStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type FieldOrientation = 'vertical' | 'horizontal'
export const label = <M>(
  text: string,
  attributes: ReadonlyArray<unknown> = [],
): Html => {
  const h = html<M>()
  return h.label(elAttrs<M>(attributes, sxAttrs(h, fieldStyles.label)), [text])
}
export const description = <M>(
  text: string,
  attributes: ReadonlyArray<unknown> = [],
): Html => {
  const h = html<M>()
  return h.p(elAttrs<M>(attributes, sxAttrs(h, fieldStyles.description)), [
    text,
  ])
}
export const error = <M>(
  text: string,
  attributes: ReadonlyArray<unknown> = [],
): Html => {
  const h = html<M>()
  return h.p(elAttrs<M>(attributes, sxAttrs(h, fieldStyles.error)), [text])
}
export const group = <M>(config: {
  label?: Html
  description?: Html
  error?: Html
  orientation?: FieldOrientation
  children: ReadonlyArray<Html>
}): Html => {
  const h = html<M>()
  const content = [
    ...(config.label ? [config.label] : []),
    ...(config.description ? [config.description] : []),
    ...(config.error ? [config.error] : []),
  ]
  return config.orientation === 'horizontal'
    ? h.div(elAttrs<M>(sxAttrs(h, fieldStyles.fieldRow)), [
        ...config.children,
        ...(content.length
          ? [h.div(elAttrs<M>(sxAttrs(h, fieldStyles.fieldContent)), content)]
          : []),
      ])
    : h.div(elAttrs<M>(sxAttrs(h, fieldStyles.field)), [
        ...content.slice(0, 1),
        ...config.children,
        ...content.slice(1),
      ])
}
