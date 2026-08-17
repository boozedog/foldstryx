import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  Card,
  Checkbox,
  Field,
  Input,
  Selector,
  Stack,
  Text,
} from '@foldstryx/foldkit'

import type { Message, Model } from '../model.js'
import { FormsKindSelector } from '../model.js'

const KIND_OPTIONS: ReadonlyArray<Selector.SelectorOption<'all' | 'active'>> = [
  { value: 'all', label: 'All kinds' },
  { value: 'active', label: 'Active' },
]

const mapSyncCheckbox = (
  message: typeof Checkbox.CompletedSyncCheckboxIndeterminate.Type,
): Message => message

const GotFormsKindSelectorMessage = (message: Selector.Message): Message => ({
  _tag: 'GotFormsKindSelectorMessage',
  message,
})

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  Stack.view(
    {
      gap: 'lg',
      children: [
        Text.view({ variant: 'title', as: 'h1', children: 'Forms' }, h),
        Text.view(
          {
            variant: 'muted',
            children: 'Labeled controls with shared Astryx form styling.',
          },
          h,
        ),
        Card.section(
          {
            title: 'Input',
            description: 'Text entry with label and description.',
            padded: true,
            children: [
              Input.view(
                {
                  id: 'docs-email',
                  label: 'Email',
                  value: '',
                  placeholder: 'name@example.com',
                  description: 'We will never share your email.',
                },
                h,
              ),
            ],
          },
          h,
        ),
        Card.section(
          {
            title: 'Checkbox',
            description: 'Boolean selection.',
            padded: true,
            children: [
              Field.group(h, {
                orientation: 'horizontal',
                children: [
                  Checkbox.control(
                    {
                      id: 'docs-terms',
                      checked: false,
                      label: 'Accept terms',
                      onChange: (): Message => ({ _tag: 'Noop' }),
                    },
                    h,
                    mapSyncCheckbox,
                  ),
                ],
              }),
            ],
          },
          h,
        ),
        Card.section(
          {
            title: 'Selector',
            description:
              'Closed option list with Astryx Selector look and keyboard navigation.',
            padded: true,
            children: [
              Selector.labeledField(
                {
                  id: 'docs-kind',
                  label: 'Kind',
                  children: [
                    h.submodel({
                      slotId: 'docs-kind',
                      model: model.formsKindSelector,
                      view: FormsKindSelector.view,
                      viewInputs: Selector.styledViewInputs<
                        'all' | 'active',
                        Message
                      >(
                        {
                          options: KIND_OPTIONS,
                          selectedValue: model.formsKind,
                          density: 'compact',
                          width: 'sm',
                          ariaLabel: 'Kind',
                          isOpen: model.formsKindSelector.isOpen,
                        },
                        h,
                      ),
                      toParentMessage: GotFormsKindSelectorMessage,
                    }),
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
