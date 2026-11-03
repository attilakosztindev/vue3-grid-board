import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

const tiles = [{ id: 'a', x: 0, y: 0, w: 2, h: 2 }]

function mountBoard(tileProps: Record<string, unknown> = {}) {
  return mount(GridBoard, {
    props: { tiles },
    slots: {
      default: () => h(GridTile, { id: 'a', x: 0, y: 0, w: 2, h: 2, ...tileProps })
    }
  })
}

describe('inline geometry invariants', () => {
  it('positions the board inline, not only via the scoped stylesheet', () => {
    const wrapper = mountBoard()

    expect(wrapper.get('.grid-board').attributes('style')).toContain('position: relative')
  })

  it('positions an interactive tile inline and disables native touch gestures', () => {
    const wrapper = mountBoard()
    const style = wrapper.get('.grid-tile:not(.grid-shadow)').attributes('style')

    expect(style).toContain('position: absolute')
    expect(style).toContain('touch-action: none')
  })

  it.each([
    ['non-interactive', { draggable: false, resizable: false }],
    ['frozen', { frozen: true }]
  ])('leaves touch-action unset on a %s tile', (_label, tileProps) => {
    const wrapper = mountBoard(tileProps)
    const style = wrapper.get('.grid-tile:not(.grid-shadow)').attributes('style')

    expect(style).toContain('position: absolute')
    expect(style).not.toContain('touch-action')
  })
})
