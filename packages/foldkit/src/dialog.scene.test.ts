import { html, submodel } from 'foldkit/html'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'
import {
  CloseDialog,
  CompletedCloseDialog,
  type Message,
  type Model,
  RequestedOpen,
} from '@foldkit/ui/dialog'

import { init, styledViewInputs, update, view } from './dialog.js'

const dialogId = 'confirm-dialog'

const sceneView = (model: Model) => {
  const h = html<Message>()
  return submodel({
    slotId: model.id,
    model,
    view,
    viewInputs: styledViewInputs<Message>({
      id: dialogId,
      title: 'Confirm',
      description: 'Are you sure?',
      showClose: true,
      footer: [h.button([], ['OK'])],
    }),
    toParentMessage: message => message,
  })
}

const dialog = Scene.selector(`#${dialogId}`)
const closeButton = Scene.role('button', { name: 'Close' })

const closedModel = init({ id: dialogId })
const [openModel] = update(closedModel, RequestedOpen())

const resolveClose = Scene.Command.resolve(
  CloseDialog({ id: dialogId }),
  CompletedCloseDialog(),
)

describe('Dialog scene', () => {
  it('renders the native dialog open when open', () => {
    Scene.scene(
      { update, view: sceneView },
      Scene.with(openModel),
      Scene.expect(dialog).toHaveAttr('open', 'true'),
      Scene.expect(dialog).toHaveAttr('aria-labelledby', `${dialogId}-title`),
      Scene.expect(dialog).toHaveAttr(
        'aria-describedby',
        `${dialogId}-description`,
      ),
    )
  })

  it('renders no panel content when closed', () => {
    Scene.scene(
      { update, view: sceneView },
      Scene.with(closedModel),
      Scene.expect(closeButton).toBeAbsent(),
    )
  })

  it('closes when the close button is clicked', () => {
    Scene.scene(
      { update, view: sceneView },
      Scene.with(openModel),
      Scene.click(closeButton),
      resolveClose,
      Scene.expect(closeButton).toBeAbsent(),
    )
  })
})
