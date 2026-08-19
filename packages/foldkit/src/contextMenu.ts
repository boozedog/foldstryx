import { Effect, Queue, Schema as S, Stream } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as ElementMount from 'foldkit/mount'
import * as Mount from 'foldkit/mount'

import type { Model } from '@foldkit/ui/menu'
import { layoutDynamicStyles, layoutStyles } from '@foldstryx/styles'

import * as DropdownMenu from './dropdownMenu.js'
import { elAttrs, sxAttrs } from './sx.js'

export type ContextMenuAnchor = Readonly<{
  x: number
  y: number
}>

export const ContextMenuOpened = m('ContextMenuOpened', {
  offsetX: S.Number,
  offsetY: S.Number,
})

/** Scene/test ack for `attachMount` stream mounts (update no-ops). */
export const CompletedAttachContextMenu = m('CompletedAttachContextMenu')

export const attachMount = Mount.defineStream(
  'AttachContextMenu',
  ContextMenuOpened,
)((element: Element) =>
  Stream.callback<typeof ContextMenuOpened.Type>(queue =>
    Effect.gen(function* () {
      if (!(element instanceof HTMLElement)) {
        return yield* Effect.never
      }
      yield* Effect.acquireRelease(
        Effect.sync(() => {
          const handler = (event: MouseEvent) => {
            event.preventDefault()
            const rect = element.getBoundingClientRect()
            Queue.offerUnsafe(
              queue,
              ContextMenuOpened({
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top,
              }),
            )
          }
          element.addEventListener('contextmenu', handler)
          return handler
        }),
        handler =>
          Effect.sync(() => {
            element.removeEventListener('contextmenu', handler)
          }),
      )
      return yield* Effect.never
    }),
  ),
)

export type ContextMenuViewConfig<
  Item extends string,
  ParentMessage,
> = Readonly<{
  menu: ReturnType<typeof DropdownMenu.create<Item>>
  menuModel: Model
  items: ReadonlyArray<Item>
  itemSpec: DropdownMenu.DropdownMenuStyledConfig<
    Item,
    ParentMessage
  >['itemSpec']
  anchor: ContextMenuAnchor
  trigger: Html
  menuSlotId: string
  toContextMenuOpened: (message: typeof ContextMenuOpened.Type) => ParentMessage
  toMenuMessage: (message: DropdownMenu.Message) => ParentMessage
  isItemDisabled?: DropdownMenu.DropdownMenuStyledConfig<
    Item,
    ParentMessage
  >['isItemDisabled']
}>

/**
 * Right-click surface + cursor-anchored DropdownMenu chrome.
 * Touch long-press is not ported in v1.
 */
export const view = <Item extends string, ParentMessage>(
  config: ContextMenuViewConfig<Item, ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.div(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.relative)), [
    h.div(
      elAttrs<ParentMessage>(
        h.OnMount(
          ElementMount.mapMessage(attachMount(), config.toContextMenuOpened),
        ),
      ),
      [config.trigger],
    ),
    h.span(
      elAttrs<ParentMessage>(
        sxAttrs(
          h,
          layoutStyles.contextMenuAnchor,
          layoutDynamicStyles.contextMenuOffset(
            config.anchor.x,
            config.anchor.y,
          ),
        ),
      ),
      [
        h.submodel({
          slotId: config.menuSlotId,
          model: config.menuModel,
          view: config.menu.view,
          viewInputs: DropdownMenu.styledViewInputs<Item, ParentMessage>(
            {
              items: config.items,
              itemSpec: config.itemSpec,
              buttonContent: h.span([]),
              anchor: { placement: 'bottom-start', gap: 0, padding: 8 },
              ...(config.isItemDisabled !== undefined
                ? { isItemDisabled: config.isItemDisabled }
                : {}),
            },
            h,
          ),
          toParentMessage: config.toMenuMessage,
        }),
      ],
    ),
  ])

export const mapContextMenuOpened =
  <ParentMessage>(toParent: (anchor: ContextMenuAnchor) => ParentMessage) =>
  (message: typeof ContextMenuOpened.Type): ParentMessage =>
    toParent({ x: message.offsetX, y: message.offsetY })
