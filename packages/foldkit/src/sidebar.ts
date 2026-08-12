import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

import { sidebarStyles } from '@foldstryx/styles'

import * as Icon from './icon.js'
import { elAttrs, sxAttrs } from './sx.js'

export type SidebarNavItem<Message> = Readonly<{
  id: string
  label: string
  icon?: (config?: Icon.IconConfig) => Html
  selectedIcon?: (config?: Icon.IconConfig) => Html
  onClick?: Message
  children?: ReadonlyArray<SidebarNavItem<Message>>
  trailing?: string
}>

export type SidebarGroupConfig<Message> = Readonly<{
  label: string
  items: ReadonlyArray<SidebarNavItem<Message>>
}>

export type SidebarBrandConfig = Readonly<{
  name: string
  subtitle?: string
  icon?: (config?: Icon.IconConfig) => Html
}>

export type SidebarUserConfig = Readonly<{
  name: string
  detail?: string
}>

export type SidebarNavConfig<Message> = Readonly<{
  brand: SidebarBrandConfig
  groups: ReadonlyArray<SidebarGroupConfig<Message>>
  activeItemId?: string
  expandedItemIds?: ReadonlyArray<string>
  onToggleItem?: (id: string) => Message
  hoveredItemId?: string
  onHoverItem?: (id: string | undefined) => Message
  openItemId?: string
  onOpenItem?: (id: string | undefined) => Message
  onToggleSidebar?: Message
  user?: SidebarUserConfig
}>

export type SidebarInsetConfig<_Message = never> = Readonly<{
  headerChildren: ReadonlyArray<Html | string>
  children: Html
  isCollapsed?: boolean
}>

const iconSlot = <Message>(
  item: SidebarNavItem<Message>,
  selected: boolean,
): ReadonlyArray<Html> => {
  const icon =
    selected && item.selectedIcon !== undefined ? item.selectedIcon : item.icon
  if (icon === undefined) return []
  const h = html<Message>()
  return [
    h.span(
      elAttrs<Message>(
        sxAttrs(
          h,
          sidebarStyles.icon,
          selected ? sidebarStyles.iconSelected : undefined,
        ),
      ),
      [icon({ size: 16 })],
    ),
  ]
}

const itemContent = <Message>(
  item: SidebarNavItem<Message>,
  selected: boolean,
  collapsed: boolean,
): ReadonlyArray<Html> => {
  const h = html<Message>()
  return [
    ...iconSlot<Message>(item, selected),
    ...(collapsed
      ? []
      : [
          h.span(elAttrs<Message>(sxAttrs(h, sidebarStyles.itemLabel)), [
            item.label,
          ]),
        ]),
    ...(item.trailing !== undefined && !collapsed
      ? [
          h.span(elAttrs<Message>(sxAttrs(h, sidebarStyles.itemTrailing)), [
            item.trailing,
          ]),
        ]
      : []),
  ]
}

const expandControl = <Message>(
  item: SidebarNavItem<Message>,
  expanded: boolean,
  childId: string,
  onToggleItem: (id: string) => Message,
): Html => {
  const h = html<Message>()
  return h.button(
    elAttrs<Message>(
      h.AriaLabel(`${expanded ? 'Collapse' : 'Expand'} ${item.label}`),
      h.AriaExpanded(expanded),
      h.AriaControls(childId),
      h.OnClick(onToggleItem(item.id)),
      sxAttrs(h, sidebarStyles.expandButton),
    ),
    [
      h.span(
        elAttrs<Message>(
          sxAttrs(
            h,
            sidebarStyles.itemExpandIcon,
            expanded ? undefined : sidebarStyles.itemExpandIconClosed,
          ),
        ),
        [Icon.chevronDown({})],
      ),
    ],
  )
}

const chevron = <Message>(expanded: boolean): Html => {
  const h = html<Message>()
  return h.span(
    elAttrs<Message>(
      sxAttrs(
        h,
        sidebarStyles.itemExpandIcon,
        expanded ? undefined : sidebarStyles.itemExpandIconClosed,
      ),
    ),
    [Icon.chevronDown({})],
  )
}

const itemModes = <Message>(
  config: SidebarNavConfig<Message>,
  item: SidebarNavItem<Message>,
  collapsed: boolean,
) => {
  const hasChildren = (item.children ?? []).length > 0
  const canToggle = hasChildren && config.onToggleItem !== undefined
  return {
    hasChildren,
    expanded: config.expandedItemIds?.includes(item.id) === true,
    selected: item.id === config.activeItemId,
    canToggle,
    independentToggle: canToggle && !collapsed && item.onClick !== undefined,
    rowToggle: canToggle && !collapsed && item.onClick === undefined,
    hovered: config.hoveredItemId === item.id,
    open: config.openItemId === item.id,
  }
}

