import type { Html } from 'foldkit/html'

import { Card, ListRow, Stack, Stat, Table, Text } from '@foldstryx/foldkit'

export const view = (): Html =>
  Stack.view({
    gap: 'lg',
    children: [
      Text.view({ variant: 'title', as: 'h1', children: 'Data display' }),
      Text.view({
        variant: 'muted',
        children: 'Tables, stats, and list rows for structured data.',
      }),
      Card.section({
        title: 'Table',
        description: 'Accessible table with alignment and tone.',
        padded: true,
        children: [
          Table.wrap([
            Table.table([
              Table.thead([
                Table.tr({
                  children: [
                    Table.th('Project'),
                    Table.th({ align: 'right', children: 'Value' }),
                  ],
                }),
              ]),
              Table.tbody([
                Table.tr({
                  children: [
                    Table.td('Foldstryx'),
                    Table.td({ align: 'right', children: '1,240' }),
                  ],
                }),
              ]),
            ]),
          ]),
        ],
      }),
      Card.section({
        title: 'Stat',
        description: 'Labeled metric with ready, loading, and failed states.',
        padded: true,
        children: [
          Stack.view({
            gap: 'sm',
            children: [
              Stat.card({
                label: 'Active users',
                state: new Stat.Ready({ value: '1,240' }),
              }),
              Stat.card({
                label: 'Error rate',
                state: new Stat.Failed({ message: 'Unavailable' }),
              }),
            ],
          }),
        ],
      }),
      Card.section({
        title: 'List row',
        description: 'Title, metadata, and actions in a single row.',
        padded: true,
        children: [
          ListRow.view({
            title: 'Recent activity',
            meta: ['Updated 2 min ago'],
          }),
        ],
      }),
    ],
  })
