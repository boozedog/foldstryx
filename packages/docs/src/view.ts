import type { Html, HtmlBuilder } from 'foldkit/html'

import { Icon, Sidebar, Text, elAttrs, sxAttrs } from '@foldstryx/foldkit'
import { Mount } from '@foldstryx/kitchen-sink'
import { layoutStyles, sidebarStyles } from '@foldstryx/styles'

import type { Message, Model } from './model.js'
import { type DocsNavItem, navigation } from './navigation.js'
import * as DataPage from './pages/data.js'
import * as FeedbackPage from './pages/feedback.js'
import * as FormsPage from './pages/forms.js'
import * as GettingStartedPage from './pages/getting-started.js'
import * as LayoutPage from './pages/layout.js'
import * as MediaPage from './pages/media.js'
import * as OverviewPage from './pages/overview.js'
import * as PrinciplesPage from './pages/principles.js'
import type { Route } from './routes.js'

const routeTitle = (route: Route): string => {
  switch (route._tag) {
    case 'overview':
      return 'Overview'
    case 'layout':
      return 'Layout'
    case 'forms':
      return 'Forms'
    case 'feedback':
      return 'Feedback'
    case 'data':
      return 'Data display'
    case 'media':
      return 'Media'
    case 'gettingStarted':
      return 'Getting started'
    case 'principles':
      return 'Principles'
    case 'kitchenSink':
      return 'Kitchen sink'
  }
}

const toSidebarItem = (item: DocsNavItem): Sidebar.SidebarNavItem<Message> => ({
  id: item.id,
  label: item.label,
  ...(item.icon !== undefined ? { icon: item.icon } : {}),
  ...(item.selectedIcon !== undefined
    ? { selectedIcon: item.selectedIcon }
    : {}),
  ...(item.route !== undefined
    ? { onClick: { _tag: 'Navigate', route: item.route } }
    : {}),
  ...(item.children !== undefined
    ? { children: item.children.map(toSidebarItem) }
    : {}),
})

const renderRoute = (model: Model, h: HtmlBuilder<Message>): Html => {
  switch (model.route._tag) {
    case 'overview':
    case 'layout':
    case 'forms':
    case 'feedback':
    case 'data':
    case 'media':
    case 'gettingStarted':
    case 'principles': {
      const page = (() => {
        switch (model.route._tag) {
          case 'overview':
            return OverviewPage.view(h)
          case 'layout':
            return LayoutPage.view(h)
          case 'forms':
            return FormsPage.view(h)
          case 'feedback':
            return FeedbackPage.view(h)
          case 'data':
            return DataPage.view(h)
          case 'media':
            return MediaPage.view(h)
          case 'gettingStarted':
            return GettingStartedPage.view(h)
          case 'principles':
            return PrinciplesPage.view(h)
        }
      })()
      return h.div(elAttrs<Message>(sxAttrs(h, layoutStyles.catalogShell)), [
        page,
      ])
    }
    case 'kitchenSink':
      return h.submodel({
        slotId: 'kitchen-sink',
        model: model.sink,
        view: Mount.view,
        toParentMessage: message => ({ _tag: 'Sink', message }),
      })
  }
}

export const view = (
  model: Model,
  h: HtmlBuilder<Message>,
): Readonly<{ title: string; body: Html }> => {
  const groups = navigation.map(group => ({
    label: group.label,
    items: group.items.map(toSidebarItem),
  }))
  return {
    title: `Foldstryx · ${routeTitle(model.route)}`,
    body: h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.shell)), [
      Sidebar.desktop<Message>(
        {
          brand: {
            name: 'foldstryx',
            subtitle: 'documentation',
            icon: Icon.appMark,
          },
          groups,
          activeItemId: model.route._tag,
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
        h,
      ),
      Sidebar.inset<Message>(
        {
          isCollapsed: model.collapsed,
          headerChildren: [
            Text.view(
              {
                variant: 'sectionTitle',
                children: routeTitle(model.route),
              },
              h,
            ),
          ],
          children: renderRoute(model, h),
        },
        h,
      ),
    ]),
  }
}
