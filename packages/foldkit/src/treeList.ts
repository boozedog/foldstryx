import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { treeListDynamicStyles, treeListStyles } from '@foldstryx/styles'

import * as Icon from './icon.js'
import { elAttrs, sxAttrs } from './sx.js'

export type TreeListItem<Id extends string = string> = Readonly<{
  id: Id
  label: string
  children?: ReadonlyArray<TreeListItem<Id>>
  start?: Html
  end?: Html
}>

export type TreeListViewConfig<Id extends string, ParentMessage> = Readonly<{
  items: ReadonlyArray<TreeListItem<Id>>
  expandedIds: ReadonlySet<Id>
  selectedId?: Id
  focusedId?: Id
  ariaLabel?: string
  onToggle: (id: Id) => ParentMessage
  onSelect: (id: Id) => ParentMessage
  onFocus: (id: Id) => ParentMessage
  onKeyDown?: (key: string) => ParentMessage | undefined
}>

type VisibleRow<Id extends string> = Readonly<{
  id: Id
  label: string
  level: number
  hasChildren: boolean
  isExpanded: boolean
  start?: Html
  end?: Html
}>

type TreeListKeyHandlers<Id extends string, ParentMessage> = Readonly<{
  onToggle: (id: Id) => ParentMessage
  onSelect: (id: Id) => ParentMessage
  onFocus: (id: Id) => ParentMessage
}>

const flattenVisible = <Id extends string>(
  items: ReadonlyArray<TreeListItem<Id>>,
  expandedIds: ReadonlySet<Id>,
  level = 0,
): ReadonlyArray<VisibleRow<Id>> => {
  const rows: Array<VisibleRow<Id>> = []
  for (const item of items) {
    const hasChildren = item.children !== undefined && item.children.length > 0
    const isExpanded = hasChildren && expandedIds.has(item.id)
    rows.push({
      id: item.id,
      label: item.label,
      level,
      hasChildren,
      isExpanded,
      ...(item.start !== undefined ? { start: item.start } : {}),
      ...(item.end !== undefined ? { end: item.end } : {}),
    })
    if (isExpanded && item.children !== undefined) {
      rows.push(...flattenVisible(item.children, expandedIds, level + 1))
    }
  }
  return rows
}

const rowIndex = <Id extends string>(
  rows: ReadonlyArray<VisibleRow<Id>>,
  id: Id | undefined,
): number => (id === undefined ? -1 : rows.findIndex(row => row.id === id))

const parentRowIndex = <Id extends string>(
  rows: ReadonlyArray<VisibleRow<Id>>,
  currentIndex: number,
  currentLevel: number,
): number => {
  for (let i = currentIndex - 1; i >= 0; i -= 1) {
    const candidate = rows[i]
    if (candidate !== undefined && candidate.level < currentLevel) {
      return i
    }
  }
  return -1
}

export type TreeListKeyStep<Id extends string, ParentMessage> = Readonly<{
  message: ParentMessage
  focusId?: Id
}>

const focusStep = <Id extends string, ParentMessage>(
  rows: ReadonlyArray<VisibleRow<Id>>,
  index: number,
  onFocus: (id: Id) => ParentMessage,
): TreeListKeyStep<Id, ParentMessage> | undefined => {
  const row = rows[index]
  return row === undefined
    ? undefined
    : { message: onFocus(row.id), focusId: row.id }
}

/** Stable DOM id for roving treeitem focus. */
export const treeListItemDomId = <Id extends string>(id: Id): string =>
  `foldstryx-treeitem-${id}`

/** Pure APG tree keyboard step for parent-owned TreeList state. */
export const treeListKeyDown = <Id extends string, ParentMessage>(
  rows: ReadonlyArray<VisibleRow<Id>>,
  focusedIndex: number,
  key: string,
  handlers: TreeListKeyHandlers<Id, ParentMessage>,
): TreeListKeyStep<Id, ParentMessage> | undefined => {
  if (rows.length === 0) return undefined
  const currentIndex = focusedIndex >= 0 ? focusedIndex : 0
  const current = rows[currentIndex]
  if (current === undefined) return undefined

  switch (key) {
    case 'ArrowDown':
      return focusStep(
        rows,
        Math.min(currentIndex + 1, rows.length - 1),
        handlers.onFocus,
      )
    case 'ArrowUp':
      return focusStep(rows, Math.max(currentIndex - 1, 0), handlers.onFocus)
    case 'ArrowRight':
      if (current.hasChildren && !current.isExpanded) {
        return { message: handlers.onToggle(current.id) }
      }
      if (current.hasChildren && current.isExpanded) {
        return focusStep(rows, currentIndex + 1, handlers.onFocus)
      }
      return undefined
    case 'ArrowLeft':
      if (current.hasChildren && current.isExpanded) {
        return { message: handlers.onToggle(current.id) }
      }
      if (current.level > 0) {
        const parentIndex = parentRowIndex(rows, currentIndex, current.level)
        return focusStep(rows, parentIndex, handlers.onFocus)
      }
      return undefined
    case 'Home':
      return focusStep(rows, 0, handlers.onFocus)
    case 'End':
      return focusStep(rows, rows.length - 1, handlers.onFocus)
    case 'Enter':
    case ' ':
      return { message: handlers.onSelect(current.id) }
    default:
      return undefined
  }
}

