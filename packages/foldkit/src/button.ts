import { Predicate } from 'effect'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import { Button as UiButton } from '@foldkit/ui'
import { buttonStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'sm' | 'icon'
export type ButtonViewConfig<Message> = Readonly<{
  label?: string
  icon?: Html
  onClick?: Message
  variant?: ButtonVariant
  size?: ButtonSize
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
export const view = <Message>(
  config: ButtonViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html => {
  const {
    label,
    icon,
    onClick,
    variant = 'primary',
    size = 'md',
    isDisabled = false,
    ariaLabel,
  } = config
  const toView = (
    attributes: Readonly<{ button: ReadonlyArray<Attribute<Message>> }>,
  ): Html =>
    h.button(
      elAttrs<Message>(
        attributes.button,
        sxAttrs(h, buttonStyles.base, variantStyle(variant), sizeStyle(size)),
        ...(ariaLabel !== undefined ? [h.AriaLabel(ariaLabel)] : []),
      ),
      [...(icon ? [icon] : []), ...(label ? [label] : [])],
    )
  return Predicate.isNotUndefined(onClick)
    ? UiButton.view<Message>({ onClick, isDisabled, toView }, h)
    : UiButton.view<Message>({ isDisabled, toView }, h)
}
