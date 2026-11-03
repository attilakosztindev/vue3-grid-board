import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'
import gridTileSource from '../src/grid-tile.vue?raw'

type T = { id: string; x: number; y: number; w: number; h: number }

const BOARD: T[] = [
  { id: '1', x: 0, y: 0, w: 2, h: 3 },
  { id: '2', x: 2, y: 0, w: 6, h: 3 },
  { id: '3', x: 8, y: 0, w: 4, h: 3 },
  { id: '4', x: 0, y: 3, w: 6, h: 4 },
  { id: '5', x: 6, y: 3, w: 6, h: 4 },
  { id: '6', x: 0, y: 7, w: 12, h: 3 }
]

const Host = defineComponent({
  setup() {
    const tiles = ref<T[]>(BOARD.map((t) => ({ ...t })))
    return { tiles }
  },
  render() {
    return h(
      GridBoard,
      {
        tiles: this.tiles,
        'onUpdate:tiles': (next: T[]) => {
          this.tiles = next
        }
      },
      { default: () => this.tiles.map((t) => h(GridTile, { key: t.id, ...t })) }
    )
  }
})

function mountBoard() {
  const wrapper = mount(Host)
  const board = wrapper.findComponent(GridBoard)
  const dispatch = (board.vm as unknown as { dispatch: (e: string, p?: unknown) => void }).dispatch

  const shadow = () => {
    const found = wrapper.findAllComponents(GridTile).find((c) => c.props('shadow') === true)
    if (!found) throw new Error('no shadow rendered')
    return {
      x: found.props('x') as number,
      y: found.props('y') as number,
      w: found.props('w') as number,
      h: found.props('h') as number
    }
  }

  const tiles = () => wrapper.vm.tiles as T[]
  const tile = (id: string) => tiles().find((t) => t.id === id)!
  const shadowEl = () => wrapper.find('.grid-shadow')

  return { wrapper, dispatch, shadow, tiles, tile, shadowEl }
}

function overlaps(a: { x: number; y: number; w: number; h: number }, b: T) {
  return !(a.x + a.w <= b.x || a.x >= b.x + b.w || a.y + a.h <= b.y || a.y >= b.y + b.h)
}

describe('drag shadow', () => {
  it('shows the slot the tile lands in, not the one it is leaving', async () => {
    const board = mountBoard()

    board.dispatch('dragEvent', ['dragstart', '4', 0, 3, 4, 6])
    await nextTick()

    board.dispatch('dragEvent', ['dragmove', '4', 6, 5, 4, 6])
    await nextTick()

    const landed = board.tile('4')
    expect(board.shadow()).toMatchObject({ x: landed.x, y: landed.y, w: 6, h: 4 })
  })

  it('never parks the shadow on top of another tile', async () => {
    const board = mountBoard()

    board.dispatch('dragEvent', ['dragstart', '4', 0, 3, 4, 6])
    await nextTick()

    const path = [
      [6, 3],
      [6, 4],
      [6, 5],
      [6, 6],
      [6, 7],
      [0, 8],
      [0, 2],
      [0, 0]
    ]

    for (const [x, y] of path) {
      board.dispatch('dragEvent', ['dragmove', '4', x, y, 4, 6])
      await nextTick()

      const shadow = board.shadow()
      const landed = board.tile('4')
      const where = `dragging to (${x}, ${y})`

      expect(shadow, where).toMatchObject({ x: landed.x, y: landed.y })
      for (const other of board.tiles()) {
        if (other.id === '4') continue
        expect(overlaps(shadow, other), `${where}: shadow over tile ${other.id}`).toBe(false)
      }
    }
  })

  it('glides by transitioning its own box, never by a FLIP', async () => {
    const board = mountBoard()
    const el = board.shadowEl().element as unknown as {
      animate: (...args: unknown[]) => unknown
    }

    const started: unknown[] = []
    el.animate = (...args: unknown[]) => {
      started.push(args)
      return {
        cancel() {},
        finish() {},
        onfinish: null,
        oncancel: null
      }
    }

    board.dispatch('dragEvent', ['dragstart', '4', 0, 3, 4, 6])
    await nextTick()
    for (const [x, y] of [
      [6, 3],
      [6, 6],
      [0, 0],
      [3, 4]
    ]) {
      board.dispatch('dragEvent', ['dragmove', '4', x, y, 4, 6])
      await nextTick()
    }

    expect(started).toEqual([])
  })

  it('stacks above an idle tile but below the tile being dragged', () => {
    const zOf = (selector: string) => {
      const rule = gridTileSource.match(new RegExp(`\\.grid-tile${selector}\\s*\\{([^}]*)\\}`))?.[1]
      expect(rule, `no rule for .grid-tile${selector}`).toBeTruthy()
      return Number(rule?.match(/z-index:\s*(\d+)/)?.[1])
    }

    const shadow = zOf('\\.grid-shadow')
    const dragged = zOf('--dragging')

    expect(shadow).toBeGreaterThan(0)
    expect(shadow).toBeLessThan(dragged)
  })

  it('keeps the shadow on the tile while resizing', async () => {
    const board = mountBoard()

    board.dispatch('resizeEvent', ['resizestart', '4', 0, 3, 4, 6])
    await nextTick()
    board.dispatch('resizeEvent', ['resizemove', '4', 0, 3, 7, 9])
    await nextTick()

    const landed = board.tile('4')
    expect(board.shadow()).toMatchObject({ x: landed.x, y: landed.y, w: landed.w, h: landed.h })
  })
})
