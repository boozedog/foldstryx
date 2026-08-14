import { Match as M, Option, Schema as S } from 'effect'
import { html } from 'foldkit/html'

import { Toast as UiToast } from '@foldkit/ui'
import type { EntryHandlers, Variant } from '@foldkit/ui/toast'
import { toastStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export const ToastPayload = S.Struct({
  title: S.String,
  maybeDescription: S.Option(S.String),
})

export type ToastPayload = typeof ToastPayload.Type

const entryStyle = (variant: Variant) =>
  M.value(variant).pipe(
    M.when('Info', () => toastStyles.entry),
    M.when('Success', () => toastStyles.entrySuccess),
    M.when('Warning', () => toastStyles.entryWarning),
    M.when('Error', () => toastStyles.entryError),
    M.exhaustive,
  )

export type ToastStyledViewInputsConfig = Readonly<{
  ariaLabel?: string
}>

/** Binds Toast to the default foldstryx payload and Astryx toast visuals. */
export const create = () => {
  const Toast = UiToast.make(ToastPayload)
  type Entry = typeof Toast.Entry.Type
  type ToastMessage = typeof Toast.Message.Type

  const styledViewInputs = (config: ToastStyledViewInputsConfig = {}) => ({
    position: 'BottomRight' as const,
    ...(config.ariaLabel !== undefined ? { ariaLabel: config.ariaLabel } : {}),
    entryToView: (entry: Entry, handlers: EntryHandlers) => {
      const h = html<ToastMessage>()

      return h.div(
        elAttrs<ToastMessage>(
          sxAttrs(h, toastStyles.entry, entryStyle(entry.variant)),
        ),
        [
          h.p(elAttrs<ToastMessage>(sxAttrs(h, toastStyles.title)), [
            entry.payload.title,
          ]),
          ...Option.match(entry.payload.maybeDescription, {
            onNone: () => [],
            onSome: description => [
              h.p(elAttrs<ToastMessage>(sxAttrs(h, toastStyles.description)), [
                description,
              ]),
            ],
          }),
          h.button(
            elAttrs<ToastMessage>(
              handlers.dismiss,
              h.AriaLabel('Close'),
              sxAttrs(h, toastStyles.dismiss),
            ),
            ['×'],
          ),
        ],
      )
    },
  })

  return {
    ...Toast,
    styledViewInputs,
    Payload: ToastPayload,
  }
}
