import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { childAttributes } from 'foldkit/html'

import { Combobox } from '@foldkit/ui'
import type { ViewInputs } from '@foldkit/ui/combobox'
import {
  fieldStyles,
  formDensityStyles,
  inputWrapperStyles,
  selectorStyles,
  typeaheadStyles,
} from '@foldstryx/styles'
import * as stylex from '@stylexjs/stylex'

import type { InputDensity, InputWidth } from './input.js'
import { elAttrs, sxAttrs } from './sx.js'

export type TypeaheadOption<Item extends string = string> = Readonly<{
  value: Item
  label: string
}>

export type TypeaheadStyledConfig<Item extends string = string> = Readonly<{
  items: ReadonlyArray<Item>
  options: ReadonlyArray<TypeaheadOption<Item>>
  maybeSelectedValue: Option.Option<Item>
  inputValue: string
  density?: InputDensity
  width?: InputWidth
  placeholder?: string
  ariaLabel?: string
  isDisabled?: boolean
  isInvalid?: boolean
  isOpen?: boolean
  emptyLabel?: string
}>

const className = (
  ...styles: ReadonlyArray<stylex.StyleXStyles | false | undefined>
): string => {
  const filtered: ReadonlyArray<stylex.StyleXStyles> = styles.filter(
    (style): style is stylex.StyleXStyles => Boolean(style),
  )
  return stylex.props(...filtered).className ?? ''
}

const densityStyle = (density: InputDensity | undefined) => {
  switch (density) {
    case 'compact':
      return formDensityStyles.inputCompact
    default:
      return undefined
  }
}

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

const labelForValue = <Item extends string>(
  options: ReadonlyArray<TypeaheadOption<Item>>,
  value: string,
): string | undefined => options.find(option => option.value === value)?.label

const restingInputValue = <Item extends string>(
  options: ReadonlyArray<TypeaheadOption<Item>>,
  maybeSelected: Option.Option<Item>,
): string =>
  Option.match(maybeSelected, {
    onNone: () => '',
    onSome: value => labelForValue(options, value) ?? value,
  })

const NO_MATCHES = '__foldstryx_no_matches__'

/** Builds styled Foldkit Combobox view inputs with Astryx Typeahead visuals.
 *  When filtering yields zero matches, inject `noMatchesItem()` into `items`. */
export const styledViewInputs = <Item extends string, ParentMessage>(
  config: TypeaheadStyledConfig<Item>,
  h: HtmlBuilder<ParentMessage>,
): ViewInputs<Item> => {
  return {
    items: config.items,
    maybeSelectedValue: config.maybeSelectedValue,
    restingInputValue: restingInputValue(
      config.options,
      config.maybeSelectedValue,
    ),
    itemToValue: (item: Item) => item,
    itemToDisplayText: (item: Item) =>
      item === NO_MATCHES
        ? ''
        : (labelForValue(config.options, item) ?? String(item)),
    anchor: { placement: 'bottom-start', gap: 4, padding: 8 },
    ...(config.ariaLabel !== undefined ? { ariaLabel: config.ariaLabel } : {}),
    ...(config.isDisabled === true ? { isDisabled: true } : {}),
    ...(config.isInvalid === true ? { isInvalid: true } : {}),
    ...(config.placeholder !== undefined
      ? { inputPlaceholder: config.placeholder }
      : {}),
    inputClassName: className(typeaheadStyles.input),
    inputWrapperClassName: className(
      inputWrapperStyles.base,
      densityStyle(config.density),
      widthStyle(config.width),
      config.isDisabled === true ? inputWrapperStyles.disabled : undefined,
    ),
    itemsClassName: className(selectorStyles.dropdown, selectorStyles.popover),
    backdropClassName: className(selectorStyles.backdrop),
    attributes: childAttributes(
      sxAttrs(h, selectorStyles.wrapper, widthStyle(config.width)),
    ),
    isItemDisabled: item => item === NO_MATCHES,
    itemToConfig: (item, { isActive, isDisabled, isSelected }) => {
      if (item === NO_MATCHES) {
        return {
          className: className(typeaheadStyles.emptyState),
          content: h.div([], [config.emptyLabel ?? 'No matches']),
        }
      }
      return {
        className: className(
          selectorStyles.item,
          config.density === 'compact' ? selectorStyles.itemCompact : undefined,
          isActive ? selectorStyles.itemActive : undefined,
          isSelected ? selectorStyles.itemSelected : undefined,
          isDisabled ? selectorStyles.itemDisabled : undefined,
        ),
        content: h.span(
          [],
          [labelForValue(config.options, item) ?? String(item)],
        ),
      }
    },
  }
}

export const noMatchesItem = (): typeof NO_MATCHES => NO_MATCHES

/** Labeled field chrome around a typeahead submodel slot. */
export const labeledField = <ParentMessage>(
  config: Readonly<{
    id: string
    label: string
    description?: string
    error?: string
    children: ReadonlyArray<Html>
  }>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.div(elAttrs<ParentMessage>(sxAttrs(h, fieldStyles.field)), [
    h.label(
      elAttrs<ParentMessage>(
        sxAttrs(h, fieldStyles.label),
        h.For(`${config.id}-input`),
      ),
      [config.label],
    ),
    ...config.children,
    ...(config.description
      ? [
          h.p(elAttrs<ParentMessage>(sxAttrs(h, fieldStyles.description)), [
            config.description,
          ]),
        ]
      : []),
    ...(config.error
      ? [
          h.p(elAttrs<ParentMessage>(sxAttrs(h, fieldStyles.error)), [
            config.error,
          ]),
        ]
      : []),
  ])

export const create = Combobox.create

export const init = Combobox.init

export { Model, Message } from '@foldkit/ui/combobox'
