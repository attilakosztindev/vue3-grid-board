function collides(l1, l2) {
  if (l1 === l2) return false
  if (l1.x + l1.w <= l2.x) return false
  if (l1.x >= l2.x + l2.w) return false
  if (l1.y + l1.h <= l2.y) return false
  if (l1.y >= l2.y + l2.h) return false
  return true
}

function getFirstCollision(layout, layoutItem) {
  return layout.find((l) => collides(l, layoutItem))
}

function getAllCollisions(layout, layoutItem) {
  return layout.filter((l) => collides(l, layoutItem))
}

function getStatics(layout) {
  return layout.filter((l) => l.static)
}

function sortLayoutItemsByRowCol(layout, priorityId) {
  return [].concat(layout).sort((a, b) => {
    if (a.y === b.y && a.x === b.x) {
      if (priorityId !== undefined) {
        if (a.i === priorityId) return -1
        if (b.i === priorityId) return 1
      }
      return 0
    }
    if (a.y > b.y || (a.y === b.y && a.x > b.x)) return 1
    return -1
  })
}

function compactItem(compareWith, l, verticalCompact) {
  if (verticalCompact) {
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--
    }
  }

  let collision
  while ((collision = getFirstCollision(compareWith, l))) {
    l.y = collision.y + collision.h
  }
}

function moveElementAwayFromCollision(layout, collidesWith, itemToMove, isUserAction) {
  if (isUserAction) {
    const fakeItem = {
      x: itemToMove.x,
      y: Math.max(collidesWith.y - itemToMove.h, 0),
      w: itemToMove.w,
      h: itemToMove.h,
      i: '-1'
    }
    if (!getFirstCollision(layout, fakeItem)) {
      return moveElement(layout, itemToMove, undefined, fakeItem.y, false)
    }
  }

  return moveElement(layout, itemToMove, undefined, itemToMove.y + 1, false)
}

function isNum(num) {
  return typeof num === 'number' && !Number.isNaN(num)
}

export function bottom(layout) {
  let max = 0
  for (let i = 0, len = layout.length; i < len; i++) {
    const bottomY = layout[i].y + layout[i].h
    if (bottomY > max) max = bottomY
  }
  return max
}

export function cloneLayout(layout) {
  return (layout || []).map((item) => ({ ...item }))
}

export function getLayoutItem(layout, id) {
  return layout.find((item) => item.i === id)
}

export function compact(layout, verticalCompact, priorityId) {
  const compareWith = getStatics(layout)
  const sorted = sortLayoutItemsByRowCol(layout, priorityId)

  for (let i = 0, len = sorted.length; i < len; i++) {
    const l = sorted[i]

    if (!l.static) {
      compactItem(compareWith, l, verticalCompact)
      compareWith.push(l)
    }

    delete l.moved
  }
}

export function moveElement(layout, l, x, y, isUserAction, preventCollision) {
  if (l.static) return layout

  const oldX = l.x
  const oldY = l.y

  const movingUp = y && l.y > y
  if (typeof x === 'number') l.x = x
  if (typeof y === 'number') l.y = y
  l.moved = true

  let sorted = sortLayoutItemsByRowCol(layout)
  if (movingUp) sorted = sorted.reverse()
  const collisions = getAllCollisions(sorted, l)

  if (preventCollision && collisions.length) {
    l.x = oldX
    l.y = oldY
    l.moved = false
    return layout
  }

  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i]

    if (collision.moved) continue
    if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue

    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction)
    } else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction)
    }
  }

  return layout
}

export function validateLayout(layout, contextName = 'Layout') {
  if (!Array.isArray(layout)) throw new Error(`${contextName} must be an array!`)

  const subProps = ['x', 'y', 'w', 'h']
  const seen = new Set()

  layout.forEach((item, i) => {
    for (const prop of subProps) {
      if (typeof item[prop] !== 'number') {
        throw new Error(`VueGridLayout: ${contextName}[${i}].${prop} must be a number!`)
      }
    }
    if (item.i === undefined || item.i === null) {
      throw new Error(`VueGridLayout: ${contextName}[${i}].i cannot be null!`)
    }
    if (typeof item.i !== 'number' && typeof item.i !== 'string') {
      throw new Error(`VueGridLayout: ${contextName}[${i}].i must be a string or number!`)
    }
    if (seen.has(item.i)) {
      throw new Error(`VueGridLayout: ${contextName}[${i}].i must be unique!`)
    }
    seen.add(item.i)
    if (item.static !== undefined && typeof item.static !== 'boolean') {
      throw new Error(`VueGridLayout: ${contextName}[${i}].static must be a boolean!`)
    }
  })
}

export function getControlPosition(e) {
  const offsetParent = e.target.offsetParent || document.body
  const offsetParentRect = offsetParent.getBoundingClientRect()

  return {
    x: e.clientX + offsetParent.scrollLeft - offsetParentRect.left,
    y: e.clientY + offsetParent.scrollTop - offsetParentRect.top
  }
}

export function createCoreData(lastX, lastY, x, y) {
  if (!isNum(lastX)) {
    return { deltaX: 0, deltaY: 0, lastX: x, lastY: y, x, y }
  }
  return { deltaX: x - lastX, deltaY: y - lastY, lastX, lastY, x, y }
}
