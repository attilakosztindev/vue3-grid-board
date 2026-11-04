import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

type T = {
  id: string
  x: number
  y: number
  w: number
  h: number
  removable?: boolean
  frozen?: boolean
}

const layout: T[] = [
  { id: 'revenue', x: 0, y: 0, w: 6, h: 4 },
  { id: 'signups', x: 6, y: 0, w: 6, h: 2 },
  { id: 'churn', x: 6, y: 2, w: 3, h: 2 },
  { id: 'sessions', x: 9, y: 2, w: 3, h: 2 }
]

function mountApp({
  tiles = layout,
  listen = true,
  remove = true,
  buttons = false,
  board = { removable: true }
}: {
  tiles?: T[]
  listen?: boolean
  remove?: boolean
  buttons?: boolean
  board?: Record<string, unknown>
} = {}) {
  const removed: string[] = []
  const App = defineComponent({
    setup() {
      const list = ref(tiles.map((t) => ({ ...t })))
      const onRemove = (id: string) => {
        removed.push(id)
        if (remove) list.value = list.value.filter((t) => t.id !== id)
      }
      return () =>
        h(
          GridBoard,
          {
            tiles: list.value,
            columns: 12,
            ...board,
            'onUpdate:tiles': (next: T[]) => (list.value = next),
            ...(listen ? { onRemove } : {})
          },
          () =>
            list.value.map((t) =>
              h(GridTile, { key: t.id, ...t }, () =>
                buttons ? h('button', { class: 'remove', onClick: () => onRemove(t.id) }) : null
              )
            )
        )
    }
  })
  const wrapper = mount(App, { attachTo: document.body })
  return { wrapper, removed }
}

function tile(wrapper: ReturnType<typeof mountApp>['wrapper'], id: string) {
  return wrapper.find(`.grid-tile[data-tile="${id}"]:not(.grid-shadow)`)
}

async function press(wrapper: ReturnType<typeof mountApp>['wrapper'], id: string, key: string) {
  const el = tile(wrapper, id)
  ;(el.element as HTMLElement).focus()
  await el.trigger('keydown', { key })
  await nextTick()
}

function ids(wrapper: ReturnType<typeof mountApp>['wrapper']) {
  return wrapper.findAll('.grid-tile:not(.grid-shadow)').map((t) => t.attributes('data-tile'))
}

describe('removing a tile with the keyboard', () => {
  it('asks the app to remove the focused tile on Delete', async () => {
    const { wrapper, removed } = mountApp()
    await press(wrapper, 'churn', 'Delete')

    expect(removed).toEqual(['churn'])
    expect(ids(wrapper)).toEqual(['revenue', 'signups', 'sessions'])
    wrapper.unmount()
  })

  it('treats Backspace the same', async () => {
    const { wrapper, removed } = mountApp()
    await press(wrapper, 'signups', 'Backspace')

    expect(removed).toEqual(['signups'])
    wrapper.unmount()
  })

  it('moves focus to the next tile in reading order', async () => {
    const { wrapper } = mountApp()
    await press(wrapper, 'signups', 'Delete')

    expect(document.activeElement).toBe(tile(wrapper, 'churn').element)
    wrapper.unmount()
  })

  it('moves focus to the previous tile when the last one goes', async () => {
    const { wrapper } = mountApp()
    await press(wrapper, 'sessions', 'Delete')

    expect(document.activeElement).toBe(tile(wrapper, 'churn').element)
    wrapper.unmount()
  })

  it('announces the removal', async () => {
    const { wrapper } = mountApp({ tiles: [{ id: 'only', x: 0, y: 0, w: 2, h: 2 }] })
    await press(wrapper, 'only', 'Delete')

    expect(wrapper.find('[role="status"]').text()).toBe('Tile only. Removed.')
    wrapper.unmount()
  })

  it('keeps focus and announces nothing when the app keeps the tile', async () => {
    const { wrapper, removed } = mountApp({ remove: false })
    await press(wrapper, 'churn', 'Delete')

    expect(removed).toEqual(['churn'])
    expect(document.activeElement).toBe(tile(wrapper, 'churn').element)
    expect(wrapper.find('[role="status"]').text()).toBe('')
    wrapper.unmount()
  })

  it('puts a picked-up tile back before removing it', async () => {
    const { wrapper, removed } = mountApp()
    await press(wrapper, 'signups', 'Enter')
    await tile(wrapper, 'signups').trigger('keydown', { key: 'ArrowDown' })
    await tile(wrapper, 'signups').trigger('keydown', { key: 'Delete' })
    await nextTick()

    expect(removed).toEqual(['signups'])
    expect(ids(wrapper)).toEqual(['revenue', 'churn', 'sessions'])
    const status = wrapper.find('[role="status"]').text()
    expect(status).toBe('Tile signups. Removed.')
    wrapper.unmount()
  })

  it('moves focus on when a button inside the tile removes it', async () => {
    const { wrapper } = mountApp({ listen: false, buttons: true })
    const button = tile(wrapper, 'revenue').find('.remove')
    ;(button.element as HTMLElement).focus()
    await button.trigger('click')
    await nextTick()

    expect(ids(wrapper)).toEqual(['signups', 'churn', 'sessions'])
    expect(document.activeElement).toBe(tile(wrapper, 'signups').element)
    wrapper.unmount()
  })
})

