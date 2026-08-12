import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import GridLayout from '~/grid-fork/grid-layout.vue'
import GridItem from '~/grid-fork/grid-item.vue'

type Item = { i: string; x: number; y: number; w: number; h: number }

const BOARD: Item[] = [
  { i: '1', x: 0, y: 0, w: 2, h: 3 },
  { i: '2', x: 2, y: 0, w: 6, h: 3 },
  { i: '3', x: 8, y: 0, w: 4, h: 3 },
  { i: '4', x: 0, y: 3, w: 6, h: 4 },
  { i: '5', x: 6, y: 3, w: 6, h: 4 },
  { i: '6', x: 0, y: 7, w: 12, h: 3 }
]

/** Mirrors a real consumer: the layout is bound both ways. */
const Host = defineComponent({
  setup() {
    const layout = ref<Item[]>(BOARD.map((it) => ({ ...it })))
    return { layout }
  },
  render() {
    return h(
      GridLayout,
      {
        layout: this.layout,
        'onUpdate:layout': (next: Item[]) => {
          this.layout = next
        }
      },
      { default: () => this.layout.map((it) => h(GridItem, { key: it.i, ...it })) }
    )
  }
})

function mountBoard() {
  const wrapper = mount(Host)
  const grid = wrapper.findComponent(GridLayout)
  const emitter = (grid.vm as unknown as { emitter: { emit: (e: string, p: unknown) => void } })
    .emitter

  /** The shadow is the GridItem rendered with `placeholder`. */
  const shadow = () => {
    const found = wrapper.findAllComponents(GridItem).find((c) => c.props('placeholder') === true)
    if (!found) throw new Error('no placeholder rendered')
    return {
      x: found.props('x') as number,
      y: found.props('y') as number,
      w: found.props('w') as number,
      h: found.props('h') as number
    }
  }

  const layout = () => wrapper.vm.layout as Item[]
  const item = (id: string) => layout().find((it) => it.i === id)!
  const shadowEl = () => wrapper.find('.vue-grid-placeholder')

  return { wrapper, emitter, shadow, layout, item, shadowEl }
}

function overlaps(a: { x: number; y: number; w: number; h: number }, b: Item) {
  return !(a.x + a.w <= b.x || a.x >= b.x + b.w || a.y + a.h <= b.y || a.y >= b.y + b.h)
}

describe('drag placeholder', () => {
  it('shows the slot the item lands in, not the one it is leaving', async () => {
    const board = mountBoard()

    board.emitter.emit('dragEvent', ['dragstart', '4', 0, 3, 4, 6])
    await nextTick()

    // Item 4 cannot simply sit at y5 -- compaction settles it somewhere else. The
    // shadow used to keep showing the previous slot until the next frame arrived.
    board.emitter.emit('dragEvent', ['dragmove', '4', 6, 5, 4, 6])
    await nextTick()

    const landed = board.item('4')
    expect(board.shadow()).toMatchObject({ x: landed.x, y: landed.y, w: 6, h: 4 })
  })

  it('never parks the shadow on top of another tile', async () => {
    const board = mountBoard()

    board.emitter.emit('dragEvent', ['dragstart', '4', 0, 3, 4, 6])
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
      board.emitter.emit('dragEvent', ['dragmove', '4', x, y, 4, 6])
      await nextTick()

      const shadow = board.shadow()
      const landed = board.item('4')
      const where = `dragging to (${x}, ${y})`

      expect(shadow, where).toMatchObject({ x: landed.x, y: landed.y })
      for (const other of board.layout()) {
        if (other.i === '4') continue
        expect(overlaps(shadow, other), `${where}: shadow over item ${other.i}`).toBe(false)
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

    board.emitter.emit('dragEvent', ['dragstart', '4', 0, 3, 4, 6])
    await nextTick()
    for (const [x, y] of [
      [6, 3],
      [6, 6],
      [0, 0],
      [3, 4]
    ]) {
      board.emitter.emit('dragEvent', ['dragmove', '4', x, y, 4, 6])
      await nextTick()
    }

    // The shadow re-targets on every cell the pointer crosses. A FLIP interrupted
    // mid-flight has to restart from wherever it reached, so it falls further behind
    // on each change rather than converging; a transition on left/top always
    // interpolates from the painted value to the new one. Measured over a full sweep,
    // the FLIP left the shadow up to 1394px from the slot it was meant to show.
    expect(started).toEqual([])
  })

  it('paints under the tiles, so a tile gliding clear covers it', () => {
    const board = mountBoard()
    const children = [...board.wrapper.find('.vue-grid-layout').element.children]
    const shadowIndex = children.findIndex((n) => n.classList.contains('vue-grid-placeholder'))
    const firstTileIndex = children.findIndex(
      (n) => n.classList.contains('vue-grid-item') && !n.classList.contains('vue-grid-placeholder')
    )

    // Every tile is absolutely positioned and the shadow carries no z-index, so
    // paint order is DOM order and the shadow has to come first. (The z-index side
    // of this lives in the SFC stylesheet, which is not injected under test.)
    expect(shadowIndex).toBeGreaterThanOrEqual(0)
    expect(shadowIndex).toBeLessThan(firstTileIndex)
  })

  it('keeps the shadow on the item while resizing', async () => {
    const board = mountBoard()

    board.emitter.emit('resizeEvent', ['resizestart', '4', 0, 3, 4, 6])
    await nextTick()
    board.emitter.emit('resizeEvent', ['resizemove', '4', 0, 3, 7, 9])
    await nextTick()

    const landed = board.item('4')
    expect(board.shadow()).toMatchObject({ x: landed.x, y: landed.y, w: landed.w, h: landed.h })
  })
})
