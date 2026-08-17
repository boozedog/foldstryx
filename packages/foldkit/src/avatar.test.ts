import type { Html } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import * as Avatar from './avatar.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    class?: Readonly<Record<string, boolean>>
  }>
}>
const asNode = (value: Html): Node => value as Node
const text = (value: unknown): string => {
  if (typeof value === 'string') return value
  const node = value as Node & { text?: string }
  if (node.text) return node.text
  return node.children?.map(text).join('') ?? ''
}

const classKeys = (node: Node): ReadonlyArray<string> =>
  Object.keys(node.data?.class ?? {}).filter(
    k => node.data?.class?.[k] === true,
  )

const hasSx = (node: Node, key: string): boolean =>
  classKeys(node).includes(`sx-${key}`)

const attr = (node: Node, name: string): string | undefined =>
  node.data?.attrs?.[name] ??
  (node.data as Readonly<{ props?: Readonly<Record<string, string>> }>)
    ?.props?.[name]

describe('Avatar.view', () => {
  it('renders a root div with the fallback text', () => {
    const node = asNode(
      renderWithBuilder(h => Avatar.view({ fallback: 'JD' }, h)),
    )
    expect(node.sel).toBe('div')
    expect(hasSx(node, 'root')).toBe(true)
    expect(text(node)).toContain('JD')
  })

  it('defaults to default size and circle shape', () => {
    const node = asNode(
      renderWithBuilder(h => Avatar.view({ fallback: 'JD' }, h)),
    )
    expect(hasSx(node, 'sizeDefault')).toBe(true)
    expect(hasSx(node, 'rootRounded')).toBe(false)
  })

  it('selects the expected size style for every size', () => {
    const cases: ReadonlyArray<readonly [Avatar.AvatarSize, string]> = [
      ['sm', 'sizeSm'],
      ['default', 'sizeDefault'],
      ['lg', 'sizeLg'],
    ]
    for (const [size, key] of cases) {
      const node = asNode(
        renderWithBuilder(h => Avatar.view({ fallback: 'JD', size }, h)),
      )
      expect(hasSx(node, key)).toBe(true)
    }
  })

  it('applies the rounded shape style when shape is rounded', () => {
    const node = asNode(
      renderWithBuilder(h =>
        Avatar.view({ fallback: 'JD', shape: 'rounded' }, h),
      ),
    )
    expect(hasSx(node, 'rootRounded')).toBe(true)
  })

  it('renders an image with src and alt when imageSrc is provided', () => {
    const node = asNode(
      renderWithBuilder(h =>
        Avatar.view({ fallback: 'JD', imageSrc: '/avatar.png' }, h),
      ),
    )
    const img = (node.children ?? []).find(
      child => (child as Node).sel === 'img',
    ) as Node | undefined
    expect(img).toBeDefined()
    expect(attr(img!, 'src')).toBe('/avatar.png')
    expect(attr(img!, 'alt')).toBe('JD')
    expect(hasSx(img!, 'image')).toBe(true)
  })

  it('uses imageAlt for the image alt when provided', () => {
    const node = asNode(
      renderWithBuilder(h =>
        Avatar.view(
          {
            fallback: 'JD',
            imageSrc: '/avatar.png',
            imageAlt: 'Jane Doe',
          },
          h,
        ),
      ),
    )
    const img = (node.children ?? []).find(
      child => (child as Node).sel === 'img',
    ) as Node | undefined
    expect(attr(img!, 'alt')).toBe('Jane Doe')
  })

  it('omits the image when imageSrc is not provided', () => {
    const node = asNode(
      renderWithBuilder(h => Avatar.view({ fallback: 'JD' }, h)),
    )
    const hasImage = (node.children ?? []).some(
      child => (child as Node).sel === 'img',
    )
    expect(hasImage).toBe(false)
  })

  it('exposes role=img and aria-label when a label is provided', () => {
    const node = asNode(
      renderWithBuilder(h =>
        Avatar.view({ fallback: 'JD', label: 'Jane Doe' }, h),
      ),
    )
    expect(attr(node, 'role')).toBe('img')
    expect(attr(node, 'aria-label')).toBe('Jane Doe')
  })

  it('does not set role=img when no label is provided', () => {
    const node = asNode(
      renderWithBuilder(h => Avatar.view({ fallback: 'JD' }, h)),
    )
    expect(attr(node, 'role')).toBeUndefined()
  })

  it('applies the small fallback style for the sm size', () => {
    const node = asNode(
      renderWithBuilder(h => Avatar.view({ fallback: 'JD', size: 'sm' }, h)),
    )
    const fallback = (node.children ?? []).find(
      child => (child as Node).sel === 'div',
    ) as Node | undefined
    expect(hasSx(fallback!, 'fallback')).toBe(true)
    expect(hasSx(fallback!, 'fallbackSm')).toBe(true)
  })
})
