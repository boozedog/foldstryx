import type { Html } from 'foldkit/html'

import { Card, Stack, Text } from '@foldstryx/foldkit'

export const view = (): Html =>
  Stack.view({
    gap: 'lg',
    children: [
      Text.view({
        variant: 'title',
        as: 'h1',
        children: 'Foldstryx documentation',
      }),
      Text.view({
        variant: 'muted',
        children: 'Astryx-inspired styling for Foldkit, powered by StyleX.',
      }),
      Card.section({
        title: 'Getting started',
        description:
          'Named composition primitives sit on top of StyleX so product apps rarely invent layout and chrome by hand.',
        padded: true,
        children: [
          Text.view({
            children:
              'Use the sidebar to explore the layout, forms, and feedback primitives, or open the full kitchen sink.',
          }),
        ],
      }),
      Card.section({
        title: 'Principles',
        description:
          'Foldkit governs, tokens stay Astryx-faithful, and the composition stays platform-neutral.',
        padded: true,
        children: [
          Text.view({
            children:
              'This documentation shell is a Foldkit model/message/update/view application with typed routes.',
          }),
        ],
      }),
    ],
  })
