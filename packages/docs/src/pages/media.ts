import type { Html } from 'foldkit/html'

import { Avatar, Card, Row, Stack, Text } from '@foldstryx/foldkit'

export const view = (): Html =>
  Stack.view({
    gap: 'lg',
    children: [
      Text.view({ variant: 'title', as: 'h1', children: 'Media' }),
      Text.view({
        variant: 'muted',
        children: 'Avatars and media primitives.',
      }),
      Card.section({
        title: 'Avatar',
        description: 'Sizes, shapes, image, and fallback labeling.',
        padded: true,
        children: [
          Row.view({
            align: 'wrap',
            children: [
              Avatar.view({ fallback: 'JD', label: 'Jane Doe' }),
              Avatar.view({ fallback: 'AB', size: 'sm' }),
              Avatar.view({ fallback: 'CD', size: 'lg' }),
              Avatar.view({ fallback: 'EF', shape: 'rounded' }),
            ],
          }),
        ],
      }),
    ],
  })
