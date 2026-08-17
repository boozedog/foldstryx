import { Command } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'
import {
  CompletedFocusTab,
  FocusTab,
  Message,
  type Model,
} from '@foldkit/ui/tabs'

import * as Tabs from './tabs.js'

type TabValue = 'overview' | 'details'

const DemoTabs = Tabs.create<TabValue>()

const GotTabsMessage = m('GotTabsMessage', { message: Message })
type ParentMessage = typeof GotTabsMessage.Type
type ParentModel = Readonly<{ tabs: Model; selectedValue: TabValue }>

const parentUpdate = (
  model: ParentModel,
  message: ParentMessage,
): readonly [ParentModel, ReadonlyArray<Command.Command<ParentMessage>>] => {
  const { message: tabsMessage } = message
  const [tabs, commands, maybeOut] = DemoTabs.update(model.tabs, tabsMessage)
  const selectedValue =
    maybeOut._tag === 'Some' ? maybeOut.value.value : model.selectedValue
  return [
    { ...model, tabs, selectedValue },
    Command.mapMessages(commands, m => GotTabsMessage({ message: m })),
  ]
}

const sceneView = (model: ParentModel, h: HtmlBuilder<ParentMessage>) =>
  h.submodel({
    slotId: model.tabs.id,
    model: model.tabs,
    view: DemoTabs.view,
    viewInputs: DemoTabs.styledViewInputs<ParentMessage>(
      {
        selectedValue: model.selectedValue,
        tabs: ['overview', 'details'],
        ariaLabel: 'Demo tabs',
        renderPanel: value => h.p([], [value]),
      },
      h,
    ),
    toParentMessage: message => GotTabsMessage({ message }),
  })

const overviewTab = Scene.role('tab', { name: 'overview' })
const detailsTab = Scene.role('tab', { name: 'details' })
const detailsPanel = Scene.role('tabpanel')

const initialModel = (): ParentModel => ({
  tabs: Tabs.init({ id: 'tabs' }),
  selectedValue: 'overview',
})

const resolveFocus = (index: number) =>
  Scene.Command.resolve(FocusTab({ id: 'tabs', index }), CompletedFocusTab())

describe('Tabs scene', () => {
  it('renders the first tab active by default', () => {
    Scene.scene(
      { update: parentUpdate, view: sceneView },
      Scene.given(initialModel()),
      Scene.expect(overviewTab).toHaveAttr('aria-selected', 'true'),
      Scene.expect(detailsTab).toHaveAttr('aria-selected', 'false'),
    )
  })

  it('selects a tab on click and renders its panel', () => {
    Scene.scene(
      { update: parentUpdate, view: sceneView },
      Scene.given(initialModel()),
      Scene.click(detailsTab),
      resolveFocus(1),
      Scene.expect(detailsTab).toHaveAttr('aria-selected', 'true'),
      Scene.expect(detailsPanel).toContainText('details'),
    )
  })

  it('moves selection with the right arrow key', () => {
    Scene.scene(
      { update: parentUpdate, view: sceneView },
      Scene.given(initialModel()),
      Scene.keydown(overviewTab, 'ArrowRight'),
      resolveFocus(1),
      Scene.expect(detailsTab).toHaveAttr('aria-selected', 'true'),
    )
  })

  it('marks a disabled tab as disabled and leaves selection unchanged', () => {
    const disabledView = (model: ParentModel, h: HtmlBuilder<ParentMessage>) =>
      h.submodel({
        slotId: model.tabs.id,
        model: model.tabs,
        view: DemoTabs.view,
        viewInputs: DemoTabs.styledViewInputs<ParentMessage>(
          {
            selectedValue: model.selectedValue,
            tabs: ['overview', 'details'],
            ariaLabel: 'Demo tabs',
            renderPanel: value => h.p([], [value]),
            isTabDisabled: value => value === 'details',
          },
          h,
        ),
        toParentMessage: message => GotTabsMessage({ message }),
      })
    Scene.scene(
      { update: parentUpdate, view: disabledView },
      Scene.given(initialModel()),
      Scene.expect(detailsTab).toHaveAttr('aria-disabled', 'true'),
      Scene.expect(detailsTab).not.toHaveHandler('click'),
      Scene.expect(overviewTab).toHaveAttr('aria-selected', 'true'),
      Scene.expect(detailsTab).toHaveAttr('aria-selected', 'false'),
    )
  })
})
