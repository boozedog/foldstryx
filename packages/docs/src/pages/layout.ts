import type { Html } from 'foldkit/html'

import { Card, Grid, Page, Row, Stack, Text } from '@foldstryx/foldkit'

export const view = (): Html =>
  Stack.view({
    gap: 'lg',
    children: [
      Text.view({ variant: 'title', as: 'h1', children: 'Layout' }),
      Text.view({
        variant: 'muted',
        children: 'Token-based spacing and alignment primitives.',
      }),
      Card.section({
        title: 'Stack',
        description: 'Vertical composition with token gaps.',
        padded: true,
        children: [
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
        title: 'Row',
        description: 'Horizontal alignment presets.',
        padded: true,
        children: [
          Row.view({
            align: 'wrap',
            children: [
              Text.view({ children: 'Row item' }),
              Text.view({ children: 'Another item' }),
            ],
          }),
        ],
      }),
      Card.section({
        title: 'Grid',
        description: 'Responsive columns with a token gap scale.',
        padded: true,
        children: [
          Grid.view({
            columns: 3,
            children: [
              Text.view({ children: 'Cell one' }),
              Text.view({ children: 'Cell two' }),
              Text.view({ children: 'Cell three' }),
            ],
          }),
        ],
      }),
      Card.section({
        title: 'Page',
        description: 'Header, content, and footer regions compose a shell.',
        padded: true,
        children: [
          Page.shell({
            header: Page.header({
              title: 'Page title',
              description: 'Supporting description for the page.',
            }),
            content: [
              Text.view({
                children: 'Page content sits between the header and footer.',
              }),
            ],
            footer: Page.footer([
              Text.view({ variant: 'mutedSm', children: 'Footer region' }),
            ]),
          }),
        ],
      }),
    ],
  })
