import { Match, Schema } from 'effect'
import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { cardStyles, layoutStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

/** Async metric state — display-only; apps format values and map errors at the boundary. */
export class Loading extends Schema.TaggedClass<Loading>()('Loading', {}) {}

export class Failed extends Schema.TaggedClass<Failed>()('Failed', {
  message: Schema.String,
}) {}

export class Ready extends Schema.TaggedClass<Ready>()('Ready', {
  /** App formats; string only in v1. */
  value: Schema.String,
}) {}

export const StatState = Schema.Union([Loading, Failed, Ready])
export type StatState = typeof StatState.Type

export type StatCardConfig = Readonly<{
  label: string
  state: StatState
  /** Optional loading placeholder text (default: "…"). */
  loadingText?: string
}>

/** Metric card: label + Effect tagged Loading | Failed | Ready. */
export const card = <ParentMessage>(config: StatCardConfig): Html => {
  const h = html<ParentMessage>()
  const loadingText = config.loadingText ?? '…'

  const body = Match.value(config.state).pipe(
    Match.tagsExhaustive({
      Loading: () =>
        h.div(
          elAttrs<ParentMessage>(
            sxAttrs(h, layoutStyles.metricValue),
            h.AriaLive('polite'),
          ),
          [loadingText],
        ),
      Failed: ({ message }) =>
        h.div(
          elAttrs<ParentMessage>(
            sxAttrs(h, layoutStyles.metricError),
            h.AriaLive('polite'),
          ),
          [message],
        ),
      Ready: ({ value }) =>
        h.div(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.metricValue)), [
          value,
        ]),
    }),
  )

  return h.div(
    elAttrs<ParentMessage>(sxAttrs(h, cardStyles.root, layoutStyles.panelPad)),
    [
      h.div(elAttrs<ParentMessage>(sxAttrs(h, layoutStyles.metricLabel)), [
        config.label,
      ]),
      body,
    ],
  )
}
