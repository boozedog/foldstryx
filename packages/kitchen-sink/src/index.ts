import { Option, Schema as S } from 'effect'
import { Command, Runtime, Submodel } from 'foldkit'

import {
  Alert,
  Attention,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Details,
  Dialog,
  DropdownMenu,
  EmptyState,
  Field,
  Grid,
  GridFocus,
  Input,
  ListRow,
  LoadingPanel,
  Page,
  Pagination,
  Row,
  Selector,
  Separator,
  Stack,
  Stat,
  Switch,
  Table,
  TableSelection,
  Tabs,
  Text,
  Toast,
  ToggleButton,
  Tooltip,
  elAttrs,
  sxAttrs,
} from '@foldstryx/foldkit'
import { layoutStyles, tooltipStyles } from '@foldstryx/styles'

type CatalogTab = 'overview' | 'details' | 'settings'
const DemoTabs = Tabs.create<CatalogTab>()
type CatalogItem = 'edit' | 'duplicate' | 'delete'
const DemoMenu = DropdownMenu.create<CatalogItem>()
const DemoToast = Toast.create()
type KindItem = 'all' | 'active'
const KindSelector = Selector.create<KindItem>()
const KIND_OPTIONS: ReadonlyArray<Selector.SelectorOption<KindItem>> = [
  { value: 'all', label: 'All kinds' },
  { value: 'active', label: 'Active' },
]

export const Model = S.Struct({
  clicks: S.Finite,
  detailsOpen: S.Boolean,
  dialog: Dialog.Model,
  email: S.String,
  filter: S.String,
  includeInactive: S.Boolean,
  kind: S.Literals(['all', 'active']),
  kindSelector: Selector.Model,
  menu: DropdownMenu.Model,
  notifications: S.Boolean,
  page: S.Finite,
  selectedTab: S.Literals(['overview', 'details', 'settings']),
  tabs: Tabs.Model,
  toast: DemoToast.Model,
  tooltip: Tooltip.Model,
  toggleBold: S.Boolean,
  toggleView: S.NullOr(S.String),
  toggleMulti: S.Array(S.String),
  tableSelected: S.Array(S.String),
  matrixPressed: S.Array(S.Boolean),
})
export type Model = typeof Model.Type
export const Clicked = () => ({ _tag: 'Clicked' as const })
export const FieldChanged = (field: 'email' | 'filter', value: string) => ({
  _tag: 'FieldChanged' as const,
  field,
  value,
})
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
export const GotDialogMessage = (message: Dialog.Message) => ({
  _tag: 'GotDialogMessage' as const,
  message,
})
export const GotTabsMessage = (message: Tabs.Message) => ({
  _tag: 'GotTabsMessage' as const,
  message,
})
export const GotKindSelectorMessage = (message: Selector.Message) => ({
  _tag: 'GotKindSelectorMessage' as const,
  message,
})
export const GotMenuMessage = (message: DropdownMenu.Message) => ({
  _tag: 'GotMenuMessage' as const,
  message,
})
export const GotToastMessage = (message: typeof DemoToast.Message.Type) => ({
  _tag: 'GotToastMessage' as const,
  message,
})
export const ShowToast = (
  variant: 'Info' | 'Success' | 'Warning' | 'Error',
) => ({
  _tag: 'ShowToast' as const,
  variant,
})
export const ToggleBoldChanged = (pressed: boolean) => ({
  _tag: 'ToggleBoldChanged' as const,
  pressed,
})
export const ToggleViewChanged = (value: string | null) => ({
  _tag: 'ToggleViewChanged' as const,
  value,
})
export const ToggleMultiChanged = (value: ReadonlyArray<string>) => ({
  _tag: 'ToggleMultiChanged' as const,
  value,
})
export const TableRowSelectionChanged = (id: string, checked: boolean) => ({
  _tag: 'TableRowSelectionChanged' as const,
  id,
  checked,
})
export const TableSelectAllChanged = (checked: boolean) => ({
  _tag: 'TableSelectAllChanged' as const,
  checked,
})
export const MatrixCellPressed = (index: number, next: boolean) => ({
  _tag: 'MatrixCellPressed' as const,
  index,
  next,
})
export type Message = Readonly<
  | { _tag: 'Clicked' }
  | { _tag: 'FieldChanged'; field: 'email' | 'filter'; value: string }
  | { _tag: 'IncludeInactiveChanged'; checked: boolean }
  | { _tag: 'NotificationsChanged'; checked: boolean }
  | { _tag: 'DetailsToggled'; isOpen: boolean }
  | { _tag: 'GotDialogMessage'; message: Dialog.Message }
  | { _tag: 'PageChanged'; delta: number }
  | { _tag: 'GotTooltipMessage'; message: Tooltip.Message }
  | { _tag: 'GotTabsMessage'; message: Tabs.Message }
  | { _tag: 'GotKindSelectorMessage'; message: Selector.Message }
  | { _tag: 'GotMenuMessage'; message: DropdownMenu.Message }
  | { _tag: 'GotToastMessage'; message: typeof DemoToast.Message.Type }
  | { _tag: 'ShowToast'; variant: 'Info' | 'Success' | 'Warning' | 'Error' }
  | { _tag: 'ToggleBoldChanged'; pressed: boolean }
  | { _tag: 'ToggleViewChanged'; value: string | null }
  | { _tag: 'ToggleMultiChanged'; value: ReadonlyArray<string> }
  | { _tag: 'TableRowSelectionChanged'; id: string; checked: boolean }
  | { _tag: 'TableSelectAllChanged'; checked: boolean }
  | { _tag: 'MatrixCellPressed'; index: number; next: boolean }
  | typeof GridFocus.CompletedGridFocus.Type
  | typeof Checkbox.CompletedSyncCheckboxIndeterminate.Type
