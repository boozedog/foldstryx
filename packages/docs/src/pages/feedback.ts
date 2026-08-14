import type { Html } from 'foldkit/html'

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

export const view = (): Html =>
  Stack.view({
    gap: 'lg',
    children: [
      Text.view({ variant: 'title', as: 'h1', children: 'Feedback' }),
      Text.view({
        variant: 'muted',
        children: 'Status, alert, and attention surfaces.',
      }),
      Card.section({
        title: 'Badges',
        description: 'Status and metadata chips across sentiment variants.',
        padded: true,
        children: [
          Row.view({
            align: 'wrap',
            children: [
              Badge.view({ label: 'Default' }),
              Badge.view({ label: 'Success', variant: 'success' }),
              Badge.view({ label: 'Warning', variant: 'warning' }),
              Badge.view({ label: 'Info', variant: 'info' }),
            ],
          }),
        ],
      }),
      Card.section({
        title: 'Alerts',
        description: 'Role=alert banners with optional action slots.',
        padded: true,
        children: [
          Stack.view({
            gap: 'sm',
            children: [
              Alert.view({
                title: 'Default',
                body: 'A neutral informational banner.',
              }),
              Alert.view({
                variant: 'destructive',
                title: 'Error',
                body: 'Something went wrong.',
              }),
              Alert.view({
                variant: 'success',
                body: 'Import complete.',
              }),
            ],
          }),
        ],
      }),
      Card.section({
        title: 'Feedback',
        description: 'Loading, empty, and attention surfaces.',
        padded: true,
        children: [
          Stack.view({
            gap: 'sm',
            children: [
              LoadingPanel.view({ message: 'Loading panel…', card: false }),
              EmptyState.view({
                title: 'Nothing here',
                message: 'Empty state with an optional action.',
                card: false,
              }),
              Attention.view({
                title: 'Attention',
                body: 'Soft callout for inline notices (not role=alert).',
              }),
            ],
          }),
        ],
      }),
    ],
  })
