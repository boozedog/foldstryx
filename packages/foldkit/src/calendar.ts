import type { Html, HtmlBuilder } from 'foldkit/html'

import type { CalendarAttributes } from '@foldkit/ui/calendar'
import { calendarStyles } from '@foldstryx/styles'

import * as Icon from './icon.js'
import { elAttrs, sxAttrs } from './sx.js'

const renderDays = <ParentMessage>(
  attrs: Extract<CalendarAttributes, { _tag: 'Days' }>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.div(elAttrs<ParentMessage>(attrs.root, sxAttrs(h, calendarStyles.root)), [
    h.div(elAttrs<ParentMessage>(sxAttrs(h, calendarStyles.header)), [
      h.button(
        elAttrs<ParentMessage>(
          attrs.previousMonthButton,
          sxAttrs(h, calendarStyles.navButton),
        ),
        [Icon.chevronLeft({ size: 16 })],
      ),
      h.button(
        elAttrs<ParentMessage>(
          attrs.headingButton,
          sxAttrs(h, calendarStyles.headingButton),
        ),
        [attrs.heading.text],
      ),
      h.button(
        elAttrs<ParentMessage>(
          attrs.nextMonthButton,
          sxAttrs(h, calendarStyles.navButton),
        ),
        [Icon.chevronRight({ size: 16 })],
      ),
    ]),
    h.div(elAttrs<ParentMessage>(attrs.grid, sxAttrs(h, calendarStyles.grid)), [
      h.div(
        elAttrs<ParentMessage>(
          attrs.headerRow,
          sxAttrs(h, calendarStyles.headerRow),
        ),
        attrs.columnHeaders.map(header =>
          h.div(
            elAttrs<ParentMessage>(
              header.attributes,
              sxAttrs(h, calendarStyles.dayName),
            ),
            [header.name],
          ),
        ),
      ),
      ...attrs.weeks.map(week =>
        h.div(
          elAttrs<ParentMessage>(
            week.attributes,
            sxAttrs(h, calendarStyles.weekRow),
          ),
          week.cells.map(cell =>
            h.div(
              elAttrs<ParentMessage>(
                cell.cellAttributes,
                sxAttrs(h, calendarStyles.dayCell),
              ),
              [
                h.button(
                  elAttrs<ParentMessage>(
                    cell.buttonAttributes,
                    sxAttrs(
                      h,
                      calendarStyles.dayButton,
                      !cell.isInViewMonth
                        ? calendarStyles.dayOutside
                        : undefined,
                      cell.isToday ? calendarStyles.dayToday : undefined,
                      cell.isSelected ? calendarStyles.daySelected : undefined,
                      cell.isDisabled ? calendarStyles.dayDisabled : undefined,
                    ),
                  ),
                  [cell.label],
                ),
              ],
            ),
          ),
        ),
      ),
    ]),
  ])

const renderMonths = <ParentMessage>(
  attrs: Extract<CalendarAttributes, { _tag: 'Months' }>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.div(elAttrs<ParentMessage>(attrs.root, sxAttrs(h, calendarStyles.root)), [
    h.button(
      elAttrs<ParentMessage>(
        attrs.headingButton,
        sxAttrs(h, calendarStyles.headingButton),
      ),
      [attrs.heading.text],
    ),
    h.div(
      elAttrs<ParentMessage>(attrs.grid, sxAttrs(h, calendarStyles.pickerGrid)),
      attrs.cells.map(cell =>
        h.button(
          elAttrs<ParentMessage>(
            cell.buttonAttributes,
            sxAttrs(
              h,
              calendarStyles.dayButton,
              cell.isSelected ? calendarStyles.daySelected : undefined,
              cell.isDisabled ? calendarStyles.dayDisabled : undefined,
            ),
          ),
          [cell.shortLabel],
        ),
      ),
    ),
  ])

const renderYears = <ParentMessage>(
  attrs: Extract<CalendarAttributes, { _tag: 'Years' }>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.div(elAttrs<ParentMessage>(attrs.root, sxAttrs(h, calendarStyles.root)), [
    h.div(elAttrs<ParentMessage>(sxAttrs(h, calendarStyles.header)), [
      h.button(
        elAttrs<ParentMessage>(
          attrs.previousPageButton,
          sxAttrs(h, calendarStyles.navButton),
        ),
        [Icon.chevronLeft({ size: 16 })],
      ),
      h.span(elAttrs<ParentMessage>(sxAttrs(h, calendarStyles.headingButton)), [
        attrs.heading.text,
      ]),
      h.button(
        elAttrs<ParentMessage>(
          attrs.nextPageButton,
          sxAttrs(h, calendarStyles.navButton),
        ),
        [Icon.chevronRight({ size: 16 })],
      ),
    ]),
    h.div(
      elAttrs<ParentMessage>(attrs.grid, sxAttrs(h, calendarStyles.pickerGrid)),
      attrs.cells.map(cell =>
        h.button(
          elAttrs<ParentMessage>(
            cell.buttonAttributes,
            sxAttrs(
              h,
              calendarStyles.dayButton,
              cell.isSelected ? calendarStyles.daySelected : undefined,
              cell.isDisabled ? calendarStyles.dayDisabled : undefined,
            ),
          ),
          [cell.label],
        ),
      ),
    ),
  ])

/** Renders styled Foldkit Calendar attribute bundles. */
export const toView = <ParentMessage>(
  attributes: CalendarAttributes,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  switch (attributes._tag) {
    case 'Days':
      return renderDays(attributes, h)
    case 'Months':
      return renderMonths(attributes, h)
    case 'Years':
      return renderYears(attributes, h)
  }
}

export {
  init,
  update,
  view,
  focusDate,
  reflectMinDate,
  reflectMaxDate,
  reflectDisabledDates,
  reflectDisabledDaysOfWeek,
  selectDate,
  Model,
  Message,
} from '@foldkit/ui/calendar'
