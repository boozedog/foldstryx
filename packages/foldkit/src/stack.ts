import type { Html, HtmlBuilder } from 'foldkit/html'

import { layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export type StackGap = 'xs' | 'sm' | 'md' | 'lg'

export type StackViewConfig = Readonly<{
  gap?: StackGap
  children: ReadonlyArray<Html | string>
  /** Optional top margin: `'2'` → 0.5rem, `'3'` → 0.75rem. */
  mt?: '2' | '3'
  /** Align this stack as flex-start within a parent flex container. */
  selfStart?: boolean
}>

const gapStyle = (gap: StackGap) => {
  switch (gap) {
    case 'xs':
      return layoutStyles.stackXs
    case 'sm':
      return layoutStyles.stackSm
    case 'lg':
      return layoutStyles.stackLg
    default:
      return layoutStyles.stack
  }
}

const mtStyle = (mt: '2' | '3' | undefined) => {
  if (mt === '2') return layoutStyles.mt2
  if (mt === '3') return layoutStyles.mt3
  return undefined
}

/** Vertical flex stack with closed gap scale. Prefer over raw layoutStyles.stack*. */
export const view = <ParentMessage>(
  config: StackViewConfig,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const gap = config.gap ?? 'md'

  return h.div(
    elAttrs<ParentMessage>(
      sxAttrs(
        h,
        gapStyle(gap),
        mtStyle(config.mt),
        config.selfStart === true ? layoutStyles.selfStart : undefined,
      ),
    ),
    config.children,
  )
}
