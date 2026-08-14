import type { Html } from 'foldkit/html'

import {
  Card,
  Checkbox,
  Field,
  Input,
  NativeSelect,
  Stack,
  Text,
} from '@foldstryx/foldkit'

import type { Message } from '../model.js'

export const view = (): Html =>
  Stack.view({
    gap: 'lg',
    children: [
      Text.view({ variant: 'title', as: 'h1', children: 'Forms' }),
      Text.view({
        variant: 'muted',
        children: 'Labeled controls with shared Astryx form styling.',
      }),
      Card.section({
        title: 'Input',
        description: 'Text entry with label and description.',
        padded: true,
        children: [
          Input.view({
            id: 'docs-email',
            label: 'Email',
            value: '',
            placeholder: 'name@example.com',
            description: 'We will never share your email.',
          }),
        ],
      }),
      Card.section({
        title: 'Checkbox',
        description: 'Boolean selection.',
        padded: true,
        children: [
          Field.group({
            orientation: 'horizontal',
            children: [
              Checkbox.control({
                id: 'docs-terms',
                checked: false,
                label: 'Accept terms',
                onChange: (): Message => ({ _tag: 'Noop' }),
              }),
            ],
          }),
        ],
      }),
      Card.section({
        title: 'Native select',
        description: 'Compact native select for filters.',
        padded: true,
        children: [
          NativeSelect.view({
            id: 'docs-kind',
            ariaLabel: 'Kind',
            density: 'compact',
            width: 'sm',
            value: 'all',
            options: [
              { value: 'all', label: 'All kinds' },
              { value: 'active', label: 'Active' },
            ],
            onChange: (): Message => ({ _tag: 'Noop' }),
            label: 'Kind',
          }),
        ],
      }),
    ],
  })
