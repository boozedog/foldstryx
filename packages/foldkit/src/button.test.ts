import type { Html } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import * as Button from './button.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  sel?: string
  children?: ReadonlyArray<unknown>
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    on?: Readonly<Record<string, unknown>>
  }>
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
      renderWithBuilder(h =>
        Button.view({ label: 'Save', ariaLabel: 'Save changes' }, h),
      ),
    )
    expect(node.sel).toBe('button')
    expect(text(node)).toContain('Save')
    expect(node.data?.attrs?.['aria-label']).toBe('Save changes')
  })

  it('renders enabled click and disabled paths without throwing', () => {
    const enabled = asNode(
      renderWithBuilder(h =>
        Button.view({ label: 'Primary', onClick: { _tag: 'Clicked' } }, h),
      ),
    )
    const disabled = asNode(
      renderWithBuilder(h =>
        Button.view(
          {
            label: 'Disabled',
            onClick: { _tag: 'Clicked' },
            isDisabled: true,
          },
          h,
        ),
      ),
    )
    expect(Object.keys(enabled.data?.on ?? {})).toContain('click')
    expect(Object.keys(disabled.data?.on ?? {})).not.toContain('click')
    expect(() =>
      renderWithBuilder(h =>
        Button.view({ label: 'Primary', onClick: { _tag: 'Clicked' } }, h),
      ),
    ).not.toThrow()

    const node = asNode(
      renderWithBuilder(h =>
        Button.view({ label: 'Disabled', isDisabled: true }, h),
      ),
    )
    expect(node.data?.attrs?.['data-disabled']).toBe('')
  })
})
