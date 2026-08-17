import { Effect, Option, Schema as S } from 'effect'
import { m } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

/** Fired when grid focus mount attaches (fire-and-forget lifecycle ack). */
export const CompletedGridFocus = m('CompletedGridFocus')

export type GridFocusDirection =
  'ArrowRight' | 'ArrowLeft' | 'ArrowDown' | 'ArrowUp' | 'Home' | 'End'

export type GridFocusStepInput = Readonly<{
  columns: number
  cellCount: number
  currentIndex: number
  direction: GridFocusDirection
  ctrlKey?: boolean
  isRtl?: boolean
  isCellFocusable?: (index: number) => boolean
}>

const cellFocusable = (
  index: number,
  isCellFocusable: GridFocusStepInput['isCellFocusable'],
): boolean => (isCellFocusable ? isCellFocusable(index) : true)

/** Find the next focusable cell index moving by `step`, or -1 at boundary. */
export const findFocusableInDirection = (
  cellCount: number,
  startIndex: number,
  step: number,
  isCellFocusable?: (index: number) => boolean,
): number => {
  let index = startIndex
  while (index >= 0 && index < cellCount) {
    if (cellFocusable(index, isCellFocusable)) {
      return index
    }
    index += step
  }
  return -1
}

const mapRtlKey = (
  key: GridFocusDirection,
  isRtl: boolean,
): GridFocusDirection => {
  if (!isRtl) {
    return key
  }
  if (key === 'ArrowLeft') {
    return 'ArrowRight'
  }
  if (key === 'ArrowRight') {
    return 'ArrowLeft'
  }
  return key
}

/**
 * Pure grid focus step — returns the next focusable cell index, or `null` when
 * navigation would cross the grid boundary.
 */
export const gridFocusStep = (input: GridFocusStepInput): number | null => {
  const {
    columns,
    cellCount,
    currentIndex,
    direction,
    ctrlKey = false,
    isRtl = false,
    isCellFocusable,
  } = input

  if (cellCount === 0 || currentIndex < 0 || currentIndex >= cellCount) {
    return null
  }

  const key = mapRtlKey(direction, isRtl)
  const currentRow = Math.floor(currentIndex / columns)
  const totalRows = Math.ceil(cellCount / columns)

  switch (key) {
    case 'ArrowRight': {
      const target = findFocusableInDirection(
        cellCount,
        currentIndex + 1,
        1,
        isCellFocusable,
      )
      return target === -1 ? null : target
    }
    case 'ArrowLeft': {
      const target = findFocusableInDirection(
        cellCount,
        currentIndex - 1,
        -1,
        isCellFocusable,
      )
      return target === -1 ? null : target
    }
    case 'ArrowDown': {
      if (currentRow >= totalRows - 1) {
        return null
      }
      const target = findFocusableInDirection(
        cellCount,
        currentIndex + columns,
        columns,
        isCellFocusable,
      )
      return target === -1 ? null : target
    }
    case 'ArrowUp': {
      if (currentRow <= 0) {
        return null
      }
      const target = findFocusableInDirection(
        cellCount,
        currentIndex - columns,
        -columns,
        isCellFocusable,
      )
      return target === -1 ? null : target
    }
    case 'Home': {
      if (ctrlKey) {
        const target = findFocusableInDirection(
          cellCount,
          0,
          1,
          isCellFocusable,
        )
        return target === -1 ? null : target
      }
      const rowStart = currentRow * columns
      const rowEnd = Math.min(rowStart + columns - 1, cellCount - 1)
      const target = findFocusableInDirection(
        cellCount,
        rowStart,
        1,
        isCellFocusable,
      )
      if (target === -1 || target > rowEnd) {
        return null
      }
      return target
    }
    case 'End': {
      if (ctrlKey) {
        const target = findFocusableInDirection(
          cellCount,
          cellCount - 1,
          -1,
          isCellFocusable,
        )
        return target === -1 ? null : target
      }
      const rowStart = currentRow * columns
      const rowEnd = Math.min(rowStart + columns - 1, cellCount - 1)
      const target = findFocusableInDirection(
        cellCount,
        rowEnd,
        -1,
        isCellFocusable,
      )
      if (target === -1 || target < rowStart) {
        return null
      }
      return target
    }
    default:
      return null
  }
}

