import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import GridBoard from '~/grid/grid-board.vue'
import GridTile from '~/grid/grid-tile.vue'

const COLUMNS = 12
const ROW_HEIGHT = 40
const GAP = 10
const COL_WIDTH = 50
const BOARD_WIDTH = COL_WIDTH * COLUMNS + GAP * (COLUMNS + 1)

const START_W = 4
const START_H = 2
const END_W = 6
const END_H = 4

type Payload = [string, number, number]

function pointer(type: string, x: number, y: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  Object.defineProperty(event, 'pointerId', { value: 1 })
  Object.defineProperty(event, 'pointerType', { value: 'mouse' })
  return event
}

function spanToPixels(w: number, h: number) {
  return {
    width: COL_WIDTH * w + GAP * (w - 1),
    height: ROW_HEIGHT * h + GAP * (h - 1)
  }
}

async function resizeGesture() {
  const resizestart: Payload[] = []
  const resize: Payload[] = []
  const resizeend: Payload[] = []

  const wrapper = mount(GridBoard, {
    props: {
      tiles: [{ id: 'a', x: 0, y: 0, w: START_W, h: START_H }],
      columns: COLUMNS,
      rowHeight: ROW_HEIGHT,
      gap: GAP
    },
    slots: {
      default: () =>
        h(GridTile, {
          id: 'a',
          x: 0,
          y: 0,
          w: START_W,
          h: START_H,
          onResizestart: (...args: Payload) => resizestart.push(args),
          onResize: (...args: Payload) => resize.push(args),
          onResizeend: (...args: Payload) => resizeend.push(args)
        })
    },
    attachTo: document.body
  })

  const board = wrapper.find('.grid-board').element as HTMLElement
  Object.defineProperty(board, 'offsetWidth', { configurable: true, value: BOARD_WIDTH })
  ;(wrapper.vm as unknown as { dispatch: (k: string) => void }).dispatch('measure')
  await nextTick()

  const handle = wrapper.find('.grid-handle').element
  const from = spanToPixels(START_W, START_H)
  const to = spanToPixels(END_W, END_H)

  const originX = 200
  const originY = 80
  const nudgeX = originX + 4
  const nudgeY = originY + 4

  handle.dispatchEvent(pointer('pointerdown', originX, originY))
  handle.dispatchEvent(pointer('pointermove', nudgeX, nudgeY))
  handle.dispatchEvent(
    pointer(
      'pointermove',
      nudgeX + (to.width - from.width) - 4,
      nudgeY + (to.height - from.height) - 4
    )
  )
  handle.dispatchEvent(pointer('pointerup', 0, 0))
  await nextTick()

  return { wrapper, resizestart, resize, resizeend }
}

describe('resizeend', () => {
  it('fires once when a gesture changes the span', async () => {
    const { wrapper, resizeend } = await resizeGesture()

    expect(resizeend).toHaveLength(1)
    wrapper.unmount()
  })

  it('reports the span the tile settles at, not the span it started from', async () => {
    const { wrapper, resizestart, resizeend } = await resizeGesture()

    expect(resizestart[0]).toEqual(['a', START_W, START_H])
    expect(resizeend[0]).toEqual(['a', END_W, END_H])
    wrapper.unmount()
  })

  it('agrees with the last resize payload of the same gesture', async () => {
    const { wrapper, resize, resizeend } = await resizeGesture()

    expect(resize.length).toBeGreaterThan(0)
    expect(resizeend[0]).toEqual(resize.at(-1))
    wrapper.unmount()
  })
})
