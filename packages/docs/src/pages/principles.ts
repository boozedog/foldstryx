import type { Html, HtmlBuilder } from 'foldkit/html'

import { Card, Stack, Text } from '@foldstryx/foldkit'

import type { Message } from '../model.js'

export const view = (h: HtmlBuilder<Message>): Html =>
  Stack.view(
    {
      gap: 'lg',
      children: [
        Text.view({ variant: 'title', as: 'h1', children: 'Principles' }, h),
        Text.view(
          {
            variant: 'muted',
            children:
              'The design and architecture principles behind Foldstryx.',
          },
          h,
        ),
        Card.section(
          {
            title: 'Foldkit governs',
            description: 'No React, hooks, or context as the public surface.',
            padded: true,
            children: [
              Text.view(
                {
                  children:
                    'The documentation shell is a model/message/update/view application with typed routes.',
                },
                h,
              ),
            ],
          },
          h,
        ),
        Card.section(
          {
            title: 'Token-faithful',
            description:
              'Component styles reference Astryx tokens, not magic numbers.',
            padded: true,
            children: [
              Text.view(
                {
                  children:
                    'Lift Astryx scales and roles over inventing Foldstryx-only tokens.',
                },
                h,
              ),
            ],
          },
          h,
        ),
        Card.section(
          {
            title: 'Platform-neutral',
            description:
              'The shared composition has no browser or host dependencies.',
            padded: true,
            children: [
              Text.view(
                {
                  children:
                    'Browser and desktop hosts own runtime bootstrap and URL integration.',
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
