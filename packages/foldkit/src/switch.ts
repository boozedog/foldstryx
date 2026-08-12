import { html } from 'foldkit/html'

import type { Model, ViewInputs } from '@foldkit/ui/switch'
import type { Message as SwitchMessage } from '@foldkit/ui/switch'
import { fieldStyles, switchStyles } from '@foldstryx/styles'

import * as Field from './field.js'
import { elAttrs, sxAttrs } from './sx.js'

const noChildren: ReadonlyArray<never> = []

export {
  init,
  update,
  setChecked,
  reflectChecked,
  view,
  Model,
  Message,
  OutMessage,
  ToggledChecked,
} from '@foldkit/ui/switch'

export type SwitchStyledConfig = Readonly<{
  label: string
  description?: string
  orientation?: 'vertical' | 'horizontal'
  isDisabled?: boolean
}>

/** Builds styled Foldkit Switch view inputs with shadcn switch visuals. */
export const styledViewInputs = (
  model: Model,
  config: SwitchStyledConfig,
): ViewInputs => ({
  ...(config.isDisabled === true ? { isDisabled: true } : {}),
  toView: attributes => {
    const h = html<SwitchMessage>()
    const orientation = config.orientation ?? 'horizontal'

    const control = h.button(
      elAttrs<SwitchMessage>(
        attributes.button,
        sxAttrs(
          h,
          switchStyles.root,
          model.isChecked ? switchStyles.rootChecked : undefined,
        ),
      ),
      [
        h.span(
          elAttrs<SwitchMessage>(
            sxAttrs(
              h,
              switchStyles.thumb,
              model.isChecked ? switchStyles.thumbChecked : undefined,
            ),
          ),
          noChildren,
        ),
      ],
    )

    const fieldLabel = h.span(
      elAttrs<SwitchMessage>(
        attributes.label,
        h.Id('catalog-notifications-label'),
        sxAttrs(h, fieldStyles.label),
      ),
      [config.label],
    )
    const fieldDescription =
      config.description !== undefined
        ? Field.description<SwitchMessage>(
            config.description,
            attributes.description,
          )
        : undefined

    if (orientation === 'vertical') {
      return Field.group<SwitchMessage>({
        orientation: 'vertical',
        label: fieldLabel,
        ...(fieldDescription !== undefined
          ? { description: fieldDescription }
          : {}),
        children: [control],
      })
    }

    return Field.group<SwitchMessage>({
      orientation: 'horizontal',
      children: [
        control,
        h.div(elAttrs<SwitchMessage>(sxAttrs(h, fieldStyles.fieldContent)), [
          fieldLabel,
          ...(fieldDescription !== undefined ? [fieldDescription] : []),
        ]),
      ],
    })
  },
})
