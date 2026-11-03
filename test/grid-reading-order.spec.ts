import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

type Tile = { id: string; x: number; y: number; w: number; h: number }

function mountBoard(tiles: Tile[]) {
  return mount(GridBoard, {
    props: { tiles, columns: 12, rowHeight: 100, gap: 10, gravity: false },
    slots: {
      default: () => tiles.map((tile) => h(GridTile, { key: tile.id, ...tile }))
    }
  })
}

function domOrder(wrapper: ReturnType<typeof mountBoard>) {
  return wrapper
    .findAll('.grid-tile:not(.grid-shadow)')
    .map((el) => el.attributes('data-tile'))
    .filter(Boolean)
}

describe('reading order', () => {
  it('renders tiles in row-major order regardless of array order', () => {
    const wrapper = mountBoard([
      { id: 'd', x: 6, y: 2, w: 3, h: 1 },
      { id: 'a', x: 0, y: 0, w: 3, h: 1 },
      { id: 'c', x: 0, y: 2, w: 3, h: 1 },
      { id: 'b', x: 6, y: 0, w: 3, h: 1 }
    ])

    expect(domOrder(wrapper)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('reorders the DOM when tiles move, so tab order follows the layout', async () => {
    const tiles: Tile[] = [
      { id: 'a', x: 0, y: 0, w: 3, h: 1 },
      { id: 'b', x: 6, y: 0, w: 3, h: 1 },
      { id: 'c', x: 0, y: 2, w: 3, h: 1 }
    ]
    const wrapper = mountBoard(tiles)
    expect(domOrder(wrapper)).toEqual(['a', 'b', 'c'])

    const moved = tiles.map((tile) => (tile.id === 'b' ? { ...tile, x: 6, y: 4 } : tile))
    await wrapper.setProps({ tiles: moved })
    await wrapper.vm.$nextTick()

    expect(domOrder(wrapper)).toEqual(['a', 'c', 'b'])
  })

  it('keeps a stable order while a gesture is in flight', async () => {
    const tiles: Tile[] = [
      { id: 'a', x: 0, y: 0, w: 3, h: 1 },
      { id: 'b', x: 6, y: 0, w: 3, h: 1 }
    ]
    const wrapper = mountBoard(tiles)
    const board = wrapper.vm as unknown as { dispatch: (t: string, p: unknown) => void }

    board.dispatch('dragEvent', ['dragstart', 'b', 6, 0, 1, 3])
    await nextTick()
    const during = domOrder(wrapper)

    board.dispatch('dragEvent', ['dragmove', 'b', 0, 4, 1, 3])
    await nextTick()

    expect(domOrder(wrapper)).toEqual(during)
  })
})
