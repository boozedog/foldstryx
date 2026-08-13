import { Schema as S } from 'effect'
import { Command, Runtime, Submodel } from 'foldkit'
import { html } from 'foldkit/html'

import {
  Alert,
  Attention,
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Input,
  LoadingPanel,
  NativeSelect,
  Row,
  Separator,
  Stack,
  Switch,
  Text,
  Tooltip,
  elAttrs,
  sxAttrs,
} from '@foldstryx/foldkit'
import { layoutStyles, tooltipStyles } from '@foldstryx/styles'

export const Model = S.Struct({
  clicks: S.Finite,
  email: S.String,
  filter: S.String,
  includeInactive: S.Boolean,
  kind: S.String,
  notifications: S.Boolean,
  tooltip: Tooltip.Model,
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
export const GotTooltipMessage = (message: Tooltip.Message) => ({
  _tag: 'GotTooltipMessage' as const,
  message,
})
export type Message = Readonly<
  | { _tag: 'Clicked' }
  | { _tag: 'EmailChanged'; value: string }
  | { _tag: 'FilterChanged'; value: string }
  | { _tag: 'IncludeInactiveChanged'; checked: boolean }
  | { _tag: 'KindChanged'; value: string }
  | { _tag: 'NotificationsChanged'; checked: boolean }
  | { _tag: 'GotTooltipMessage'; message: Tooltip.Message }
>
export const init: Runtime.ApplicationInit<Model, Message> = () => [
  {
    clicks: 0,
    email: '',
    filter: '',
    includeInactive: false,
    kind: 'all',
    notifications: false,
    tooltip: Tooltip.init('catalog-tooltip'),
  },
  [],
]
export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotTooltipMessage': {
      const [tooltip, commands] = Tooltip.update(model.tooltip, message.message)
      return [
        { ...model, tooltip },
        Command.mapMessages(commands, m => GotTooltipMessage(m)),
      ]
    }
    case 'Clicked':
      return [{ ...model, clicks: model.clicks + 1 }, []]
    case 'EmailChanged':
      return [{ ...model, email: message.value }, []]
    case 'FilterChanged':
      return [{ ...model, filter: message.value }, []]
    case 'IncludeInactiveChanged':
      return [{ ...model, includeInactive: message.checked }, []]
    case 'KindChanged':
      return [{ ...model, kind: message.value }, []]
    case 'NotificationsChanged':
      return [{ ...model, notifications: message.checked }, []]
  }
}

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
        Card.section({
          title: 'Badges',
          description: 'Status and metadata chips across sentiment variants.',
          padded: true,
          children: [
            Row.view({
              align: 'wrap',
              children: [
                Badge.view({ label: 'Default' }),
                Badge.view({ label: 'Secondary', variant: 'secondary' }),
                Badge.view({ label: 'Destructive', variant: 'destructive' }),
                Badge.view({ label: 'Outline', variant: 'outline' }),
                Badge.view({ label: 'Success', variant: 'success' }),
                Badge.view({ label: 'Warning', variant: 'warning' }),
                Badge.view({ label: 'Info', variant: 'info' }),
                Badge.view({ label: 'Large', size: 'lg' }),
              ],
            }),
          ],
        }),
        Card.section({
          title: 'Alerts',
          description: 'Role=alert banners with optional action slots.',
          padded: true,
          children: [
            Stack.view({
              gap: 'sm',
              children: [
                Alert.view<Message>({
                  title: 'Default',
                  body: 'A neutral informational banner.',
                }),
                Alert.view<Message>({
                  variant: 'destructive',
                  title: 'Error',
                  body: 'Something went wrong.',
                  action: Button.view<Message>({
                    label: 'Dismiss',
                    variant: 'ghost',
                    size: 'sm',
                    onClick: Clicked(),
                  }),
                }),
                Alert.view<Message>({
                  variant: 'warning',
                  body: 'Review required before continuing.',
                  compact: true,
                }),
                Alert.view<Message>({
                  variant: 'success',
                  body: 'Import complete.',
                }),
              ],
            }),
          ],
        }),
        Card.section({
          title: 'Feedback',
          description: 'Loading, empty, and attention surfaces.',
          padded: true,
          children: [
            Stack.view({
              gap: 'sm',
              children: [
                LoadingPanel.view<Message>({
                  message: 'Loading panel…',
                  card: false,
                }),
                EmptyState.view<Message>({
                  title: 'Nothing here',
                  message: 'Empty state with an optional action.',
                  action: Button.view<Message>({
                    label: 'Create',
                    size: 'sm',
                    variant: 'ghost',
                    onClick: Clicked(),
                  }),
                  card: false,
                }),
                Attention.view<Message>({
                  title: 'Attention',
                  body: 'Soft callout for inline notices (not role=alert).',
                }),
              ],
            }),
          ],
        }),
        Card.section({
          title: 'Tooltip',
          description: 'Hover or focus the trigger to reveal the panel.',
          padded: true,
          children: [
            h.submodel({
              slotId: 'catalog-tooltip',
              model: model.tooltip,
              view: Tooltip.view,
              viewInputs: {
                anchor: { placement: 'top', gap: 8, padding: 8 },
                enabled: true,
                toView: ({ trigger, panel, isVisible }) =>
                  h.div(
                    elAttrs<Message>(sxAttrs(h, layoutStyles.rowCenterGap2)),
                    [
                      h.button(elAttrs<Message>(trigger), [
                        'Hover or focus me',
                      ]),
                      h.div(
                        elAttrs<Message>(
                          sxAttrs(
                            h,
                            tooltipStyles.content,
                            isVisible ? undefined : tooltipStyles.contentHidden,
                          ),
                          panel,
                        ),
                        ['Tooltip content'],
                      ),
                    ],
                  ),
              },
              toParentMessage: message => GotTooltipMessage(message),
            }),
          ],
        }),
      ],
    }),
  ])
})

export const Mount = { Model, init, update, view }
