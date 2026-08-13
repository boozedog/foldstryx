import { Effect, Schema as S } from 'effect'
import { Command } from 'foldkit'
import * as Story from 'foldkit/story'

import { describe, expect, it } from '@effect/vitest'

import { Failed, Loading, Ready, StatState, card } from './stat.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  text?: string
}>
const asNode = (value: unknown): Node => value as Node
const text = (value: unknown): string => {
  if (typeof value === 'string') return value
  const node = asNode(value)
  if (node.text) return node.text
  return node.children?.map(text).join('') ?? ''
}
const cardText = (state: StatState): string =>
  text(card({ label: 'Pending', state }))

// A minimal async metric reducer that drives Stat's tagged states and
// demonstrates stale-result handling via a request id.
class LoadRequested extends S.TaggedClass<LoadRequested>()('LoadRequested', {
  requestId: S.Finite,
}) {}
class Loaded extends S.TaggedClass<Loaded>()('Loaded', {
  requestId: S.Finite,
  value: S.String,
}) {}
class LoadFailed extends S.TaggedClass<LoadFailed>()('LoadFailed', {
  requestId: S.Finite,
  message: S.String,
}) {}
const MetricMessage = S.Union([LoadRequested, Loaded, LoadFailed])
type MetricMessage = typeof MetricMessage.Type

const MetricModel = S.Struct({
  state: StatState,
  requestId: S.Finite,
})
type MetricModel = typeof MetricModel.Type

const FetchMetric = Command.define(
  'FetchMetric',
  { requestId: S.Finite },
  Loaded,
  LoadFailed,
)(({ requestId }): Effect.Effect<Loaded | LoadFailed> =>
  Effect.succeed(new Loaded({ requestId, value: '42' })),
)

const update = (
  model: MetricModel,
  message: MetricMessage,
): readonly [MetricModel, ReadonlyArray<Command.Command<MetricMessage>>] => {
  switch (message._tag) {
    case 'LoadRequested':
      return [
        { ...model, state: new Loading(), requestId: message.requestId },
        [FetchMetric({ requestId: message.requestId })],
      ]
    case 'Loaded':
      // Stale result: a newer request superseded this one.
      if (message.requestId !== model.requestId) return [model, []]
      return [{ ...model, state: new Ready({ value: message.value }) }, []]
    case 'LoadFailed':
      if (message.requestId !== model.requestId) return [model, []]
      return [{ ...model, state: new Failed({ message: message.message }) }, []]
  }
}

describe('Stat async lifecycle', () => {
  it('transitions Loading → Ready when the fetch resolves', () => {
    Story.story(
      update,
      Story.with({ state: new Loading(), requestId: 0 }),
      Story.message(new LoadRequested({ requestId: 1 })),
      Story.model(model => {
        expect(model.state._tag).toBe('Loading')
        expect(model.requestId).toBe(1)
      }),
      Story.Command.expectHas(FetchMetric({ requestId: 1 })),
      Story.Command.resolve(
        FetchMetric({ requestId: 1 }),
        new Loaded({ requestId: 1, value: '42' }),
      ),
      Story.model(model => {
        expect(model.state._tag).toBe('Ready')
        if (model.state._tag === 'Ready') {
          expect(model.state.value).toBe('42')
          expect(cardText(model.state)).toContain('Pending')
          expect(cardText(model.state)).toContain('42')
        }
      }),
      Story.Command.expectNone(),
    )
  })

  it('transitions Loading → Failed when the fetch fails', () => {
    Story.story(
      update,
      Story.with({ state: new Loading(), requestId: 0 }),
      Story.message(new LoadRequested({ requestId: 1 })),
      Story.Command.resolve(
        FetchMetric({ requestId: 1 }),
        new LoadFailed({ requestId: 1, message: 'Unavailable' }),
      ),
      Story.model(model => {
        expect(model.state._tag).toBe('Failed')
        if (model.state._tag === 'Failed') {
          expect(model.state.message).toBe('Unavailable')
          expect(cardText(model.state)).toContain('Pending')
          expect(cardText(model.state)).toContain('Unavailable')
        }
      }),
      Story.Command.expectNone(),
    )
  })

  it('ignores a stale Loaded result from an older request', () => {
    // A newer request (requestId 2) is in flight; an older Loaded (requestId 1)
    // must not clobber the Loading state.
    const [model] = update(
      { state: new Loading(), requestId: 2 },
      new Loaded({ requestId: 1, value: 'stale' }),
    )
    expect(model.state._tag).toBe('Loading')
    expect(model.requestId).toBe(2)
  })

  it('ignores a stale LoadFailed result from an older request', () => {
    const [model] = update(
      { state: new Loading(), requestId: 2 },
      new LoadFailed({ requestId: 1, message: 'stale error' }),
    )
    expect(model.state._tag).toBe('Loading')
    expect(model.requestId).toBe(2)
  })
})
