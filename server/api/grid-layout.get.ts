import type { GridBoardResponse } from '#shared/types/grid'

export default defineEventHandler((): GridBoardResponse => {
  return {
    config: {
      colNum: 12,
      rowHeight: 40,
      margin: [10, 10],
      interactive: false
    },
    layout: [
      { i: '1', x: 0, y: 0, w: 2, h: 3 },
      { i: '2', x: 2, y: 0, w: 6, h: 3 },
      { i: '3', x: 8, y: 0, w: 4, h: 3 },
      { i: '4', x: 0, y: 3, w: 6, h: 4 },
      { i: '5', x: 6, y: 3, w: 6, h: 4 },
      { i: '6', x: 0, y: 7, w: 12, h: 3 }
    ]
  }
})
