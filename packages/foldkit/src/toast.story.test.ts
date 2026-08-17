import { Duration, Option } from 'effect'
import * as Story from 'foldkit/story'

import { describe, expect, it } from '@effect/vitest'
import {
  CompletedWaitBeforeDismissal,
  Dismissed,
  DismissedAll,
  test as ToastTest,
} from '@foldkit/ui/toast'

import * as Toast from './toast.js'

const DemoToast = Toast.create()

const payload = { title: 'Saved', maybeDescription: Option.some('All good') }

describe('Toast lifecycle', () => {
  it('shows an entry', () => {
    const [initial] = DemoToast.show(DemoToast.init({ id: 't' }), {
      payload,
      variant: 'Success',
    })
    expect(initial.entries).toHaveLength(1)
    expect(initial.entries[0]!.payload.title).toBe('Saved')
  })

  it('dismisses an entry by transitioning it to a leaving state', () => {
    const [initial] = DemoToast.show(DemoToast.init({ id: 't' }), {
      payload,
      variant: 'Success',
    })
    const entryId = initial.entries[0]!.id
    Story.story(
      DemoToast.update,
      Story.given(initial),
      Story.message(Dismissed({ entryId })),
      ToastTest.drainEntry({ entryId }),
      Story.expectOutMessage(DemoToast.DismissedToast({ payload })),
      Story.model(model => {
        expect(model.entries).toHaveLength(0)
      }),
    )
  })

  it('dismisses an entry when its duration elapses', () => {
    const [initial] = DemoToast.show(DemoToast.init({ id: 't' }), {
      payload,
      variant: 'Info',
      duration: Duration.millis(100),
    })
    const entryId = initial.entries[0]!.id
    const version = initial.entries[0]!.pendingDismissVersion

    Story.story(
      DemoToast.update,
      Story.given(initial),
      Story.message(CompletedWaitBeforeDismissal({ entryId, version })),
      ToastTest.drainEntry({ entryId, version }),
      Story.expectOutMessage(DemoToast.DismissedToast({ payload })),
      Story.model(model => {
        expect(model.entries).toHaveLength(0)
      }),
    )
  })

  it('ignores a stale elapsed-duration message from an older version', () => {
    const [initial] = DemoToast.show(DemoToast.init({ id: 't' }), {
      payload,
      variant: 'Info',
    })
    const entryId = initial.entries[0]!.id

    Story.story(
      DemoToast.update,
      Story.given(initial),
      Story.message(
        CompletedWaitBeforeDismissal({
          entryId,
          version: entryId.length + 99,
        }),
      ),
      Story.model(model => {
        expect(model.entries).toHaveLength(1)
      }),
    )
  })

  it('dismisses all entries on DismissedAll', () => {
    const [one] = DemoToast.show(DemoToast.init({ id: 't' }), {
      payload,
      variant: 'Info',
    })
    const [two] = DemoToast.show(one, {
      payload: { title: 'Second', maybeDescription: Option.none() },
      variant: 'Warning',
    })
    expect(two.entries).toHaveLength(2)

    Story.story(
      DemoToast.update,
      Story.given(two),
      Story.message(DismissedAll()),
      ToastTest.drainEntry({ entryId: two.entries[0]!.id }),
      ToastTest.drainEntry({ entryId: two.entries[1]!.id }),
      Story.model(model => {
        expect(model.entries).toHaveLength(0)
      }),
    )
  })
})