const primaryButton = <Message>(
  config: SidebarNavConfig<Message>,
  item: SidebarNavItem<Message>,
  collapsed: boolean,
  modes: ReturnType<typeof itemModes<Message>>,
): Html => {
  const h = html<Message>()
  const childId = `sidebar-children-${item.id}`
  const content = [
    ...itemContent<Message>(item, modes.selected, collapsed),
    ...(modes.rowToggle ? [chevron<Message>(modes.expanded)] : []),
  ]
  const collapsedParentClick =
    collapsed && modes.hasChildren && config.onOpenItem !== undefined
      ? config.onOpenItem(modes.open ? undefined : item.id)
      : undefined
  return h.button(
    elAttrs<Message>(
      collapsedParentClick !== undefined
        ? h.OnClick(collapsedParentClick)
        : modes.rowToggle
          ? h.OnClick(config.onToggleItem!(item.id))
          : item.onClick !== undefined
            ? h.OnClick(item.onClick)
            : undefined,
      h.Id(`sidebar-item-${item.id}`),
      h.AriaLabel(item.label),
      ...(modes.selected ? [h.AriaCurrent('page')] : []),
      ...(modes.rowToggle
        ? [h.AriaExpanded(modes.expanded), h.AriaControls(childId)]
        : []),
      ...(collapsed && modes.hasChildren
        ? [h.AriaExpanded(modes.open || modes.hovered), h.AriaHasPopup('true')]
        : []),
      ...(modes.independentToggle
        ? [sxAttrs(h, sidebarStyles.splitAction)]
        : [
            sxAttrs(
              h,
              sidebarStyles.item,
              modes.selected ? sidebarStyles.itemActive : undefined,
              collapsed ? sidebarStyles.itemCollapsed : undefined,
            ),
          ]),
    ),
    content,
  )
}

const itemRow = <Message>(
  config: SidebarNavConfig<Message>,
  item: SidebarNavItem<Message>,
  collapsed: boolean,
  modes: ReturnType<typeof itemModes<Message>>,
): Html => {
  const h = html<Message>()
  const primary = primaryButton(config, item, collapsed, modes)
  if (!modes.independentToggle) return primary
  return h.div(
    elAttrs<Message>(
      sxAttrs(
        h,
        sidebarStyles.item,
        sidebarStyles.itemRow,
        modes.selected ? sidebarStyles.itemActive : undefined,
      ),
    ),
    [
      primary,
      expandControl(
        item,
        modes.expanded,
        `sidebar-children-${item.id}`,
        config.onToggleItem!,
      ),
    ],
  )
}

const childGroup = <Message>(
  item: SidebarNavItem<Message>,
  expanded: boolean,
  childNodes: ReadonlyArray<Html>,
): Html => {
  const h = html<Message>()
  const childId = `sidebar-children-${item.id}`
  const groupId = `sidebar-group-label-${item.id}`
  return h.div(
    elAttrs<Message>(
      h.Id(childId),
      h.Role('group'),
      h.AriaLabelledBy(groupId),
      h.AriaHidden(!expanded),
      sxAttrs(
        h,
        sidebarStyles.children,
        expanded ? undefined : sidebarStyles.childrenCollapsed,
      ),
    ),
    [
      h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.childrenInner)), [
        h.span(
          elAttrs<Message>(
            h.Id(groupId),
            h.AriaHidden(true),
            sxAttrs(h, sidebarStyles.visuallyHidden),
          ),
          [item.label],
        ),
        ...childNodes,
      ]),
    ],
  )
}

const itemFlyout = <Message>(
  config: SidebarNavConfig<Message>,
  item: SidebarNavItem<Message>,
  collapsed: boolean,
  modes: ReturnType<typeof itemModes<Message>>,
): Html | undefined => {
  if (!collapsed || (!modes.hovered && !modes.open)) return undefined
  const h = html<Message>()
  if (modes.hasChildren) {
    return h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.flyout)), [
      h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.flyoutHeader)), [
        item.label,
      ]),
      ...(item.children ?? [])
        .map(child => navItem(config, child, false))
        .filter((node): node is Html => node !== undefined),
    ])
  }
  return h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.tooltip)), [
    item.label,
  ])
}

const navItem = <Message>(
  config: SidebarNavConfig<Message>,
  item: SidebarNavItem<Message>,
  collapsed: boolean,
): Html | undefined => {
  if (collapsed && item.icon === undefined) return undefined

  const h = html<Message>()
  const modes = itemModes(config, item, collapsed)
  const childNodes = modes.hasChildren
    ? (item.children ?? [])
        .map(child => navItem(config, child, collapsed))
        .filter((node): node is Html => node !== undefined)
    : []
  const flyout = itemFlyout(config, item, collapsed, modes)

  return h.div(
    elAttrs<Message>(
      sxAttrs(
        h,
        sidebarStyles.itemRoot,
        collapsed ? sidebarStyles.itemRootCollapsed : undefined,
      ),
      ...(config.onHoverItem !== undefined
        ? [
            h.OnMouseEnter(config.onHoverItem(item.id)),
            h.OnMouseLeave(config.onHoverItem(undefined)),
          ]
        : []),
    ),
    [
      itemRow(config, item, collapsed, modes),
      ...(modes.hasChildren && !collapsed
        ? [childGroup(item, modes.expanded, childNodes)]
        : []),
      ...(flyout !== undefined ? [flyout] : []),
    ],
  )
}

