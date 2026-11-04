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

export interface GridBoardProps<T extends Tile = Tile> {
  tiles: T[]
  columns?: number
  rowHeight?: number
  gap?: Gap
  draggable?: boolean
  resizable?: boolean
  removable?: boolean
  autoHeight?: boolean
  gravity?: boolean
  overflow?: boolean
  tapToMove?: boolean
  a11y?: Partial<GridA11y> | null
}

export interface GridTileDescription {
  name: string
  column: number
  row: number
  w: number
  h: number
}

export interface GridA11y {
  roleDescription: string
  tileName: (id: TileId) => string
  tileLabel: (tile: GridTileDescription) => string
  instructions: string
  tapInstructions: string
  removeInstructions: string
  pickedUp: string
  pickedUpToMove: string
  pickedUpToResize: string
  dropped: string
  putDown: string
  returned: string
  removed: string
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
  removable?: boolean | null
  frozen?: boolean
  dragHandle?: string | null
  dragIgnore?: string
  resizeIgnore?: string
  radius?: number
  label?: string | null
}

export interface GridBoardEmits<T extends Tile = Tile> {
  'update:tiles': [tiles: T[]]
  ready: [tiles: T[]]
  remove: [id: T['id']]
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
  removeInstructionsId: string
  listensForRemove: () => boolean
  remove: (id: TileId, name: string) => void
  dragEvent: (event: DragEventTuple) => void
  resizeEvent: (event: ResizeEventTuple) => void
  announce: (message: string) => void
  settleTiming: () => { duration: number; easing: string }
  a11y: ComputedRef<GridA11y>
  startPlacing: (
    id: TileId,
    place: (column: number, row: number) => void,
    putDown: () => void
  ) => void
  stopPlacing: (id: TileId) => void
  cancelPlacing: () => void
  placingId: () => TileId | null
}

export interface PointerGestureEvent {
  type: DragPhase | ResizePhase
  target: HTMLElement
  clientX: number
  clientY: number
}

export interface PointerTapEvent {
  mode: 'drag' | 'resize'
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
  onTap?: (event: PointerTapEvent) => void
}

export interface PointerDragResizeController {
  destroy: () => void
}
