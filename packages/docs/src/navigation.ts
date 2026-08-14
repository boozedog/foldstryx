import type { Html } from 'foldkit/html'

import { Icon } from '@foldstryx/foldkit'

import { Route, type Route as RouteType } from './routes.js'

/**
 * Canonical navigation metadata. This is the single owner of the sidebar
 * structure: ids, labels, icons, and the route each link targets. The view
 * maps these to `Sidebar` configs by attaching `Navigate` messages.
 */
export type DocsNavItem = Readonly<{
  id: string
  label: string
  icon?: (config?: Icon.IconConfig) => Html
  selectedIcon?: (config?: Icon.IconConfig) => Html
  route?: RouteType
  children?: ReadonlyArray<DocsNavItem>
}>

export type DocsNavGroup = Readonly<{
  label: string
  items: ReadonlyArray<DocsNavItem>
}>

export const navigation: ReadonlyArray<DocsNavGroup> = [
  {
    label: 'Docs',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        route: Route.overview,
        icon: Icon.home,
        selectedIcon: Icon.homeSolid,
      },
      {
        id: 'components',
        label: 'Components',
        icon: Icon.folder,
        selectedIcon: Icon.folderSolid,
        children: [
          { id: 'layout', label: 'Layout', route: Route.layout },
          { id: 'forms', label: 'Forms', route: Route.forms },
          { id: 'feedback', label: 'Feedback', route: Route.feedback },
          { id: 'data', label: 'Data display', route: Route.data },
          { id: 'media', label: 'Media', route: Route.media },
        ],
      },
      {
        id: 'kitchenSink',
        label: 'Kitchen sink',
        route: Route.kitchenSink,
        icon: Icon.terminal,
      },
    ],
  },
  {
    label: 'Guides',
    items: [
      {
        id: 'gettingStarted',
        label: 'Getting started',
        route: Route.gettingStarted,
      },
      {
        id: 'principles',
        label: 'Principles',
        route: Route.principles,
      },
    ],
  },
]
