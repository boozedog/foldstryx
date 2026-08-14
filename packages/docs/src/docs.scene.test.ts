import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'
import { AnchorTooltip, CompletedAnchorTooltip } from '@foldkit/ui/tooltip'
import { GotTooltipMessage } from '@foldstryx/kitchen-sink'

import { init, update } from './model.js'
import { view } from './view.js'

const [initialModel] = init()
const acknowledgeTooltip = Scene.Mount.resolve(
  AnchorTooltip,
  CompletedAnchorTooltip(),
  message => ({ _tag: 'Sink', message: GotTooltipMessage(message) }),
)

describe('docs scene', () => {
  it('navigates to a focused page and updates active navigation', () => {
    Scene.scene(
      { update, view: m => view(m).body },
      Scene.with(initialModel),
      Scene.click(Scene.role('button', { name: 'Layout' })),
      Scene.expect(Scene.selector('h1')).toHaveText('Layout'),
      Scene.expect(Scene.role('button', { name: 'Layout' })).toHaveAttr(
        'aria-current',
        'page',
      ),
    )
  })

  it('navigates to the kitchen-sink route', () => {
    Scene.scene(
      { update, view: m => view(m).body },
      Scene.with(initialModel),
      Scene.click(Scene.role('button', { name: 'Kitchen sink' })),
      acknowledgeTooltip,
      Scene.expect(Scene.selector('h1')).toHaveText('Foldstryx catalog'),
    )
  })

  it('navigates back to the overview route', () => {
    Scene.scene(
      { update, view: m => view(m).body },
      Scene.with(initialModel),
      Scene.click(Scene.role('button', { name: 'Layout' })),
      Scene.click(Scene.role('button', { name: 'Overview' })),
      Scene.expect(Scene.selector('h1')).toHaveText('Foldstryx documentation'),
    )
  })

  it('dispatches a typed message when the forms checkbox is clicked', () => {
    Scene.scene(
      { update, view: m => view(m).body },
      Scene.with(initialModel),
      Scene.click(Scene.role('button', { name: 'Forms' })),
      Scene.click(Scene.role('checkbox', { name: 'Accept terms' })),
      Scene.expect(Scene.selector('h1')).toHaveText('Forms'),
    )
  })

  it('dispatches a typed message when the forms select changes', () => {
    Scene.scene(
      { update, view: m => view(m).body },
      Scene.with(initialModel),
      Scene.click(Scene.role('button', { name: 'Forms' })),
      Scene.change(Scene.role('combobox', { name: 'Kind' }), 'active'),
      Scene.expect(Scene.selector('h1')).toHaveText('Forms'),
    )
  })
})
