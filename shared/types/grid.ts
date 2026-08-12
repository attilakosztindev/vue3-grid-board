export interface GridLayoutItem {
  i: number | string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  static?: boolean
}

export interface GridConfig {
  colNum: number
  rowHeight: number
  margin: [number, number]
  interactive: boolean
}

export interface GridBoardResponse {
  config?: Partial<GridConfig>
  layout?: GridLayoutItem[]
}
