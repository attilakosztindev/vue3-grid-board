import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

type T = { id: string; x: number; y: number; w: number; h: number }

const layout: T[] = [
  { id: 'revenue', x: 0, y: 0, w: 6, h: 4 },
  { id: 'signups', x: 6, y: 0, w: 6, h: 2 },
  { id: 'churn', x: 6, y: 2, w: 3, h: 2 },
  { id: 'sessions', x: 9, y: 2, w: 3, h: 2 }
]

function mountApp() {
  const App = defineComponent({
    setup() {
      const list = ref(layout.map((t) => ({ ...t })))
      const remove = (id: string) => (list.value = list.value.filter((t) => t.id !== id))
      return () =>
        h('div', null, [
          h('button', { class: 'outside', onClick: () => remove('churn') }),
          h(
            GridBoard,
            {
              tiles: list.value,
              columns: 12,
              'onUpdate:tiles': (next: T[]) => (list.value = next)
            },
            () =>
              list.value.map((t) =>
                h(GridTile, { key: t.id, ...t }, () =>
                  h('button', { class: 'remove', onClick: () => remove(t.id) })
                )
              )
          )
        ])
    }
  })
  return mount(App, { attachTo: document.body })
}

function tile(wrapper: ReturnType<typeof mountApp>, id: string) {
  return wrapper.find(`.grid-tile[data-tile="${id}"]:not(.grid-shadow)`)
}

async function removeWithButton(wrapper: ReturnType<typeof mountApp>, id: string) {
  const button = tile(wrapper, id).find('.remove')
  ;(button.element as HTMLElement).focus()
  await button.trigger('click')
  await nextTick()
}

describe('focus after the focused tile is removed', () => {
  it('moves to the next tile in reading order', async () => {
    const wrapper = mountApp()
    await removeWithButton(wrapper, 'signups')

    expect(tile(wrapper, 'signups').exists()).toBe(false)
    expect(document.activeElement).toBe(tile(wrapper, 'churn').element)
    wrapper.unmount()
  })

  it('moves to the previous tile when the last one goes', async () => {
    const wrapper = mountApp()
    await removeWithButton(wrapper, 'sessions')

    expect(document.activeElement).toBe(tile(wrapper, 'churn').element)
    wrapper.unmount()
  })

  it('moves the same way when the tile itself had focus', async () => {
    const wrapper = mountApp()
    ;(tile(wrapper, 'revenue').element as HTMLElement).focus()
    await tile(wrapper, 'revenue').find('.remove').trigger('click')
    await nextTick()

    expect(document.activeElement).toBe(tile(wrapper, 'signups').element)
    wrapper.unmount()
  })

  it('leaves focus alone when it was outside the board', async () => {
    const wrapper = mountApp()
    const outside = wrapper.find('.outside')
    ;(outside.element as HTMLElement).focus()
    await outside.trigger('click')
    await nextTick()

    expect(tile(wrapper, 'churn').exists()).toBe(false)
    expect(document.activeElement).toBe(outside.element)
    wrapper.unmount()
  })

  it('does nothing on Delete', async () => {
    const wrapper = mountApp()
    const el = tile(wrapper, 'churn')
    ;(el.element as HTMLElement).focus()
    const event = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })
    el.element.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(false)
    expect(tile(wrapper, 'churn').exists()).toBe(true)
    wrapper.unmount()
  })
})
