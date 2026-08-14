import { Schema as S } from 'effect'
import { Command, Runtime } from 'foldkit'

import { Mount, type Message as SinkMessage } from '@foldstryx/kitchen-sink'

import { Route, RouteSchema } from './routes.js'

export const Model = S.Struct({
  route: RouteSchema,
  collapsed: S.Boolean,
  expanded: S.Array(S.String),
  hovered: S.NullOr(S.String),
  open: S.NullOr(S.String),
  sink: Mount.Model,
})
export type Model = typeof Model.Type

/**
 * Runtime schema for the docs application's top-level `Message` union.
 *
 * External hosts (e.g. Taurifold) pass this to
 * `Runtime.makeApplication({ devTools: { Message } })` so the Foldkit DevTools
 * overlay can discover the message schema and decode inbound dispatch payloads
 * without reconstructing the union in the host.
 *
 * The nested `Sink.message` payload is intentionally unconstrained (`S.Any`):
 * the kitchen-sink catalog does not (yet) publish a stable runtime message
 * schema, and the docs package MUST NOT depend on host-specific schemas. The
 * typed `Message` type below narrows that payload to the kitchen-sink `Message`
 * union for the host's typed `update`.
 *
 * `HoverNav` / `OpenNav` ids are JSON-friendly optional-nullable strings: they
 * accept a missing key or `null`. Internal producers emit `string | undefined`;
 * `undefined` is not JSON-transportable, so external dispatch should use `null`
 * (or omit the key).
 */
export const Message = S.Union([
  S.Struct({ _tag: S.Literal('ToggleSidebar') }),
  S.Struct({ _tag: S.Literal('Navigate'), route: RouteSchema }),
  S.Struct({ _tag: S.Literal('ToggleNav'), id: S.String }),
  S.Struct({ _tag: S.Literal('HoverNav'), id: S.optional(S.NullOr(S.String)) }),
  S.Struct({ _tag: S.Literal('OpenNav'), id: S.optional(S.NullOr(S.String)) }),
  S.Struct({ _tag: S.Literal('Noop') }),
  S.Struct({ _tag: S.Literal('Sink'), message: S.Any }),
])
export type Message =
  | Exclude<typeof Message.Type, { _tag: 'Sink' }>
  | { _tag: 'Sink'; message: SinkMessage }

export const init: Runtime.ApplicationInit<Model, Message> = () => {
  const [sink] = Mount.init()
  return [
    {
      route: Route.overview,
      collapsed: false,
      expanded: ['components'],
      hovered: null,
      open: null,
      sink,
    },
    [],
  ]
}

export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ToggleSidebar':
      return [{ ...model, collapsed: !model.collapsed }, []]
    case 'Navigate':
      return [{ ...model, route: message.route }, []]
    case 'ToggleNav':
      return [
        {
          ...model,
          expanded: model.expanded.includes(message.id)
            ? model.expanded.filter(id => id !== message.id)
            : [...model.expanded, message.id],
        },
        [],
      ]
    case 'HoverNav':
      return [{ ...model, hovered: message.id ?? null }, []]
    case 'OpenNav':
      return [{ ...model, open: message.id ?? null }, []]
    case 'Noop':
      return [model, []]
    case 'Sink': {
      const [sink, commands] = Mount.update(model.sink, message.message)
      return [
        { ...model, sink },
        Command.mapMessages(commands, m => ({ _tag: 'Sink', message: m })),
      ]
    }
  }
}
