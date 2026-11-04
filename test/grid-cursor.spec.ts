import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

const tiles = [{ id: 'a', x: 0, y: 0, w: 2, h: 2 }]

function mountTile(
  tileProps: Record<string, unknown> = {},
  boardProps: Record<string, unknown> = {}
) {
  return mount(GridBoard, {
    props: { tiles, ...boardProps },
    slots: { default: () => h(GridTile, { id: 'a', x: 0, y: 0, w: 2, h: 2, ...tileProps }) }
  })
}

function classes(wrapper: ReturnType<typeof mountTile>) {
  return wrapper.find('.grid-tile:not(.grid-shadow)').classes()
}

describe('the grab cursor', () => {
  it('is offered on a tile that can be dragged', () => {
    expect(classes(mountTile())).toContain('grid-tile--draggable')
  })

  it('is withheld when the board turns dragging off', () => {
    expect(classes(mountTile({}, { draggable: false }))).not.toContain('grid-tile--draggable')
  })

  it('is withheld when the tile itself opts out', () => {
    expect(classes(mountTile({ draggable: false }))).not.toContain('grid-tile--draggable')
  })

  it('is withheld on a frozen tile', () => {
    expect(classes(mountTile({ frozen: true }))).not.toContain('grid-tile--draggable')
  })

  it('is withheld when only a handle starts the drag', () => {
    expect(classes(mountTile({ dragHandle: 'card-header' }))).not.toContain('grid-tile--draggable')
  })

  it('never marks the drag shadow', () => {
    const wrapper = mountTile()
    expect(wrapper.find('.grid-shadow').classes()).not.toContain('grid-tile--draggable')
  })
})
