import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

const COLUMNS = 12
const GAP = 10
const COL_WIDTH = 50
const BOARD_WIDTH = COL_WIDTH * COLUMNS + GAP * (COLUMNS + 1)

function pointer(type: string, x: number, y: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  Object.defineProperty(event, 'pointerId', { value: 1 })
  Object.defineProperty(event, 'pointerType', { value: 'mouse' })
  return event
}

async function pressAndMove(dragHandle: string, handleClass: string, pressOn: string) {
  let dragstarts = 0

  const wrapper = mount(GridBoard, {
    props: { tiles: [{ id: 'a', x: 0, y: 0, w: 4, h: 2 }], columns: COLUMNS, gap: GAP },
    slots: {
      default: () =>
        h(
          GridTile,
          { id: 'a', x: 0, y: 0, w: 4, h: 2, dragHandle, onDragstart: () => dragstarts++ },
          () => [h('header', { class: handleClass }, 'Title'), h('p', { class: 'body' }, 'Body')]
        )
    },
    attachTo: document.body
  })

  const board = wrapper.find('.grid-board').element as HTMLElement
  Object.defineProperty(board, 'offsetWidth', { configurable: true, value: BOARD_WIDTH })
  ;(wrapper.vm as unknown as { dispatch: (k: string) => void }).dispatch('measure')
  await nextTick()

  const target = wrapper.find(pressOn).element
  target.dispatchEvent(pointer('pointerdown', 100, 40))
  target.dispatchEvent(pointer('pointermove', 120, 40))
  target.dispatchEvent(pointer('pointerup', 120, 40))
  await nextTick()

  wrapper.unmount()
  return dragstarts
}

describe('dragHandle', () => {
  it('takes a class name, and a press inside that class starts a drag', async () => {
    expect(await pressAndMove('card-header', 'card-header', '.card-header')).toBe(1)
  })

  it('ignores a press elsewhere in the tile', async () => {
    expect(await pressAndMove('card-header', 'card-header', '.body')).toBe(0)
  })

  it('accepts a class name with characters a selector would need escaped', async () => {
    expect(await pressAndMove('md:handle', 'md:handle', 'header')).toBe(1)
  })
})
