import { Schema as S } from 'effect'
import { Command, Runtime } from 'foldkit'

import { Mount, type Message as SinkMessage } from '@foldstryx/kitchen-sink'

import { Route, RouteSchema, type Route as RouteType } from './routes.js'

export const Model = S.Struct({
  route: RouteSchema,
  collapsed: S.Boolean,
  expanded: S.Array(S.String),
  hovered: S.NullOr(S.String),
  open: S.NullOr(S.String),
  sink: Mount.Model,
})
export type Model = typeof Model.Type

export type Message = Readonly<
  | { _tag: 'ToggleSidebar' }
  | { _tag: 'Navigate'; route: RouteType }
  | { _tag: 'ToggleNav'; id: string }
  | { _tag: 'HoverNav'; id: string | undefined }
  | { _tag: 'OpenNav'; id: string | undefined }
  | { _tag: 'Sink'; message: SinkMessage }
>

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
    case 'Sink': {
      const [sink, commands] = Mount.update(model.sink, message.message)
      return [
        { ...model, sink },
        Command.mapMessages(commands, m => ({ _tag: 'Sink', message: m })),
      ]
    }
  }
}
