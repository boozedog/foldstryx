import { Array } from 'effect'
import { Option } from 'effect'
import { Command } from 'foldkit'
import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'
import type { Reflect2, View } from 'foldkit/submodel'

import { Tabs as UiTabs } from '@foldkit/ui'
import type {
  Message,
  Model,
  OutMessage,
  Message as TabsMessage,
  ViewInputs,
} from '@foldkit/ui/tabs'
import { tabsStyles } from '@foldstryx/styles'

import { elAttrs, sxAttrs } from './sx.js'

export { init, Model, Message } from '@foldkit/ui/tabs'

export type TabsStyledConfig<Value extends string> = Readonly<{
  tabs: ReadonlyArray<Value>
  ariaLabel: string
  renderPanel: (value: Value) => Html
  isTabDisabled?: (value: Value, index: number) => boolean
  orientation?: 'Horizontal' | 'Vertical'
}>

/** Pairs Tabs.create with Astryx-styled view inputs. */
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
  selectTab: (
    model: Model,
    value: Value,
    index: number,
  ) => readonly [
    Model,
    ReadonlyArray<Command.Command<Message>>,
    Option.Option<OutMessage<Value>>,
  ]
  reflectSelectedTab: Reflect2<Model, Value, ReadonlyArray<Value>>
  styledViewInputs: (config: TabsStyledConfig<Value>) => ViewInputs<Value>
}> => {
  const Ui = UiTabs.create<Value>()

  const styledViewInputs = (
    config: TabsStyledConfig<Value>,
  ): ViewInputs<Value> => ({
    tabs: config.tabs,
    ariaLabel: config.ariaLabel,
    ...(config.isTabDisabled !== undefined
      ? { isTabDisabled: config.isTabDisabled }
      : {}),
    ...(config.orientation !== undefined
      ? { orientation: config.orientation }
      : {}),
    toView: ({ tablist, tabs, activeIndex }) => {
      const h = html<TabsMessage>()

      return h.div(elAttrs<TabsMessage>(sxAttrs(h, tabsStyles.root)), [
        h.div(
          elAttrs<TabsMessage>(tablist, sxAttrs(h, tabsStyles.list)),
          tabs.map(tab =>
            h.button(
              elAttrs<TabsMessage>(
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
              elAttrs<TabsMessage>(tab.panel, sxAttrs(h, tabsStyles.content)),
              [config.renderPanel(tab.value)],
            ),
        ),
      ])
    },
  })

  return {
    view: Ui.view,
    update: Ui.update,
    selectTab: Ui.selectTab,
    reflectSelectedTab: Ui.reflectSelectedTab,
    styledViewInputs,
  }
}
