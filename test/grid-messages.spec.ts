import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import GridBoard from '../src/grid-board.vue'
import GridTile from '../src/grid-tile.vue'

const tiles = [{ id: 'a', x: 0, y: 0, w: 2, h: 2 }]

function mountBoard(messages?: Record<string, unknown>) {
  return mount(GridBoard, {
    attachTo: document.body,
    props: { tiles, ...(messages ? { messages } : {}) },
    slots: { default: () => tiles.map((t) => h(GridTile, { key: t.id, ...t })) }
  })
}

describe('the text the board reads out', () => {
  it('is English by default, and marked as English', () => {
    const wrapper = mountBoard()
    const tile = wrapper.find('.grid-tile:not(.grid-shadow)')

    expect(tile.attributes('aria-roledescription')).toBe('Draggable tile')
    expect(tile.attributes('aria-label')).toBe('Tile a, column 1, row 1, 2 wide, 2 tall')
    for (const region of wrapper.findAll('.grid-sr')) expect(region.attributes('lang')).toBe('en')
    wrapper.unmount()
  })

  it('comes from messages, in the language of the page', async () => {
    const wrapper = mountBoard({
      roleDescription: 'Verschiebbare Kachel',
      tileName: (id: string) => `Kachel ${id}`,
      tileLabel: ({ name, column, row }: { name: string; column: number; row: number }) =>
        `${name}, Spalte ${column}, Zeile ${row}`,
      instructions: 'Mit Enter aufnehmen.',
      pickedUp: 'Aufgenommen.'
    })
    const tile = wrapper.find('.grid-tile:not(.grid-shadow)')

    expect(tile.attributes('aria-roledescription')).toBe('Verschiebbare Kachel')
    expect(tile.attributes('aria-label')).toBe('Kachel a, Spalte 1, Zeile 1')
    expect(wrapper.find(`#${tile.attributes('aria-describedby')}`).text()).toBe(
      'Mit Enter aufnehmen.'
    )
    for (const region of wrapper.findAll('.grid-sr')) {
      expect(region.attributes('lang')).toBeUndefined()
    }

    await tile.trigger('keydown', { key: 'Enter' })
    await nextTick()
    expect(wrapper.find('[role="status"]').text()).toBe('Kachel a, Spalte 1, Zeile 1. Aufgenommen.')
    wrapper.unmount()
  })
})
