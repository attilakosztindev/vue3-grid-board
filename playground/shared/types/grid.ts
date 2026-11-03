export interface GridTileData {
  id: number | string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  frozen?: boolean
}

export interface GridConfig {
  columns: number
  rowHeight: number
  gap: number
  interactive: boolean
}

export interface GridBoardResponse {
  config?: Partial<GridConfig>
  tiles?: GridTileData[]
}
