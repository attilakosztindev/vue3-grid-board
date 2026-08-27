import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import GridBoard from '~/grid/grid-board.vue'
import GridTile from '~/grid/grid-tile.vue'

const tiles = [{ id: 'a', x: 0, y: 0, w: 2, h: 2 }]

function pointer(type: string, x: number, y: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  Object.defineProperty(event, 'pointerId', { value: 1 })
  Object.defineProperty(event, 'pointerType', { value: 'mouse' })
  return event
}

function mimicBrowserOffsetParent(tile: HTMLElement, board: HTMLElement) {
  Object.defineProperty(tile, 'offsetParent', {
    configurable: true,
    get: () => (tile.style.position === 'fixed' ? null : board)
  })
}

function mountBoard(overflow: boolean) {
  return mount(GridBoard, {
    props: { tiles, overflow },
    slots: { default: () => h(GridTile, { id: 'a', x: 0, y: 0, w: 2, h: 2 }) },
    attachTo: document.body
  })
}

function tileStyle(wrapper: ReturnType<typeof mountBoard>) {
  return wrapper.find('.grid-tile:not(.grid-shadow)').attributes('style') ?? ''
}

describe('overflow', () => {
  it('leaves a resting tile positioned inside the board', () => {
    const wrapper = mountBoard(true)
    const style = tileStyle(wrapper)

    expect(style).toContain('position: absolute')
    expect(style).not.toContain('position: fixed')
    wrapper.unmount()
  })

  it('does not raise a resting tile above the rest of the page', () => {
    const wrapper = mountBoard(true)

    expect(tileStyle(wrapper)).not.toContain('2147483647')
    wrapper.unmount()
  })

  it('is off by default, so the board stays a plain stacking context', () => {
    const wrapper = mount(GridBoard, {
      props: { tiles },
      slots: { default: () => h(GridTile, { id: 'a', x: 0, y: 0, w: 2, h: 2 }) }
    })

    expect(wrapper.props('overflow')).toBe(false)
    expect(tileStyle(wrapper)).toContain('position: absolute')
    wrapper.unmount()
  })
})

describe('a tile that has escaped its board', () => {
  async function startEscapedDrag() {
    const wrapper = mountBoard(true)
    const tile = wrapper.find('.grid-tile:not(.grid-shadow)').element as HTMLElement
    const board = wrapper.find('.grid-board').element as HTMLElement

    mimicBrowserOffsetParent(tile, board)

    tile.dispatchEvent(pointer('pointerdown', 100, 100))
    tile.dispatchEvent(pointer('pointermove', 140, 140))
    await nextTick()

    return { wrapper, tile }
  }

  it('pins itself to the viewport for the length of the gesture', async () => {
    const { wrapper, tile } = await startEscapedDrag()

    expect(tile.style.position).toBe('fixed')
    wrapper.unmount()
  })

  it('stays pinned while the page scrolls, instead of flipping back every frame', async () => {
    const { wrapper, tile } = await startEscapedDrag()

    for (let i = 0; i < 5; i++) {
      window.dispatchEvent(new Event('scroll'))
      await nextTick()
      expect(tile.style.position, `after scroll ${i + 1}`).toBe('fixed')
    }

    wrapper.unmount()
  })

  it('drops back into the board when the gesture ends', async () => {
    const { wrapper, tile } = await startEscapedDrag()

    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    tile.dispatchEvent(pointer('pointerup', 140, 140))
    await nextTick()

    expect(tile.style.position).toBe('absolute')
    wrapper.unmount()
  })
})

describe('gesture start events', () => {
  it('declares dragstart and resizestart alongside their end counterparts', () => {
    const declared = (GridTile as unknown as { emits: string[] }).emits

    expect(declared).toContain('dragstart')
    expect(declared).toContain('resizestart')
    expect(declared).toContain('dragend')
    expect(declared).toContain('resizeend')
  })
})
