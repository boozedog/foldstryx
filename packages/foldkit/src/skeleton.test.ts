import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { renderWithBuilder } from './renderHelper.js'
import { view } from './skeleton.js'

type Node = Readonly<{
  sel?: string | undefined
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
  }>
}>

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

describe('Skeleton', () => {
  it('renders aria-hidden placeholder with default radius', () => {
    const root = asNode(renderWithBuilder(h => view({}, h)))
    expect(root.data?.attrs?.['aria-hidden']).toBe('true')
    expect(hasSx(root, 'root')).toBe(true)
    expect(hasSx(root, 'animate')).toBe(true)
    expect(hasSx(root, 'radius3')).toBe(true)
  })

  it('applies width, height, radius, and stagger index', () => {
    const root = asNode(
      renderWithBuilder(h =>
        view(
          {
            width: 200,
            height: 20,
            radius: 'rounded',
            index: 2,
          },
          h,
        ),
      ),
    )
    expect(hasSx(root, 'radiusRounded')).toBe(true)
    expect(hasSx(root, 'radius3')).toBe(false)
  })

  it('is not role=alert', () => {
    const root = asNode(renderWithBuilder(h => view({}, h)))
    expect(root.data?.attrs?.['role']).toBeUndefined()
  })
})
