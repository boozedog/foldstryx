import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  Alert,
  Attention,
  Badge,
  Card,
  EmptyState,
  LoadingPanel,
  Row,
  Stack,
  Text,
} from '@foldstryx/foldkit'

import type { Message } from '../model.js'

export const view = (h: HtmlBuilder<Message>): Html =>
  Stack.view(
    {
      gap: 'lg',
      children: [
        Text.view({ variant: 'title', as: 'h1', children: 'Feedback' }, h),
        Text.view(
          {
            variant: 'muted',
            children: 'Status, alert, and attention surfaces.',
          },
          h,
        ),
        Card.section(
          {
            title: 'Badges',
            description: 'Status and metadata chips across sentiment variants.',
            padded: true,
            children: [
              Row.view(
                {
                  align: 'wrap',
                  children: [
                    Badge.view({ label: 'Default' }, h),
                    Badge.view({ label: 'Success', variant: 'success' }, h),
                    Badge.view({ label: 'Warning', variant: 'warning' }, h),
                    Badge.view({ label: 'Info', variant: 'info' }, h),
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
            title: 'Alerts',
            description: 'Role=alert banners with optional action slots.',
            padded: true,
            children: [
              Stack.view(
                {
                  gap: 'sm',
                  children: [
                    Alert.view(
                      {
                        title: 'Default',
                        body: 'A neutral informational banner.',
                      },
                      h,
                    ),
                    Alert.view(
                      {
                        variant: 'destructive',
                        title: 'Error',
                        body: 'Something went wrong.',
                      },
                      h,
                    ),
                    Alert.view(
                      {
                        variant: 'success',
                        body: 'Import complete.',
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
            title: 'Feedback',
            description: 'Loading, empty, and attention surfaces.',
            padded: true,
            children: [
              Stack.view(
                {
                  gap: 'sm',
                  children: [
                    LoadingPanel.view(
                      { message: 'Loading panel…', card: false },
                      h,
                    ),
                    EmptyState.view(
                      {
                        title: 'Nothing here',
                        message: 'Empty state with an optional action.',
                        card: false,
                      },
                      h,
                    ),
                    Attention.view(
                      {
                        title: 'Attention',
                        body: 'Soft callout for inline notices (not role=alert).',
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
      ],
    },
    h,
  )
