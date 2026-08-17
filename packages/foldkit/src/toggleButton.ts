import { Predicate } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { Button as UiButton } from '@foldkit/ui'
import {
  buttonStyles,
  toggleButtonGroupStyles,
  toggleButtonStyles,
} from '@foldstryx/styles'

import { type ButtonSize, type ButtonVariant } from './button.js'
import { elAttrs, sxAttrs } from './sx.js'

export type { ButtonSize, ButtonVariant }

export type ToggleButtonViewConfig<Message> = Readonly<{
  label: string
  isPressed: boolean
  onPressedChange?: (isPressed: boolean) => Message
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: Html
  pressedIcon?: Html
  isDisabled?: boolean
  ariaLabel?: string
}>

const variantStyle = (variant: ButtonVariant) =>
  ({
    primary: buttonStyles.variantPrimary,
    secondary: buttonStyles.variantSecondary,
    ghost: buttonStyles.variantGhost,
    danger: buttonStyles.variantDanger,
  })[variant]

const sizeStyle = (size: ButtonSize) =>
  ({
    md: buttonStyles.sizeMd,
    sm: buttonStyles.sizeSm,
    icon: buttonStyles.sizeIcon,
  })[size]

const labelContent = <Message>(
  h: HtmlBuilder<Message>,
  label: string,
  isPressed: boolean,
): Html =>
  h.span(elAttrs<Message>(sxAttrs(h, toggleButtonStyles.labelWrapper)), [
    h.span(
      elAttrs<Message>(
        sxAttrs(h, isPressed ? toggleButtonStyles.labelPressed : undefined),
      ),
      [label],
    ),
    h.span(
      elAttrs<Message>(
        sxAttrs(h, toggleButtonStyles.labelWidthReservation),
        h.AriaHidden(true),
      ),
      [label],
    ),
  ])

/** Controlled toggle button with Astryx pressed chrome (ghost Button wrapper). */
export const view = <Message>(
  config: ToggleButtonViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html => {
  const {
    label,
    isPressed,
    onPressedChange,
    variant = 'ghost',
    size = 'md',
    icon,
    pressedIcon,
    isDisabled = false,
    ariaLabel,
  } = config

  const resolvedIcon =
    isPressed && pressedIcon !== undefined ? pressedIcon : icon
  const nextPressed = !isPressed

  const onClick =
    Predicate.isNotUndefined(onPressedChange) && !isDisabled
      ? onPressedChange(nextPressed)
      : undefined

  const toView = (
    attributes: Readonly<{ button: ReadonlyArray<unknown> }>,
  ): Html =>
    h.button(
      elAttrs<Message>(
        attributes.button,
        sxAttrs(
          h,
          buttonStyles.base,
          variantStyle(variant),
          sizeStyle(size),
          isPressed ? toggleButtonStyles.pressed : undefined,
        ),
        h.AriaPressed(isPressed ? 'true' : 'false'),
        ...(ariaLabel !== undefined ? [h.AriaLabel(ariaLabel)] : []),
      ),
      [
        ...(resolvedIcon !== undefined ? [resolvedIcon] : []),
        labelContent(h, label, isPressed),
      ],
    )

  return Predicate.isNotUndefined(onClick)
    ? UiButton.view<Message>({ onClick, isDisabled, toView }, h)
    : UiButton.view<Message>({ isDisabled, toView }, h)
}

export type ToggleButtonGroupItem = Readonly<{
  value: string
  label: string
  icon?: Html
  pressedIcon?: Html
  isDisabled?: boolean
}>

type ToggleButtonGroupBaseConfig = Readonly<{
  label: string
  orientation?: 'horizontal' | 'vertical'
  size?: ButtonSize
  isDisabled?: boolean
  items: ReadonlyArray<ToggleButtonGroupItem>
}>

export type ToggleButtonGroupSingleConfig<ParentMessage> =
  ToggleButtonGroupBaseConfig &
    Readonly<{
      type?: 'single'
      value: string | null
      onChange: (value: string | null) => ParentMessage
    }>

export type ToggleButtonGroupMultipleConfig<ParentMessage> =
  ToggleButtonGroupBaseConfig &
    Readonly<{
      type: 'multiple'
      value: ReadonlyArray<string>
      onChange: (value: ReadonlyArray<string>) => ParentMessage
    }>

export type ToggleButtonGroupViewConfig<ParentMessage> =
  | ToggleButtonGroupSingleConfig<ParentMessage>
  | ToggleButtonGroupMultipleConfig<ParentMessage>

const isMultipleGroup = <ParentMessage>(
  config: ToggleButtonGroupViewConfig<ParentMessage>,
): config is ToggleButtonGroupMultipleConfig<ParentMessage> =>
  config.type === 'multiple'

/** Layout group enforcing single or multi-select toggle semantics. */
export const groupView = <ParentMessage>(
  config: ToggleButtonGroupViewConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const orientation = config.orientation ?? 'horizontal'
  const groupDisabled = config.isDisabled === true
  const isMultiple = isMultipleGroup(config)

  const itemButtons = config.items.map(item => {
    const isPressed = isMultiple
      ? config.value.includes(item.value)
      : config.value === item.value
    const itemDisabled = groupDisabled || item.isDisabled === true

    const onPressedChange = (nextPressed: boolean): ParentMessage => {
      if (isMultiple) {
        const current = config.value
        if (nextPressed) {
          return config.onChange([...current, item.value])
        }
        return config.onChange(current.filter(v => v !== item.value))
      }
      if (nextPressed) {
        return config.onChange(item.value)
      }
      return config.onChange(null)
    }

    return view(
      {
        label: item.label,
        isPressed,
        onPressedChange: nextPressed => onPressedChange(nextPressed),
        isDisabled: itemDisabled,
        ...(config.size !== undefined ? { size: config.size } : {}),
        ...(item.icon !== undefined ? { icon: item.icon } : {}),
        ...(item.pressedIcon !== undefined
          ? { pressedIcon: item.pressedIcon }
          : {}),
      },
      h,
    )
  })

  return h.div(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        toggleButtonGroupStyles.group,
        orientation === 'vertical'
          ? toggleButtonGroupStyles.vertical
          : undefined,
      ),
      h.Role('group'),
      h.AriaLabel(config.label),
    ),
    itemButtons,
  )
}
