import type { Html, HtmlBuilder } from 'foldkit/html'

import { dateInputStyles } from '@foldstryx/styles'

import * as Field from './field.js'
import { elAttrs, sxAttrs } from './sx.js'

export type DateRangeInputViewConfig = Readonly<{
  id: string
  label: string
  description?: string
  startField: Html
  endField: Html
}>

/**
 * Labeled range field composing two DateInput submodel slots.
 * Foldkit Calendar is single-select; this is not Astryx one-calendar range mode.
 */
export const view = <ParentMessage>(
  config: DateRangeInputViewConfig,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  Field.group(h, {
    label: Field.label(h, config.label),
    ...(config.description
      ? { description: Field.description(h, config.description) }
      : {}),
    children: [
      h.div(elAttrs<ParentMessage>(sxAttrs(h, dateInputStyles.rangeRow)), [
        h.div(elAttrs<ParentMessage>(sxAttrs(h, dateInputStyles.rangeField)), [
          config.startField,
        ]),
        h.span(
          elAttrs<ParentMessage>(sxAttrs(h, dateInputStyles.rangeSeparator)),
          ['–'],
        ),
        h.div(elAttrs<ParentMessage>(sxAttrs(h, dateInputStyles.rangeField)), [
          config.endField,
        ]),
      ]),
    ],
  })
