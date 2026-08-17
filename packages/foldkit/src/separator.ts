import type { Html, HtmlBuilder } from 'foldkit/html'

import { separatorStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

const noChildren: ReadonlyArray<never> = []

export type SeparatorOrientation = 'horizontal' | 'vertical'

export type SeparatorViewConfig<_ParentMessage> = Readonly<{
  orientation?: SeparatorOrientation
}>

/** Renders a shadcn-styled separator line. */
export const view = <ParentMessage>(
  config: SeparatorViewConfig<ParentMessage> = {},
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const orientation = config.orientation ?? 'horizontal'

  return h.div(
    elAttrs<ParentMessage>(
      h.AriaHidden(true),
      h.Role('separator'),
      sxAttrs(
        h,
        orientation === 'vertical'
          ? separatorStyles.vertical
          : separatorStyles.horizontal,
      ),
    ),
    noChildren,
  )
}
