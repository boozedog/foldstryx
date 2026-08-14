import type { Html } from 'foldkit/html'
import * as Scene from 'foldkit/scene'

import { describe, expect, it } from '@effect/vitest'
import { AnchorTooltip, CompletedAnchorTooltip } from '@foldkit/ui/tooltip'
import { GotTooltipMessage } from '@foldstryx/kitchen-sink'

import { init, update } from './model.js'
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
  message => ({ _tag: 'Sink', message: GotTooltipMessage(message) }),
)

const render = (model: Model, resolveTooltip = false): Node => {
  let result: Html = null
  if (resolveTooltip) {
    Scene.scene(
      { update, view: m => view(m).body },
      Scene.with(model),
      acknowledgeTooltip,
      Scene.tap(simulation => {
        result = simulation.html
      }),
    )
  } else {
    Scene.scene(
      { update, view: m => view(m).body },
      Scene.with(model),
      Scene.tap(simulation => {
        result = simulation.html
      }),
    )
  }
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
    const forms = render(withRoute(Route.forms))
    expect(collectText(forms)).toContain('Native select')
    const feedback = render(withRoute(Route.feedback))
    expect(collectText(feedback)).toContain('Alerts')
    const data = render(withRoute(Route.data))
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
    const root = render(withRoute(Route.kitchenSink), true)
    expect(collectText(root)).toContain('Foldstryx catalog')
    expect(collectText(root)).toContain('Stack and Row')
  })
})
