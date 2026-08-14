import { colorVars, typographyVars } from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export { avatarStyles } from './avatar.stylex.js'
export { buttonStyles } from './button.stylex.js'
export { cardStyles } from './card.stylex.js'
export { gridStyles } from './grid.stylex.js'
export { layoutStyles } from './layout.stylex.js'
export { pageStyles } from './page.stylex.js'
export { sidebarStyles } from './sidebar.stylex.js'
export { badgeStyles } from './badge.stylex.js'
export { alertStyles } from './alert.stylex.js'
export { tooltipStyles } from './tooltip.stylex.js'
export { tableStyles } from './table.stylex.js'
export { dialogStyles } from './dialog.stylex.js'
export { tabsStyles } from './tabs.stylex.js'
export { dropdownMenuStyles } from './dropdownMenu.stylex.js'
export { toastStyles } from './toast.stylex.js'
export {
  checkboxStyles,
  fieldStyles,
  formDensityStyles,
  inputStyles,
  separatorStyles,
  switchStyles,
} from './form.stylex.js'

/** Document-level styles shared by Foldstryx consumers. */
export const documentStyles = stylex.create({
  root: {
    backgroundColor: colorVars['--color-background-body'],
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
  },
})
