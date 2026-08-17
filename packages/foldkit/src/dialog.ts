import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { RequestedClose } from '@foldkit/ui/dialog'
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
  h: HtmlBuilder<ParentMessage>,
  render: RenderInfo,
  config: DialogStyledConfig<ParentMessage>,
): ReadonlyArray<Html> => [
  ...(config.showClose === true
    ? [
        h.button(
          elAttrs<ParentMessage>(
            render.closeButton,
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
                    render.title,
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
                    render.description,
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

/**
 * Builds styled Foldkit Dialog view inputs with Astryx dialog visuals.
 * The parent thread's builder renders the dialog markup in the parent
 * boundary; the dialog keeps its headless submodel.
 */
export const styledViewInputs = <ParentMessage>(
  config: DialogStyledConfig<ParentMessage> & Readonly<{ id: string }>,
  h: HtmlBuilder<ParentMessage>,
): ViewInputs => {
  return {
    toView: render => {
      const { dialog, backdrop, panel, isVisible } = render

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
                panelContent(h, render, config),
              ),
            ]
          : [],
      )
    },
  }
}
