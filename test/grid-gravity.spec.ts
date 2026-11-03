import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

type T = { id: string; x: number; y: number; w: number; h: number }

const tiles: T[] = [{ id: 'a', x: 0, y: 4, w: 2, h: 2 }]

function mountBoard(gravity: boolean) {
  return mount(GridBoard, {
    props: { tiles: tiles.map((t) => ({ ...t })), gravity },
    slots: {
      default: () => h(GridTile, { id: 'a', x: 0, y: 4, w: 2, h: 2 })
    }
  })
}

function rowOf(wrapper: ReturnType<typeof mountBoard>) {
  const emitted = wrapper.emitted('update:tiles') as T[][][] | undefined
  const committed = emitted?.at(-1)?.[0]
  return (committed ?? (wrapper.props('tiles') as T[]))[0]!.y
}

describe('gravity as a reactive prop', () => {
  it('leaves the tile where it was put while gravity is off', () => {
    expect(rowOf(mountBoard(false))).toBe(4)
  })

  it('pulls the tile to the top while gravity is on', () => {
    expect(rowOf(mountBoard(true))).toBe(0)
  })

  it('re-runs gravity when the prop is switched back on', async () => {
    const wrapper = mountBoard(false)
    expect(rowOf(wrapper)).toBe(4)

    await wrapper.setProps({ gravity: true })

    expect(rowOf(wrapper)).toBe(0)
  })
})
