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
  Details,
  EmptyState,
  Field,
  Input,
  ListRow,
  LoadingPanel,
  NativeSelect,
  Pagination,
  Row,
  Separator,
  Stack,
  Stat,
  Switch,
  Table,
  Text,
  Tooltip,
  elAttrs,
  sxAttrs,
} from '@foldstryx/foldkit'
import { layoutStyles, tooltipStyles } from '@foldstryx/styles'

export const Model = S.Struct({
  clicks: S.Finite,
  detailsOpen: S.Boolean,
  email: S.String,
  filter: S.String,
  includeInactive: S.Boolean,
  kind: S.String,
  notifications: S.Boolean,
  page: S.Finite,
  tooltip: Tooltip.Model,
})
export type Model = typeof Model.Type
export const Clicked = () => ({ _tag: 'Clicked' as const })
export const FieldChanged = (
  field: 'email' | 'filter' | 'kind',
  value: string,
) => ({ _tag: 'FieldChanged' as const, field, value })
export const IncludeInactiveChanged = (checked: boolean) => ({
  _tag: 'IncludeInactiveChanged' as const,
  checked,
})
export const NotificationsChanged = (checked: boolean) => ({
  _tag: 'NotificationsChanged' as const,
  checked,
})
export const DetailsToggled = (isOpen: boolean) => ({
  _tag: 'DetailsToggled' as const,
  isOpen,
})
export const PageChanged = (delta: number) => ({
  _tag: 'PageChanged' as const,
  delta,
})
export const GotTooltipMessage = (message: Tooltip.Message) => ({
  _tag: 'GotTooltipMessage' as const,
  message,
})
export type Message = Readonly<
  | { _tag: 'Clicked' }
  | { _tag: 'FieldChanged'; field: 'email' | 'filter' | 'kind'; value: string }
  | { _tag: 'IncludeInactiveChanged'; checked: boolean }
  | { _tag: 'NotificationsChanged'; checked: boolean }
  | { _tag: 'DetailsToggled'; isOpen: boolean }
  | { _tag: 'PageChanged'; delta: number }
  | { _tag: 'GotTooltipMessage'; message: Tooltip.Message }
>
export const init: Runtime.ApplicationInit<Model, Message> = () => [
  {
    clicks: 0,
    detailsOpen: false,
    email: '',
    filter: '',
    includeInactive: false,
    kind: 'all',
    notifications: false,
    page: 1,
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
    case 'FieldChanged':
      return [{ ...model, [message.field]: message.value }, []]
    case 'IncludeInactiveChanged':
      return [{ ...model, includeInactive: message.checked }, []]
    case 'NotificationsChanged':
      return [{ ...model, notifications: message.checked }, []]
    case 'DetailsToggled':
      return [{ ...model, detailsOpen: message.isOpen }, []]
    case 'PageChanged':
      return [
        {
          ...model,
          page: Math.min(Math.max(model.page + message.delta, 1), 5),
        },
        [],
      ]
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
              onInput: value => FieldChanged('email', value),
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
                  onInput: value => FieldChanged('filter', value),
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
                  onChange: value => FieldChanged('kind', value),
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
        Card.section({
          title: 'Data display',
          description: 'Tables, stats, list rows, pagination, and disclosures.',
          padded: true,
          children: [
            Stack.view({
              gap: 'sm',
              children: [
                Table.wrap([
                  Table.table([
                    Table.thead([
                      Table.tr({
                        children: [
                          Table.th('Project'),
                          Table.th({ align: 'right', children: 'Value' }),
                          Table.th({ align: 'right', children: 'Status' }),
                        ],
                      }),
                    ]),
                    Table.tbody([
                      Table.tr({
                        children: [
                          Table.td('Foldstryx'),
                          Table.td({ align: 'right', children: '1,240' }),
                          Table.td({
                            align: 'right',
                            tone: 'success',
                            children: 'Active',
                          }),
                        ],
                      }),
                      Table.tr({
                        children: [
                          Table.td('Sidebar'),
                          Table.td({ align: 'right', children: '860' }),
                          Table.td({
                            align: 'right',
                            tone: 'warning',
                            children: 'Review',
                          }),
                        ],
                      }),
                      Table.tr({
                        presentation: 'summary',
                        children: [
                          Table.td('Total'),
                          Table.td({ align: 'right', children: '2,100' }),
                          Table.td({ align: 'right', children: '' }),
                        ],
                      }),
                    ]),
                  ]),
                ]),
                Row.view({
                  align: 'wrap',
                  children: [
                    Stat.card<Message>({
                      label: 'Active users',
                      state: new Stat.Ready({ value: '1,240' }),
                    }),
                    Stat.card<Message>({
                      label: 'Error rate',
                      state: new Stat.Failed({ message: 'Unavailable' }),
                    }),
                    Stat.card<Message>({
                      label: 'Requests',
                      state: new Stat.Loading(),
                    }),
                  ],
                }),
                ListRow.view<Message>({
                  title: 'Recent activity',
                  meta: ['Updated 2 min ago'],
                  actions: [
                    Button.view<Message>({
                      label: 'View',
                      size: 'sm',
                      variant: 'ghost',
                      onClick: Clicked(),
                    }),
                  ],
                }),
                Pagination.view<Message>({
                  status: `Page ${model.page} of 5`,
                  previous: Button.view<Message>({
                    label: 'Previous',
                    variant: 'secondary',
                    size: 'sm',
                    onClick: PageChanged(-1),
                    isDisabled: model.page <= 1,
                  }),
                  next: Button.view<Message>({
                    label: 'Next',
                    variant: 'secondary',
                    size: 'sm',
                    onClick: PageChanged(1),
                    isDisabled: model.page >= 5,
                  }),
                }),
                Details.view<Message>({
                  summary: 'More about this data',
                  children: [
                    Text.view({
                      variant: 'muted',
                      children: 'Disclosure body with supporting detail.',
                    }),
                  ],
                  open: model.detailsOpen,
                  onToggle: isOpen => DetailsToggled(isOpen),
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
