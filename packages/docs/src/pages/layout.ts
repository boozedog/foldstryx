import type { Html, HtmlBuilder } from 'foldkit/html'

import { Card, Grid, Page, Row, Stack, Text } from '@foldstryx/foldkit'

import type { Message } from '../model.js'

export const view = (h: HtmlBuilder<Message>): Html =>
  Stack.view(
    {
      gap: 'lg',
      children: [
        Text.view({ variant: 'title', as: 'h1', children: 'Layout' }, h),
        Text.view(
          {
            variant: 'muted',
            children: 'Token-based spacing and alignment primitives.',
          },
          h,
        ),
        Card.section(
          {
            title: 'Stack',
            description: 'Vertical composition with token gaps.',
            padded: true,
            children: [
              Stack.view(
                {
                  gap: 'sm',
                  children: [
                    Text.view({ children: 'Stack item' }, h),
                    Text.view({ children: 'Another item' }, h),
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
            title: 'Row',
            description: 'Horizontal alignment presets.',
            padded: true,
            children: [
              Row.view(
                {
                  align: 'wrap',
                  children: [
                    Text.view({ children: 'Row item' }, h),
                    Text.view({ children: 'Another item' }, h),
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
            title: 'Grid',
            description: 'Responsive columns with a token gap scale.',
            padded: true,
            children: [
              Grid.view(
                {
                  columns: 3,
                  children: [
                    Text.view({ children: 'Cell one' }, h),
                    Text.view({ children: 'Cell two' }, h),
                    Text.view({ children: 'Cell three' }, h),
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
            title: 'Page',
            description: 'Header, content, and footer regions compose a shell.',
            padded: true,
            children: [
              Page.shell(
                {
                  header: Page.header(
                    {
                      title: 'Page title',
                      description: 'Supporting description for the page.',
                    },
                    h,
                  ),
                  content: [
                    Text.view(
                      {
                        children:
                          'Page content sits between the header and footer.',
                      },
                      h,
                    ),
                  ],
                  footer: Page.footer(
                    [
                      Text.view(
                        { variant: 'mutedSm', children: 'Footer region' },
                        h,
                      ),
                    ],
                    h,
                  ),
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
