import type { Html } from 'foldkit/html'
import { html } from 'foldkit/html'

const noChildren: ReadonlyArray<never> = []

export type IconChild =
  | Readonly<{ d: string }>
  | Readonly<{ cx: string; cy: string; r: string }>
  | Readonly<{ width: string; height: string; x: string; y: string }>
export type IconConfig = Readonly<{
  size?: number | string
  label?: string
  fill?: boolean
}>
export type IconCustomConfig = IconConfig &
  Readonly<{ children: ReadonlyArray<IconChild> }>
export const custom = (config: IconCustomConfig): Html => {
  const h = html()
  const size = String(config.size ?? 16)
  const children = config.children.map(child =>
    'd' in child
      ? h.path(
          [h.D(child.d), h.StrokeLinecap('round'), h.StrokeLinejoin('round')],
          noChildren,
        )
      : 'cx' in child
        ? h.circle([h.Cx(child.cx), h.Cy(child.cy), h.R(child.r)], noChildren)
        : h.rect(
            [
              h.Width(child.width),
              h.Height(child.height),
              h.X(child.x),
              h.Y(child.y),
            ],
            noChildren,
          ),
  )
  return h.svg(
    [
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox('0 0 24 24'),
      h.Fill(config.fill === true ? 'currentColor' : 'none'),
      h.Stroke(config.fill === true ? 'none' : 'currentColor'),
      h.StrokeWidth('1.5'),
      h.Width(size),
      h.Height(size),
      ...(config.label
        ? [h.Role('img'), h.AriaLabel(config.label)]
        : [h.AriaHidden(true)]),
    ],
    children,
  )
}
const make =
  (children: ReadonlyArray<IconChild>) =>
  (config: IconConfig = {}): Html =>
    custom({ ...config, children })
export const terminal = make([{ d: 'm4 17 6-5-6-5' }, { d: 'M12 19h8' }])
export const settings = make([
  { d: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z' },
  {
    d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
  },
])
export const folder = make([{ d: 'M3 6h7l2 2h9v10H3z' }])
export const chevronDown = make([{ d: 'M6 9l6 6 6-6' }])
export const clock = make([
  { cx: '12', cy: '12', r: '9' },
  { d: 'M12 7v5l3 3' },
])
export const star = make([
  { d: 'M12 3.5 14.7 9l6 .9-4.4 4.2 1 6-5.3-2.8L6.7 20l1-6L3.3 9.9 9.3 9z' },
])
export const home = make([{ d: 'M4 11 12 4l8 7' }, { d: 'M6 10.5V20h12v-9.5' }])
export const homeSolid = (config: IconConfig = {}): Html =>
  custom({
    ...config,
    fill: true,
    children: [{ d: 'M4 11 12 4l8 7V20H4z' }],
  })
export const folderSolid = (config: IconConfig = {}): Html =>
  custom({
    ...config,
    fill: true,
    children: [{ d: 'M3 6h7l2 2h9v10H3z' }],
  })
export const chevronLeft = make([{ d: 'M15 6l-6 6 6 6' }])
export const help = make([
  { cx: '12', cy: '12', r: '9' },
  { d: 'M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.8V14' },
  { cx: '12', cy: '17', r: '0.6' },
])
export const bell = make([
  { d: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5z' },
  { d: 'M10 19a2 2 0 0 0 4 0' },
])
export const appMark = make([{ cx: '12', cy: '12', r: '8' }])
