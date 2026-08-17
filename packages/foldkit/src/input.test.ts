import type { Html } from 'foldkit/html'

import { describe, expect, it } from '@effect/vitest'

import { control } from './input.js'
import { renderWithBuilder } from './renderHelper.js'

type Node = Readonly<{
  sel?: string | undefined
  data?: Readonly<{
    attrs?: Readonly<Record<string, string>>
    props?: Readonly<Record<string, unknown>>
    class?: Readonly<Record<string, boolean>>
    on?: Readonly<Record<string, unknown>>
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

describe('Input.control', () => {
  it('wires input events and omits them when disabled', () => {
    const message = { _tag: 'Changed' }
    const enabled = asNode(
      renderWithBuilder(h =>
        control({ ariaLabel: 'Name', onInput: () => message }, h),
      ),
    )
    const disabled = asNode(
      renderWithBuilder(h =>
        control(
          { ariaLabel: 'Name', onInput: () => message, isDisabled: true },
          h,
        ),
      ),
    )
    expect(Object.keys(enabled.data?.on ?? {})).toContain('input')
    expect(Object.keys(disabled.data?.on ?? {})).not.toContain('input')
    expect(disabled.data?.attrs?.['aria-disabled']).toBe('true')
  })
  it('applies compact density and md width as distinct style keys', () => {
    const node = asNode(
      renderWithBuilder(h =>
        control(
          {
            id: 'filter',
            ariaLabel: 'Filter',
            density: 'compact',
            width: 'md',
            value: '',
          },
          h,
        ),
      ),
    )
    expect(node.sel).toBe('input')
    expect(node.data?.props?.['id']).toBe('filter')
    expect(node.data?.attrs?.['aria-label']).toBe('Filter')
    expect(hasSx(node, 'input')).toBe(true)
    expect(hasSx(node, 'inputCompact')).toBe(true)
    expect(hasSx(node, 'inputWidthMd')).toBe(true)
    expect(hasSx(node, 'inputWidthSm')).toBe(false)
    expect(hasSx(node, 'inputWidthAuto')).toBe(false)
  })

  it('width auto overrides base full width; sm and end align are distinct', () => {
    const auto = asNode(
      renderWithBuilder(h =>
        control({ ariaLabel: 'Auto', width: 'auto', value: '' }, h),
      ),
    )
    expect(hasSx(auto, 'inputWidthAuto')).toBe(true)
    expect(hasSx(auto, 'inputWidthFull')).toBe(false)

    const smEnd = asNode(
      renderWithBuilder(h =>
        control(
          {
            ariaLabel: 'Value',
            density: 'compact',
            width: 'sm',
            align: 'end',
            value: '12.50',
          },
          h,
        ),
      ),
    )
    expect(hasSx(smEnd, 'inputCompact')).toBe(true)
    expect(hasSx(smEnd, 'inputWidthSm')).toBe(true)
    expect(hasSx(smEnd, 'inputAlignEnd')).toBe(true)
    expect(hasSx(smEnd, 'inputWidthMd')).toBe(false)
    expect(smEnd.data?.props?.['value']).toBe('12.50')
  })

  it('full width and start align apply their style keys', () => {
    const node = asNode(
      renderWithBuilder(h =>
        control(
          {
            ariaLabel: 'Full',
            width: 'full',
            align: 'start',
            value: '',
          },
          h,
        ),
      ),
    )
    expect(hasSx(node, 'inputWidthFull')).toBe(true)
    expect(hasSx(node, 'inputAlignStart')).toBe(true)
  })
})
