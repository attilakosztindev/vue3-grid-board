import type { DefineComponent } from 'vue'
import type { GridBoardEmits, GridBoardProps, GridTileEmits, GridTileProps } from './types'

export * from './types'
export * from './helpers/helpers'
export * from './helpers/usePointerDragResize'
export { GRID_BOARD } from './context'

export declare const GridBoard: DefineComponent<
  GridBoardProps,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  never,
  never,
  GridBoardEmits
>

export declare const GridTile: DefineComponent<
  GridTileProps,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  never,
  never,
  GridTileEmits
>
