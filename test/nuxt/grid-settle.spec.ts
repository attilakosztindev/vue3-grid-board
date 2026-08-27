import { describe, expect, it } from 'vitest'
import { applyGravity, copyTiles, getTileById, moveTile } from '~/grid/helpers/helpers'

type T = { id: string; x: number; y: number; w: number; h: number; frozen?: boolean }

const BOARD: T[] = [
  { id: '1', x: 0, y: 0, w: 2, h: 3 },
  { id: '2', x: 2, y: 0, w: 6, h: 3 },
  { id: '3', x: 8, y: 0, w: 4, h: 3 },
  { id: '4', x: 0, y: 3, w: 6, h: 4 },
  { id: '5', x: 6, y: 3, w: 6, h: 4 },
  { id: '6', x: 0, y: 7, w: 12, h: 3 }
]

function dragTo(tiles: T[], id: string, x: number, y: number) {
  const next = moveTile(tiles, getTileById(tiles, id)!, x, y, true, false)
  applyGravity(next, true, id)
  return next
}

function rowOf(tiles: T[], id: string) {
  return getTileById(tiles, id)!.y
}

function overlappingPairs(tiles: T[]) {
  const pairs: string[] = []
  tiles.forEach((a, i) => {
    for (const b of tiles.slice(i + 1)) {
      const apart = a.x + a.w <= b.x || a.x >= b.x + b.w || a.y + a.h <= b.y || a.y >= b.y + b.h
      if (!apart) pairs.push(`${a.id}/${b.id}`)
    }
  })
  return pairs
}

describe('settling during a gesture', () => {
  it('lifts both side-by-side neighbours together when a full-width tile is dragged past them', () => {
    const after = dragTo(copyTiles(BOARD) as T[], '6', 0, 4)

    expect(rowOf(after, '6')).toBe(3)
    expect(rowOf(after, '4')).toBe(rowOf(after, '5'))
    expect(rowOf(after, '4')).toBe(6)
  })

  it('keeps the drag continuous instead of snapping back a band mid-gesture', () => {
    const rows = [5, 4, 3, 2, 1, 0].map((y) => {
      const after = dragTo(copyTiles(BOARD) as T[], '6', 0, y)
      return { y, six: rowOf(after, '6'), four: rowOf(after, '4'), five: rowOf(after, '5') }
    })

    for (const row of rows) expect(row.four).toBe(row.five)

    let previous = Number.POSITIVE_INFINITY
    for (const row of rows) {
      expect(row.six, `dragged to y${row.y}`).toBeLessThanOrEqual(previous)
      previous = row.six
    }
  })

  it('swaps with every neighbour it straddles, not just the leftmost one', () => {
    const board: T[] = [
      { id: 'left', x: 2, y: 0, w: 2, h: 4 },
      { id: 'right', x: 4, y: 0, w: 2, h: 5 },
      { id: 'dragged', x: 3, y: 0, w: 2, h: 3 }
    ]

    const after = dragTo(copyTiles(board) as T[], 'dragged', 3, 1)

    expect(rowOf(after, 'dragged')).toBe(0)
    expect(rowOf(after, 'left')).toBe(rowOf(after, 'right'))
    expect(rowOf(after, 'left')).toBe(3)
  })

  it('still lets a tile be dragged downwards past its neighbour', () => {
    const board: T[] = [
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 0, y: 2, w: 2, h: 2 }
    ]

    const after = dragTo(copyTiles(board) as T[], 'a', 0, 3)

    expect(rowOf(after, 'b')).toBe(0)
    expect(rowOf(after, 'a')).toBe(2)
  })

  it('never displaces a frozen tile to make room for the dragged one', () => {
    const board: T[] = [
      { id: 'frozen', x: 2, y: 0, w: 2, h: 4, frozen: true },
      { id: 'dragged', x: 3, y: 0, w: 2, h: 3 }
    ]

    const after = dragTo(copyTiles(board) as T[], 'dragged', 3, 1)

    expect(getTileById(after, 'frozen')!.y).toBe(0)
    expect(getTileById(after, 'frozen')!.x).toBe(2)
    expect(rowOf(after, 'dragged')).toBe(4)
  })

  it('never leaves overlapping tiles, wherever a tile is dragged', () => {
    for (const tile of BOARD) {
      for (let y = 0; y <= 10; y++) {
        for (let x = 0; x <= 12 - tile.w; x++) {
          const after = dragTo(copyTiles(BOARD) as T[], tile.id, x, y)
          expect(overlappingPairs(after), `drag ${tile.id} to (${x}, ${y})`).toEqual([])
        }
      }
    }
  })
})
