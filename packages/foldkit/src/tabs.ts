import { Array } from 'effect'
import { Option } from 'effect'
import { Command } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { View } from 'foldkit/submodel'

import { Tabs as UiTabs } from '@foldkit/ui'
import type {
  Bundle,
  Message,
  Model,
  OutMessage,
  ViewInputs,
} from '@foldkit/ui/tabs'
import { tabsStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export { init, Model, Message } from '@foldkit/ui/tabs'

export type TabsStyledConfig<Value extends string> = Readonly<{
  /** Parent-owned active tab, read straight from the parent model. */
  selectedValue: Value
  tabs: ReadonlyArray<Value>
  ariaLabel: string
  renderPanel: (value: Value) => Html
  isTabDisabled?: (value: Value, index: number) => boolean
  orientation?: 'Horizontal' | 'Vertical'
}>

/**
 * Pairs `Tabs.create` (parent-owned selection) with Astryx-styled view
 * inputs. The parent stores the `Selected` OutMessage value and passes it
 * back in as `selectedValue`.
 */
export const create = <Value extends string = string>(): Readonly<{
  view: View<Model, Message, ViewInputs<Value>>
  update: (
    model: Model,
    message: Message,
  ) => readonly [
    Model,
    ReadonlyArray<Command.Command<Message>>,
    Option.Option<OutMessage<Value>>,
  ]
  styledViewInputs: <ParentMessage>(
    config: TabsStyledConfig<Value>,
    h: HtmlBuilder<ParentMessage>,
  ) => ViewInputs<Value>
}> => {
  const Ui: Bundle<Value> = UiTabs.create<Value>()

  const styledViewInputs = <ParentMessage>(
    config: TabsStyledConfig<Value>,
    h: HtmlBuilder<ParentMessage>,
  ): ViewInputs<Value> => ({
    selectedValue: config.selectedValue,
    tabs: config.tabs,
    ariaLabel: config.ariaLabel,
    ...(config.isTabDisabled !== undefined
      ? { isTabDisabled: config.isTabDisabled }
      : {}),
    ...(config.orientation !== undefined
      ? { orientation: config.orientation }
      : {}),
    toView: ({ tablist, tabs, activeIndex }) =>
      h.div(elAttrs<ParentMessage>(sxAttrs(h, tabsStyles.root)), [
        h.div(
          elAttrs<ParentMessage>(tablist, sxAttrs(h, tabsStyles.list)),
          tabs.map(tab =>
            h.button(
              elAttrs<ParentMessage>(
                tab.tab,
                sxAttrs(
                  h,
                  tabsStyles.trigger,
                  tab.isActive ? tabsStyles.triggerActive : undefined,
                ),
              ),
              [tab.value],
            ),
          ),
        ),
        ...Array.map(
          Array.filter(tabs, tab => tab.index === activeIndex),
          tab =>
            h.div(
              elAttrs<ParentMessage>(tab.panel, sxAttrs(h, tabsStyles.content)),
              [config.renderPanel(tab.value)],
            ),
        ),
      ]),
  })

  return {
    view: Ui.view,
    update: Ui.update,
    styledViewInputs,
  }
}
