import { Match as M, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Scene from 'foldkit/scene'

import { describe, it } from '@effect/vitest'

import * as Icon from './icon.js'
import * as Sidebar from './sidebar.js'

const Toggle = m('Toggle')
const Navigate = m('Navigate', { id: S.String })
const Hover = m('Hover', { id: S.NullOr(S.String) })
const Open = m('Open', { id: S.NullOr(S.String) })
const Collapse = m('Collapse')
const Message = S.Union([Toggle, Navigate, Hover, Open, Collapse])
type Message = typeof Message.Type
type Model = Readonly<{
  expanded: boolean
  active: string
  collapsed: boolean
  hovered: string | null
  open: string | null
}>

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, ReadonlyArray<never>]>(),
    M.tagsExhaustive({
      Toggle: () => [{ ...model, expanded: !model.expanded }, []],
      Navigate: ({ id }) => [{ ...model, active: id }, []],
      Hover: ({ id }) => [{ ...model, hovered: id }, []],
      Open: ({ id }) => [{ ...model, open: id }, []],
      Collapse: () => [{ ...model, collapsed: !model.collapsed }, []],
    }),
  )

const view = (model: Model, h: HtmlBuilder<Message>) => {
  return h.div(
    [],
    [
      Sidebar.desktop<Message>(
        {
          brand: { name: 'App' },
          activeItemId: model.active,
          expandedItemIds: model.expanded ? ['components'] : [],
          onToggleItem: () => Toggle(),
          ...(model.hovered !== null ? { hoveredItemId: model.hovered } : {}),
          ...(model.open !== null ? { openItemId: model.open } : {}),
          onHoverItem: id => Hover({ id: id ?? null }),
          onOpenItem: id => Open({ id: id ?? null }),
          onToggleSidebar: Collapse(),
          groups: [
            {
              label: 'Main',
              items: [
                {
                  id: 'components',
                  label: 'Components',
                  icon: Icon.folder,
                  children: [
                    {
                      id: 'layout',
                      label: 'Layout',
                      onClick: Navigate({ id: 'layout' }),
                    },
                  ],
                },
              ],
            },
          ],
        },
        { isCollapsed: model.collapsed },
        h,
      ),
      h.span([h.Id('state')], [model.active]),
      h.span([h.Id('open')], [model.open ?? 'none']),
    ],
  )
}

describe('Sidebar scene', () => {
  it('toggles nested items and navigates to a child', () => {
    Scene.scene(
      { update, view },
      Scene.given({
        expanded: false,
        active: 'components',
        collapsed: false,
        hovered: null,
        open: null,
      }),
      Scene.click(Scene.role('button', { name: 'Components' })),
      Scene.click(Scene.role('button', { name: 'Layout' })),
      Scene.expect(Scene.selector('#state')).toHaveText('layout'),
    )
  })

  it('opens a collapsed parent flyout on click', () => {
    Scene.scene(
      { update, view },
      Scene.given({
        expanded: false,
        active: 'components',
        collapsed: true,
        hovered: null,
        open: null,
      }),
      Scene.click(Scene.role('button', { name: 'Components' })),
      Scene.expect(Scene.selector('#open')).toHaveText('components'),
    )
  })
})
