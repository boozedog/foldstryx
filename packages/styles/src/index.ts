import { colorVars, typographyVars } from '@foldstryx/tokens/index.stylex.ts'
import * as stylex from '@stylexjs/stylex'

export { buttonStyles } from './button.stylex.js'
export { cardStyles } from './card.stylex.js'
export { layoutStyles } from './layout.stylex.js'
export { sidebarStyles } from './sidebar.stylex.js'
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