>

const mapCompletedGridFocus = (
  message: typeof GridFocus.CompletedGridFocus.Type,
): Message => message

const mapSyncCheckbox = (
  message: typeof Checkbox.CompletedSyncCheckboxIndeterminate.Type,
): Message => message

export const init: Runtime.ApplicationInit<Model, Message> = () => [
  {
    clicks: 0,
    detailsOpen: false,
    dialog: Dialog.init({ id: 'catalog-dialog' }),
    email: '',
    filter: '',
    includeInactive: false,
    kind: 'all',
    kindSelector: Selector.init({ id: 'catalog-kind' }),
    menu: DropdownMenu.init({ id: 'catalog-menu' }),
    notifications: false,
    page: 1,
    selectedTab: 'overview',
    tabs: Tabs.init({ id: 'catalog-tabs' }),
    toast: DemoToast.init({ id: 'catalog-toast' }),
    tooltip: Tooltip.init('catalog-tooltip'),
    toggleBold: false,
    toggleView: 'grid',
    toggleMulti: ['filters'],
    tableSelected: ['foldstryx'],
    matrixPressed: [
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
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
    case 'GotDialogMessage': {
      const [dialog, commands] = Dialog.update(model.dialog, message.message)
      return [
        { ...model, dialog },
        Command.mapMessages(commands, m => GotDialogMessage(m)),
      ]
    }
    case 'GotTabsMessage': {
      const [tabs, commands, maybeOut] = DemoTabs.update(
        model.tabs,
        message.message,
      )
      const selectedTab =
        maybeOut._tag === 'Some' ? maybeOut.value.value : model.selectedTab
      return [
        { ...model, tabs, selectedTab },
        Command.mapMessages(commands, m => GotTabsMessage(m)),
      ]
    }
    case 'GotKindSelectorMessage': {
      const [kindSelector, commands, maybeOut] = KindSelector.update(
        model.kindSelector,
        message.message,
      )
      const kind = Option.match(maybeOut, {
        onNone: () => model.kind,
        onSome: out => out.value,
      })
      return [
        { ...model, kindSelector, kind },
        Command.mapMessages(commands, m => GotKindSelectorMessage(m)),
      ]
    }
    case 'GotMenuMessage': {
      const [menu, commands] = DemoMenu.update(model.menu, message.message)
      return [
        { ...model, menu },
        Command.mapMessages(commands, m => GotMenuMessage(m)),
      ]
    }
    case 'GotToastMessage': {
      const [toast, commands] = DemoToast.update(model.toast, message.message)
      return [
        { ...model, toast },
        Command.mapMessages(commands, m => GotToastMessage(m)),
      ]
    }
    case 'ShowToast': {
      const [toast, commands] = DemoToast.show(model.toast, {
        payload: {
          title: 'Notification',
          maybeDescription: Option.some('A toast was shown.'),
        },
        variant: message.variant,
      })
      return [
        { ...model, toast },
        Command.mapMessages(commands, m => GotToastMessage(m)),
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
    case 'ToggleBoldChanged':
      return [{ ...model, toggleBold: message.pressed }, []]
    case 'ToggleViewChanged':
      return [{ ...model, toggleView: message.value }, []]
    case 'ToggleMultiChanged':
      return [{ ...model, toggleMulti: message.value }, []]
    case 'TableRowSelectionChanged': {
      const selected = new Set(model.tableSelected)
      if (message.checked) {
        selected.add(message.id)
      } else {
        selected.delete(message.id)
      }
      return [{ ...model, tableSelected: [...selected] }, []]
    }
    case 'TableSelectAllChanged': {
      const rows = [
        { id: 'foldstryx', isEnabled: true },
        { id: 'sidebar', isEnabled: true },
        { id: 'docs', isEnabled: false },
      ]
      const selectedSet = new Set(model.tableSelected)
      const next = message.checked
        ? TableSelection.selectAll(rows, selectedSet)
        : TableSelection.deselectAll(rows, selectedSet)
      return [{ ...model, tableSelected: [...next] }, []]
    }
    case 'MatrixCellPressed':
      return [
        {
          ...model,
          matrixPressed: model.matrixPressed.map((pressed, index) =>
            index === message.index ? message.next : pressed,
          ),
        },
        [],
      ]
    case 'CompletedGridFocus':
      return [model, []]
    case 'CompletedSyncCheckboxIndeterminate':
      return [model, []]
  }
}

export const view = Submodel.defineView<Model, Message>((model, h) => {
  return h.div(elAttrs<Message>(sxAttrs(h, layoutStyles.catalogShell)), [
    Stack.view(
      {
        gap: 'lg',
        children: [
          Text.view(
            {
              variant: 'title',
              as: 'h1',
              children: 'Foldstryx catalog',
            },
            h,
          ),
          Text.view(
            {
              variant: 'muted',
              children: 'First primitives: layout, type, controls, and chrome.',
            },
            h,
          ),
          Card.section(
            {
              title: 'Typography',
              description: 'Astryx-faithful type roles.',
              padded: true,
              children: [
                Text.view(
                  { children: 'Body text for a readable interface.' },
                  h,
                ),
                Text.view({ variant: 'body', children: 'Label text' }, h),
                Text.view({ variant: 'muted', children: 'Supporting text' }, h),
                Text.view(
                  {
                    variant: 'mono',
                    children: 'const font = "Maple Mono NL NF"',
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Stack and Row',
              description: 'Token-based spacing and alignment.',
              padded: true,
              children: [
                Row.view(
                  {
                    align: 'wrap',
                    children: [
                      Text.view({ children: 'Row item' }, h),
                      Text.view({ children: 'Another item' }, h),
                    ],
                  },
                  h,
                ),
                Stack.view(
                  {
                    gap: 'sm',
                    children: [
                      Text.view({ children: 'Stack item' }, h),
                      Text.view({ children: 'Another item' }, h),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Page',
              description:
                'Header, content, and footer regions compose a shell.',
              padded: true,
              children: [
                Page.shell(
                  {
                    header: Page.header(
                      {
                        title: 'Page title',
                        description: 'Supporting description for the page.',
                        actions: [
                          Button.view<Message>(
                            {
                              label: 'Action',
                              size: 'sm',
                              variant: 'secondary',
                              onClick: Clicked(),
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    content: [
                      Text.view(
                        {
                          children:
                            'Page content sits between the header and footer.',
                        },
                        h,
                      ),
                    ],
                    footer: Page.footer(
                      [
                        Text.view(
                          { variant: 'mutedSm', children: 'Footer region' },
                          h,
                        ),
                      ],
                      h,
                    ),
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Grid',
              description: 'Fixed, preset, and responsive column APIs.',
              padded: true,
              children: [
                Stack.view(
                  {
                    gap: 'md',
                    children: [
                      Grid.view(
                        {
                          columns: 6,
                          gap: 'sm',
                          children: Array.from({ length: 6 }, (_, index) =>
                            Text.view({ children: `Col ${index + 1}` }, h),
                          ),
                        },
                        h,
                      ),
                      Grid.view(
                        {
                          columns: { minWidth: 280, max: 4 },
                          children: [
                            Text.view({ children: 'Responsive one' }, h),
                            Text.view({ children: 'Responsive two' }, h),
                            Text.view({ children: 'Responsive three' }, h),
                          ],
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Avatar',
              description: 'Sizes, shapes, image, and fallback labeling.',
              padded: true,
              children: [
                Row.view(
                  {
                    align: 'wrap',
                    children: [
                      Avatar.view({ fallback: 'JD', label: 'Jane Doe' }, h),
                      Avatar.view({ fallback: 'AB', size: 'sm' }, h),
                      Avatar.view({ fallback: 'CD', size: 'lg' }, h),
                      Avatar.view({ fallback: 'EF', shape: 'rounded' }, h),
                      Avatar.view(
                        {
                          fallback: 'GH',
                          imageSrc:
                            'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22><rect width=%2232%22 height=%2232%22 fill=%22%230064E0%22/></svg>',
                          label: 'With image',
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Buttons',
              description: `Click count: ${model.clicks}`,
              padded: true,
              children: [
                Row.view(
                  {
                    align: 'wrap',
                    children: [
                      Button.view({ label: 'Primary', onClick: Clicked() }, h),
                      Button.view(
                        { label: 'Secondary', variant: 'secondary' },
                        h,
                      ),
                      Button.view({ label: 'Ghost', variant: 'ghost' }, h),
                      Button.view({ label: 'Danger', variant: 'danger' }, h),
                      Button.view({ label: 'Small', size: 'sm' }, h),
                      Button.view({ label: 'Disabled', isDisabled: true }, h),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'ToggleButton',
              description: 'Pressed ghost buttons and selection groups.',
              padded: true,
              children: [
                Row.view(
                  {
                    align: 'wrap',
                    children: [
                      ToggleButton.view(
                        {
                          label: 'Bold',
                          isPressed: model.toggleBold,
                          onPressedChange: pressed =>
                            ToggleBoldChanged(pressed),
                        },
                        h,
                      ),
                      ToggleButton.groupView(
                        {
                          label: 'View mode',
                          value: model.toggleView,
                          onChange: value => ToggleViewChanged(value),
                          items: [
                            { value: 'list', label: 'List' },
                            { value: 'grid', label: 'Grid' },
                          ],
                        },
                        h,
                      ),
                      ToggleButton.groupView(
                        {
                          label: 'Filters',
                          type: 'multiple',
                          value: model.toggleMulti,
                          onChange: value => ToggleMultiChanged(value),
                          items: [
                            { value: 'filters', label: 'Filters' },
                            { value: 'sort', label: 'Sort' },
                          ],
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Grid matrix',
              description: 'role=grid keyboard navigation with ToggleButtons.',
              padded: true,
              children: [
                Grid.matrix(
                  {
                    columns: 3,
                    ariaLabel: 'Selection matrix',
                    children: model.matrixPressed.map((isPressed, index) =>
                      Grid.gridcell(
                        [
                          ToggleButton.view(
                            {
                              label: `Cell ${index}`,
                              isPressed,
                              onPressedChange: next =>
                                MatrixCellPressed(index, next),
                            },
                            h,
                          ),
                        ],
                        h,
                      ),
                    ),
                  },
                  h,
                  mapCompletedGridFocus,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Card',
              description:
                'Root, header, and body slots compose surface chrome.',
              padded: true,
              children: [
                Text.view(
                  {
                    children:
                      'Cards provide a neutral surface with border, radius, and elevation.',
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Form',
              description: 'Labeled controls with shared Astryx form styling.',
              padded: true,
              children: [
                Input.view<Message>(
                  {
                    id: 'catalog-email',
                    label: 'Email',
                    value: model.email,
                    onInput: value => FieldChanged('email', value),
                    placeholder: 'name@example.com',
                    description: 'We will never share your email.',
                  },
                  h,
                ),
                Input.view<Message>(
                  {
                    id: 'catalog-disabled',
                    label: 'Disabled',
                    value: 'Read only',
                    isDisabled: true,
                  },
                  h,
                ),
                Field.group<Message>(h, {
                  orientation: 'horizontal',
                  children: [
                    Checkbox.control<Message>(
                      {
                        id: 'catalog-terms',
                        checked: model.includeInactive,
                        label: 'Accept terms',
                        onChange: checked => IncludeInactiveChanged(checked),
                      },
                      h,
                      mapSyncCheckbox,
                    ),
                  ],
                }),
                Switch.view(
                  {
                    id: 'catalog-notifications',
                    isChecked: model.notifications,
                    onToggle: checked => NotificationsChanged(checked),
                    label: 'Notifications',
                    description: 'Enable notifications.',
                  },
                  h,
                ),
                Separator.view<Message>({}, h),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Dense controls',
              description: 'Compact inputs and selector for filters.',
              padded: true,
              children: [
                Row.view(
                  {
                    align: 'wrap',
                    children: [
                      Input.control<Message>(
                        {
                          id: 'catalog-filter',
                          ariaLabel: 'Filter',
                          density: 'compact',
                          width: 'md',
                          placeholder: 'Filter…',
                          value: model.filter,
                          onInput: value => FieldChanged('filter', value),
                          label: 'Filter',
                        },
                        h,
                      ),
                      Selector.labeledField<Message>(
                        {
                          id: 'catalog-kind',
                          label: 'Kind',
                          children: [
                            h.submodel({
                              slotId: 'catalog-kind',
                              model: model.kindSelector,
                              view: KindSelector.view,
                              viewInputs: Selector.styledViewInputs<
                                KindItem,
                                Message
                              >(
                                {
                                  options: KIND_OPTIONS,
                                  selectedValue: model.kind,
                                  density: 'compact',
                                  width: 'sm',
                                  ariaLabel: 'Kind',
                                  isOpen: model.kindSelector.isOpen,
                                },
                                h,
                              ),
                              toParentMessage: message =>
                                GotKindSelectorMessage(message),
                            }),
                          ],
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Badges',
              description:
                'Status and metadata chips across sentiment variants.',
              padded: true,
              children: [
                Row.view(
                  {
                    align: 'wrap',
                    children: [
                      Badge.view({ label: 'Default' }, h),
                      Badge.view(
                        { label: 'Secondary', variant: 'secondary' },
                        h,
                      ),
                      Badge.view(
                        { label: 'Destructive', variant: 'destructive' },
                        h,
                      ),
                      Badge.view({ label: 'Outline', variant: 'outline' }, h),
                      Badge.view({ label: 'Success', variant: 'success' }, h),
                      Badge.view({ label: 'Warning', variant: 'warning' }, h),
                      Badge.view({ label: 'Info', variant: 'info' }, h),
                      Badge.view({ label: 'Large', size: 'lg' }, h),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Alerts',
              description: 'Role=alert banners with optional action slots.',
              padded: true,
              children: [
                Stack.view(
                  {
                    gap: 'sm',
                    children: [
                      Alert.view<Message>(
                        {
                          title: 'Default',
                          body: 'A neutral informational banner.',
                        },
                        h,
                      ),
                      Alert.view<Message>(
                        {
                          variant: 'destructive',
                          title: 'Error',
                          body: 'Something went wrong.',
                          action: Button.view<Message>(
                            {
                              label: 'Dismiss',
                              variant: 'ghost',
                              size: 'sm',
                              onClick: Clicked(),
                            },
                            h,
                          ),
                        },
                        h,
                      ),
                      Alert.view<Message>(
                        {
                          variant: 'warning',
                          body: 'Review required before continuing.',
                          compact: true,
                        },
                        h,
                      ),
                      Alert.view<Message>(
                        {
                          variant: 'success',
                          body: 'Import complete.',
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Feedback',
              description: 'Loading, empty, and attention surfaces.',
              padded: true,
              children: [
                Stack.view(
                  {
                    gap: 'sm',
                    children: [
                      LoadingPanel.view<Message>(
                        {
                          message: 'Loading panel…',
                          card: false,
                        },
                        h,
                      ),
                      EmptyState.view<Message>(
                        {
                          title: 'Nothing here',
                          message: 'Empty state with an optional action.',
                          action: Button.view<Message>(
                            {
                              label: 'Create',
                              size: 'sm',
                              variant: 'ghost',
                              onClick: Clicked(),
                            },
                            h,
                          ),
                          card: false,
                        },
                        h,
                      ),
                      Attention.view<Message>(
                        {
                          title: 'Attention',
                          body: 'Soft callout for inline notices (not role=alert).',
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
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
                        elAttrs<Message>(
                          sxAttrs(h, layoutStyles.rowCenterGap2),
                        ),
                        [
                          h.button(elAttrs<Message>(trigger), [
                            'Hover or focus me',
                          ]),
                          h.div(
                            elAttrs<Message>(
                              sxAttrs(
                                h,
                                tooltipStyles.content,
                                isVisible
                                  ? undefined
                                  : tooltipStyles.contentHidden,
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
            },
            h,
          ),
          Card.section(
            {
              title: 'Data display',
              description:
                'Tables, stats, list rows, pagination, and disclosures.',
              padded: true,
              children: [
                Stack.view(
                  {
                    gap: 'sm',
                    children: [
                      Table.wrap(
                        [
                          Table.table(
                            [
                              Table.thead(
                                [
                                  Table.tr(
                                    {
                                      children: [
                                        Table.selectionHeader(
                                          {
                                            checked:
                                              TableSelection.getIsAllSelected(
                                                [
                                                  {
                                                    id: 'foldstryx',
                                                    isEnabled: true,
                                                  },
                                                  {
                                                    id: 'sidebar',
                                                    isEnabled: true,
                                                  },
                                                  {
                                                    id: 'docs',
                                                    isEnabled: false,
                                                  },
                                                ],
                                                new Set(model.tableSelected),
                                              ),
                                            isIndeterminate:
                                              TableSelection.getIsIndeterminate(
                                                [
                                                  {
                                                    id: 'foldstryx',
                                                    isEnabled: true,
                                                  },
                                                  {
                                                    id: 'sidebar',
                                                    isEnabled: true,
                                                  },
                                                  {
                                                    id: 'docs',
                                                    isEnabled: false,
                                                  },
                                                ],
                                                new Set(model.tableSelected),
                                              ),
                                            onChange: checked =>
                                              TableSelectAllChanged(checked),
                                          },
                                          h,
                                          mapSyncCheckbox,
                                        ),
                                        Table.th('Project', h),
                                        Table.th(
                                          { align: 'right', children: 'Value' },
                                          h,
                                        ),
                                        Table.th(
                                          {
                                            align: 'right',
                                            children: 'Status',
                                          },
                                          h,
                                        ),
                                      ],
                                    },
                                    h,
                                  ),
                                ],
                                h,
                              ),
                              Table.tbody(
                                [
                                  Table.tr(
                                    {
                                      isSelected:
                                        model.tableSelected.includes(
                                          'foldstryx',
                                        ),
                                      children: [
                                        Table.selectionCell(
                                          {
                                            rowId: 'foldstryx',
                                            rowLabel: 'Foldstryx',
                                            checked:
                                              model.tableSelected.includes(
                                                'foldstryx',
                                              ),
                                            onChange: checked =>
                                              TableRowSelectionChanged(
                                                'foldstryx',
                                                checked,
                                              ),
                                          },
                                          h,
                                          mapSyncCheckbox,
                                        ),
                                        Table.td('Foldstryx', h),
                                        Table.td(
                                          {
                                            align: 'right',
                                            children: '1,240',
                                          },
                                          h,
                                        ),
                                        Table.td(
                                          {
                                            align: 'right',
                                            tone: 'success',
                                            children: 'Active',
                                          },
                                          h,
                                        ),
                                      ],
                                    },
                                    h,
                                  ),
                                  Table.tr(
                                    {
                                      isSelected:
                                        model.tableSelected.includes('sidebar'),
                                      children: [
                                        Table.selectionCell(
                                          {
                                            rowId: 'sidebar',
                                            rowLabel: 'Sidebar',
                                            checked:
                                              model.tableSelected.includes(
                                                'sidebar',
                                              ),
                                            onChange: checked =>
                                              TableRowSelectionChanged(
                                                'sidebar',
                                                checked,
                                              ),
                                          },
                                          h,
                                          mapSyncCheckbox,
                                        ),
                                        Table.td('Sidebar', h),
                                        Table.td(
                                          { align: 'right', children: '860' },
                                          h,
                                        ),
                                        Table.td(
                                          {
                                            align: 'right',
                                            tone: 'warning',
                                            children: 'Review',
                                          },
                                          h,
                                        ),
                                      ],
                                    },
                                    h,
                                  ),
                                  Table.tr(
                                    {
                                      isSelected:
                                        model.tableSelected.includes('docs'),
                                      children: [
                                        Table.selectionCell(
                                          {
                                            rowId: 'docs',
                                            rowLabel: 'Docs',
                                            checked:
                                              model.tableSelected.includes(
                                                'docs',
                                              ),
                                            onChange: checked =>
                                              TableRowSelectionChanged(
                                                'docs',
                                                checked,
                                              ),
                                            isDisabled: true,
                                          },
                                          h,
                                          mapSyncCheckbox,
                                        ),
                                        Table.td('Docs', h),
                                        Table.td(
                                          { align: 'right', children: '420' },
                                          h,
                                        ),
                                        Table.td(
                                          {
                                            align: 'right',
                                            children: 'Paused',
                                          },
                                          h,
                                        ),
                                      ],
                                    },
                                    h,
                                  ),
                                ],
                                h,
                              ),
                            ],
                            h,
                          ),
                        ],
                        h,
                      ),
                      Row.view(
                        {
                          align: 'wrap',
                          children: [
                            Stat.card<Message>(
                              {
                                label: 'Active users',
                                state: new Stat.Ready({ value: '1,240' }),
                              },
                              h,
                            ),
                            Stat.card<Message>(
                              {
                                label: 'Error rate',
                                state: new Stat.Failed({
                                  message: 'Unavailable',
                                }),
                              },
                              h,
                            ),
                            Stat.card<Message>(
                              {
                                label: 'Requests',
                                state: new Stat.Loading(),
                              },
                              h,
                            ),
                          ],
                        },
                        h,
                      ),
                      ListRow.view<Message>(
                        {
                          title: 'Recent activity',
                          meta: ['Updated 2 min ago'],
                          actions: [
                            Button.view<Message>(
                              {
                                label: 'View',
                                size: 'sm',
                                variant: 'ghost',
                                onClick: Clicked(),
                              },
                              h,
                            ),
                          ],
                        },
                        h,
                      ),
                      Pagination.view<Message>(
                        {
                          status: `Page ${model.page} of 5`,
                          previous: Button.view<Message>(
                            {
                              label: 'Previous',
                              variant: 'secondary',
                              size: 'sm',
                              onClick: PageChanged(-1),
                              isDisabled: model.page <= 1,
                            },
                            h,
                          ),
                          next: Button.view<Message>(
                            {
                              label: 'Next',
                              variant: 'secondary',
                              size: 'sm',
                              onClick: PageChanged(1),
                              isDisabled: model.page >= 5,
                            },
                            h,
                          ),
                        },
                        h,
                      ),
                      Details.view<Message>(
                        {
                          summary: 'More about this data',
                          children: [
                            Text.view(
                              {
                                variant: 'muted',
                                children:
                                  'Disclosure body with supporting detail.',
                              },
                              h,
                            ),
                          ],
                          open: model.detailsOpen,
                          onToggle: isOpen => DetailsToggled(isOpen),
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Dialog',
              description:
                'Modal surface with accessible labeling and dismissal.',
              padded: true,
              children: [
                Button.view<Message>(
                  {
                    label: 'Open dialog',
                    onClick: GotDialogMessage(Dialog.RequestedOpen()),
                  },
                  h,
                ),
                h.submodel({
                  slotId: 'catalog-dialog',
                  model: model.dialog,
                  view: Dialog.view,
                  viewInputs: Dialog.styledViewInputs<Message>(
                    {
                      id: 'catalog-dialog',
                      title: 'Confirm action',
                      description:
                        'Controlled dialog with accessible labeling.',
                      showClose: true,
                      onRequestClose: message => GotDialogMessage(message),
                      body: [
                        Text.view({ children: 'Dialog body content.' }, h),
                      ],
                      footer: [
                        Button.view<Message>(
                          {
                            label: 'Cancel',
                            variant: 'secondary',
                            onClick: GotDialogMessage(Dialog.RequestedClose()),
                          },
                          h,
                        ),
                        Button.view<Message>(
                          {
                            label: 'Confirm',
                            onClick: GotDialogMessage(Dialog.RequestedClose()),
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                  toParentMessage: message => GotDialogMessage(message),
                }),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Tabs',
              description: 'Accessible tablist with controlled selection.',
              padded: true,
              children: [
                h.submodel({
                  slotId: 'catalog-tabs',
                  model: model.tabs,
                  view: DemoTabs.view,
                  viewInputs: DemoTabs.styledViewInputs(
                    {
                      selectedValue: model.selectedTab,
                      tabs: ['overview', 'details', 'settings'],
                      ariaLabel: 'Catalog tabs',
                      renderPanel: value =>
                        Text.view(
                          {
                            variant: 'muted',
                            children: `Panel for ${value}.`,
                          },
                          h,
                        ),
                    },
                    h,
                  ),
                  toParentMessage: message => GotTabsMessage(message),
                }),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Dropdown menu',
              description:
                'Menu trigger with accessible items and disabled behavior.',
              padded: true,
              children: [
                h.submodel({
                  slotId: 'catalog-menu',
                  model: model.menu,
                  view: DemoMenu.view,
                  viewInputs: DropdownMenu.styledViewInputs<
                    CatalogItem,
                    Message
                  >(
                    {
                      items: ['edit', 'duplicate', 'delete'],
                      buttonContent: h.span([], ['Actions']),
                      itemSpec: item =>
                        item === 'delete'
                          ? { label: 'Delete', variant: 'destructive' }
                          : { label: item[0]!.toUpperCase() + item.slice(1) },
                      isItemDisabled: item => item === 'duplicate',
                    },
                    h,
                  ),
                  toParentMessage: message => GotMenuMessage(message),
                }),
              ],
            },
            h,
          ),
          Card.section(
            {
              title: 'Toast',
              description: 'Status notifications with lifecycle and dismissal.',
              padded: true,
              children: [
                Row.view(
                  {
                    align: 'wrap',
                    children: [
                      Button.view<Message>(
                        {
                          label: 'Info',
                          variant: 'secondary',
                          onClick: ShowToast('Info'),
                        },
                        h,
                      ),
                      Button.view<Message>(
                        {
                          label: 'Success',
                          variant: 'secondary',
                          onClick: ShowToast('Success'),
                        },
                        h,
                      ),
                      Button.view<Message>(
                        {
                          label: 'Warning',
                          variant: 'secondary',
                          onClick: ShowToast('Warning'),
                        },
                        h,
                      ),
                      Button.view<Message>(
                        {
                          label: 'Error',
                          variant: 'secondary',
                          onClick: ShowToast('Error'),
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
                h.submodel({
                  slotId: 'catalog-toast',
                  model: model.toast,
                  view: DemoToast.view,
                  viewInputs: DemoToast.styledViewInputs(),
                  toParentMessage: message => GotToastMessage(message),
                }),
              ],
            },
            h,
          ),
        ],
      },
      h,
    ),
  ])
})

export const Mount = { Model, init, update, view }
