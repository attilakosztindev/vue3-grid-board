import type { PointerGestureEvent, Tile, TileId } from '../types'

export declare const IS_BROWSER: boolean

export declare function getLastRow(tiles: Tile[]): number

export declare function copyTiles<T extends Tile>(tiles: T[] | null | undefined): T[]

export declare function getTileById<T extends Tile>(tiles: T[], id: TileId): T | undefined

export declare function applyGravity<T extends Tile>(
  tiles: T[],
  gravity: boolean,
  priorityId?: TileId
): void

export declare function moveTile<T extends Tile>(
  tiles: T[],
  tile: T,
  x: number | undefined,
  y: number | undefined,
  isUserAction: boolean,
  preventOverlap: boolean
): T[]

export declare function findKeyboardSlot(
  tiles: Tile[],
  id: TileId,
  dx: number,
  dy: number,
  columns: number,
  gravity: boolean
): { x: number; y: number } | null

export declare function validateTiles(tiles: unknown, context?: string): void

export declare function getPointerOffset(
  e: Pick<PointerGestureEvent, 'target' | 'clientX' | 'clientY'>
): { x: number; y: number }

export interface FrameDelta {
  deltaX: number
  deltaY: number
  lastX: number
  lastY: number
  x: number
  y: number
}

export declare function getFrameDelta(
  lastX: number,
  lastY: number,
  x: number,
  y: number
): FrameDelta
