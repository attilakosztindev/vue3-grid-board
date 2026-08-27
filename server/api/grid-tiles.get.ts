import type { GridBoardResponse } from '#shared/types/grid'

export default defineEventHandler((): GridBoardResponse => {
  return {
    config: {
      columns: 12,
      rowHeight: 40,
      gap: 10,
      interactive: false
    },
    tiles: [
      { id: '1', x: 0, y: 0, w: 2, h: 3 },
      { id: '2', x: 2, y: 0, w: 6, h: 3 },
      { id: '3', x: 8, y: 0, w: 4, h: 3 },
      { id: '4', x: 0, y: 3, w: 6, h: 4 },
      { id: '5', x: 6, y: 3, w: 6, h: 4 },
      { id: '6', x: 0, y: 7, w: 12, h: 3 }
    ]
  }
})