const renderTreeItem = <Id extends string, ParentMessage>(
  item: TreeListItem<Id>,
  config: TreeListViewConfig<Id, ParentMessage>,
  selectedId: Id | undefined,
  level: number,
  h: HtmlBuilder<ParentMessage>,
  renderChildren: (
    items: ReadonlyArray<TreeListItem<Id>>,
    level: number,
  ) => ReadonlyArray<Html>,
): Html => {
  const hasChildren = item.children !== undefined && item.children.length > 0
  const isExpanded = hasChildren && config.expandedIds.has(item.id)
  const isSelected = selectedId === item.id
  const isFocused = config.focusedId === item.id
  const tabIndex = isFocused ? 0 : -1

  return h.li(
    elAttrs<ParentMessage>(
      sxAttrs(h, treeListStyles.item),
      h.Id(treeListItemDomId(item.id)),
      h.Role('treeitem'),
      ...(hasChildren ? [h.AriaExpanded(isExpanded)] : []),
      h.AriaSelected(isSelected),
      h.Tabindex(tabIndex),
      h.OnFocus(config.onFocus(item.id)),
    ),
    [
      h.div(
        elAttrs<ParentMessage>(
          sxAttrs(
            h,
            treeListStyles.row,
            treeListDynamicStyles.indent(level),
            treeListStyles.rowInteractive,
            isSelected ? treeListStyles.rowSelected : undefined,
            isFocused ? treeListStyles.rowFocused : undefined,
          ),
        ),
        [
          ...(hasChildren
            ? [
                h.button(
                  elAttrs<ParentMessage>(
                    sxAttrs(
                      h,
                      treeListStyles.chevronButton,
                      isExpanded ? treeListStyles.chevronExpanded : undefined,
                    ),
                    h.Type('button'),
                    h.Tabindex(-1),
                    h.AriaLabel(isExpanded ? 'Collapse' : 'Expand'),
                    h.OnClick(config.onToggle(item.id)),
                  ),
                  [Icon.chevronRight({ size: 16 })],
                ),
              ]
            : [h.span(elAttrs<ParentMessage>([]))]),
          ...(item.start !== undefined ? [item.start] : []),
          h.span(
            elAttrs<ParentMessage>(
              sxAttrs(h, treeListStyles.label),
              h.OnClick(config.onSelect(item.id)),
            ),
            [item.label],
          ),
          ...(item.end !== undefined ? [item.end] : []),
        ],
      ),
      ...(hasChildren && isExpanded && item.children !== undefined
        ? [
            h.ul(
              elAttrs<ParentMessage>(
                sxAttrs(h, treeListStyles.group),
                h.Role('group'),
              ),
              renderChildren(item.children, level + 1),
            ),
          ]
        : []),
    ],
  )
}

const renderTreeRows = <Id extends string, ParentMessage>(
  items: ReadonlyArray<TreeListItem<Id>>,
  config: TreeListViewConfig<Id, ParentMessage>,
  selectedId: Id | undefined,
  level: number,
  h: HtmlBuilder<ParentMessage>,
): ReadonlyArray<Html> => {
  const renderChildren = (
    childItems: ReadonlyArray<TreeListItem<Id>>,
    childLevel: number,
  ): ReadonlyArray<Html> =>
    renderTreeRows(childItems, config, selectedId, childLevel, h)

  return items.map(item =>
    renderTreeItem(item, config, selectedId, level, h, renderChildren),
  )
}

/** Parent-owned tree view with APG tree roles and keyboard navigation. */
export const view = <Id extends string, ParentMessage>(
  config: TreeListViewConfig<Id, ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const rows = flattenVisible(config.items, config.expandedIds)
  const focusedIndex = rowIndex(rows, config.focusedId)
  const handlers: TreeListKeyHandlers<Id, ParentMessage> = {
    onToggle: config.onToggle,
    onSelect: config.onSelect,
    onFocus: config.onFocus,
  }

  const keyStep = (
    key: string,
  ): TreeListKeyStep<Id, ParentMessage> | undefined => {
    if (config.onKeyDown !== undefined) {
      const custom = config.onKeyDown(key)
      if (custom !== undefined) {
        return { message: custom }
      }
    }
    return treeListKeyDown(rows, focusedIndex, key, handlers)
  }

  const focusTargetId = (step: TreeListKeyStep<Id, ParentMessage>) =>
    step.focusId ?? (focusedIndex >= 0 ? rows[focusedIndex]?.id : rows[0]?.id)

  return h.div(elAttrs<ParentMessage>(sxAttrs(h, treeListStyles.root)), [
    h.ul(
      elAttrs<ParentMessage>(
        sxAttrs(h, treeListStyles.tree),
        h.Role('tree'),
        ...(config.ariaLabel !== undefined
          ? [h.AriaLabel(config.ariaLabel)]
          : []),
        h.OnKeyDownFocus((key, _modifiers) => {
          const step = keyStep(key)
          if (step === undefined) return Option.none()
          const focusId = focusTargetId(step)
          if (focusId === undefined) return Option.none()
          return Option.some({
            focusSelector: `#${treeListItemDomId(focusId)}`,
            message: step.message,
          })
        }),
      ),
      renderTreeRows(config.items, config, config.selectedId, 0, h),
    ),
  ])
}
