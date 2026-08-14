import type { Html } from 'foldkit/html'

import { Card, Stack, Text } from '@foldstryx/foldkit'

export const view = (): Html =>
  Stack.view({
    gap: 'lg',
    children: [
      Text.view({ variant: 'title', as: 'h1', children: 'Principles' }),
      Text.view({
        variant: 'muted',
        children: 'The design and architecture principles behind Foldstryx.',
      }),
      Card.section({
        title: 'Foldkit governs',
        description: 'No React, hooks, or context as the public surface.',
        padded: true,
        children: [
          Text.view({
            children:
              'The documentation shell is a model/message/update/view application with typed routes.',
          }),
        ],
      }),
      Card.section({
        title: 'Token-faithful',
        description:
          'Component styles reference Astryx tokens, not magic numbers.',
        padded: true,
        children: [
          Text.view({
            children:
              'Lift Astryx scales and roles over inventing Foldstryx-only tokens.',
          }),
        ],
      }),
      Card.section({
        title: 'Platform-neutral',
        description:
          'The shared composition has no browser or host dependencies.',
        padded: true,
        children: [
          Text.view({
            children:
              'Browser and desktop hosts own runtime bootstrap and URL integration.',
          }),
        ],
      }),
    ],
  })
