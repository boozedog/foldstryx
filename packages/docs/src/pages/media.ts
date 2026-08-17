import type { Html, HtmlBuilder } from 'foldkit/html'

import { Avatar, Card, Row, Stack, Text } from '@foldstryx/foldkit'

import type { Message } from '../model.js'

export const view = (h: HtmlBuilder<Message>): Html =>
  Stack.view(
    {
      gap: 'lg',
      children: [
        Text.view({ variant: 'title', as: 'h1', children: 'Media' }, h),
        Text.view(
          {
            variant: 'muted',
            children: 'Avatars and media primitives.',
          },
          h,
        ),
        Card.section(
          {
            title: 'Avatar',
            description: 'Sizes, shapes, image, and fallback labeling.',
            padded: true,
            children: [
              Row.view(
                {
                  align: 'wrap',
                  children: [
                    Avatar.view({ fallback: 'JD', label: 'Jane Doe' }, h),
                    Avatar.view({ fallback: 'AB', size: 'sm' }, h),
                    Avatar.view({ fallback: 'CD', size: 'lg' }, h),
                    Avatar.view({ fallback: 'EF', shape: 'rounded' }, h),
                  ],
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
