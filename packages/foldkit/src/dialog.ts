import { Option } from 'effect'
import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import {
  RequestedClose,
  descriptionId,
  init,
  titleId,
} from '@foldkit/ui/dialog'
import type { RenderInfo, ViewInputs } from '@foldkit/ui/dialog'
import { dialogStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export {
  init,
  update,
  open,
  close,
  view,
  titleId,
  descriptionId,
  Model,
  Message,
  OutMessage,
  Opened,
  Closed,
  RequestedOpen,
  RequestedClose,
} from '@foldkit/ui/dialog'

export type DialogStyledConfig<ParentMessage> = Readonly<{
  title?: string
  description?: string
  body?: ReadonlyArray<Html>
  footer?: ReadonlyArray<Html>
  showClose?: boolean
  panelSize?: 'default' | 'sm'
  extraDialogAttributes?: ReadonlyArray<unknown>
  /** Lifts an Escape-keydown close request into the parent's message type. */
  onRequestClose?: (message: RequestedClose) => ParentMessage
}>

const panelContent = <ParentMessage>(
  h: ReturnType<typeof html<ParentMessage>>,
  titleElementId: string,
  descriptionElementId: string,
  config: DialogStyledConfig<ParentMessage>,
  closeButton: RenderInfo['closeButton'],
): ReadonlyArray<Html> => [
  ...(config.showClose === true
    ? [
        h.button(
          elAttrs<ParentMessage>(
            closeButton,
            sxAttrs(h, dialogStyles.close),
            h.AriaLabel('Close'),
          ),
          ['×'],
        ),
      ]
    : []),
  ...(config.title !== undefined || config.description !== undefined
    ? [
        h.div(elAttrs<ParentMessage>(sxAttrs(h, dialogStyles.header)), [
          ...(config.title !== undefined
            ? [
                h.h2(
                  elAttrs<ParentMessage>(
                    sxAttrs(h, dialogStyles.title),
                    h.Id(titleElementId),
                  ),
                  [config.title],
                ),
              ]
            : []),
          ...(config.description !== undefined
            ? [
                h.p(
                  elAttrs<ParentMessage>(
                    sxAttrs(h, dialogStyles.description),
                    h.Id(descriptionElementId),
                  ),
                  [config.description],
                ),
              ]
            : []),
        ]),
      ]
    : []),
  ...(config.body !== undefined
    ? [
        h.div(elAttrs<ParentMessage>(sxAttrs(h, dialogStyles.body)), [
          ...config.body,
        ]),
      ]
    : []),
  ...(config.footer !== undefined
    ? [
        h.div(
          elAttrs<ParentMessage>(sxAttrs(h, dialogStyles.footer)),
          config.footer,
        ),
      ]
    : []),
]

/** Builds styled Foldkit Dialog view inputs with Astryx dialog visuals. */
export const styledViewInputs = <ParentMessage>(
  config: DialogStyledConfig<ParentMessage> & Readonly<{ id: string }>,
): ViewInputs => {
  const model = init({ id: config.id })
  const titleElementId = titleId(model)
  const descriptionElementId = descriptionId(model)
  const describedBy =
    config.description !== undefined ? descriptionElementId : ''

  return {
    toView: ({ dialog, backdrop, panel, closeButton, isVisible }) => {
      const h = html<ParentMessage>()

      const handleDialogKeyDown = (
        key: string,
      ): Option.Option<ParentMessage> => {
        if (
          key !== 'Escape' ||
          !isVisible ||
          config.onRequestClose === undefined
        ) {
          return Option.none()
        }
        return Option.some(config.onRequestClose(RequestedClose()))
      }

      return h.dialog(
        elAttrs<ParentMessage>(
          dialog,
          sxAttrs(
            h,
            dialogStyles.dialog,
            isVisible ? dialogStyles.dialogOpen : undefined,
          ),
          ...(config.extraDialogAttributes ?? []),
          h.OnKeyDownPreventDefault(handleDialogKeyDown),
          h.AriaDescribedBy(describedBy),
        ),
        isVisible
          ? [
              h.div(
                elAttrs<ParentMessage>(
                  backdrop,
                  h.Id(`${config.id}-backdrop`),
                  sxAttrs(h, dialogStyles.backdrop),
                ),
                [],
              ),
              h.div(
                elAttrs<ParentMessage>(
                  panel,
                  sxAttrs(
                    h,
                    dialogStyles.panel,
                    config.panelSize === 'sm'
                      ? dialogStyles.panelSm
                      : undefined,
                  ),
                ),
                panelContent(
                  h,
                  titleElementId,
                  descriptionElementId,
                  config,
                  closeButton,
                ),
              ),
            ]
          : [],
      )
    },
  }
}
