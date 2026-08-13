import { Duration } from 'effect'
import * as Story from 'foldkit/story'

import { describe, expect, it } from '@effect/vitest'
import {
  ElapsedShowDelay,
  EnteredTrigger,
  PressedEscape,
  ShowAfterDelay,
  update,
} from '@foldkit/ui/tooltip'

import { init } from './tooltip.js'

describe('SidebarTooltip', () => {
  it('init uses zero show delay for instant sidebar labels', () => {
    expect(init('sidebar-tip').showDelay).toStrictEqual(Duration.millis(0))
  })

  it('opens on hover after the show-delay command resolves', () => {
    Story.story(
      update,
      Story.with(init('sidebar-tip')),
      Story.message(EnteredTrigger()),
      Story.Command.resolve(ShowAfterDelay, ElapsedShowDelay({ version: 1 })),
      Story.model(model => {
        expect(model.isOpen).toBe(true)
        expect(model.isHovered).toBe(true)
      }),
      Story.Command.expectNone(),
    )
  })

  it('dismisses an open tooltip on Escape without lying about hover state', () => {
    Story.story(
      update,
      Story.with(init('sidebar-tip')),
      Story.message(EnteredTrigger()),
      Story.Command.resolve(ShowAfterDelay, ElapsedShowDelay({ version: 1 })),
      Story.model(model => {
        expect(model.isOpen).toBe(true)
      }),
      Story.message(PressedEscape()),
      Story.model(model => {
        expect(model.isOpen).toBe(false)
        expect(model.isHovered).toBe(true)
        expect(model.isDismissed).toBe(true)
      }),
      Story.Command.expectNone(),
    )
  })
})
