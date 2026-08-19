import { Schema as S } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'

import { describe, expect, it } from '@effect/vitest'
import { AnchorTooltip, CompletedAnchorTooltip } from '@foldkit/ui/tooltip'
import { Checkbox, ContextMenu, GridFocus } from '@foldstryx/foldkit'

import { Message, init, update } from './model.js'
import type { Model } from './model.js'
import { Route, type Route as RouteType } from './routes.js'
import { view } from './view.js'

type Node = Readonly<{
  sel?: string | undefined
  children?: ReadonlyArray<unknown> | undefined
  text?: string | undefined
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    props?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
  }>
}>

const asNode = (html: Html): Node => {
  if (html === null) throw new Error('expected VNode')
  return html as Node
}

const descendants = (value: unknown): Node[] => {
  if (typeof value !== 'object' || value === null) return []
  const node = value as Node
  return [node, ...(node.children?.flatMap(descendants) ?? [])]
}

const collectText = (node: unknown): string => {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node
  const n = node as Node
  if (n.text !== undefined) return n.text
  if (n.children === undefined) return ''
  return n.children.map(collectText).join('')
}

const acknowledgeTooltip = Scene.Mount.resolve(
  AnchorTooltip,
  CompletedAnchorTooltip(),
)

const acknowledgeFormsMounts = Scene.Mount.resolve(
  Checkbox.syncIndeterminateMount({ indeterminate: false }),
  Checkbox.CompletedSyncCheckboxIndeterminate(),
)

const acknowledgeContextMenuAttach = Scene.Mount.resolve(
  ContextMenu.attachMount,
  ContextMenu.CompletedAttachContextMenu() as unknown as typeof ContextMenu.ContextMenuOpened.Type,
)

const acknowledgeDataMounts = Scene.Mount.resolveAll(
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
)

const acknowledgeKitchenSinkMounts = Scene.Mount.resolveAll(
  [GridFocus.mount, GridFocus.CompletedGridFocus()],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
  [
    Checkbox.syncIndeterminateMount,
    Checkbox.CompletedSyncCheckboxIndeterminate(),
  ],
  [
    ContextMenu.attachMount,
    ContextMenu.CompletedAttachContextMenu() as unknown as typeof ContextMenu.ContextMenuOpened.Type,
  ],
)

type RenderStep =
  | ReturnType<typeof Scene.Mount.resolve>
  | ReturnType<typeof Scene.Mount.resolveAll>

const sceneView = (m: Model, h: HtmlBuilder<Message>) => view(m, h).body

const render = (model: Model): Node => {
  let result: Html = null
  Scene.scene(
    { update, view: sceneView },
    Scene.given(model),
    Scene.tap(simulation => {
      result = simulation.html
    }),
  )
  return asNode(result)
}

const renderWithSteps = (model: Model, ...steps: RenderStep[]): Node => {
  let result: Html = null
  Scene.scene(
    { update, view: sceneView },
    Scene.given(model),
    ...steps,
    Scene.tap(simulation => {
      result = simulation.html
    }),
  )
  return asNode(result)
}

const [initialModel] = init()
const withRoute = (route: RouteType): Model => ({ ...initialModel, route })

const activeLabel = (root: Node): string | undefined => {
  const active = descendants(root).find(
    node => node.data?.attrs?.['aria-current'] === 'page',
  )
  return active?.data?.attrs?.['aria-label']
}

describe('docs view', () => {
  it('renders the documentation shell with sidebar and main regions', () => {
    const root = render(withRoute(Route.overview))
    const nodes = descendants(root)
    expect(
      nodes.some(node => node.data?.attrs?.['role'] === 'complementary'),
    ).toBe(true)
    expect(nodes.some(node => node.sel === 'main')).toBe(true)
  })

  it('marks the active route in the navigation', () => {
    const root = render(withRoute(Route.layout))
    expect(activeLabel(root)).toBe('Layout')
  })

  it('renders the overview page content on the overview route', () => {
    const root = render(withRoute(Route.overview))
    expect(collectText(root)).toContain('Foldstryx documentation')
    expect(collectText(root)).toContain('Getting started')
  })

  it('renders focused page content per route', () => {
    const layout = render(withRoute(Route.layout))
    expect(collectText(layout)).toContain('Stack')
    expect(collectText(layout)).toContain('Row')
    const forms = renderWithSteps(
      withRoute(Route.forms),
      acknowledgeFormsMounts,
    )
    expect(collectText(forms)).toContain('Selector')
    const feedback = render(withRoute(Route.feedback))
    expect(collectText(feedback)).toContain('Alerts')
    const data = renderWithSteps(
      withRoute(Route.data),
      acknowledgeDataMounts,
      acknowledgeContextMenuAttach,
    )
    expect(collectText(data)).toContain('Data display')
    expect(collectText(data)).toContain('Table')
    const media = render(withRoute(Route.media))
    expect(collectText(media)).toContain('Avatar')
    const gettingStarted = render(withRoute(Route.gettingStarted))
    expect(collectText(gettingStarted)).toContain('Getting started')
    const principles = render(withRoute(Route.principles))
    expect(collectText(principles)).toContain('Principles')
  })

  it('renders the kitchen-sink submodel on the kitchen-sink route', () => {
    const root = renderWithSteps(
      withRoute(Route.kitchenSink),
      acknowledgeTooltip,
      acknowledgeKitchenSinkMounts,
    )
    expect(collectText(root)).toContain('Foldstryx catalog')
    expect(collectText(root)).toContain('Stack and Row')
  })
})

describe('docs Message schema', () => {
  const decode = (input: unknown): unknown =>
    S.decodeUnknownSync(Message)(input)

  it('decodes representative top-level messages', () => {
    expect(decode({ _tag: 'ToggleSidebar' })).toEqual({ _tag: 'ToggleSidebar' })
    expect(decode({ _tag: 'Navigate', route: { _tag: 'layout' } })).toEqual({
      _tag: 'Navigate',
      route: { _tag: 'layout' },
    })
    expect(decode({ _tag: 'ToggleNav', id: 'components' })).toEqual({
      _tag: 'ToggleNav',
      id: 'components',
    })
    expect(decode({ _tag: 'HoverNav', id: 'components' })).toEqual({
      _tag: 'HoverNav',
      id: 'components',
    })
    expect(decode({ _tag: 'OpenNav', id: 'components' })).toEqual({
      _tag: 'OpenNav',
      id: 'components',
    })
    expect(decode({ _tag: 'Noop' })).toEqual({ _tag: 'Noop' })
  })

  it('decodes hover/open ids as JSON-friendly nullable strings', () => {
    expect(decode({ _tag: 'HoverNav', id: null })).toEqual({
      _tag: 'HoverNav',
      id: null,
    })
    expect(decode({ _tag: 'OpenNav' })).toEqual({ _tag: 'OpenNav' })
  })

  it('decodes a nested Sink message with an arbitrary payload', () => {
    const payload = { _tag: 'GotTooltipMessage', message: { text: 'hi' } }
    expect(decode({ _tag: 'Sink', message: payload })).toEqual({
      _tag: 'Sink',
      message: payload,
    })
  })

  it('rejects an invalid representative message', () => {
    expect(() => decode({ _tag: 'UnknownTag' })).toThrow()
    expect(() =>
      decode({ _tag: 'Navigate', route: { _tag: 'bogus' } }),
    ).toThrow()
    expect(() => decode({ _tag: 'Sink' })).toThrow()
  })
})
