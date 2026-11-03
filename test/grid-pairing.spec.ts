import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

const tiles = [{ id: 'a', x: 0, y: 0, w: 2, h: 2 }]

function mountBoard(boardProps: Record<string, unknown> = {}) {
  return mount(GridBoard, {
    props: { tiles, ...boardProps },
    slots: { default: () => h(GridTile, { id: 'a', x: 0, y: 0, w: 2, h: 2 }) }
  })
}

function tileVm(wrapper: ReturnType<typeof mountBoard>) {
  return wrapper.findAllComponents(GridTile).find((c) => c.props('shadow') !== true)!
}

const BOARD_WIDTH = 730

async function measuredBoard() {
  const size: [string, number, number][] = []

  const wrapper = mount(GridBoard, {
    props: { tiles, columns: 12, rowHeight: 150, gap: 10 },
    slots: {
      default: () =>
        h(GridTile, {
          id: 'a',
          x: 0,
          y: 0,
          w: 2,
          h: 2,
          onSize: (...args: [string, number, number]) => size.push(args)
        })
    }
  })

  const board = wrapper.find('.grid-board').element as HTMLElement
  Object.defineProperty(board, 'offsetWidth', { configurable: true, value: BOARD_WIDTH })
  ;(wrapper.vm as unknown as { dispatch: (k: string) => void }).dispatch('measure')
  await nextTick()

  return { wrapper, size }
}

describe('board and tile as one pair', () => {
  it('refuses to render a tile that has no board above it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(() => mount(GridTile, { props: { id: 'a', x: 0, y: 0, w: 2, h: 2 } })).toThrow(
      /inside a GridBoard/
    )

    warn.mockRestore()
  })

  it('carries no event bus on the exposed handle', () => {
    const wrapper = mountBoard()
    const exposed = wrapper.vm as unknown as Record<string, unknown>

    expect(exposed.emitter).toBeUndefined()
    expect(typeof exposed.dispatch).toBe('function')
  })

  it('rejects a command it does not understand', () => {
    const wrapper = mountBoard()
    const dispatch = (wrapper.vm as unknown as { dispatch: (k: string) => void }).dispatch

    expect(() => dispatch('nonsense')).toThrow(/unknown command/)
  })
})

describe('board props reaching the tile', () => {
  it.each([
    ['columns', { columns: 6 }, [230, 310]],
    ['rowHeight', { rowHeight: 80 }, [110, 170]],
    ['gap', { gap: 30 }, [87, 330]]
  ])('relays %s to the tile with no bus in between', async (_label, next, expected) => {
    const { wrapper, size } = await measuredBoard()
    const before = size.at(-1)

    await wrapper.setProps(next)
    await nextTick()

    expect(before).toEqual(['a', 110, 310])
    expect(size.at(-1)).toEqual(['a', ...expected])
    wrapper.unmount()
  })

  it('turns a tile non-interactive when the board withdraws both gestures', async () => {
    const wrapper = mountBoard()
    expect(tileVm(wrapper).attributes('tabindex')).toBe('0')

    await wrapper.setProps({ draggable: false, resizable: false })
    await nextTick()

    expect(tileVm(wrapper).attributes('tabindex')).toBeUndefined()
  })

  it('lets a tile prop override the board default and survive a board change', async () => {
    const wrapper = mount(GridBoard, {
      props: { tiles, draggable: true, resizable: false },
      slots: { default: () => h(GridTile, { id: 'a', x: 0, y: 0, w: 2, h: 2, draggable: false }) }
    })

    await wrapper.setProps({ draggable: false })
    await nextTick()
    expect(tileVm(wrapper).attributes('tabindex')).toBeUndefined()

    await wrapper.setProps({ draggable: true })
    await nextTick()
    expect(tileVm(wrapper).attributes('tabindex')).toBeUndefined()
  })
})
