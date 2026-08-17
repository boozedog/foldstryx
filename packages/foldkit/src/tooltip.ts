import { Duration, Match as M, Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { childAttributes } from 'foldkit/html'
import { defineView } from 'foldkit/submodel'

import {
  AnchorTooltip,
  BlurredTrigger,
  EnteredTrigger,
  FocusedTrigger,
  LeftTrigger,
  PressedEscape,
  PressedPointerOnTrigger,
  type Message as TooltipMessage,
  type Model as TooltipModel,
  type ViewInputs as TooltipViewInputs,
  init as tooltipInit,
  triggerId,
} from '@foldkit/ui/tooltip'
import type { AnchorConfig } from '@foldkit/ui/tooltip'
import { tooltipStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/** Re-export the headless tooltip model, message schema, and update for consumers. */
export { Model, Message, update } from '@foldkit/ui/tooltip'

/** Anchor for sidebar icon-mode tooltips (side right, sideOffset 0). */
export const sidebarAnchor: AnchorConfig = {
  placement: 'right',
  gap: 0,
  padding: 8,
}

/** Creates a tooltip model with instant show delay for sidebar hover labels. */
export const init = (id: string): TooltipModel =>
  tooltipInit({ id, showDelay: Duration.millis(0) })

type SidebarTooltipViewInputs = TooltipViewInputs &
  Readonly<{
    enabled: boolean
  }>

/** Like Foldkit `Tooltip.view`, but leaves the trigger alone when `enabled` is false. */
export const view = defineView<
  TooltipModel,
  TooltipMessage,
  SidebarTooltipViewInputs
>((model, viewInputs, h) => {
  const { id, isOpen } = model
  const { anchor, toView, enabled } = viewInputs

  const handleTriggerKeyDown = (key: string): Option.Option<PressedEscape> =>
    M.value(key).pipe(
      M.when('Escape', () =>
        isOpen ? Option.some(PressedEscape()) : Option.none(),
      ),
      M.orElse(() => Option.none()),
    )

  const handleTriggerPointerDown = (
    pointerType: string,
  ): Option.Option<PressedPointerOnTrigger> =>
    Option.some(PressedPointerOnTrigger({ pointerType }))

  const interactiveTriggerAttributes = enabled
    ? [
        h.AriaDescribedBy(`${id}-panel`),
        ...(isOpen ? [h.DataAttribute('open', '')] : []),
        h.OnMouseEnter(EnteredTrigger()),
        h.OnMouseLeave(LeftTrigger()),
        h.OnFocus(FocusedTrigger()),
        h.OnBlur(BlurredTrigger()),
        h.OnKeyDownPreventDefault(handleTriggerKeyDown),
        h.OnPointerDown(handleTriggerPointerDown),
      ]
    : []

  const triggerAttributes = [
    h.Id(triggerId(id)),
    h.Type('button'),
    ...interactiveTriggerAttributes,
  ]

  const panelAttributes = [
    h.Id(`${id}-panel`),
    h.Role('tooltip'),
    h.Style({
      position: 'absolute',
      margin: '0',
      visibility: 'hidden',
      pointerEvents: 'none',
    }),
    h.OnMount(AnchorTooltip({ buttonId: triggerId(id), anchor })),
    ...(isOpen && enabled ? [h.DataAttribute('open', '')] : []),
  ]

  return toView({
    trigger: childAttributes(triggerAttributes),
    panel: childAttributes(panelAttributes),
    isVisible: enabled && isOpen,
  })
})

export type WrapConfig<ParentMessage> = Readonly<{
  model: TooltipModel
  label: string
  enabled: boolean
  toParentMessage: (message: TooltipMessage) => ParentMessage
  triggerAttributes: ReadonlyArray<unknown>
  triggerChildren: ReadonlyArray<Html>
}>

/** Wraps a menu button in a Foldkit tooltip submodel (stable DOM; use `enabled` to toggle). */
export const wrapButton = <ParentMessage>(
  h: HtmlBuilder<ParentMessage>,
  config: WrapConfig<ParentMessage>,
): Html =>
  h.submodel({
    slotId: config.model.id,
    model: config.model,
    view,
    viewInputs: {
      anchor: sidebarAnchor,
      enabled: config.enabled,
      toView: ({ trigger, panel, isVisible }) =>
        h.div(elAttrs<ParentMessage>(sxAttrs(h, tooltipStyles.wrapper)), [
          h.button(
            elAttrs<ParentMessage>(config.triggerAttributes, trigger),
            config.triggerChildren,
          ),
          h.div(
            elAttrs<ParentMessage>(
              sxAttrs(
                h,
                tooltipStyles.content,
                isVisible ? undefined : tooltipStyles.contentHidden,
              ),
              panel,
            ),
            [config.label],
          ),
        ]),
    },
    toParentMessage: config.toParentMessage,
  })