const footerIcons = <Message>(collapsed: boolean): Html => {
  const h = html<Message>()
  return h.div(
    elAttrs<Message>(
      sxAttrs(
        h,
        sidebarStyles.footerIcons,
        collapsed ? sidebarStyles.footerIconsCollapsed : undefined,
      ),
    ),
    [
      h.button(
        elAttrs<Message>(
          h.AriaLabel('Help'),
          h.Title('Help'),
          sxAttrs(h, sidebarStyles.footerIconButton),
        ),
        [Icon.help({})],
      ),
      h.button(
        elAttrs<Message>(
          h.AriaLabel('Notifications'),
          h.Title('Notifications'),
          sxAttrs(h, sidebarStyles.footerIconButton),
        ),
        [Icon.bell({})],
      ),
    ],
  )
}

export const desktop = <Message>(
  config: SidebarNavConfig<Message>,
  options: Readonly<{ isCollapsed?: boolean }> = {},
): Html => {
  const h = html<Message>()
  const collapsed = options.isCollapsed === true
  const brandIcon = config.brand.icon ?? Icon.appMark

  return h.div(
    elAttrs<Message>(
      h.AriaLabel('Sidebar'),
      h.Role('complementary'),
      sxAttrs(
        h,
        sidebarStyles.desktop,
        collapsed ? sidebarStyles.desktopCollapsed : undefined,
      ),
    ),
    [
      h.div(
        elAttrs<Message>(
          sxAttrs(
            h,
            sidebarStyles.brand,
            collapsed ? sidebarStyles.brandCollapsed : undefined,
          ),
        ),
        [
          h.span(elAttrs<Message>(sxAttrs(h, sidebarStyles.icon)), [
            brandIcon({ size: 20 }),
          ]),
          ...(collapsed
            ? []
            : [
                h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.brandText)), [
                  h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.brandName)), [
                    config.brand.name,
                  ]),
                  ...(config.brand.subtitle !== undefined
                    ? [
                        h.div(
                          elAttrs<Message>(
                            sxAttrs(h, sidebarStyles.brandSubtitle),
                          ),
                          [config.brand.subtitle],
                        ),
                      ]
                    : []),
                ]),
              ]),
        ],
      ),
      h.div(
        elAttrs<Message>(
          h.Role('navigation'),
          sxAttrs(
            h,
            sidebarStyles.nav,
            collapsed ? sidebarStyles.navCollapsed : undefined,
          ),
        ),
        config.groups.map(group => {
          const labelId = `sidebar-section-${group.label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`
          return h.div(
            elAttrs<Message>(
              h.Role('group'),
              h.AriaLabelledBy(labelId),
              sxAttrs(h, sidebarStyles.group),
            ),
            [
              h.div(
                elAttrs<Message>(
                  h.Id(labelId),
                  sxAttrs(
                    h,
                    sidebarStyles.groupLabel,
                    collapsed ? sidebarStyles.visuallyHidden : undefined,
                  ),
                ),
                [group.label],
              ),
              h.div(
                elAttrs<Message>(sxAttrs(h, sidebarStyles.groupItems)),
                group.items
                  .map(item => navItem(config, item, collapsed))
                  .filter((node): node is Html => node !== undefined),
              ),
            ],
          )
        }),
      ),
      h.div(
        elAttrs<Message>(
          sxAttrs(
            h,
            sidebarStyles.footer,
            collapsed ? sidebarStyles.footerCollapsed : undefined,
          ),
        ),
        [
          ...(config.user !== undefined && !collapsed
            ? [
                h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.user)), [
                  config.user.name,
                  ...(config.user.detail !== undefined
                    ? [h.br([]), config.user.detail]
                    : []),
                ]),
              ]
            : []),
          footerIcons<Message>(collapsed),
          ...(config.onToggleSidebar !== undefined
            ? [
                h.button(
                  elAttrs<Message>(
                    h.AriaLabel(
                      collapsed ? 'Expand sidebar' : 'Collapse sidebar',
                    ),
                    h.OnClick(config.onToggleSidebar),
                    sxAttrs(h, sidebarStyles.collapseButton),
                  ),
                  [
                    h.span(
                      elAttrs<Message>(
                        sxAttrs(
                          h,
                          sidebarStyles.collapseIcon,
                          collapsed
                            ? sidebarStyles.collapseIconCollapsed
                            : undefined,
                        ),
                      ),
                      [Icon.chevronLeft({})],
                    ),
                  ],
                ),
              ]
            : []),
        ],
      ),
    ],
  )
}

export const inset = <Message>(config: SidebarInsetConfig<Message>): Html => {
  const h = html<Message>()
  return h.main(elAttrs<Message>(sxAttrs(h, sidebarStyles.inset)), [
    h.header(
      elAttrs<Message>(sxAttrs(h, sidebarStyles.insetHeader)),
      config.headerChildren,
    ),
    h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.insetMain)), [
      config.children,
    ]),
  ])
}
