import { Option, Schema as S } from 'effect'
import type { CalendarDate } from 'foldkit/calendar'
import * as Calendar from 'foldkit/calendar'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { DatePicker } from '@foldkit/ui'
import type { ViewInputs } from '@foldkit/ui/datePicker'
import {
  dateInputStyles,
  fieldStyles,
  formDensityStyles,
  inputWrapperStyles,
  selectorStyles,
} from '@foldstryx/styles'
import * as stylex from '@stylexjs/stylex'

import * as CalendarView from './calendar.js'
import type { InputDensity, InputWidth } from './input.js'
import { elAttrs, sxAttrs } from './sx.js'

const decodeIso = S.decodeUnknownSync(Calendar.CalendarDateFromIsoString)
const encodeIso = S.encodeSync(Calendar.CalendarDateFromIsoString)

export const isoFromCalendarDate = (date: CalendarDate): string =>
  encodeIso(date)

export const calendarDateFromIso = (iso: string): CalendarDate => decodeIso(iso)

export const maybeCalendarDateFromIso = (
  iso: string,
): Option.Option<CalendarDate> => {
  try {
    return Option.some(decodeIso(iso))
  } catch {
    return Option.none()
  }
}

const className = (
  ...styles: ReadonlyArray<stylex.StyleXStyles | false | undefined>
): string => {
  const filtered: ReadonlyArray<stylex.StyleXStyles> = styles.filter(
    (style): style is stylex.StyleXStyles => Boolean(style),
  )
  return stylex.props(...filtered).className ?? ''
}

const widthStyle = (width: InputWidth | undefined) => {
  switch (width) {
    case 'auto':
      return formDensityStyles.inputWidthAuto
    case 'sm':
      return formDensityStyles.inputWidthSm
    case 'md':
      return formDensityStyles.inputWidthMd
    case 'full':
      return formDensityStyles.inputWidthFull
    default:
      return undefined
  }
}

export type DateInputStyledConfig = Readonly<{
  maybeIsoDate: Option.Option<string>
  placeholder?: string
  density?: InputDensity
  width?: InputWidth
  isDisabled?: boolean
  isOpen?: boolean
}>

/** Builds styled Foldkit DatePicker view inputs with Astryx DateInput visuals. */
export const styledViewInputs = <ParentMessage>(
  config: DateInputStyledConfig,
  h: HtmlBuilder<ParentMessage>,
): ViewInputs => ({
  anchor: { placement: 'bottom-start', gap: 4, padding: 8 },
  maybeSelectedDate: Option.flatMap(config.maybeIsoDate, iso =>
    maybeCalendarDateFromIso(iso),
  ),
  triggerContent: maybeDate =>
    h.span(
      elAttrs<ParentMessage>(
        sxAttrs(
          h,
          Option.isNone(maybeDate)
            ? dateInputStyles.triggerPlaceholder
            : undefined,
        ),
      ),
      [
        Option.match(maybeDate, {
          onNone: () => config.placeholder ?? 'Select date…',
          onSome: date =>
            Calendar.formatShort(date, Calendar.defaultEnglishLocale),
        }),
      ],
    ),
  toCalendarView: attributes => CalendarView.toView(attributes, h),
  triggerClassName: className(
    inputWrapperStyles.base,
    selectorStyles.trigger,
    densityStyle(config.density),
    widthStyle(config.width),
    config.isDisabled === true ? inputWrapperStyles.disabled : undefined,
  ),
  panelClassName: className(selectorStyles.dropdown, selectorStyles.popover),
  backdropClassName: className(selectorStyles.backdrop),
  ...(config.isDisabled === true ? { isDisabled: true } : {}),
})

const densityStyle = (density: InputDensity | undefined) => {
  switch (density) {
    case 'compact':
      return formDensityStyles.inputCompact
    default:
      return undefined
  }
}

/** Labeled field chrome around a date picker submodel slot. */
export const labeledField = <ParentMessage>(
  config: Readonly<{
    id: string
    label: string
    description?: string
    error?: string
    children: ReadonlyArray<Html>
  }>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.div(elAttrs<ParentMessage>(sxAttrs(h, fieldStyles.field)), [
    h.label(
      elAttrs<ParentMessage>(
        sxAttrs(h, fieldStyles.label),
        h.For(DatePicker.triggerId(config.id)),
      ),
      [config.label],
    ),
    ...config.children,
    ...(config.description
      ? [
          h.p(elAttrs<ParentMessage>(sxAttrs(h, fieldStyles.description)), [
            config.description,
          ]),
        ]
      : []),
    ...(config.error
      ? [
          h.p(elAttrs<ParentMessage>(sxAttrs(h, fieldStyles.error)), [
            config.error,
          ]),
        ]
      : []),
  ])

export const init = DatePicker.init

export const update = DatePicker.update

export const view = DatePicker.view

export {
  clear,
  close,
  focusDate,
  Model,
  Message,
  open,
  reflectDisabledDates,
  reflectDisabledDaysOfWeek,
  reflectMaxDate,
  reflectMinDate,
  selectDate,
  triggerId,
} from '@foldkit/ui/datePicker'

export const selectedIso = (
  outMessage:
    | { readonly _tag: 'SelectedDate'; readonly date: CalendarDate }
    | { readonly _tag: 'ClearedDate' },
): Option.Option<string> =>
  outMessage._tag === 'SelectedDate'
    ? Option.some(isoFromCalendarDate(outMessage.date))
    : Option.none()
