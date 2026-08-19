import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  Card,
  Checkbox,
  DateInput,
  DateRangeInput,
  Field,
  Input,
  NumberInput,
  Selector,
  Stack,
  Text,
  TextArea,
  Typeahead,
} from '@foldstryx/foldkit'

import type { FormsFruitItem, Message, Model } from '../model.js'
import { FormsKindSelector, FormsTypeahead } from '../model.js'

const KIND_OPTIONS: ReadonlyArray<Selector.SelectorOption<'all' | 'active'>> = [
  { value: 'all', label: 'All kinds' },
  { value: 'active', label: 'Active' },
]

const FRUIT_OPTIONS: ReadonlyArray<
  Typeahead.TypeaheadOption<'apple' | 'banana'>
> = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
]

const mapSyncCheckbox = (
  message: typeof Checkbox.CompletedSyncCheckboxIndeterminate.Type,
): Message => message

const GotFormsKindSelectorMessage = (message: Selector.Message): Message => ({
  _tag: 'GotFormsKindSelectorMessage',
  message,
})

const GotFormsTypeaheadMessage = (message: Typeahead.Message): Message => ({
  _tag: 'GotFormsTypeaheadMessage',
  message,
})

const GotFormsStartDateMessage = (message: DateInput.Message): Message => ({
  _tag: 'GotFormsStartDateMessage',
  message,
})

const GotFormsEndDateMessage = (message: DateInput.Message): Message => ({
  _tag: 'GotFormsEndDateMessage',
  message,
})

const GotFormsCalendarDateMessage = (message: DateInput.Message): Message => ({
  _tag: 'GotFormsCalendarDateMessage',
  message,
})

const maybeIso = (iso: string | null): Option.Option<string> =>
  iso === null ? Option.none() : Option.some(iso)

const filterFruitItems = (
  inputValue: string,
): ReadonlyArray<FormsFruitItem> => {
  const query = inputValue.trim().toLowerCase()
  if (query === '') return ['apple', 'banana']
  const matches = FRUIT_OPTIONS.filter(option =>
    option.label.toLowerCase().includes(query),
  )
  return matches.length === 0
    ? [Typeahead.noMatchesItem()]
    : matches.map(option => option.value)
}

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
            title: 'Typeahead',
            description:
              'Single-select combobox with parent-filtered items and Astryx typeahead chrome.',
            padded: true,
            children: [
              Typeahead.labeledField(
                {
                  id: 'docs-typeahead',
                  label: 'Fruit',
                  children: [
                    h.submodel({
                      slotId: 'docs-typeahead',
                      model: model.formsTypeahead,
                      view: FormsTypeahead.view,
                      viewInputs: Typeahead.styledViewInputs<
                        FormsFruitItem,
                        Message
                      >(
                        {
                          items: filterFruitItems(
                            model.formsTypeahead.inputValue,
                          ),
                          options: FRUIT_OPTIONS,
                          maybeSelectedValue: Option.none(),
                          inputValue: model.formsTypeahead.inputValue,
                          ariaLabel: 'Fruit',
                          placeholder: 'Search fruit…',
                          emptyLabel: 'No matches',
                        },
                        h,
                      ),
                      toParentMessage: GotFormsTypeaheadMessage,
                    }),
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
            title: 'Date input',
            description:
              'Single DateInput with Foldkit Calendar popover. DateRangeInput below composes two of these fields.',
            padded: true,
            children: [
              DateInput.labeledField(
                {
                  id: 'docs-calendar-date',
                  label: 'Event date',
                  description: 'Opens the styled month grid in a popover.',
                  children: [
                    h.submodel({
                      slotId: 'docs-calendar-date',
                      model: model.formsCalendarDate,
                      view: DateInput.view,
                      viewInputs: DateInput.styledViewInputs(
                        {
                          maybeIsoDate: maybeIso(model.formsCalendarIso),
                          placeholder: 'Select date…',
                          width: 'md',
                        },
                        h,
                      ),
                      toParentMessage: GotFormsCalendarDateMessage,
                    }),
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
            title: 'Date range',
            description:
              'DateRangeInput composes two DateInput submodels. Foldkit Calendar is single-select per field, not Astryx one-calendar range mode.',
            padded: true,
            children: [
              DateRangeInput.view(
                {
                  id: 'docs-date-range',
                  label: 'Stay dates',
                  startField: h.submodel({
                    slotId: 'docs-start-date',
                    model: model.formsStartDate,
                    view: DateInput.view,
                    viewInputs: DateInput.styledViewInputs(
                      {
                        maybeIsoDate: maybeIso(model.formsStartIso),
                        placeholder: 'Start',
                        width: 'full',
                      },
                      h,
                    ),
                    toParentMessage: GotFormsStartDateMessage,
                  }),
                  endField: h.submodel({
                    slotId: 'docs-end-date',
                    model: model.formsEndDate,
                    view: DateInput.view,
                    viewInputs: DateInput.styledViewInputs(
                      {
                        maybeIsoDate: maybeIso(model.formsEndIso),
                        placeholder: 'End',
                        width: 'full',
                      },
                      h,
                    ),
                    toParentMessage: GotFormsEndDateMessage,
                  }),
                },
                h,
              ),
            ],
          },
          h,
        ),
        Card.section(
          {
            title: 'Number and textarea',
            description:
              'Native number input and Foldkit Textarea with shared field chrome.',
            padded: true,
            children: [
              NumberInput.view(
                {
                  id: 'docs-quantity',
                  label: 'Quantity',
                  value: '1',
                  min: 0,
                },
                h,
              ),
              TextArea.view(
                {
                  id: 'docs-notes',
                  label: 'Notes',
                  rows: 3,
                  placeholder: 'Optional notes…',
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
