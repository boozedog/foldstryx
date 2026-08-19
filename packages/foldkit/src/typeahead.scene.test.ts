import { Option } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'
import {
  AnchorCombobox,
  CompletedAnchorCombobox,
  CompletedFocusInput,
  CompletedPortalComboboxBackdrop,
  FocusInput,
  type Message,
  type Model,
  PortalComboboxBackdrop,
} from '@foldkit/ui/combobox'

import * as Typeahead from './typeahead.js'

type Fruit = 'apple' | 'banana' | ReturnType<typeof Typeahead.noMatchesItem>

const FruitTypeahead = Typeahead.create<Fruit>()

const options: ReadonlyArray<Typeahead.TypeaheadOption<'apple' | 'banana'>> = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
]

const filterItems = (inputValue: string): ReadonlyArray<Fruit> => {
  const query = inputValue.trim().toLowerCase()
  if (query === '') return ['apple', 'banana']
  const matches = options.filter(option =>
    option.label.toLowerCase().includes(query),
  )
  return matches.length === 0
    ? [Typeahead.noMatchesItem()]
    : matches.map(option => option.value)
}

const sceneView = (model: Model, h: HtmlBuilder<Message>) =>
  h.submodel({
    slotId: model.id,
    model,
    view: FruitTypeahead.view,
    viewInputs: Typeahead.styledViewInputs<Fruit, Message>(
      {
        items: filterItems(model.inputValue),
        options,
        maybeSelectedValue: Option.none(),
        inputValue: model.inputValue,
        ariaLabel: 'Fruit',
        emptyLabel: 'No matches',
      },
      h,
    ),
    toParentMessage: message => message,
  })

const fruitInput = Scene.selector('#fruit-input')
const appleOption = Scene.role('option', { name: 'Apple' })
const bananaOption = Scene.role('option', { name: 'Banana' })
const noMatches = Scene.role('option', { name: 'No matches' })
const anchor = { placement: 'bottom-start', gap: 4, padding: 8 } as const

const resolveClose = [
  Scene.Command.resolve(FocusInput({ id: 'fruit' }), CompletedFocusInput()),
]

describe('Typeahead scene', () => {
  it('renders options when the combobox is open', () => {
    const closed = Typeahead.init({ id: 'fruit' })
    const [openModel] = FruitTypeahead.open(closed)
    Scene.scene(
      { update: FruitTypeahead.update, view: sceneView },
      Scene.given(openModel),
      Scene.Mount.resolve(
        AnchorCombobox({ buttonId: 'fruit-input-wrapper', anchor }),
        CompletedAnchorCombobox(),
      ),
      Scene.Mount.resolve(
        PortalComboboxBackdrop,
        CompletedPortalComboboxBackdrop(),
      ),
      Scene.expect(appleOption).toExist(),
    )
  })

  it('filters items while typing and shows a disabled no-matches row', () => {
    const [openModel] = FruitTypeahead.open(Typeahead.init({ id: 'fruit' }))
    Scene.scene(
      { update: FruitTypeahead.update, view: sceneView },
      Scene.given(openModel),
      Scene.Mount.resolve(
        AnchorCombobox({ buttonId: 'fruit-input-wrapper', anchor }),
        CompletedAnchorCombobox(),
      ),
      Scene.Mount.resolve(
        PortalComboboxBackdrop,
        CompletedPortalComboboxBackdrop(),
      ),
      Scene.type(fruitInput, 'ban'),
      Scene.expect(bananaOption).toExist(),
      Scene.expect(appleOption).toBeAbsent(),
      Scene.type(fruitInput, 'zzz'),
      Scene.expect(noMatches).toHaveAttr('aria-disabled', 'true'),
    )
  })

  it('closes on Escape', () => {
    const closed = Typeahead.init({ id: 'fruit' })
    const [openModel] = FruitTypeahead.open(closed)
    Scene.scene(
      { update: FruitTypeahead.update, view: sceneView },
      Scene.given(openModel),
      Scene.Mount.resolve(
        AnchorCombobox({ buttonId: 'fruit-input-wrapper', anchor }),
        CompletedAnchorCombobox(),
      ),
      Scene.Mount.resolve(
        PortalComboboxBackdrop,
        CompletedPortalComboboxBackdrop(),
      ),
      Scene.keydown(fruitInput, 'Escape'),
      ...resolveClose,
      Scene.Mount.expectEnded(
        AnchorCombobox({ buttonId: 'fruit-input-wrapper', anchor }),
        PortalComboboxBackdrop,
      ),
      Scene.expect(appleOption).toBeAbsent(),
    )
  })
})
