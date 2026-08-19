/* oxlint-disable typescript/consistent-type-assertions */
import type * as stylex from '@stylexjs/stylex'

const make = new Proxy(
  {},
  {
    get: (_target, key) => ({
      $$css: true,
      [String(key)]: `sx-${String(key)}`,
    }),
  },
) as unknown as Record<string, stylex.StyleXStyles>
export const avatarStyles = make
export const buttonStyles = make
export const gridStyles = make
export const gridDynamicStyles = {
  templateColumns: (_value: string) => ({
    $$css: true,
    dynamicTemplateColumns: 'sx-dynamicTemplateColumns',
  }),
}
export const layoutStyles = make
export const layoutDynamicStyles = {
  contextMenuOffset: (_x: number, _y: number) => ({
    $$css: true,
    contextMenuOffset: 'sx-contextMenuOffset',
  }),
}
export const pageStyles = make
export const cardStyles = make
export const badgeStyles = make
export const alertStyles = make
export const tooltipStyles = make
export const inputStyles = { input: make['input'] }
export const inputWrapperStyles = make
export const selectorStyles = make
export const formDensityStyles = make
export const fieldStyles = make
export const checkboxStyles = make
export const switchStyles = make
export const separatorStyles = make
export const sidebarStyles = make
export const tableStyles = make
export const dialogStyles = make
export const tabsStyles = make
export const dropdownMenuStyles = make
export const toastStyles = make
export const toggleButtonStyles = make
export const toggleButtonGroupStyles = make
export const progressBarDynamicStyles = {
  fillWidth: (_percentage: number) => ({
    $$css: true,
    fillWidth: 'sx-fillWidth',
  }),
}
export const progressBarStyles = make
export const skeletonStyles = make
export const skeletonDynamicStyles = {
  animationDelay: (_index: number) => ({
    $$css: true,
    animationDelay: 'sx-animationDelay',
  }),
  dimensions: (_width: number | string, _height: number | string) => ({
    $$css: true,
    dimensions: 'sx-dimensions',
  }),
}
export const spinnerStyles = make
export const textareaStyles = make
export const numberInputStyles = make
export const typeaheadStyles = make
export const calendarStyles = make
export const dateInputStyles = make
export const treeListStyles = make
export const treeListDynamicStyles = {
  indent: (_level: number) => ({
    $$css: true,
    indent: 'sx-indent',
  }),
}
