export const IS_BROWSER = typeof document !== 'undefined'

function overlaps(a, b) {
  if (a === b) return false
  if (a.x + a.w <= b.x) return false
  if (a.x >= b.x + b.w) return false
  if (a.y + a.h <= b.y) return false
  if (a.y >= b.y + b.h) return false
  return true
}

function firstOverlap(tiles, tile) {
  return tiles.find((t) => overlaps(t, tile))
}

function allOverlaps(tiles, tile) {
  return tiles.filter((t) => overlaps(t, tile))
}

function frozenOnly(tiles) {
  return tiles.filter((t) => t.frozen)
}

function sortByRowThenColumn(tiles, priorityId) {
  return [].concat(tiles).sort((a, b) => {
    if (a.y === b.y) {
      if (priorityId !== undefined) {
        if (a.id === priorityId) return -1
        if (b.id === priorityId) return 1
      }
      if (a.x === b.x) return 0
    }
    if (a.y > b.y || (a.y === b.y && a.x > b.x)) return 1
    return -1
  })
}

function fall(settled, tile, gravity) {
  if (gravity) {
    while (tile.y > 0 && !firstOverlap(settled, tile)) {
      tile.y--
    }
  }

  let hit
  while ((hit = firstOverlap(settled, tile))) {
    tile.y = hit.y + hit.h
  }
}

function pushAside(tiles, blocker, tile, isUserAction) {
  if (isUserAction) {
    const probe = {
      x: tile.x,
      y: Math.max(blocker.y - tile.h, 0),
      w: tile.w,
      h: tile.h,
      id: '-1'
    }
    if (!firstOverlap(tiles, probe)) {
      return moveTile(tiles, tile, undefined, probe.y, false)
    }
  }

  return moveTile(tiles, tile, undefined, tile.y + 1, false)
}

function isNum(n) {
  return typeof n === 'number' && !Number.isNaN(n)
}

export function getLastRow(tiles) {
  let max = 0
  for (let i = 0, len = tiles.length; i < len; i++) {
    const edge = tiles[i].y + tiles[i].h
    if (edge > max) max = edge
  }
  return max
}

export function copyTiles(tiles) {
  return (tiles || []).map((tile) => ({ ...tile }))
}

export function getTileById(tiles, id) {
  return tiles.find((tile) => tile.id === id)
}

export function applyGravity(tiles, gravity, priorityId) {
  const settled = frozenOnly(tiles)
  const sorted = sortByRowThenColumn(tiles, priorityId)

  for (let i = 0, len = sorted.length; i < len; i++) {
    const tile = sorted[i]

    if (!tile.frozen) {
      fall(settled, tile, gravity)
      settled.push(tile)
    }

    delete tile.moved
  }
}

export function moveTile(tiles, tile, x, y, isUserAction, preventOverlap) {
  if (tile.frozen) return tiles

  const oldX = tile.x
  const oldY = tile.y

  const movingUp = y && tile.y > y
  if (typeof x === 'number') tile.x = x
  if (typeof y === 'number') tile.y = y
  tile.moved = true

  let sorted = sortByRowThenColumn(tiles)
  if (movingUp) sorted = sorted.reverse()
  const hits = allOverlaps(sorted, tile)

  if (preventOverlap && hits.length) {
    tile.x = oldX
    tile.y = oldY
    tile.moved = false
    return tiles
  }

  for (let i = 0, len = hits.length; i < len; i++) {
    const hit = hits[i]

    if (hit.moved) continue
    if (tile.y > hit.y && tile.y - hit.y > hit.h / 4) continue

    if (hit.frozen) {
      tiles = pushAside(tiles, hit, tile, isUserAction)
    } else {
      tiles = pushAside(tiles, tile, hit, isUserAction)
    }
  }

  return tiles
}

export function validateTiles(tiles, context = 'tiles') {
  if (!Array.isArray(tiles)) throw new Error(`Vue Grid: ${context} must be an array.`)

  const seen = new Set()

  tiles.forEach((tile, i) => {
    for (const key of ['x', 'y', 'w', 'h']) {
      if (typeof tile[key] !== 'number') {
        throw new Error(`Vue Grid: ${context}[${i}].${key} must be a number.`)
      }
    }
    if (tile.id === undefined || tile.id === null) {
      throw new Error(`Vue Grid: ${context}[${i}].id is required.`)
    }
    if (typeof tile.id !== 'number' && typeof tile.id !== 'string') {
      throw new Error(`Vue Grid: ${context}[${i}].id must be a string or a number.`)
    }
    if (seen.has(tile.id)) {
      throw new Error(`Vue Grid: ${context}[${i}].id must be unique (saw "${tile.id}" twice).`)
    }
    seen.add(tile.id)
    if (tile.frozen !== undefined && typeof tile.frozen !== 'boolean') {
      throw new Error(`Vue Grid: ${context}[${i}].frozen must be a boolean.`)
    }
  })
}

export function getPointerOffset(e) {
  const offsetParent = e.target.offsetParent || document.body
  const rect = offsetParent.getBoundingClientRect()

  return {
    x: e.clientX + offsetParent.scrollLeft - rect.left,
    y: e.clientY + offsetParent.scrollTop - rect.top
  }
}

export function getFrameDelta(lastX, lastY, x, y) {
  if (!isNum(lastX)) {
    return { deltaX: 0, deltaY: 0, lastX: x, lastY: y, x, y }
  }
  return { deltaX: x - lastX, deltaY: y - lastY, lastX, lastY, x, y }
}
