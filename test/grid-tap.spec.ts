import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

type T = { id: string; x: number; y: number; w: number; h: number }

const COLUMNS = 12
const GAP = 10
const COL_WIDTH = 50
const ROW_HEIGHT = 40
const BOARD_WIDTH = COL_WIDTH * COLUMNS + GAP * (COLUMNS + 1)

function pointer(type: string, x = 0, y = 0) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  Object.defineProperty(event, 'pointerId', { value: 1 })
  Object.defineProperty(event, 'pointerType', { value: 'mouse' })
  return event
}

function cellCentre(column: number, row: number) {
  return {
    x: GAP + column * (COL_WIDTH + GAP) + COL_WIDTH / 2,
    y: GAP + row * (ROW_HEIGHT + GAP) + ROW_HEIGHT / 2
  }
}

async function mountBoard(tiles: T[], content?: () => unknown) {
  const wrapper = mount(GridBoard, {
    attachTo: document.body,
    props: {
      tiles,
      columns: COLUMNS,
      rowHeight: ROW_HEIGHT,
      gap: GAP,
      gravity: false,
      'onUpdate:tiles': (next: T[]) => wrapper.setProps({ tiles: next })
    },
    slots: {
      default: () => tiles.map((t) => h(GridTile, { key: t.id, ...t }, content))
    }
  })
  const board = wrapper.find('.grid-board').element as HTMLElement
  Object.defineProperty(board, 'offsetWidth', { configurable: true, value: BOARD_WIDTH })
  board.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: BOARD_WIDTH, height: 400 }) as DOMRect
  ;(wrapper.vm as unknown as { dispatch: (k: string) => void }).dispatch('measure')
  await nextTick()
  return { wrapper, board }
}

function tileEl(wrapper: Awaited<ReturnType<typeof mountBoard>>['wrapper'], id: string) {
  return wrapper.find(`.grid-tile[data-tile="${id}"]:not(.grid-shadow)`).element as HTMLElement
}

async function tap(el: Element) {
  el.dispatchEvent(pointer('pointerdown', 5, 5))
  el.dispatchEvent(pointer('pointerup', 5, 5))
  el.dispatchEvent(pointer('click', 5, 5))
  await nextTick()
}

async function tapCell(target: Element, column: number, row: number) {
  const { x, y } = cellCentre(column, row)
  target.dispatchEvent(pointer('mousedown', x, y))
  target.dispatchEvent(pointer('click', x, y))
  await nextTick()
  await nextTick()
}

function slotOf(wrapper: Awaited<ReturnType<typeof mountBoard>>['wrapper'], id: string) {
  const tile = (wrapper.props('tiles') as T[]).find((t) => t.id === id)!
  return { x: tile.x, y: tile.y, w: tile.w, h: tile.h }
}

function announced(board: HTMLElement) {
  return board.querySelector('[role="status"]')!.textContent!.trim()
}

const pair: T[] = [
  { id: 'a', x: 0, y: 0, w: 2, h: 2 },
  { id: 'b', x: 4, y: 0, w: 2, h: 2 }
]

describe('moving a tile without dragging', () => {
  it('picks a tile up on a tap, and moves it to the next cell tapped', async () => {
    const { wrapper, board } = await mountBoard(pair)
    await tap(tileEl(wrapper, 'a'))

    expect(tileEl(wrapper, 'a').dataset.grabbed).toBe('true')
    expect(announced(board)).toContain('Tap where it should go')

    await tapCell(board, 8, 3)
    expect(slotOf(wrapper, 'a')).toMatchObject({ x: 8, y: 3 })
    expect(tileEl(wrapper, 'a').dataset.grabbed).toBeUndefined()
    expect(announced(board)).toContain('Dropped.')
    wrapper.unmount()
  })

  it('puts the tile down when it is tapped again', async () => {
    const { wrapper, board } = await mountBoard(pair)
    await tap(tileEl(wrapper, 'a'))
    await tap(tileEl(wrapper, 'a'))
    await nextTick()

    expect(tileEl(wrapper, 'a').dataset.grabbed).toBeUndefined()
    expect(slotOf(wrapper, 'a')).toMatchObject({ x: 0, y: 0 })
    expect(announced(board)).toContain('Put down.')
    wrapper.unmount()
  })

  it('moves the waiting tile onto another tile that is tapped, instead of picking that one up', async () => {
    const { wrapper } = await mountBoard(pair)
    await tap(tileEl(wrapper, 'a'))
    const b = tileEl(wrapper, 'b')
    b.dispatchEvent(pointer('pointerdown', 5, 5))
    b.dispatchEvent(pointer('pointerup', 5, 5))
    await tapCell(b, 4, 0)

    expect(slotOf(wrapper, 'a')).toMatchObject({ x: 4, y: 0 })
    expect(tileEl(wrapper, 'b').dataset.grabbed).toBeUndefined()
    wrapper.unmount()
  })

  it('leaves a tap on a control inside the tile to that control', async () => {
    const { wrapper } = await mountBoard(pair, () => h('input', { class: 'field' }))
    await tap(wrapper.find('[data-tile="a"] .field').element)

    expect(tileEl(wrapper, 'a').dataset.grabbed).toBeUndefined()
    wrapper.unmount()
  })

  it('resizes a tile to the cell tapped after its grip', async () => {
    const { wrapper, board } = await mountBoard(pair)
    await tap(wrapper.find('[data-tile="a"] .grid-handle').element)
    expect(announced(board)).toContain('Picked up to resize')

    await tapCell(board, 4, 3)
    expect(slotOf(wrapper, 'a')).toMatchObject({ x: 0, y: 0, w: 5, h: 4 })
    wrapper.unmount()
  })

  it('keeps focus on the waiting tile when the next tap lands elsewhere on the board', async () => {
    const { wrapper, board } = await mountBoard(pair)
    await tap(tileEl(wrapper, 'a'))

    const press = pointer('mousedown', 400, 300)
    board.dispatchEvent(press)
    expect(press.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(tileEl(wrapper, 'a'))
    wrapper.unmount()
  })
})
