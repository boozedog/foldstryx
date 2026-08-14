import { Schema as S } from 'effect'

/**
 * Typed discriminated union of documentation routes. The docs composition
 * owns this model; browser and Taurifold bootstraps only ever dispatch
 * `Navigate` messages against it.
 */
export const RouteSchema = S.Union([
  S.Struct({ _tag: S.Literal('overview') }),
  S.Struct({ _tag: S.Literal('layout') }),
  S.Struct({ _tag: S.Literal('forms') }),
  S.Struct({ _tag: S.Literal('feedback') }),
  S.Struct({ _tag: S.Literal('data') }),
  S.Struct({ _tag: S.Literal('media') }),
  S.Struct({ _tag: S.Literal('gettingStarted') }),
  S.Struct({ _tag: S.Literal('principles') }),
  S.Struct({ _tag: S.Literal('kitchenSink') }),
])
export type Route = typeof RouteSchema.Type

/** Canonical route constants. Prefer these over hand-built literals. */
export const Route = {
  overview: { _tag: 'overview' },
  layout: { _tag: 'layout' },
  forms: { _tag: 'forms' },
  feedback: { _tag: 'feedback' },
  data: { _tag: 'data' },
  media: { _tag: 'media' },
  gettingStarted: { _tag: 'gettingStarted' },
  principles: { _tag: 'principles' },
  kitchenSink: { _tag: 'kitchenSink' },
} as const satisfies Record<string, Route>
