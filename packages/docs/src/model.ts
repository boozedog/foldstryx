import { Option, Schema as S } from 'effect'
import { Command, Runtime } from 'foldkit'
import * as Calendar from 'foldkit/calendar'

import {
  DateInput,
  DropdownMenu,
  Selector,
  Typeahead,
} from '@foldstryx/foldkit'
import { Mount, type Message as SinkMessage } from '@foldstryx/kitchen-sink'

import { Route, RouteSchema } from './routes.js'

const FormsKindSelector = Selector.create<'all' | 'active'>()
export type FormsFruitItem =
  'apple' | 'banana' | ReturnType<typeof Typeahead.noMatchesItem>
const FormsTypeahead = Typeahead.create<FormsFruitItem>()
type DataMenuItem = 'open' | 'rename'
type DataContextMenuWidget = ReturnType<
  typeof DropdownMenu.create<DataMenuItem>
>
const DataContextMenu: DataContextMenuWidget =
  DropdownMenu.create<DataMenuItem>()
export { DataContextMenu, FormsKindSelector, FormsTypeahead }

const today = Calendar.make(2026, 8, 19)

export const Model = S.Struct({
  route: RouteSchema,
  collapsed: S.Boolean,
  expanded: S.Array(S.String),
  hovered: S.NullOr(S.String),
  open: S.NullOr(S.String),
  formsKind: S.Literals(['all', 'active']),
  formsKindSelector: Selector.Model,
  formsTypeahead: Typeahead.Model,
  formsStartDate: DateInput.Model,
  formsEndDate: DateInput.Model,
  dataContextMenu: DropdownMenu.Model,
  dataContextMenuAnchorX: S.Number,
  dataContextMenuAnchorY: S.Number,
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
  S.Struct({ _tag: S.Literal('CompletedSyncCheckboxIndeterminate') }),
  S.Struct({ _tag: S.Literal('CompletedAttachContextMenu') }),
  S.Struct({
    _tag: S.Literal('GotFormsKindSelectorMessage'),
    message: S.Any,
  }),
  S.Struct({
    _tag: S.Literal('GotFormsTypeaheadMessage'),
    message: S.Any,
  }),
  S.Struct({
    _tag: S.Literal('ContextMenuOpened'),
    offsetX: S.Number,
    offsetY: S.Number,
  }),
  S.Struct({
    _tag: S.Literal('GotDataContextMenuMessage'),
    message: S.Any,
  }),
  S.Struct({ _tag: S.Literal('Sink'), message: S.Any }),
])
export type Message =
  | Exclude<
      typeof Message.Type,
      | { _tag: 'Sink' }
      | { _tag: 'GotFormsKindSelectorMessage' }
      | { _tag: 'GotFormsTypeaheadMessage' }
      | { _tag: 'GotDataContextMenuMessage' }
    >
  | { _tag: 'Sink'; message: SinkMessage }
  | { _tag: 'GotFormsKindSelectorMessage'; message: Selector.Message }
  | { _tag: 'GotFormsTypeaheadMessage'; message: Typeahead.Message }
  | { _tag: 'GotDataContextMenuMessage'; message: DropdownMenu.Message }

export const init: Runtime.ApplicationInit<Model, Message> = () => {
  const [sink] = Mount.init()
  return [
    {
      route: Route.overview,
      collapsed: false,
      expanded: ['components'],
      hovered: null,
      open: null,
      formsKind: 'all',
      formsKindSelector: Selector.init({ id: 'docs-kind' }),
      formsTypeahead: Typeahead.init({ id: 'docs-typeahead' }),
      formsStartDate: DateInput.init({ id: 'docs-start-date', today }),
      formsEndDate: DateInput.init({ id: 'docs-end-date', today }),
      dataContextMenu: DropdownMenu.init({ id: 'docs-context-menu' }),
      dataContextMenuAnchorX: 0,
      dataContextMenuAnchorY: 0,
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
    case 'CompletedSyncCheckboxIndeterminate':
      return [model, []]
    case 'CompletedAttachContextMenu':
      return [model, []]
    case 'GotFormsKindSelectorMessage': {
      const [formsKindSelector, commands, maybeOut] = FormsKindSelector.update(
        model.formsKindSelector,
        message.message,
      )
      const formsKind = Option.match(maybeOut, {
        onNone: () => model.formsKind,
        onSome: out => out.value,
      })
      return [
        {
          ...model,
          formsKindSelector,
          formsKind,
        },
        Command.mapMessages(commands, m => ({
          _tag: 'GotFormsKindSelectorMessage' as const,
          message: m,
        })),
      ]
    }
    case 'GotFormsTypeaheadMessage': {
      const [formsTypeahead, commands] = FormsTypeahead.update(
        model.formsTypeahead,
        message.message,
      )
      return [
        { ...model, formsTypeahead },
        Command.mapMessages(commands, m => ({
          _tag: 'GotFormsTypeaheadMessage' as const,
          message: m,
        })),
      ]
    }
    case 'ContextMenuOpened': {
      const [dataContextMenu, commands] = DataContextMenu.open(
        model.dataContextMenu,
      )
      return [
        {
          ...model,
          dataContextMenu,
          dataContextMenuAnchorX: message.offsetX,
          dataContextMenuAnchorY: message.offsetY,
        },
        Command.mapMessages(commands, m => ({
          _tag: 'GotDataContextMenuMessage' as const,
          message: m,
        })),
      ]
    }
    case 'GotDataContextMenuMessage': {
      const [dataContextMenu, commands] = DataContextMenu.update(
        model.dataContextMenu,
        message.message,
      )
      return [
        { ...model, dataContextMenu },
        Command.mapMessages(commands, m => ({
          _tag: 'GotDataContextMenuMessage' as const,
          message: m,
        })),
      ]
    }
    case 'Sink': {
      const [sink, commands] = Mount.update(model.sink, message.message)
      return [
        { ...model, sink },
        Command.mapMessages(commands, m => ({ _tag: 'Sink', message: m })),
      ]
    }
  }
}
