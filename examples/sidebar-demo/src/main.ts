import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { Icon, Sidebar, Text, elAttrs, sxAttrs } from '@foldstryx/foldkit'
import { Mount, type Message as SinkMessage } from '@foldstryx/kitchen-sink'
import { sidebarStyles } from '@foldstryx/styles'
import '@foldstryx/styles/document.global.css'

const Model = S.Struct({
  collapsed: S.Boolean,
  active: S.String,
  expanded: S.Array(S.String),
  hovered: S.NullOr(S.String),
  open: S.NullOr(S.String),
  sink: Mount.Model,
})
type Model = typeof Model.Type
type Message = Readonly<
  | { _tag: 'ToggleSidebar' }
  | { _tag: 'Navigate'; id: string }
  | { _tag: 'ToggleNav'; id: string }
  | { _tag: 'HoverNav'; id: string | undefined }
  | { _tag: 'OpenNav'; id: string | undefined }
  | { _tag: 'Sink'; message: SinkMessage }
>

const init: Runtime.ApplicationInit<Model, Message> = () => {
  const [sink] = Mount.init()
  return [
    {
      collapsed: false,
      active: 'overview',
      expanded: ['components'],
      hovered: null,
      open: null,
      sink,
    },
    [],
  ]
}

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<never>] => {
  if (message._tag === 'ToggleSidebar')
    return [{ ...model, collapsed: !model.collapsed }, []]
  if (message._tag === 'Navigate') return [{ ...model, active: message.id }, []]
  if (message._tag === 'ToggleNav')
    return [
      {
        ...model,
        expanded: model.expanded.includes(message.id)
          ? model.expanded.filter(id => id !== message.id)
          : [...model.expanded, message.id],
      },
      [],
    ]
  if (message._tag === 'HoverNav')
    return [{ ...model, hovered: message.id ?? null }, []]
  if (message._tag === 'OpenNav')
    return [{ ...model, open: message.id ?? null }, []]
  const [sink] = Mount.update(model.sink, message.message)
  return [{ ...model, sink }, []]
}

const view = (model: Model): Readonly<{ title: string; body: Html }> => {
  const h = html<Message>()
  const navIcon = (icon: (config?: Icon.IconConfig) => Html) => icon
  const navigate = (id: string): Message => ({ _tag: 'Navigate', id })
  const groups: ReadonlyArray<Sidebar.SidebarGroupConfig<Message>> = [
    {
      label: 'Main',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: navIcon(Icon.home),
          selectedIcon: navIcon(Icon.homeSolid),
          onClick: navigate('overview'),
        },
        {
          id: 'components',
          label: 'Components',
          icon: navIcon(Icon.folder),
          selectedIcon: navIcon(Icon.folderSolid),
          children: [
            { id: 'layout', label: 'Layout', onClick: navigate('layout') },
            { id: 'forms', label: 'Forms', onClick: navigate('forms') },
            {
              id: 'feedback',
              label: 'Feedback',
              onClick: navigate('feedback'),
            },
          ],
        },
        {
          id: 'playground',
          label: 'Playground',
          icon: navIcon(Icon.terminal),
          onClick: navigate('playground'),
        },
        {
          id: 'history',
          label: 'History',
          icon: navIcon(Icon.clock),
          onClick: navigate('history'),
        },
        {
          id: 'starred',
          label: 'Starred',
          icon: navIcon(Icon.star),
          onClick: navigate('starred'),
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: navIcon(Icon.settings),
          children: [
            {
              id: 'preferences',
              label: 'Preferences',
              onClick: navigate('preferences'),
            },
            {
              id: 'shortcuts',
              label: 'Shortcuts',
              onClick: navigate('shortcuts'),
            },
          ],
        },
      ],
    },
    {
      label: 'Projects',
      items: [
        {
          id: 'design-engineering',
          label: 'Design Engineering',
          icon: navIcon(Icon.folder),
          onClick: navigate('design-engineering'),
        },
        {
          id: 'sales-marketing',
          label: 'Sales & Marketing',
          icon: navIcon(Icon.folder),
          onClick: navigate('sales-marketing'),
        },
        {
          id: 'travel',
          label: 'Travel',
          icon: navIcon(Icon.folder),
          onClick: navigate('travel'),
        },
      ],
    },
  ]
  return {
    title: 'Foldstryx catalog',
    body: h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.shell)), [
      Sidebar.desktop(
        {
          brand: {
            name: 'foldstryx',
            subtitle: 'component catalog',
            icon: Icon.appMark,
          },
          groups,
          activeItemId: model.active,
          expandedItemIds: model.expanded,
          ...(model.hovered !== null ? { hoveredItemId: model.hovered } : {}),
          ...(model.open !== null ? { openItemId: model.open } : {}),
          onToggleItem: (id): Message => ({ _tag: 'ToggleNav', id }),
          onHoverItem: (id): Message => ({ _tag: 'HoverNav', id }),
          onOpenItem: (id): Message => ({ _tag: 'OpenNav', id }),
          onToggleSidebar: { _tag: 'ToggleSidebar' },
          user: { name: 'Foldkit team', detail: 'Design systems' },
        },
        { isCollapsed: model.collapsed },
      ),
      Sidebar.inset({
        isCollapsed: model.collapsed,
        headerChildren: [
          Text.view({ variant: 'sectionTitle', children: 'Kitchen sink' }),
        ],
        children: h.submodel({
          slotId: 'kitchen-sink',
          model: model.sink,
          view: Mount.view,
          toParentMessage: message => ({ _tag: 'Sink', message }),
        }),
      }),
    ]),
  }
}

const application = Runtime.makeApplication({
  Model,
  init,
  update,
  view,
  container: document.getElementById('root'),
})
Runtime.run(application)
