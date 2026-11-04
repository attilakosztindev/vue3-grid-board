import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

type T = { id: string; x: number; y: number; w: number; h: number }

const COLUMNS = 12
const GAP = 10
const BOARD_WIDTH = 50 * COLUMNS + GAP * (COLUMNS + 1)

async function mountBoard(tiles: T[]) {
  let current = tiles
  const wrapper = mount(GridBoard, {
    attachTo: document.body,
    props: { tiles, columns: COLUMNS, rowHeight: 40, gap: GAP },
    slots: { default: () => current.map((t) => h(GridTile, { key: t.id, ...t })) }
  })
  const board = wrapper.find('.grid-board').element as HTMLElement
  Object.defineProperty(board, 'offsetWidth', { configurable: true, value: BOARD_WIDTH })
  ;(wrapper.vm as unknown as { dispatch: (k: string) => void }).dispatch('measure')
  await nextTick()

  return {
    wrapper,
    board,
    async setTiles(next: T[]) {
      current = next
      await wrapper.setProps({ tiles: next })
      await nextTick()
    }
  }
}

describe('the board height transition', () => {
  it('uses the grow duration while the board grows, and the shrink duration otherwise', async () => {
    const { wrapper, board, setTiles } = await mountBoard([{ id: 'a', x: 0, y: 0, w: 2, h: 2 }])

    await setTiles([{ id: 'a', x: 0, y: 0, w: 2, h: 4 }])
    expect(board.style.transitionDuration).toBe('var(--grid-board-grow-duration, 150ms)')

    await setTiles([{ id: 'a', x: 0, y: 0, w: 2, h: 1 }])
    expect(board.style.transitionDuration).toBe('')

    wrapper.unmount()
  })
})

describe('the tile movement animation', () => {
  const animate = vi.fn(() => ({ cancel: vi.fn(), onfinish: null, oncancel: null }))

  beforeEach(() => {
    animate.mockClear()
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate })
  })

  afterEach(() => {
    delete (HTMLElement.prototype as { animate?: unknown }).animate
  })

  async function moveTileB(variables: Record<string, string> = {}) {
    const a = { id: 'a', x: 0, y: 0, w: 2, h: 2 }
    const b = { id: 'b', x: 2, y: 0, w: 2, h: 2 }
    const { wrapper, board, setTiles } = await mountBoard([a, b])
    for (const [name, value] of Object.entries(variables)) board.style.setProperty(name, value)

    await setTiles([a, { ...b, x: 6 }])
    wrapper.unmount()
    return animate.mock.calls.map((call) => (call as unknown[])[1])
  }

  it('defaults to 220ms on the settle curve', async () => {
    expect(await moveTileB()).toEqual([
      { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)', composite: 'add' }
    ])
  })

  it('takes its duration and easing from --grid-tile-duration and --grid-tile-easing', async () => {
    const calls = await moveTileB({
      '--grid-tile-duration': '480ms',
      '--grid-tile-easing': 'linear'
    })
    expect(calls).toEqual([{ duration: 480, easing: 'linear', composite: 'add' }])
  })

  it('reads a duration given in seconds', async () => {
    expect(await moveTileB({ '--grid-tile-duration': '0.5s' })).toMatchObject([{ duration: 500 }])
  })

  it('does not animate at all when the duration is 0', async () => {
    expect(await moveTileB({ '--grid-tile-duration': '0ms' })).toEqual([])
  })

  it('reads the timing from the board once, however many tiles move together', async () => {
    const start = [
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 2, y: 0, w: 2, h: 2 },
      { id: 'c', x: 4, y: 0, w: 2, h: 2 }
    ]
    const { wrapper, board, setTiles } = await mountBoard(start)
    const read = vi.spyOn(window, 'getComputedStyle')

    await setTiles(start.map((t) => ({ ...t, x: t.x + 6 })))

    expect(animate).toHaveBeenCalledTimes(3)
    expect(read.mock.calls.filter(([el]) => el === board)).toHaveLength(1)
    read.mockRestore()
    wrapper.unmount()
  })
})
