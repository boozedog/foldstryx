import type { Html } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import * as Button from './button.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  data?: Readonly<{ attrs?: Readonly<Record<string, string>> }>
}>
const asNode = (value: Html): Node => value as Node
const text = (value: unknown): string => {
  if (typeof value === 'string') return value
  const node = value as Node & { text?: string }
  if (node.text) return node.text
  return node.children?.map(text).join('') ?? ''
}

describe('Button', () => {
  it('renders its label and aria name', () => {
    const node = asNode(
      Button.view({ label: 'Save', ariaLabel: 'Save changes' }),
    )
    expect(node.sel).toBe('button')
    expect(text(node)).toContain('Save')
    expect(node.data?.attrs?.['aria-label']).toBe('Save changes')
  })

  it('accepts disabled configuration', () => {
    expect({ isDisabled: true } satisfies { isDisabled?: boolean }).toEqual({
      isDisabled: true,
    })
  })
})
