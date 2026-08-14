import type { Html } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import type { AnyCommand } from 'foldkit/scene'

/**
 * Renders a submodel `view(model, viewInputs)` to a VNode outside a running
 * program. Pure render tests use this to assert on the VNode tree (tags,
 * attrs, handlers, StyleX keys) without mounting a full application. It drives
 * the view through `foldkit/scene` (which sets up the html runtime) and
 * captures the rendered VNode via a `tap` step.
 */
export const renderSubmodel = <Model, Message, OutMessage>(
  view: (model: Model) => Html,
  model: Model,
  update: (
    model: Model,
    message: Message,
  ) => readonly [Model, ReadonlyArray<AnyCommand>, OutMessage],
): Html => {
  let result: Html = null
  Scene.scene(
    { update, view },
    Scene.with(model),
    Scene.tap(simulation => {
      result = simulation.html
    }),
  )
  return result
}
