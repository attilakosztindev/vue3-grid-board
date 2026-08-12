import { describe, expect, it } from 'vitest'
import { cloneLayout, compact, getLayoutItem, moveElement } from '~/grid-fork/helpers/helpers'

type Item = { i: string; x: number; y: number; w: number; h: number }

const BOARD: Item[] = [
  { i: '1', x: 0, y: 0, w: 2, h: 3 },
  { i: '2', x: 2, y: 0, w: 6, h: 3 },
  { i: '3', x: 8, y: 0, w: 4, h: 3 },
  { i: '4', x: 0, y: 3, w: 6, h: 4 },
  { i: '5', x: 6, y: 3, w: 6, h: 4 },
  { i: '6', x: 0, y: 7, w: 12, h: 3 }
]

/** Mirrors what grid-layout.vue does for a single drag frame. */
function dragTo(layout: Item[], id: string, x: number, y: number) {
  const next = moveElement(layout, getLayoutItem(layout, id), x, y, true, false)
  compact(next, true, id)
  return next as Item[]
}

function rowOf(layout: Item[], id: string) {
  return getLayoutItem(layout, id).y
}

function overlappingPairs(layout: Item[]) {
  const pairs: string[] = []
  layout.forEach((l1, a) => {
    for (const l2 of layout.slice(a + 1)) {
      const apart =
        l1.x + l1.w <= l2.x || l1.x >= l2.x + l2.w || l1.y + l1.h <= l2.y || l1.y >= l2.y + l2.h
      if (!apart) pairs.push(`${l1.i}/${l2.i}`)
    }
  })
  return pairs
}

describe('compaction during a gesture', () => {
  it('lifts both side-by-side neighbours together when a full-width tile is dragged past them', () => {
    // Item 6 spans the full width, so it collides with items 4 and 5 at once.
    // Item 4 sits at the same (x, y) that item 6 lands on, which used to win the
    // sort tie and strand item 5 an entire band below item 4.
    const after = dragTo(cloneLayout(BOARD) as Item[], '6', 0, 4)

    expect(rowOf(after, '6')).toBe(3)
    expect(rowOf(after, '4')).toBe(rowOf(after, '5'))
    expect(rowOf(after, '4')).toBe(6)
  })

  it('keeps the drag continuous instead of snapping back a band mid-gesture', () => {
    const rows = [5, 4, 3, 2, 1, 0].map((y) => {
      const after = dragTo(cloneLayout(BOARD) as Item[], '6', 0, y)
      return { y, six: rowOf(after, '6'), four: rowOf(after, '4'), five: rowOf(after, '5') }
    })

    // Item 4 and item 5 must never split across different bands.
    for (const row of rows) expect(row.four).toBe(row.five)

    // Dragging further up may only ever move item 6 up, never back down.
    let previous = Number.POSITIVE_INFINITY
    for (const row of rows) {
      expect(row.six, `dragged to y${row.y}`).toBeLessThanOrEqual(previous)
      previous = row.six
    }
  })

  it('never leaves overlapping tiles, wherever an item is dragged', () => {
    for (const item of BOARD) {
      for (let y = 0; y <= 10; y++) {
        for (let x = 0; x <= 12 - item.w; x++) {
          const after = dragTo(cloneLayout(BOARD) as Item[], item.i, x, y)
          expect(overlappingPairs(after), `drag ${item.i} to (${x}, ${y})`).toEqual([])
        }
      }
    }
  })
})
