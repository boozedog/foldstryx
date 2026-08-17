import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'
import {
  AnchorListbox,
  CompletedAnchorListbox,
  CompletedFocusButton,
  CompletedFocusItems,
  CompletedPortalListboxBackdrop,
  FocusButton,
  FocusItems,
  PortalListboxBackdrop,
} from '@foldkit/ui/listbox'
import { AnchorTooltip, CompletedAnchorTooltip } from '@foldkit/ui/tooltip'
import { Checkbox, GridFocus } from '@foldstryx/foldkit'

import { init, update } from './model.js'
import { view } from './view.js'

const [initialModel] = init()
const acknowledgeTooltip = Scene.Mount.resolve(
  AnchorTooltip,
  CompletedAnchorTooltip(),
)

const acknowledgeFormsMounts = Scene.Mount.resolve(
  Checkbox.syncIndeterminateMount({ indeterminate: false }),
  Checkbox.CompletedSyncCheckboxIndeterminate(),
)

const acknowledgeKitchenSinkMounts = Scene.Mount.resolveAll(
  [GridFocus.mount, GridFocus.CompletedGridFocus()],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
)

const kindTrigger = Scene.role('button', { name: 'Kind' })
const activeOption = Scene.role('option', { name: 'Active' })
const kindAnchor = { placement: 'bottom-start', gap: 4, padding: 8 } as const

const resolveKindOpen = [
  Scene.Command.resolve(FocusItems({ id: 'docs-kind' }), CompletedFocusItems()),
  Scene.Mount.resolve(
    AnchorListbox({ buttonId: 'docs-kind-button', anchor: kindAnchor }),
    CompletedAnchorListbox(),
  ),
  Scene.Mount.resolve(PortalListboxBackdrop, CompletedPortalListboxBackdrop()),
]

const resolveKindClose = [
  Scene.Command.resolve(
    FocusButton({ id: 'docs-kind' }),
    CompletedFocusButton(),
  ),
]

describe('docs scene', () => {
  it('navigates to a focused page and updates active navigation', () => {
    Scene.scene(
      { update, view: (m, h) => view(m, h).body },
      Scene.given(initialModel),
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
      { update, view: (m, h) => view(m, h).body },
      Scene.given(initialModel),
      Scene.click(Scene.role('button', { name: 'Kitchen sink' })),
      acknowledgeTooltip,
      acknowledgeKitchenSinkMounts,
      Scene.expect(Scene.selector('h1')).toHaveText('Foldstryx catalog'),
    )
  })

  it('navigates back to the overview route', () => {
    Scene.scene(
      { update, view: (m, h) => view(m, h).body },
      Scene.given(initialModel),
      Scene.click(Scene.role('button', { name: 'Layout' })),
      Scene.click(Scene.role('button', { name: 'Overview' })),
      Scene.expect(Scene.selector('h1')).toHaveText('Foldstryx documentation'),
    )
  })

  it('dispatches a typed message when the forms checkbox is clicked', () => {
    Scene.scene(
      { update, view: (m, h) => view(m, h).body },
      Scene.given(initialModel),
      Scene.click(Scene.role('button', { name: 'Forms' })),
      acknowledgeFormsMounts,
      Scene.click(Scene.role('checkbox', { name: 'Accept terms' })),
      Scene.expect(Scene.selector('h1')).toHaveText('Forms'),
    )
  })

  it('dispatches a typed message when the forms selector changes', () => {
    Scene.scene(
      { update, view: (m, h) => view(m, h).body },
      Scene.given(initialModel),
      Scene.click(Scene.role('button', { name: 'Forms' })),
      acknowledgeFormsMounts,
      Scene.click(kindTrigger),
      ...resolveKindOpen,
      Scene.click(activeOption),
      ...resolveKindClose,
      Scene.Mount.expectEnded(
        AnchorListbox({ buttonId: 'docs-kind-button', anchor: kindAnchor }),
        PortalListboxBackdrop,
      ),
      Scene.expect(Scene.selector('h1')).toHaveText('Forms'),
    )
  })
})
