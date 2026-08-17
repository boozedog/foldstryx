import type { Html, HtmlBuilder } from 'foldkit/html'

import { Switch as UiSwitch } from '@foldkit/ui'
import type {
  SwitchAttributes,
  ViewConfig as SwitchViewConfig,
} from '@foldkit/ui/switch'
import { labelId } from '@foldkit/ui/switch'
import { fieldStyles, switchStyles } from '@foldstryx/styles'

import * as Field from './field.js'
import { elAttrs, sxAttrs } from './sx.js'

const noChildren: ReadonlyArray<never> = []

export { descriptionId, labelId } from '@foldkit/ui/switch'
export type {
  SwitchAttributes,
  ViewConfig as SwitchViewConfig,
} from '@foldkit/ui/switch'

/**
 * Styled Switch configuration. The parent owns the checked state and
 * receives the new value through `onToggle` — the view is a stateless
 * controlled component in the parent frame (no nested submodel).
 */
export type SwitchStyledConfig<ParentMessage> = Readonly<{
  id: string
  label: string
  description?: string
  orientation?: 'vertical' | 'horizontal'
  isDisabled?: boolean
  isReadOnly?: boolean
  /** Parent-owned checked state, read straight from the parent model. */
  isChecked: boolean
  /** Dispatched with the new checked state; the parent stores it. */
  onToggle: (isChecked: boolean) => ParentMessage
}>

const toView = <ParentMessage>(
  h: HtmlBuilder<ParentMessage>,
  config: SwitchStyledConfig<ParentMessage>,
  attributes: SwitchAttributes<ParentMessage>,
): Html => {
  const orientation = config.orientation ?? 'horizontal'

  const control = h.button(
    elAttrs<ParentMessage>(
      attributes.button,
      sxAttrs(
        h,
        switchStyles.root,
        config.isChecked ? switchStyles.rootChecked : undefined,
      ),
    ),
    [
      h.span(
        elAttrs<ParentMessage>(
          sxAttrs(
            h,
            switchStyles.thumb,
            config.isChecked ? switchStyles.thumbChecked : undefined,
          ),
        ),
        noChildren,
      ),
    ],
  )

  const fieldLabel = h.span(
    elAttrs<ParentMessage>(
      attributes.label,
      h.Id(labelId(config.id)),
      sxAttrs(h, fieldStyles.label),
    ),
    [config.label],
  )
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
 * Builds a styled controlled Switch view config. Parent owns checked state;
 * `onToggle` lifts the new value into the parent's Message universe.
 */
export const styledViewConfig = <ParentMessage>(
  config: SwitchStyledConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): SwitchViewConfig<ParentMessage> => ({
  id: config.id,
  isChecked: config.isChecked,
  onToggle: config.onToggle,
  ...(config.isDisabled === true ? { isDisabled: true } : {}),
  ...(config.isReadOnly === true ? { isReadOnly: true } : {}),
  toView: attributes => toView(h, config, attributes),
})

/** Renders a styled controlled Switch with Astryx visuals. */
export const view = <ParentMessage>(
  config: SwitchStyledConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => UiSwitch.view(styledViewConfig(config, h), h)
