import type { DefineComponent, PublicProps, VNode } from 'vue'
import type {
  GridBoardEmits,
  GridBoardExposed,
  GridBoardProps,
  GridTileEmits,
  GridTileProps,
  Tile
} from './types'

export * from './types'
export * from './helpers/helpers'
export * from './helpers/usePointerDragResize'
export { GRID_BOARD } from './context'

type GridBoardPublicProps<T extends Tile> = GridBoardProps<T> & {
  'onUpdate:tiles'?: (tiles: T[]) => void
  onReady?: (tiles: T[]) => void
  onRemove?: (id: T['id']) => void
} & PublicProps

interface GridBoardInstance<T extends Tile> {
  props: GridBoardPublicProps<T>
  expose: (exposed: GridBoardExposed) => void
  attrs: Record<string, unknown>
  slots: { default?: () => VNode[] }
  emit: <K extends keyof GridBoardEmits<T>>(event: K, ...args: GridBoardEmits<T>[K]) => void
}

export declare const GridBoard: <T extends Tile = Tile>(
  props: GridBoardPublicProps<T>,
  ctx?: Pick<GridBoardInstance<T>, 'attrs' | 'slots' | 'emit'>,
  expose?: GridBoardInstance<T>['expose'],
  setup?: Promise<GridBoardInstance<T>>
) => VNode & { __ctx?: GridBoardInstance<T> }

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
