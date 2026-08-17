/** Pure table selection helpers (Astryx `useTableSelectionState` semantics). */

export type TableSelectionItem = Readonly<{
  id: string
  isSelectable?: boolean
  isEnabled?: boolean
}>

const stableTrue = (): boolean => true

const actionableIds = (
  items: ReadonlyArray<TableSelectionItem>,
): ReadonlySet<string> => {
  const ids = new Set<string>()
  for (const item of items) {
    const selectable = item.isSelectable ?? true
    const enabled = item.isEnabled ?? true
    if (selectable && enabled) {
      ids.add(item.id)
    }
  }
  return ids
}

const frozenSelectedIds = (
  selectedIds: ReadonlySet<string>,
  actionable: ReadonlySet<string>,
): ReadonlySet<string> => {
  const frozen = new Set<string>()
  for (const id of selectedIds) {
    if (!actionable.has(id)) {
      frozen.add(id)
    }
  }
  return frozen
}

/** Whether every actionable row is selected (false when none are actionable). */
export const getIsAllSelected = (
  items: ReadonlyArray<TableSelectionItem>,
  selectedIds: ReadonlySet<string>,
): boolean => {
  const actionable = actionableIds(items)
  if (actionable.size === 0) {
    return false
  }
  for (const id of actionable) {
    if (!selectedIds.has(id)) {
      return false
    }
  }
  return true
}

/** Whether some but not all actionable rows are selected. */
export const getIsIndeterminate = (
  items: ReadonlyArray<TableSelectionItem>,
  selectedIds: ReadonlySet<string>,
): boolean => {
  const actionable = actionableIds(items)
  if (actionable.size === 0) {
    return false
  }
  let selectedActionable = 0
  for (const item of items) {
    const selectable = item.isSelectable ?? true
    const enabled = item.isEnabled ?? true
    if (selectable && enabled && selectedIds.has(item.id)) {
      selectedActionable += 1
    }
  }
  return selectedActionable > 0 && selectedActionable < actionable.size
}

/** Select all actionable rows, preserving frozen (disabled-but-selected) IDs. */
export const selectAll = (
  items: ReadonlyArray<TableSelectionItem>,
  selectedIds: ReadonlySet<string>,
): ReadonlySet<string> => {
  const actionable = actionableIds(items)
  const frozen = frozenSelectedIds(selectedIds, actionable)
  return new Set([...frozen, ...actionable])
}

/** Deselect actionable rows, preserving frozen IDs. */
export const deselectAll = (
  items: ReadonlyArray<TableSelectionItem>,
  selectedIds: ReadonlySet<string>,
): ReadonlySet<string> => {
  const actionable = actionableIds(items)
  return frozenSelectedIds(selectedIds, actionable)
}

/** Toggle a single row's selection membership. */
export const toggleItem = (
  selectedIds: ReadonlySet<string>,
  id: string,
  isSelected: boolean,
): ReadonlySet<string> => {
  const next = new Set(selectedIds)
  if (isSelected) {
    next.add(id)
  } else {
    next.delete(id)
  }
  return next
}

export const tableSelectionDefaults = {
  getIsItemSelectable: stableTrue,
  getIsItemEnabled: stableTrue,
}