export type GridFocusDomOptions = Readonly<{
  columns: number
  cellSelector?: string
  isCellFocusable?: (cell: HTMLElement) => boolean
  getFocusTarget?: (cell: HTMLElement) => HTMLElement | null
  hasRovingTabIndex?: boolean
  isRtl?: boolean
}>

const defaultCellSelector =
  'button:not([disabled]), [tabindex]:not([tabindex="-1"])'

const gridcellSelector = '[role="gridcell"]'

const setTabIndex = (el: HTMLElement, value: 0 | -1): void => {
  if (el.getAttribute('tabindex') !== String(value)) {
    el.setAttribute('tabindex', String(value))
  }
}

const getCells = (
  grid: HTMLElement,
  cellSelector: string,
): ReadonlyArray<HTMLElement> =>
  Array.from(grid.querySelectorAll<HTMLElement>(cellSelector))

const resolveFocusTarget = (
  cell: HTMLElement,
  getFocusTarget?: (cell: HTMLElement) => HTMLElement | null,
): HTMLElement | null => (getFocusTarget ? getFocusTarget(cell) : cell)

const getFocusTargets = (
  grid: HTMLElement,
  options: GridFocusDomOptions,
): ReadonlyArray<HTMLElement> => {
  const cellSelector = options.cellSelector ?? defaultCellSelector
  const isCellFocusable = options.isCellFocusable
  return getCells(grid, cellSelector)
    .filter(cell => (isCellFocusable ? isCellFocusable(cell) : true))
    .map(cell => resolveFocusTarget(cell, options.getFocusTarget))
    .filter((el): el is HTMLElement => el !== null)
}

const syncTabStops = (
  grid: HTMLElement,
  options: GridFocusDomOptions,
): void => {
  const targets = getFocusTargets(grid, options)
  if (targets.length === 0) {
    return
  }
  const current = targets.find(el => el.getAttribute('tabindex') === '0')
  const tabbable = current ?? targets[0]
  for (const el of targets) {
    setTabIndex(el, el === tabbable ? 0 : -1)
  }
}

const focusTarget = (
  grid: HTMLElement,
  target: HTMLElement | null,
  options: GridFocusDomOptions,
): void => {
  if (target === null) {
    return
  }
  if (options.hasRovingTabIndex === true) {
    for (const el of getFocusTargets(grid, options)) {
      setTabIndex(el, el === target ? 0 : -1)
    }
  }
  target.focus()
}

const focusCellAtIndex = (
  grid: HTMLElement,
  index: number,
  options: GridFocusDomOptions,
): void => {
  const cellSelector = options.cellSelector ?? defaultCellSelector
  const cells = getCells(grid, cellSelector)
  const cell = cells[index]
  if (cell === undefined) {
    return
  }
  focusTarget(grid, resolveFocusTarget(cell, options.getFocusTarget), options)
}

const getCurrentIndex = (grid: HTMLElement, cellSelector: string): number => {
  const cells = getCells(grid, cellSelector)
  const active = document.activeElement
  return cells.findIndex(cell => cell === active || cell.contains(active))
}

const domOptionsFromMountArgs = (
  columns: number,
  cellSelector: string | undefined,
  hasRovingTabIndex: boolean | undefined,
  isRtl: boolean | undefined,
): GridFocusDomOptions => {
  const selector = cellSelector ?? defaultCellSelector
  const gridcellMode = selector === gridcellSelector
  return {
    columns,
    cellSelector: selector,
    ...(hasRovingTabIndex !== undefined ? { hasRovingTabIndex } : {}),
    ...(isRtl !== undefined ? { isRtl } : {}),
    ...(gridcellMode
      ? {
          isCellFocusable: cell =>
            cell.querySelector('button:not([disabled])') !== null,
          getFocusTarget: cell => cell.querySelector<HTMLElement>('button'),
        }
      : {}),
  }
}

const isGridFocusDirection = (key: string): key is GridFocusDirection =>
  key === 'ArrowRight' ||
  key === 'ArrowLeft' ||
  key === 'ArrowDown' ||
  key === 'ArrowUp' ||
  key === 'Home' ||
  key === 'End'

