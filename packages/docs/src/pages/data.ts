import type { Html, HtmlBuilder } from 'foldkit/html'

import { Card, ListRow, Stack, Stat, Table, Text } from '@foldstryx/foldkit'

import type { Message } from '../model.js'

export const view = (h: HtmlBuilder<Message>): Html =>
  Stack.view(
    {
      gap: 'lg',
      children: [
        Text.view({ variant: 'title', as: 'h1', children: 'Data display' }, h),
        Text.view(
          {
            variant: 'muted',
            children: 'Tables, stats, and list rows for structured data.',
          },
          h,
        ),
        Card.section(
          {
            title: 'Table',
            description: 'Accessible table with alignment and tone.',
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
                              children: [
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
      ],
    },
    h,
  )
