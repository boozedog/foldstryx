import { Schema as S } from 'effect'
import { Command, Runtime, Submodel } from 'foldkit'
import { html } from 'foldkit/html'

import {
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  NativeSelect,
  Row,
  Separator,
  Stack,
  Switch,
  Text,
  elAttrs,
  sxAttrs,
} from '@foldstryx/foldkit'
import { layoutStyles } from '@foldstryx/styles'

export const Model = S.Struct({
  clicks: S.Finite,
  email: S.String,
  filter: S.String,
  includeInactive: S.Boolean,
  kind: S.String,
  notifications: S.Boolean,
})
export type Model = typeof Model.Type
export const Clicked = () => ({ _tag: 'Clicked' as const })
export const EmailChanged = (value: string) => ({
  _tag: 'EmailChanged' as const,
  value,
})
export const FilterChanged = (value: string) => ({
  _tag: 'FilterChanged' as const,
  value,
})
export const IncludeInactiveChanged = (checked: boolean) => ({
  _tag: 'IncludeInactiveChanged' as const,
  checked,
})
export const KindChanged = (value: string) => ({
  _tag: 'KindChanged' as const,
  value,
})
export const NotificationsChanged = (checked: boolean) => ({
  _tag: 'NotificationsChanged' as const,
  checked,
})
export type Message = Readonly<
  | { _tag: 'Clicked' }
  | { _tag: 'EmailChanged'; value: string }
  | { _tag: 'FilterChanged'; value: string }
  | { _tag: 'IncludeInactiveChanged'; checked: boolean }
  | { _tag: 'KindChanged'; value: string }
  | { _tag: 'NotificationsChanged'; checked: boolean }
>
export const init: Runtime.ApplicationInit<Model, Message> = () => [
  {
    clicks: 0,
    email: '',
    filter: '',
    includeInactive: false,
    kind: 'all',
    notifications: false,
  },
  [],
]
export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  message._tag === 'Clicked'
    ? { ...model, clicks: model.clicks + 1 }
    : message._tag === 'EmailChanged'
      ? { ...model, email: message.value }
      : message._tag === 'FilterChanged'
        ? { ...model, filter: message.value }
        : message._tag === 'IncludeInactiveChanged'
          ? { ...model, includeInactive: message.checked }
          : message._tag === 'KindChanged'
            ? { ...model, kind: message.value }
            : { ...model, notifications: message.checked },
  [],
]

export const view = Submodel.defineView<Model, Message>(model => {
  const h = html<Message>()
  return h.div(elAttrs<Message>(sxAttrs(h, layoutStyles.catalogShell)), [
    Stack.view({
      gap: 'lg',
      children: [
        Text.view({
          variant: 'title',
          as: 'h1',
          children: 'Foldstryx catalog',
        }),
        Text.view({
          variant: 'muted',
          children: 'First primitives: layout, type, controls, and chrome.',
        }),
        Card.section({
          title: 'Typography',
          description: 'Astryx-faithful type roles.',
          padded: true,
          children: [
            Text.view({ children: 'Body text for a readable interface.' }),
            Text.view({ variant: 'body', children: 'Label text' }),
            Text.view({ variant: 'muted', children: 'Supporting text' }),
          ],
        }),
        Card.section({
          title: 'Stack and Row',
          description: 'Token-based spacing and alignment.',
          padded: true,
          children: [
            Row.view({
              align: 'wrap',
              children: [
                Text.view({ children: 'Row item' }),
                Text.view({ children: 'Another item' }),
              ],
            }),
            Stack.view({
              gap: 'sm',
              children: [
                Text.view({ children: 'Stack item' }),
                Text.view({ children: 'Another item' }),
              ],
            }),
          ],
        }),
        Card.section({
          title: 'Buttons',
          description: `Click count: ${model.clicks}`,
          padded: true,
          children: [
            Row.view({
              align: 'wrap',
              children: [
                Button.view({ label: 'Primary', onClick: Clicked() }),
                Button.view({ label: 'Secondary', variant: 'secondary' }),
                Button.view({ label: 'Ghost', variant: 'ghost' }),
                Button.view({ label: 'Danger', variant: 'danger' }),
                Button.view({ label: 'Small', size: 'sm' }),
                Button.view({ label: 'Disabled', isDisabled: true }),
              ],
            }),
          ],
        }),
        Card.section({
          title: 'Card',
          description: 'Root, header, and body slots compose surface chrome.',
          padded: true,
          children: [
            Text.view({
              children:
                'Cards provide a neutral surface with border, radius, and elevation.',
            }),
          ],
        }),
        Card.section({
          title: 'Form',
          description: 'Labeled controls with shared Astryx form styling.',
          padded: true,
          children: [
            Input.view<Message>({
              id: 'catalog-email',
              label: 'Email',
              value: model.email,
              onInput: value => EmailChanged(value),
              placeholder: 'name@example.com',
              description: 'We will never share your email.',
            }),
            Input.view<Message>({
              id: 'catalog-disabled',
              label: 'Disabled',
              value: 'Read only',
              isDisabled: true,
            }),
            Field.group<Message>({
              orientation: 'horizontal',
              children: [
                Checkbox.control<Message>({
                  id: 'catalog-terms',
                  checked: model.includeInactive,
                  label: 'Accept terms',
                  onChange: checked => IncludeInactiveChanged(checked),
                }),
              ],
            }),
            h.submodel({
              slotId: 'catalog-notifications',
              model: {
                id: 'catalog-notifications',
                isChecked: model.notifications,
              },
              view: Switch.view,
              viewInputs: Switch.styledViewInputs(
                { id: 'catalog-notifications', isChecked: model.notifications },
                {
                  label: 'Notifications',
                  description: 'Enable notifications.',
                },
              ),
              toParentMessage: message =>
                message._tag === 'Toggled'
                  ? NotificationsChanged(!model.notifications)
                  : NotificationsChanged(message.isChecked),
            }),
            Separator.view<Message>(),
          ],
        }),
        Card.section({
          title: 'Dense controls',
          description: 'Compact inputs and native select for filters.',
          padded: true,
          children: [
            Row.view({
              align: 'wrap',
              children: [
                Input.control<Message>({
                  id: 'catalog-filter',
                  ariaLabel: 'Filter',
                  density: 'compact',
                  width: 'md',
                  placeholder: 'Filter…',
                  value: model.filter,
                  onInput: value => FilterChanged(value),
                  label: 'Filter',
                }),
                NativeSelect.view<Message>({
                  id: 'catalog-kind',
                  ariaLabel: 'Kind',
                  density: 'compact',
                  width: 'sm',
                  value: model.kind,
                  options: [
                    { value: 'all', label: 'All kinds' },
                    { value: 'active', label: 'Active' },
                  ],
                  onChange: value => KindChanged(value),
                  label: 'Kind',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ])
})

export const Mount = { Model, init, update, view }
