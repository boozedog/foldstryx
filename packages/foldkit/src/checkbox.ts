import type { Html, HtmlBuilder } from 'foldkit/html'
import { inertHtml } from 'foldkit/html'

import { Checkbox as UiCheckbox } from '@foldkit/ui'
import type {
  CheckboxAttributes,
  ViewConfig as CheckboxViewConfig,
} from '@foldkit/ui/checkbox'
import { checkboxStyles, fieldStyles, layoutStyles } from '@foldstryx/styles'

import * as Field from './field.js'
import { elAttrs, sxAttrs } from './sx.js'

const noChildren: ReadonlyArray<never> = []

export { descriptionId, labelId } from '@foldkit/ui/checkbox'
export type {
  CheckboxAttributes,
  ViewConfig as CheckboxViewConfig,
} from '@foldkit/ui/checkbox'

/**
 * Lightweight controlled native checkbox (no headless MVU).
 * Prefer this for dense tables/filters; use `view` when you need the
 * styled controlled surface, indeterminate, or Field description chrome.
 */
export type CheckboxControlConfig<ParentMessage> = Readonly<{
  checked: boolean
  onChange: (checked: boolean) => ParentMessage
  label?: string
  id?: string
  isDisabled?: boolean
  /** Accessible name when no visible label. */
  ariaLabel?: string
}>

/** Controlled native checkbox without styled chrome. */
export const control = <ParentMessage>(
  config: CheckboxControlConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const accessibleName = config.ariaLabel ?? config.label

  const input = h.input(
    elAttrs<ParentMessage>(
      sxAttrs(h, layoutStyles.checkbox),
      h.Type('checkbox'),
      h.Checked(config.checked),
      ...(config.id !== undefined ? [h.Id(config.id)] : []),
      ...(accessibleName !== undefined ? [h.AriaLabel(accessibleName)] : []),
      ...(config.isDisabled === true
        ? [h.Disabled(true), h.AriaDisabled(true)]
        : []),
      ...(config.isDisabled !== true
        ? [h.OnClick(config.onChange(!config.checked))]
        : []),
    ),
  )

  if (config.label === undefined) {
    return input
  }

  return h.label(
    elAttrs<ParentMessage>(
      sxAttrs(h, layoutStyles.checkboxLabel),
      ...(config.id !== undefined ? [h.For(config.id)] : []),
    ),
    [input, config.label],
  )
}

/**
 * Styled Checkbox configuration. The parent owns the checked state and
 * receives the new value through `onToggle` — the view is a stateless
 * controlled component in the parent frame (no nested submodel).
 */
export type CheckboxStyledConfig<ParentMessage> = Readonly<{
  id: string
  label: string
  description?: string
  orientation?: 'vertical' | 'horizontal'
  isDisabled?: boolean
  isReadOnly?: boolean
  isIndeterminate?: boolean
  /** Optional custom indicator markup; defaults to the checkmark. */
  indicator?: Html
  /** Parent-owned checked state, read straight from the parent model. */
  isChecked: boolean
  /** Dispatched with the new checked state; the parent stores it. */
  onToggle: (isChecked: boolean) => ParentMessage
}>

const defaultIndicator = (): Html => {
  const h = inertHtml
  return h.span(elAttrs<never>(sxAttrs(h, checkboxStyles.indicator)), [
    h.svg(
      [
        h.AriaHidden(true),
        h.Xmlns('http://www.w3.org/2000/svg'),
        h.ViewBox('0 0 24 24'),
        h.Fill('none'),
        h.Stroke('currentColor'),
        h.StrokeWidth('2'),
        h.StrokeLinecap('round'),
        h.StrokeLinejoin('round'),
        h.Width('14'),
        h.Height('14'),
      ],
      [h.path([h.D('M20 6 9 17l-5-5')], noChildren)],
    ),
  ])
}

const toView = <ParentMessage>(
  h: HtmlBuilder<ParentMessage>,
  config: CheckboxStyledConfig<ParentMessage>,
  attributes: CheckboxAttributes<ParentMessage>,
): Html => {
  const isIndeterminate = config.isIndeterminate === true
  const indicator = config.indicator
  const orientation = config.orientation ?? 'horizontal'

  const control = h.button(
    elAttrs<ParentMessage>(
      attributes.checkbox,
      sxAttrs(
        h,
        checkboxStyles.root,
        config.isChecked && !isIndeterminate
          ? checkboxStyles.rootChecked
          : undefined,
        isIndeterminate ? checkboxStyles.rootIndeterminate : undefined,
      ),
    ),
    config.isChecked || isIndeterminate
      ? [indicator ?? defaultIndicator()]
      : [],
  )

  const fieldLabel = Field.label(h, config.label, attributes.label)
  const fieldDescription =
    config.description !== undefined
      ? Field.description(h, config.description, attributes.description)
      : undefined

  if (orientation === 'vertical') {
    return Field.group(h, {
      orientation: 'vertical',
      label: fieldLabel,
      ...(fieldDescription !== undefined
        ? { description: fieldDescription }
        : {}),
      children: [control],
    })
  }

  return Field.group(h, {
    orientation: 'horizontal',
    children: [
      control,
      h.div(elAttrs<ParentMessage>(sxAttrs(h, fieldStyles.fieldContent)), [
        fieldLabel,
        ...(fieldDescription !== undefined ? [fieldDescription] : []),
      ]),
    ],
  })
}

/**
 * Builds a styled controlled Checkbox view config. Parent owns checked state;
 * `onToggle` lifts the new value into the parent's Message universe.
 */
export const styledViewConfig = <ParentMessage>(
  config: CheckboxStyledConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): CheckboxViewConfig<ParentMessage> => ({
  id: config.id,
  isChecked: config.isChecked,
  onToggle: config.onToggle,
  ...(config.isDisabled === true ? { isDisabled: true } : {}),
  ...(config.isReadOnly === true ? { isReadOnly: true } : {}),
  ...(config.isIndeterminate === true ? { isIndeterminate: true } : {}),
  toView: attributes => toView(h, config, attributes),
})

/** Renders a styled controlled Checkbox with Astryx visuals. */
export const view = <ParentMessage>(
  config: CheckboxStyledConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => UiCheckbox.view(styledViewConfig(config, h), h)
