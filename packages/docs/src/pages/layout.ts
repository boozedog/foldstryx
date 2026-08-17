import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  Card,
  Grid,
  Page,
  Row,
  Stack,
  Text,
  ToggleButton,
} from '@foldstryx/foldkit'

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
            description:
              'Astryx-aligned columns: presets, fixed counts, and responsive minWidth.',
            padded: true,
            children: [
              Stack.view(
                {
                  gap: 'md',
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
                    Grid.view(
                      {
                        columns: 6,
                        gap: 'sm',
                        children: Array.from({ length: 6 }, (_, index) =>
                          Text.view({ children: `Column ${index + 1}` }, h),
                        ),
                      },
                      h,
                    ),
                    Grid.view(
                      {
                        columns: { minWidth: 280, max: 4 },
                        children: [
                          Text.view({ children: 'Responsive track' }, h),
                          Text.view({ children: 'Another track' }, h),
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
        ),
        Card.section(
          {
            title: 'ToggleButton',
            description:
              'Astryx-aligned pressed ghost buttons for toolbars and matrix cells.',
            padded: true,
            children: [
              ToggleButton.groupView(
                {
                  label: 'View mode',
                  value: 'grid',
                  onChange: (_value): Message => ({ _tag: 'Noop' }),
                  items: [
                    { value: 'list', label: 'List' },
                    { value: 'grid', label: 'Grid' },
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
