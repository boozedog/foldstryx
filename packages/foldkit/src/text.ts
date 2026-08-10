import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/**
 * Closed typography variants mapped 1:1 to layoutStyles.
 * Metric label/value belong on Stat; deferred variants are listed in issue #1.
 */
export type TextVariant =
  | 'body'
  | 'bodySm'
  | 'muted'
  | 'mutedSm'
  | 'error'
  | 'success'
  | 'mono'
  | 'sectionTitle'
  | 'title'

/** Closed element override union — no arbitrary tags. */
export type TextAs = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'div'

export type TextViewConfig = Readonly<{
  variant?: TextVariant
  as?: TextAs
  children: string | ReadonlyArray<Html | string>
}>

const defaultElement = (variant: TextVariant): TextAs => {
  switch (variant) {
    case 'mutedSm':
    case 'mono':
      return 'span'
    case 'sectionTitle':
      return 'h2'
    case 'title':
      return 'h1'
    default:
      return 'p'
  }
}

const variantStyle = (variant: TextVariant) => {
  switch (variant) {
    case 'body':
      return layoutStyles.body
    case 'bodySm':
      return layoutStyles.bodySm
    case 'muted':
      return layoutStyles.muted
    case 'mutedSm':
      return layoutStyles.mutedSm
    case 'error':
      return layoutStyles.errorText
    case 'success':
      return layoutStyles.successText
    case 'mono':
      return layoutStyles.mono
    case 'sectionTitle':
      return layoutStyles.sectionTitle
    case 'title':
      return layoutStyles.title
  }
}

/** Named typography primitive — closed variants + optional closed `as`. */
export const view = <ParentMessage>(config: TextViewConfig): Html => {
  const h = html<ParentMessage>()
  const variant = config.variant ?? 'body'
  const tag = config.as ?? defaultElement(variant)
  const children =
    typeof config.children === 'string' ? [config.children] : config.children

  const attrs = elAttrs<ParentMessage>(sxAttrs(h, variantStyle(variant)))

  switch (tag) {
    case 'span':
      return h.span(attrs, children)
    case 'h1':
      return h.h1(attrs, children)
    case 'h2':
      return h.h2(attrs, children)
    case 'h3':
      return h.h3(attrs, children)
    case 'div':
      return h.div(attrs, children)
    default:
      return h.p(attrs, children)
  }
}
