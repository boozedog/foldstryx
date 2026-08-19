import { Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'

import * as TreeList from './treeList.js'

const Focused = m('Focused', { id: S.String })
const Selected = m('Selected', { id: S.String })
const Toggled = m('Toggled', { id: S.String })

type Message = typeof Focused.Type | typeof Selected.Type | typeof Toggled.Type

type Model = Readonly<{
  expanded: ReadonlySet<string>
  selected: string
  focused: string
}>

const ITEMS: ReadonlyArray<TreeList.TreeListItem> = [
  {
    id: 'projects',
    label: 'Projects',
    children: [
      { id: 'foldstryx', label: 'Foldstryx' },
      { id: 'astryx', label: 'Astryx' },
    ],
  },
]

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] => {
  switch (message._tag) {
    case 'Focused':
      return [{ ...model, focused: message.id }, []]
    case 'Selected':
      return [{ ...model, selected: message.id }, []]
    case 'Toggled': {
      const expanded = new Set(model.expanded)
      if (expanded.has(message.id)) {
        expanded.delete(message.id)
      } else {
        expanded.add(message.id)
      }
      return [{ ...model, expanded }, []]
    }
  }
}

const sceneView = (model: Model, h: HtmlBuilder<Message>) =>
  TreeList.view(
    {
      items: ITEMS,
      expandedIds: model.expanded,
      selectedId: model.selected,
      focusedId: model.focused,
      ariaLabel: 'Projects',
      onToggle: id => Toggled({ id }),
      onSelect: id => Selected({ id }),
      onFocus: id => Focused({ id }),
    },
    h,
  )

const expandChevron = Scene.role('button', { name: 'Expand' })
const foldstryxItem = Scene.role('treeitem', { name: 'Foldstryx' })
const tree = Scene.role('tree', { name: 'Projects' })

describe('TreeList scene', () => {
  it('chevron toggles expand without changing selection', () => {
    Scene.scene(
      { update, view: sceneView },
      Scene.given({
        expanded: new Set<string>(),
        selected: 'projects',
        focused: 'projects',
      }),
      Scene.click(expandChevron),
      Scene.expect(foldstryxItem).toExist(),
      Scene.expect(foldstryxItem).not.toHaveAttr('aria-selected', 'true'),
    )
  })

  it('label click selects without toggling expand', () => {
    Scene.scene(
      { update, view: sceneView },
      Scene.given({
        expanded: new Set(['projects']),
        selected: 'projects',
        focused: 'projects',
      }),
      Scene.inside(foldstryxItem, Scene.click(Scene.selector('.sx-label'))),
      Scene.expect(foldstryxItem).toHaveAttr('aria-selected', 'true'),
      Scene.expect(foldstryxItem).toExist(),
    )
  })

  it('dispatches focus messages from tree keydown', () => {
    Scene.scene(
      { update, view: sceneView },
      Scene.given({
        expanded: new Set(['projects']),
        selected: 'projects',
        focused: 'projects',
      }),
      Scene.expect(tree).toHaveHandler('keydown'),
      Scene.keydown(tree, 'ArrowDown'),
      Scene.expectHandled(),
    )
  })
})
