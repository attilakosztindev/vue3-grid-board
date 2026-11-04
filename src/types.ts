import type { ComputedRef } from 'vue'

export type TileId = number | string

export type Gap = number | [number, number]

export interface Tile {
  id: TileId
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  frozen?: boolean
  moved?: boolean
}

export type TileWith<T> = Tile & T

export interface GridBoardProps {
  tiles: Tile[]
  columns?: number
  rowHeight?: number
  gap?: Gap
  draggable?: boolean
  resizable?: boolean
  autoHeight?: boolean
  gravity?: boolean
  overflow?: boolean
}

export interface GridTileProps {
  id: TileId
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  draggable?: boolean | null
  resizable?: boolean | null
  frozen?: boolean
  dragHandle?: string | null
  dragIgnore?: string
  resizeIgnore?: string
  radius?: number
  label?: string | null
}

export interface GridBoardEmits {
  'update:tiles': [tiles: Tile[]]
  ready: [tiles: Tile[]]
}

export interface GridTileEmits {
  dragstart: [id: TileId, x: number, y: number]
  drag: [id: TileId, x: number, y: number]
  dragend: [id: TileId, x: number, y: number]
  resizestart: [id: TileId, w: number, h: number]
  resize: [id: TileId, w: number, h: number]
  resizeend: [id: TileId, w: number, h: number]
  size: [id: TileId, width: number, height: number]
}

export interface GridTileSlots {
  default?: () => unknown
  handle?: () => unknown
}

export interface GridBoardExposed {
  el: HTMLElement | undefined
  dispatch: GridDispatch
}

export interface GridTileExposed {
  el: HTMLElement | undefined
}

export type DragPhase = 'dragstart' | 'dragmove' | 'dragend'
export type ResizePhase = 'resizestart' | 'resizemove' | 'resizeend'

export type DragEventTuple = [DragPhase, TileId, number, number, number, number]
export type ResizeEventTuple = [ResizePhase, TileId, number, number, number, number]

export interface GridDispatch {
  (type: 'dragEvent', payload: DragEventTuple): void
  (type: 'resizeEvent', payload: ResizeEventTuple): void
  (type: 'announce', payload: string): void
  (type: 'measure'): void
}

export interface GridBoardState {
  width: number | null
  boardStyle: Record<string, string | undefined>
  busy: boolean
  shadow: { x: number; y: number; w: number; h: number; id: TileId }
  tiles: Tile[]
  announcement: string
}

export interface GridBoardContext {
  props: Required<GridBoardProps>
  state: GridBoardState
  gap: ComputedRef<[number, number]>
  instructionsId: string
  dragEvent: (event: DragEventTuple) => void
  resizeEvent: (event: ResizeEventTuple) => void
  announce: (message: string) => void
  settleTiming: () => { duration: number; easing: string }
}

export interface PointerGestureEvent {
  type: DragPhase | ResizePhase
  target: HTMLElement
  clientX: number
  clientY: number
}

export interface PointerDragResizeOptions {
  handleSelector?: string
  draggable?: () => boolean
  resizable?: () => boolean
  dragIgnore?: () => string | null
  dragHandle?: () => string | null
  resizeIgnore?: () => string | null
  autoScroll?: () => boolean
  onDrag?: (event: PointerGestureEvent) => void
  onResize?: (event: PointerGestureEvent) => void
}

export interface PointerDragResizeController {
  destroy: () => void
}
