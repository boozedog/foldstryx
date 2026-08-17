import type { Html, HtmlBuilder } from 'foldkit/html'

import { pageStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/**
 * Generic page/shell chrome. No product vocabulary: callers supply their own
 * title, description, actions, content, and footer.
 */
export type PageHeaderConfig = Readonly<{
  title: string
  description?: string
  actions?: ReadonlyArray<Html | string>
}>

/**
 * Page header region: title + optional description, with an optional action
 * row. Renders a semantic `<header>` when no actions are present; wraps in a
 * row when actions are supplied.
 */
export const header = <ParentMessage>(
  config: PageHeaderConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const titleAndDescription = h.header(
    elAttrs<ParentMessage>(sxAttrs(h, pageStyles.header)),
    [
      h.h1(elAttrs<ParentMessage>(sxAttrs(h, pageStyles.title)), [
        config.title,
      ]),
      ...(config.description !== undefined
        ? [
            h.p(elAttrs<ParentMessage>(sxAttrs(h, pageStyles.description)), [
              config.description,
            ]),
          ]
        : []),
    ],
  )

  if (config.actions === undefined || config.actions.length === 0) {
    return titleAndDescription
  }

  return h.div(elAttrs<ParentMessage>(sxAttrs(h, pageStyles.headerRow)), [
    titleAndDescription,
    h.div(
      elAttrs<ParentMessage>(sxAttrs(h, pageStyles.actions)),
      config.actions,
    ),
  ])
}

/** Page content region. */
export const content = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  return h.div(elAttrs<ParentMessage>(sxAttrs(h, pageStyles.content)), children)
}

/** Page footer region. */
export const footer = <ParentMessage>(
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  return h.div(elAttrs<ParentMessage>(sxAttrs(h, pageStyles.footer)), children)
}

export type PageShellConfig = Readonly<{
  header?: Html
  content: ReadonlyArray<Html | string>
  footer?: Html
}>

/**
 * Convenience composer: page shell with optional header and footer around a
 * content region. Keeps the slot API; does not replace header/content/footer.
 */
export const shell = <ParentMessage>(
  config: PageShellConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  return h.div(elAttrs<ParentMessage>(sxAttrs(h, pageStyles.shell)), [
    ...(config.header !== undefined ? [config.header] : []),
    content<ParentMessage>(config.content, h),
    ...(config.footer !== undefined ? [config.footer] : []),
  ])
}
