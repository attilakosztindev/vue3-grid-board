import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import GridLayout from '~/grid-fork/grid-layout.vue'
import GridItem from '~/grid-fork/grid-item.vue'

const layout = [{ i: 'a', x: 0, y: 0, w: 2, h: 2 }]

function mountGrid(itemProps: Record<string, unknown> = {}) {
  return mount(GridLayout, {
    props: { layout },
    slots: {
      default: () => h(GridItem, { i: 'a', x: 0, y: 0, w: 2, h: 2, ...itemProps })
    }
  })
}

describe('grid inline layout invariants', () => {
  it('positions the container inline, not only via the scoped stylesheet', () => {
    const wrapper = mountGrid()

    expect(wrapper.get('.vue-grid-layout').attributes('style')).toContain('position: relative')
  })

  it('positions an interactive tile inline and disables native touch gestures', () => {
    const wrapper = mountGrid()
    const style = wrapper.get('.vue-grid-item:not(.vue-grid-placeholder)').attributes('style')

    expect(style).toContain('position: absolute')
    expect(style).toContain('touch-action: none')
  })

  it.each([
    ['non-interactive', { isDraggable: false, isResizable: false }],
    ['static', { static: true }]
  ])('leaves touch-action unset on a %s tile', (_label, itemProps) => {
    const wrapper = mountGrid(itemProps)
    const style = wrapper.get('.vue-grid-item:not(.vue-grid-placeholder)').attributes('style')

    expect(style).toContain('position: absolute')
    expect(style).not.toContain('touch-action')
  })
})
