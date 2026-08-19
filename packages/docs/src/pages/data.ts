import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  Card,
  Checkbox,
  ContextMenu,
  DropdownMenu,
  ListRow,
  Stack,
  Stat,
  Table,
  Text,
  TreeList,
  elAttrs,
  sxAttrs,
} from '@foldstryx/foldkit'
import { layoutStyles } from '@foldstryx/styles'

import type { Message, Model } from '../model.js'
import { DataContextMenu } from '../model.js'

const noop = (): Message => ({ _tag: 'Noop' })

const GotDataContextMenuMessage = (message: DropdownMenu.Message): Message => ({
  _tag: 'GotDataContextMenuMessage',
  message,
})

const TREE_ITEMS: ReadonlyArray<TreeList.TreeListItem> = [
  {
    id: 'projects',
    label: 'Projects',
    children: [{ id: 'foldstryx', label: 'Foldstryx' }],
  },
]

const mapSyncCheckbox = (
  message: typeof Checkbox.CompletedSyncCheckboxIndeterminate.Type,
): Message => message

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  Stack.view(
    {
      gap: 'lg',
      children: [
        Text.view({ variant: 'title', as: 'h1', children: 'Data display' }, h),
        Text.view(
          {
            variant: 'muted',
            children:
              'Tables, stats, and list rows. Row selection chrome follows Astryx table selection semantics.',
          },
          h,
        ),
        Card.section(
          {
            title: 'Table',
            description:
              'Accessible table with selection column helpers and aria-selected rows.',
            padded: true,
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
                                    checked: false,
                                    isIndeterminate: true,
                                    onChange: noop,
                                    isDisabled: true,
                                  },
                                  h,
                                  mapSyncCheckbox,
                                ),
                                Table.th('Project', h),
                                Table.th(
                                  { align: 'right', children: 'Value' },
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
                              isSelected: true,
                              children: [
                                Table.selectionCell(
                                  {
                                    rowId: 'foldstryx',
                                    rowLabel: 'Foldstryx',
                                    checked: true,
                                    onChange: noop,
                                    isDisabled: true,
                                  },
                                  h,
                                  mapSyncCheckbox,
                                ),
                                Table.td('Foldstryx', h),
                                Table.td(
                                  { align: 'right', children: '1,240' },
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
            ],
          },
          h,
        ),
        Card.section(
          {
            title: 'Stat',
            description:
              'Labeled metric with ready, loading, and failed states.',
            padded: true,
            children: [
              Stack.view(
                {
                  gap: 'sm',
                  children: [
                    Stat.card(
                      {
                        label: 'Active users',
                        state: new Stat.Ready({ value: '1,240' }),
                      },
                      h,
                    ),
                    Stat.card(
                      {
                        label: 'Error rate',
                        state: new Stat.Failed({ message: 'Unavailable' }),
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
            title: 'List row',
            description: 'Title, metadata, and actions in a single row.',
            padded: true,
            children: [
              ListRow.view(
                {
                  title: 'Recent activity',
                  meta: ['Updated 2 min ago'],
                },
                h,
              ),
            ],
          },
          h,
        ),
        Card.section(
          {
            title: 'Tree list',
            description:
              'Parent-owned expanded/selected/focused state with APG tree roles.',
            padded: true,
            children: [
              TreeList.view(
                {
                  items: TREE_ITEMS,
                  expandedIds: new Set(['projects']),
                  selectedId: 'foldstryx',
                  focusedId: 'foldstryx',
                  ariaLabel: 'Project tree',
                  onToggle: noop,
                  onSelect: noop,
                  onFocus: noop,
                },
                h,
              ),
            ],
          },
          h,
        ),
        Card.section(
          {
            title: 'Context menu',
            description:
              'Right-click trigger with cursor-anchored menu chrome (reuses DropdownMenu).',
            padded: true,
            children: [
              ContextMenu.view<'open' | 'rename', Message>(
                {
                  menu: DataContextMenu,
                  menuModel: model.dataContextMenu,
                  menuSlotId: 'docs-context-menu',
                  items: ['open', 'rename'],
                  itemSpec: item =>
                    item === 'rename' ? { label: 'Rename' } : { label: 'Open' },
                  anchor: {
                    x: model.dataContextMenuAnchorX,
                    y: model.dataContextMenuAnchorY,
                  },
                  toContextMenuOpened: message => message,
                  toMenuMessage: GotDataContextMenuMessage,
                  trigger: h.div(
                    elAttrs<Message>(
                      sxAttrs(h, layoutStyles.detailsBox),
                      h.Tabindex(0),
                    ),
                    [
                      Text.view(
                        {
                          variant: 'muted',
                          children: 'Right-click this surface',
                        },
                        h,
                      ),
                    ],
                  ),
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
  )
