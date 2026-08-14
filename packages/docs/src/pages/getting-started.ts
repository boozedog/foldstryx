import type { Html } from 'foldkit/html'

import { Card, Stack, Text } from '@foldstryx/foldkit'

export const view = (): Html =>
  Stack.view({
    gap: 'lg',
    children: [
      Text.view({ variant: 'title', as: 'h1', children: 'Getting started' }),
      Text.view({
        variant: 'muted',
        children: 'How to use the Foldstryx documentation composition.',
      }),
      Card.section({
        title: 'Install',
        description: 'The docs composition is a Foldkit application.',
        padded: true,
        children: [
          Text.view({
            children:
              'Import Model, init, update, and view from @foldstryx/docs and run them with a Foldkit Runtime.',
          }),
        ],
      }),
      Card.section({
        title: 'Routing',
        description: 'Navigation uses typed routes and Foldkit messages.',
        padded: true,
        children: [
          Text.view({
            children:
              'Dispatch a Navigate message to change the active route; the shell and navigation update from the model.',
          }),
        ],
      }),
    ],
  })