const handleGridKeyDownFromKey = (
  grid: HTMLElement,
  event: Readonly<{
    key: string
    ctrlKey?: boolean
    metaKey?: boolean
  }>,
  options: GridFocusDomOptions,
): void => {
  const cellSelector = options.cellSelector ?? defaultCellSelector
  const cells = getCells(grid, cellSelector)
  if (cells.length === 0) {
    return
  }

  const currentIndex = getCurrentIndex(grid, cellSelector)
  if (currentIndex === -1) {
    return
  }

  if (!isGridFocusDirection(event.key)) {
    return
  }

  const isCellFocusableByIndex = (index: number): boolean => {
    const cell = cells[index]
    if (cell === undefined) {
      return false
    }
    return options.isCellFocusable ? options.isCellFocusable(cell) : true
  }

  const direction = event.key

  const nextIndex = gridFocusStep({
    columns: options.columns,
    cellCount: cells.length,
    currentIndex,
    direction,
    ctrlKey: event.ctrlKey === true || event.metaKey === true,
    isRtl: options.isRtl ?? false,
    isCellFocusable: isCellFocusableByIndex,
  })

  if (nextIndex === null) {
    return
  }

  focusCellAtIndex(grid, nextIndex, options)
}

/** Vnode keydown handler for `Grid.matrix` (Scene-testable). */
export const keyDownHandler = (
  config: GridFocusMountConfig,
): ((
  key: string,
  modifiers: Readonly<{
    ctrlKey?: boolean
    metaKey?: boolean
  }>,
) => Option.Option<never>) => {
  const options = domOptionsFromMountArgs(
    config.columns,
    config.cellSelector,
    config.hasRovingTabIndex,
    config.isRtl,
  )
  return (key, modifiers) => {
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      const grid = active.closest('[role="grid"]')
      if (grid instanceof HTMLElement) {
        handleGridKeyDownFromKey(
          grid,
          {
            key,
            ...(modifiers.ctrlKey !== undefined
              ? { ctrlKey: modifiers.ctrlKey }
              : {}),
            ...(modifiers.metaKey !== undefined
              ? { metaKey: modifiers.metaKey }
              : {}),
          },
          options,
        )
      }
    }
    return Option.none()
  }
}

export const mount = Mount.define(
  'GridFocus',
  {
    columns: S.Finite,
    cellSelector: S.optional(S.String),
    hasRovingTabIndex: S.optional(S.Boolean),
    isRtl: S.optional(S.Boolean),
  },
  CompletedGridFocus,
)(({ columns, cellSelector, hasRovingTabIndex, isRtl }) => {
  const options = domOptionsFromMountArgs(
    columns,
    cellSelector,
    hasRovingTabIndex,
    isRtl,
  )

  return element =>
    Effect.gen(function* () {
      if (!(element instanceof HTMLElement)) {
        return CompletedGridFocus()
      }
      const grid = element
      yield* Effect.acquireRelease(
        Effect.sync(() => {
          const onFocus = () => {
            if (options.hasRovingTabIndex === true) {
              syncTabStops(grid, options)
            }
          }
          grid.addEventListener('focusin', onFocus)
          if (options.hasRovingTabIndex === true) {
            syncTabStops(grid, options)
          }
          return () => {
            grid.removeEventListener('focusin', onFocus)
          }
        }),
        cleanup => Effect.sync(cleanup),
      )
      return CompletedGridFocus()
    })
})

export type GridFocusMountConfig = Readonly<{
  columns: number
  cellSelector?: string
  hasRovingTabIndex?: boolean
  isRtl?: boolean
}>

export const mountFromConfig = (config: GridFocusMountConfig) =>
  mount({
    columns: config.columns,
    ...(config.cellSelector !== undefined
      ? { cellSelector: config.cellSelector }
      : {}),
    ...(config.hasRovingTabIndex !== undefined
      ? { hasRovingTabIndex: config.hasRovingTabIndex }
      : {}),
    ...(config.isRtl !== undefined ? { isRtl: config.isRtl } : {}),
  })
