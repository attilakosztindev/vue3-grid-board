import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'
import { applyGravity, copyTiles, getTileById, moveTile } from '../src/helpers/helpers'

type T = { id: string; x: number; y: number; w: number; h: number; frozen?: boolean }

function drag(start: T[], id: string, path: [number, number][], gravity = true) {
  const tiles = copyTiles(start)
  for (const [x, y] of path) {
    moveTile(tiles, getTileById(tiles, id)!, x, y, true, false)
    applyGravity(tiles, gravity, id)
  }
  return Object.fromEntries(tiles.map((t) => [t.id, [t.x, t.y]]))
}

const row: T[] = ['1', '2', '3', '4'].map((id, i) => ({ id, x: i * 3, y: 0, w: 3, h: 4 }))

describe('dragging a tile sideways within its row', () => {
  it('leaves the neighbour in place until the tile passes its middle', () => {
    expect(drag(row, '1', [[1, 0]])).toEqual({ 1: [0, 0], 2: [3, 0], 3: [6, 0], 4: [9, 0] })
  })

  it('swaps the two once it does', () => {
    expect(
      drag(row, '1', [
        [1, 0],
        [2, 0]
      ])
    ).toEqual({ 1: [3, 0], 2: [0, 0], 3: [6, 0], 4: [9, 0] })
  })

  it('swaps the same way when the drag jumps several columns at once', () => {
    expect(drag(row, '1', [[3, 0]])).toEqual({ 1: [3, 0], 2: [0, 0], 3: [6, 0], 4: [9, 0] })
  })

  it('reorders the row when the tile is dragged across it', () => {
    expect(drag(row, '1', [[9, 0]])).toEqual({ 1: [9, 0], 2: [0, 0], 3: [3, 0], 4: [6, 0] })
  })

  it('swaps to the left as well', () => {
    expect(
      drag(row, '4', [
        [8, 0],
        [7, 0]
      ])
    ).toEqual({ 1: [0, 0], 2: [3, 0], 3: [9, 0], 4: [6, 0] })
  })

  it('does not swap straight back when the pointer stays put', () => {
    expect(
      drag(row, '1', [
        [2, 0],
        [2, 0],
        [2, 0]
      ])
    ).toEqual({ 1: [3, 0], 2: [0, 0], 3: [6, 0], 4: [9, 0] })
  })

  it('works with gravity off', () => {
    expect(drag(row, '1', [[2, 0]], false)).toEqual({ 1: [3, 0], 2: [0, 0], 3: [6, 0], 4: [9, 0] })
  })
})

describe('sideways swaps between tiles of different sizes', () => {
  const mixed: T[] = [
    { id: 'A', x: 0, y: 0, w: 3, h: 4 },
    { id: 'B', x: 3, y: 0, w: 6, h: 4 },
    { id: 'C', x: 9, y: 0, w: 3, h: 2 }
  ]

  it('swaps a narrow tile past a wide one once it passes the middle', () => {
    expect(drag(mixed, 'A', [[3, 0]])).toMatchObject({ A: [0, 0], B: [3, 0] })
    expect(drag(mixed, 'A', [[4, 0]])).toMatchObject({ A: [6, 0], B: [0, 0] })
  })

  it('swaps a wide tile past a narrow one', () => {
    expect(drag(mixed, 'B', [[1, 0]])).toMatchObject({ A: [6, 0], B: [0, 0] })
  })

  it('swaps tiles of different heights that share the same top', () => {
    expect(drag(mixed, 'C', [[5, 0]])).toMatchObject({ B: [6, 0], C: [3, 0] })
  })
})

describe('what still pushes tiles down', () => {
  it('a tile entering the row from below pushes the tiles it lands on down', () => {
    const start: T[] = [
      { id: '1', x: 0, y: 0, w: 4, h: 6 },
      { id: '3', x: 4, y: 0, w: 4, h: 6 },
      { id: '4', x: 8, y: 0, w: 4, h: 6 },
      { id: '2', x: 0, y: 6, w: 4, h: 2 }
    ]
    expect(
      drag(start, '2', [
        [3, 1],
        [3, 0]
      ])
    ).toEqual({
      1: [0, 2],
      3: [4, 2],
      4: [8, 0],
      2: [3, 0]
    })
  })

  it('a vertical drag still swaps only once it reaches the next tile', () => {
    const start: T[] = [
      { id: 'A', x: 0, y: 0, w: 3, h: 4 },
      { id: 'B', x: 0, y: 4, w: 3, h: 4 }
    ]
    expect(drag(start, 'A', [[0, 2]])).toEqual({ A: [0, 0], B: [0, 4] })
    expect(drag(start, 'A', [[0, 4]])).toEqual({ A: [0, 4], B: [0, 0] })
  })

  it('a frozen tile is never swapped', () => {
    const start: T[] = [
      { id: 'A', x: 0, y: 0, w: 3, h: 4 },
      { id: 'F', x: 3, y: 0, w: 3, h: 4, frozen: true }
    ]
    expect(drag(start, 'A', [[3, 0]])).toMatchObject({ F: [3, 0] })
  })
})

describe('swapping with the keyboard', () => {
  function mountBoard() {
    const wrapper = mount(GridBoard, {
      attachTo: document.body,
      props: {
        tiles: row.map((t) => ({ ...t })),
        columns: 12,
        'onUpdate:tiles': (next: T[]) => wrapper.setProps({ tiles: next })
      },
      slots: { default: () => row.map((t) => h(GridTile, { key: t.id, ...t })) }
    })
    return wrapper
  }

  async function press(wrapper: ReturnType<typeof mountBoard>, ...keys: string[]) {
    const el = wrapper.find('.grid-tile[data-tile="1"]:not(.grid-shadow)')
    for (const key of keys) {
      await el.trigger('keydown', { key })
      await nextTick()
    }
  }

  const slots = (wrapper: ReturnType<typeof mountBoard>) =>
    Object.fromEntries((wrapper.props('tiles') as T[]).map((t) => [t.id, [t.x, t.y]]))

  it('swaps with the neighbour on one arrow press', async () => {
    const wrapper = mountBoard()
    await press(wrapper, 'Enter', 'ArrowRight')

    expect(slots(wrapper)).toMatchObject({ 1: [3, 0], 2: [0, 0] })
    wrapper.unmount()
  })

  it('swaps back with the opposite arrow', async () => {
    const wrapper = mountBoard()
    await press(wrapper, 'Enter', 'ArrowRight', 'ArrowLeft')

    expect(slots(wrapper)).toMatchObject({ 1: [0, 0], 2: [3, 0] })
    wrapper.unmount()
  })

  it('walks along the row one neighbour per press', async () => {
    const wrapper = mountBoard()
    await press(wrapper, 'Enter', 'ArrowRight', 'ArrowRight', 'ArrowRight')

    expect(slots(wrapper)).toEqual({ 1: [9, 0], 2: [0, 0], 3: [3, 0], 4: [6, 0] })
    wrapper.unmount()
  })
})
