import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { cardStyles, layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/** Renders a token-styled card container. */
export const root = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
): Html => {
  const h = html<ParentMessage>()

  return h.div(elAttrs<ParentMessage>(sxAttrs(h, cardStyles.root)), children)
}

/** Renders a card header block. */
export const header = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
): Html => {
  const h = html<ParentMessage>()

  return h.div(elAttrs<ParentMessage>(sxAttrs(h, cardStyles.header)), children)
}

/** Renders a card title. */
export const title = <ParentMessage>(text: string): Html => {
  const h = html<ParentMessage>()

  return h.div(elAttrs<ParentMessage>(sxAttrs(h, cardStyles.title)), [text])
}

/** Renders a card description. */
export const description = <ParentMessage>(text: string): Html => {
  const h = html<ParentMessage>()

  return h.div(elAttrs<ParentMessage>(sxAttrs(h, cardStyles.description)), [
    text,
  ])
}

/** Renders a card content section. */
export const content = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
): Html => {
  const h = html<ParentMessage>()

  return h.div(elAttrs<ParentMessage>(sxAttrs(h, cardStyles.content)), children)
}

/**
 * Convenience composer: card root + optional header (title/description) + content.
 * Keeps existing slot API; does not replace root/header/content.
 *
 * `padded: true` applies one coherent inset via `panelPad` on the root and
 * does **not** nest header/content slots (those add their own horizontal pad).
 */
export type CardSectionConfig = Readonly<{
  title?: string
  description?: string
  children: ReadonlyArray<Html | string>
  /** Single coherent inset on the root — no stacked slot padding. */
  padded?: boolean
}>

export const section = <ParentMessage>(config: CardSectionConfig): Html => {
  const h = html<ParentMessage>()
  const hasHeader =
    config.title !== undefined || config.description !== undefined

  if (config.padded === true) {
    // One padding layer: root + panelPad. Title/description/body as direct children.
    return h.div(
      elAttrs<ParentMessage>(
        sxAttrs(h, cardStyles.root, cardStyles.padded, layoutStyles.panelPad),
      ),
      [
        ...(config.title !== undefined
          ? [title<ParentMessage>(config.title)]
          : []),
        ...(config.description !== undefined
          ? [description<ParentMessage>(config.description)]
          : []),
        ...config.children,
      ],
    )
  }

  const headerBlock = hasHeader
    ? header<ParentMessage>([
        ...(config.title !== undefined
          ? [title<ParentMessage>(config.title)]
          : []),
        ...(config.description !== undefined
          ? [description<ParentMessage>(config.description)]
          : []),
      ])
    : undefined

  const body = content<ParentMessage>(config.children)

  return root<ParentMessage>([
    ...(headerBlock !== undefined ? [headerBlock] : []),
    body,
  ])
}
