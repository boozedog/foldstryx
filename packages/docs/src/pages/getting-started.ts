import type { Html, HtmlBuilder } from 'foldkit/html'

import { Card, Stack, Text } from '@foldstryx/foldkit'

import type { Message } from '../model.js'

export const view = (h: HtmlBuilder<Message>): Html =>
  Stack.view(
    {
      gap: 'lg',
      children: [
        Text.view(
          { variant: 'title', as: 'h1', children: 'Getting started' },
          h,
        ),
        Text.view(
          {
            variant: 'muted',
            children: 'How to use the Foldstryx documentation composition.',
          },
          h,
        ),
        Card.section(
          {
            title: 'Install',
            description: 'The docs composition is a Foldkit application.',
            padded: true,
            children: [
              Text.view(
                {
                  children:
                    'Import Model, init, update, and view from @foldstryx/docs and run them with a Foldkit Runtime.',
                },
                h,
              ),
            ],
          },
          h,
        ),
        Card.section(
          {
            title: 'Routing',
            description: 'Navigation uses typed routes and Foldkit messages.',
            padded: true,
            children: [
              Text.view(
                {
                  children:
                    'Dispatch a Navigate message to change the active route; the shell and navigation update from the model.',
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
