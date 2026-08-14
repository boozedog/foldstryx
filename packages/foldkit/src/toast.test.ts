import { Option } from 'effect'
import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { renderSubmodel } from './renderHelper.js'
import * as Toast from './toast.js'

type Node = Readonly<{
  sel?: string | undefined
  children?: ReadonlyArray<unknown> | undefined
  text?: string | undefined
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
  }>
}>

const collectText = (node: unknown): string => {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node
  const n = node as Node
  if (n.text !== undefined) return n.text
  if (n.children === undefined) return ''
  return n.children.map(collectText).join('')
}

const asNode = (html: Html): Node => {
  if (html === null) throw new Error('expected VNode')
  return html as Node
}

const classKeys = (node: Node): ReadonlyArray<string> =>
  Object.keys(node.data?.class ?? {}).filter(
    k => node.data?.class?.[k] === true,
  )

const hasSx = (node: Node, key: string): boolean =>
  classKeys(node).includes(`sx-${key}`)

const findAll = (node: Node, sel: string): ReadonlyArray<Node> => {
  const out: Array<Node> = []
  if (node.sel === sel) out.push(node)
  for (const child of node.children ?? []) {
    out.push(...findAll(child as Node, sel))
  }
  return out
}

const DemoToast = Toast.create()

const render = (
  variant: 'Info' | 'Success' | 'Warning' | 'Error' = 'Success',
  maybeDescription: Option.Option<string> = Option.some('All good'),
) => {
  const model = DemoToast.init({ id: 't' })
  const [withEntry] = DemoToast.show(model, {
    payload: { title: 'Saved', maybeDescription },
    variant,
  })
  return asNode(
    renderSubmodel(
      m => DemoToast.view(m, DemoToast.styledViewInputs()),
      withEntry,
      DemoToast.update,
    ),
  )
}

describe('Toast', () => {
  it('renders the entry title and description', () => {
    const root = render()
    expect(collectText(root)).toContain('Saved')
    expect(collectText(root)).toContain('All good')
  })

  it('omits the description when none is provided', () => {
    const root = render('Success', Option.none())
    expect(collectText(root)).toContain('Saved')
    expect(collectText(root)).not.toContain('All good')
    expect(findAll(root, 'p').filter(n => hasSx(n, 'description')).length).toBe(
      0,
    )
  })

  it('applies each variant style', () => {
    const variantToClass: Readonly<
      Record<'Info' | 'Success' | 'Warning' | 'Error', string>
    > = {
      Info: 'entry',
      Success: 'entrySuccess',
      Warning: 'entryWarning',
      Error: 'entryError',
    }
    for (const variant of Object.keys(variantToClass) as ReadonlyArray<
      'Info' | 'Success' | 'Warning' | 'Error'
    >) {
      const entry = findAll(render(variant), 'div').find(n => hasSx(n, 'entry'))
      expect(entry).toBeDefined()
      expect(hasSx(entry as Node, variantToClass[variant])).toBe(true)
    }
  })

  it('renders an accessible dismiss button', () => {
    const root = render()
    const buttons = findAll(root, 'button')
    expect(buttons.length).toBeGreaterThan(0)
    const dismiss = buttons[0] as Node
    expect(dismiss.data?.attrs?.['aria-label']).toBe('Close')
  })
})