describe('what makes a tile removable', () => {
  it('does nothing when the app does not listen for remove', async () => {
    const { wrapper } = mountApp({ listen: false })
    const el = tile(wrapper, 'churn')
    const event = new KeyboardEvent('keydown', { key: 'Delete', cancelable: true })
    el.element.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(false)
    expect(ids(wrapper)).toHaveLength(4)
    expect(el.attributes('aria-describedby')?.split(' ')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Delete')
    wrapper.unmount()
  })

  it('skips a tile with removable set to false', async () => {
    const tiles = layout.map((t) => (t.id === 'churn' ? { ...t, removable: false } : t))
    const { wrapper, removed } = mountApp({ tiles })
    await press(wrapper, 'churn', 'Delete')
    await press(wrapper, 'signups', 'Delete')

    expect(removed).toEqual(['signups'])
    wrapper.unmount()
  })

  it('is off unless removable is set', async () => {
    const { wrapper, removed } = mountApp({ board: {} })
    await press(wrapper, 'churn', 'Delete')

    expect(removed).toEqual([])
    expect(ids(wrapper)).toHaveLength(4)
    expect(tile(wrapper, 'churn').attributes('aria-describedby')?.split(' ')).toHaveLength(1)
    wrapper.unmount()
  })

  it('lets a single tile opt in', async () => {
    const tiles = layout.map((t) => (t.id === 'churn' ? { ...t, removable: true } : t))
    const { wrapper, removed } = mountApp({ tiles, board: {} })
    await press(wrapper, 'signups', 'Delete')
    await press(wrapper, 'churn', 'Delete')

    expect(removed).toEqual(['churn'])
    wrapper.unmount()
  })

  it('makes a tile on a static board a tab stop, described only by the Delete key', async () => {
    const { wrapper } = mountApp({
      board: { draggable: false, resizable: false, removable: true }
    })
    const el = tile(wrapper, 'churn')

    expect(el.attributes('tabindex')).toBe('0')
    expect(el.attributes('aria-roledescription')).toBeUndefined()
    const described = el.attributes('aria-describedby')?.split(' ') ?? []
    expect(described).toHaveLength(1)
    expect(wrapper.find(`[id="${described[0]}"]`).text()).toBe('Press Delete to remove the tile.')
    wrapper.unmount()
  })

  it('describes a movable, removable tile with both paragraphs', async () => {
    const { wrapper } = mountApp()
    const described = tile(wrapper, 'churn').attributes('aria-describedby')?.split(' ') ?? []

    expect(described).toHaveLength(2)
    expect(wrapper.find(`[id="${described[1]}"]`).text()).toBe('Press Delete to remove the tile.')
    wrapper.unmount()
  })

  it('leaves frozen tiles alone', async () => {
    const tiles = layout.map((t) => (t.id === 'churn' ? { ...t, frozen: true } : t))
    const { wrapper, removed } = mountApp({ tiles })
    await tile(wrapper, 'churn').trigger('keydown', { key: 'Delete' })

    expect(removed).toEqual([])
    expect(tile(wrapper, 'churn').attributes('tabindex')).toBeUndefined()
    wrapper.unmount()
  })
})
