import { html, submodel } from 'foldkit/html'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'
import {
  CompletedFocusTab,
  FocusTab,
  type Message,
  type Model,
} from '@foldkit/ui/tabs'

import * as Tabs from './tabs.js'

type TabValue = 'overview' | 'details'

const DemoTabs = Tabs.create<TabValue>()

const sceneView = (model: Model) => {
  const h = html<Message>()
  return submodel({
    slotId: model.id,
    model,
    view: DemoTabs.view,
    viewInputs: DemoTabs.styledViewInputs({
      tabs: ['overview', 'details'],
      ariaLabel: 'Demo tabs',
      renderPanel: value => h.p([], [value]),
    }),
    toParentMessage: message => message,
  })
}

const overviewTab = Scene.role('tab', { name: 'overview' })
const detailsTab = Scene.role('tab', { name: 'details' })
const detailsPanel = Scene.role('tabpanel')

const resolveFocus = (index: number) =>
  Scene.Command.resolve(FocusTab({ id: 'tabs', index }), CompletedFocusTab())

describe('Tabs scene', () => {
  it('renders the first tab active by default', () => {
    Scene.scene(
      { update: DemoTabs.update, view: sceneView },
      Scene.with(Tabs.init({ id: 'tabs' })),
      Scene.expect(overviewTab).toHaveAttr('aria-selected', 'true'),
      Scene.expect(detailsTab).toHaveAttr('aria-selected', 'false'),
    )
  })

  it('selects a tab on click and renders its panel', () => {
    Scene.scene(
      { update: DemoTabs.update, view: sceneView },
      Scene.with(Tabs.init({ id: 'tabs' })),
      Scene.click(detailsTab),
      resolveFocus(1),
      Scene.expect(detailsTab).toHaveAttr('aria-selected', 'true'),
      Scene.expect(detailsPanel).toContainText('details'),
    )
  })

  it('moves selection with the right arrow key', () => {
    Scene.scene(
      { update: DemoTabs.update, view: sceneView },
      Scene.with(Tabs.init({ id: 'tabs' })),
      Scene.keydown(overviewTab, 'ArrowRight'),
      resolveFocus(1),
      Scene.expect(detailsTab).toHaveAttr('aria-selected', 'true'),
    )
  })

  it('marks a disabled tab as disabled and leaves selection unchanged', () => {
    const disabledView = (model: Model) => {
      const h = html<Message>()
      return submodel({
        slotId: model.id,
        model,
        view: DemoTabs.view,
        viewInputs: DemoTabs.styledViewInputs({
          tabs: ['overview', 'details'],
          ariaLabel: 'Demo tabs',
          renderPanel: value => h.p([], [value]),
          isTabDisabled: value => value === 'details',
        }),
        toParentMessage: message => message,
      })
    }
    Scene.scene(
      { update: DemoTabs.update, view: disabledView },
      Scene.with(Tabs.init({ id: 'tabs' })),
      Scene.expect(detailsTab).toHaveAttr('aria-disabled', 'true'),
      Scene.expect(detailsTab).not.toHaveHandler('click'),
      Scene.expect(overviewTab).toHaveAttr('aria-selected', 'true'),
      Scene.expect(detailsTab).toHaveAttr('aria-selected', 'false'),
    )
  })
})
