import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

type T = { id: string; x: number; y: number; w: number; h: number }

// The layout of the Keyboard example in the docs
const layout: T[] = [
  { id: 'revenue', x: 0, y: 0, w: 6, h: 4 },
  { id: 'signups', x: 6, y: 0, w: 6, h: 2 },
  { id: 'churn', x: 6, y: 2, w: 3, h: 2 },
  { id: 'sessions', x: 9, y: 2, w: 3, h: 2 }
]

// Bound like v-model:tiles, so the board compares each move against the layout it last emitted
function mountBoard(tiles: T[] = layout, gravity = true) {
  const wrapper = mount(GridBoard, {
    attachTo: document.body,
    props: {
      tiles: tiles.map((t) => ({ ...t })),
      columns: 12,
      gravity,
      'onUpdate:tiles': (next: T[]) => wrapper.setProps({ tiles: next })
    },
    slots: { default: () => tiles.map((t) => h(GridTile, { key: t.id, ...t })) }
  })
  return wrapper
}

async function press(wrapper: ReturnType<typeof mountBoard>, id: string, ...keys: string[]) {
  const el = wrapper.find(`.grid-tile[data-tile="${id}"]:not(.grid-shadow)`)
  for (const key of keys) await el.trigger('keydown', { key })
}

function slots(wrapper: ReturnType<typeof mountBoard>) {
  const tiles = wrapper.props('tiles') as T[]
  return Object.fromEntries(tiles.map((t) => [t.id, { x: t.x, y: t.y }]))
}

describe('moving a picked-up tile vertically with the keyboard', () => {
  it('moves a tile down past the tiles beneath it', async () => {
    const wrapper = mountBoard()
    await press(wrapper, 'signups', 'Enter', 'ArrowDown')

    expect(slots(wrapper)).toMatchObject({
      signups: { x: 6, y: 2 },
      churn: { x: 6, y: 0 },
      sessions: { x: 9, y: 0 }
    })
    wrapper.unmount()
  })

  it('moves a tile up past the tile above it', async () => {
    const wrapper = mountBoard()
    await press(wrapper, 'churn', 'Enter', 'ArrowUp')

    expect(slots(wrapper)).toMatchObject({
      churn: { x: 6, y: 0 },
      signups: { x: 6, y: 2 }
    })
    wrapper.unmount()
  })

  it('moves it back with the opposite arrow', async () => {
    const wrapper = mountBoard()
    await press(wrapper, 'signups', 'Enter', 'ArrowDown', 'ArrowUp')

    expect(slots(wrapper)).toMatchObject({
      signups: { x: 6, y: 0 },
      churn: { x: 6, y: 2 },
      sessions: { x: 9, y: 2 }
    })
    wrapper.unmount()
  })

  it('leaves the layout alone when there is nothing to move past', async () => {
    const wrapper = mountBoard()
    await press(wrapper, 'revenue', 'Enter', 'ArrowDown')

    expect(slots(wrapper)).toMatchObject({ revenue: { x: 0, y: 0 } })
    wrapper.unmount()
  })

  it('steps a single row when gravity is off', async () => {
    const wrapper = mountBoard([{ id: 'a', x: 0, y: 0, w: 2, h: 2 }], false)
    await press(wrapper, 'a', 'Enter', 'ArrowDown')

    expect(slots(wrapper)).toMatchObject({ a: { x: 0, y: 1 } })
    wrapper.unmount()
  })
})
