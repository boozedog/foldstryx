import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { childAttributes } from 'foldkit/html'

import { Listbox } from '@foldkit/ui'
import type { AnchorConfig, ViewInputs } from '@foldkit/ui/listbox'
import {
  fieldStyles,
  formDensityStyles,
  inputWrapperStyles,
  selectorStyles,
} from '@foldstryx/styles'
import * as stylex from '@stylexjs/stylex'

import * as Icon from './icon.js'
import type { InputDensity, InputWidth } from './input.js'
import { elAttrs, sxAttrs } from './sx.js'

export type SelectorOption<Value extends string = string> = Readonly<{
  value: Value
  label: string
}>

export type SelectorStyledConfig<Value extends string = string> = Readonly<{
  options: ReadonlyArray<SelectorOption<Value>>
  selectedValue: Value
  density?: InputDensity
  width?: InputWidth
  placeholder?: string
  ariaLabel?: string
  isDisabled?: boolean
  isOpen?: boolean
  anchor?: AnchorConfig
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

const labelForValue = <Value extends string>(
  options: ReadonlyArray<SelectorOption<Value>>,
  value: string,
): string | undefined => options.find(option => option.value === value)?.label

/** Builds styled Foldkit Listbox view inputs with Astryx Selector visuals. */
export const styledViewInputs = <Item extends string, ParentMessage>(
  config: SelectorStyledConfig<Item>,
  h: HtmlBuilder<ParentMessage>,
): ViewInputs<Item, Item> => {
  const items = config.options.map(option => option.value)
  const selectedLabel = labelForValue(config.options, config.selectedValue)
  const triggerText = selectedLabel ?? config.placeholder ?? 'Select…'
  const isPlaceholder = selectedLabel === undefined

  return {
    items,
    itemToValue: (item: Item) => item,
    maybeSelectedValue: Option.some<Item>(config.selectedValue),
    ...(config.ariaLabel !== undefined ? { ariaLabel: config.ariaLabel } : {}),
    anchor: config.anchor ?? { placement: 'bottom-start', gap: 4, padding: 8 },
    ...(config.isDisabled === true ? { isDisabled: true } : {}),
    buttonClassName: className(selectorStyles.trigger),
    attributes: childAttributes(
      sxAttrs(
        h,
        selectorStyles.wrapper,
        inputWrapperStyles.base,
        densityStyle(config.density),
        widthStyle(config.width),
        config.isDisabled === true ? inputWrapperStyles.disabled : undefined,
      ),
    ),
    buttonContent: h.div(
      elAttrs<ParentMessage>(sxAttrs(h, selectorStyles.triggerInner)),
      [
        h.span(
          elAttrs<ParentMessage>(
            sxAttrs(
              h,
              selectorStyles.triggerLabel,
              isPlaceholder ? selectorStyles.triggerPlaceholder : undefined,
            ),
          ),
          [triggerText],
        ),
        h.span(
          elAttrs<ParentMessage>(
            sxAttrs(
              h,
              selectorStyles.triggerChevron,
              config.isOpen === true
                ? selectorStyles.triggerChevronOpen
                : undefined,
            ),
          ),
          [Icon.chevronDown({ size: 16 })],
        ),
      ],
    ),
    itemsClassName: className(selectorStyles.dropdown, selectorStyles.popover),
    backdropClassName: className(selectorStyles.backdrop),
    itemToConfig: (item, { isActive, isDisabled, isSelected }) => ({
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
    }),
  }
}

/** Labeled field chrome around a selector submodel slot. */
export const labeledField = <ParentMessage>(
  config: Readonly<{
    id: string
    label: string
    children: ReadonlyArray<Html>
  }>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.div(elAttrs<ParentMessage>(sxAttrs(h, fieldStyles.field)), [
    h.label(
      elAttrs<ParentMessage>(
        sxAttrs(h, fieldStyles.label),
        h.For(`${config.id}-button`),
      ),
      [config.label],
    ),
    ...config.children,
  ])

export const create = Listbox.create

export const init = Listbox.init

export { Model, Message } from '@foldkit/ui/listbox'
