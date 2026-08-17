import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import type { AnyCommand } from 'foldkit/scene'

/**
 * Renders a submodel view to a VNode outside a running program, capturing
 * the scene frame's builder so the view and its view-inputs closures can
 * build handler-bearing markup. Pure render tests use this to assert on the
 * VNode tree (tags, attrs, handlers, StyleX keys) without mounting a full
 * application. It drives the view through `foldkit/scene` (which sets up the
 * html runtime) and captures the rendered VNode via a `tap` step.
 */
export const renderSubmodel = <Model, Message, OutMessage>(
  view: (model: Model, h: HtmlBuilder<Message>) => Html,
  model: Model,
  update: (
    model: Model,
    message: Message,
  ) => readonly [Model, ReadonlyArray<AnyCommand>, OutMessage],
): Html => {
  let result: Html = null
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.tap(simulation => {
      result = simulation.html
    }),
  )
  return result
}

/**
 * Renders a composition view `(h) => Html` inside a scene frame and captures
 * the produced VNode. Composition primitives take the frame's builder as a
 * parameter; this helper supplies it. The scene's Message universe widens to
 * whatever the composition view needs, so handler-bearing views (buttons,
 * controls) can be exercised without a full application.
 */
export const renderWithBuilder = <Message>(
  build: (h: HtmlBuilder<Message>) => Html,
  ...afterGiven: ReadonlyArray<Scene.SceneStep<undefined, Message, undefined>>
): Html => {
  let result: Html = null
  const update = (
    _model: undefined,
    _message: Message,
  ): readonly [undefined, ReadonlyArray<never>] => [undefined, []]
  Scene.scene(
    {
      update,
      view: (_model, h) => {
        result = build(h)
        return result
      },
    },
    Scene.given(undefined),
    ...afterGiven,
  )
  return result
}
