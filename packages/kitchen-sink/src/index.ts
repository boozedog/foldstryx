import { Schema as S } from 'effect'
import { Command, Runtime } from 'foldkit'
import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import {
  Button,
  Card,
  Row,
  Stack,
  Text,
  elAttrs,
  sxAttrs,
} from '@foldstryx/foldkit'
import { layoutStyles } from '@foldstryx/styles'

export const Model = S.Struct({ clicks: S.Finite })
export type Model = typeof Model.Type
export const Clicked = () => ({ _tag: 'Clicked' as const })
export type Message = Readonly<{ _tag: 'Clicked' }>
export const init: Runtime.ApplicationInit<Model, Message> = () => [
  { clicks: 0 },
  [],
]
export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  message._tag === 'Clicked' ? { clicks: model.clicks + 1 } : model,
  [],
]

export const view = (model: Model): Html => {
  const h = html<Message>()
  return h.main(elAttrs<Message>(sxAttrs(h, layoutStyles.catalogShell)), [
    Stack.view({
      gap: 'lg',
      children: [
        Text.view({
          variant: 'title',
          as: 'h1',
          children: 'Foldstryx catalog',
        }),
        Text.view({
          variant: 'muted',
          children: 'First primitives: layout, type, controls, and chrome.',
        }),
        Card.section({
          title: 'Typography',
          description: 'Astryx-faithful type roles.',
          children: [
            Text.view({ children: 'Body text for a readable interface.' }),
            Text.view({ variant: 'body', children: 'Label text' }),
            Text.view({ variant: 'muted', children: 'Supporting text' }),
          ],
        }),
        Card.section({
          title: 'Stack and Row',
          description: 'Token-based spacing and alignment.',
          children: [
            Row.view({
              align: 'wrap',
              children: [
                Text.view({ children: 'Row item' }),
                Text.view({ children: 'Another item' }),
              ],
            }),
            Stack.view({
              gap: 'sm',
              children: [
                Text.view({ children: 'Stack item' }),
                Text.view({ children: 'Another item' }),
              ],
            }),
          ],
        }),
        Card.section({
          title: 'Buttons',
          description: `Click count: ${model.clicks}`,
          children: [
            Row.view({
              align: 'wrap',
              children: [
                Button.view({ label: 'Primary', onClick: Clicked() }),
                Button.view({ label: 'Secondary', variant: 'secondary' }),
                Button.view({ label: 'Ghost', variant: 'ghost' }),
                Button.view({ label: 'Danger', variant: 'danger' }),
                Button.view({ label: 'Small', size: 'sm' }),
                Button.view({ label: 'Disabled', isDisabled: true }),
              ],
            }),
          ],
        }),
        Card.section({
          title: 'Card',
          description: 'Root, header, and body slots compose surface chrome.',
          children: [
            Text.view({
              children:
                'Cards provide a neutral surface with border, radius, and elevation.',
            }),
          ],
        }),
      ],
    }),
  ])
}

export const Mount = { Model, init, update, view }
