<script setup>
import {
  reactive,
  toRaw,
  unref,
  watch,
  computed,
  onBeforeUnmount,
  onMounted,
  inject,
  nextTick
} from 'vue'
import { IS_BROWSER, getPointerOffset, getFrameDelta, findKeyboardSlot } from './helpers/helpers'
import { usePointerDragResize } from './helpers/usePointerDragResize'
import { GRID_BOARD } from './context'

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  w: {
    type: Number,
    required: true
  },
  h: {
    type: Number,
    required: true
  },
  minW: {
    type: Number,
    default: 1
  },
  minH: {
    type: Number,
    default: 1
  },
  maxW: {
    type: Number,
    default: Infinity
  },
  maxH: {
    type: Number,
    default: Infinity
  },
  draggable: {
    type: Boolean,
    default: null
  },
  resizable: {
    type: Boolean,
    default: null
  },
  removable: {
    type: Boolean,
    default: null
  },
  frozen: {
    type: Boolean,
    default: false
  },
  dragHandle: {
    type: String,
    default: null
  },
  dragIgnore: {
    type: String,
    default: 'a, button'
  },
  resizeIgnore: {
    type: String,
    default: 'a, button'
  },
  radius: {
    type: Number,
    default: 22
  },
  label: {
    type: String,
    default: null
  },
  shadow: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'dragstart',
  'drag',
  'dragend',
  'resizestart',
  'resize',
  'resizeend',
  'size'
])

const exposeObj = {
  el: undefined
}
defineExpose(exposeObj)

const board = inject(GRID_BOARD, null)

if (!board) {
  throw new Error(
    'GridTile must be rendered inside a GridBoard. The two are a single component pair and cannot be used apart.'
  )
}

let pointerCtl
const settleAnims = new Set()
let gestureFrame = null
let gestureParent = null
let rawStyle = null
let dragSlot = null
let keyGesture = null
let grabOrigin = null
let tapMode = null

const TAP_IGNORE = 'a, button, input, select, textarea, label, [contenteditable]'

const columns = computed(() => board.props.columns)
const rowHeight = computed(() => board.props.rowHeight)
const boardWidth = computed(() => board.state.width ?? 100)
const gap = computed(() => board.gap.value)

const dragEnabled = computed(() =>
  props.draggable === null ? board.props.draggable : props.draggable
)
const resizeEnabled = computed(() =>
  props.resizable === null ? board.props.resizable : props.resizable
)
const removeEnabled = computed(() =>
  props.removable === null ? board.props.removable : props.removable
)

const state = reactive({
  isDragging: false,
  dragging: null,
  settling: false,
  isResizing: false,
  grabbed: false,
  resizing: null,
  resizeMin: null,
  resizeMax: null,
  lastX: NaN,
  lastY: NaN,
  lastW: NaN,
  lastH: NaN,
  style: {},

  previousW: null,
  previousH: null,
  previousX: null,
  previousY: null,
  innerX: props.x,
  innerY: props.y,
  innerW: props.w,
  innerH: props.h
})

const canResize = computed(() => resizeEnabled.value && !props.frozen && !props.shadow)
const canDrag = computed(
  () => dragEnabled.value && !props.frozen && !props.shadow && !props.dragHandle
)
const interactive = computed(
  () => (dragEnabled.value || resizeEnabled.value) && !props.frozen && !props.shadow
)
const canRemove = computed(
  () => removeEnabled.value && board.listensForRemove() && !props.frozen && !props.shadow
)
const focusable = computed(() => interactive.value || canRemove.value)

const describedBy = computed(
  () =>
    [interactive.value && board.instructionsId, canRemove.value && board.removeInstructionsId]
      .filter(Boolean)
      .join(' ') || undefined
)

const gestureStyle = computed(() => (unref(interactive) ? { touchAction: 'none' } : {}))

const escapes = computed(
  () =>
    IS_BROWSER &&
    !props.shadow &&
    board.props.overflow &&
    (state.isDragging || state.isResizing || state.settling)
)

const classObj = computed(() => ({
  'grid-tile--draggable': canDrag.value,
  'grid-tile--frozen': props.frozen,
  'grid-tile--dragging': state.isDragging,
  'grid-tile--resizing': state.isResizing,
  'grid-tile--settling': state.settling,
  'grid-tile--grabbed': state.grabbed
}))

const a11y = computed(() => board.a11y.value)

const tileName = computed(() => props.label || a11y.value.tileName(props.id))

const tileLabel = computed(() =>
  a11y.value.tileLabel({
    name: tileName.value,
    column: state.innerX + 1,
    row: state.innerY + 1,
    w: state.innerW,
    h: state.innerH
  })
)

createStyle()

watch([rowHeight, columns], () => {
  createStyle()
  emitSize()
})

watch(boardWidth, () => {
  if (state.isDragging || state.isResizing) createStyle()
  emitSize()
})

watch([() => props.x, () => props.y, () => props.w, () => props.h], (next, previous) => {
  state.innerX = props.x
  state.innerY = props.y
  state.innerW = props.w
  state.innerH = props.h
  createStyle()

  if (props.shadow) return
  if (state.isDragging || state.isResizing) return
  if (state.settling) return

  const [nx, ny, nw, nh] = next
  const [ox, oy, ow, oh] = previous
  if (nx === ox && ny === oy) return

  const from = calcPosition(ox, oy, ow, oh)
  const to = calcPosition(nx, ny, nw, nh)
  settleFrom(from.left - to.left, from.top - to.top, false)
})

watch(escapes, createStyle)

watch(() => props.radius, createStyle)

watch(gap, (next, previous) => {
  if (next[0] === previous[0] && next[1] === previous[1]) return
  createStyle()
  emitSize()
})

onMounted(() => {
  createStyle()
  syncPointerCtl()
})

watch(interactive, syncPointerCtl)

function syncPointerCtl() {
  const want = unref(interactive)
  if (want === !!pointerCtl) return

  if (!want) {
    pointerCtl.destroy()
    pointerCtl = null
    return
  }
  if (!exposeObj.el) return

  pointerCtl = usePointerDragResize(exposeObj.el, {
    handleSelector: '.grid-handle',
    draggable: () => dragEnabled.value && !props.frozen,
    resizable: () => resizeEnabled.value && !props.frozen,
    dragIgnore: () => props.dragIgnore,
    dragHandle: () => props.dragHandle && `.${CSS.escape(props.dragHandle)}`,
    resizeIgnore: () => props.resizeIgnore,
    autoScroll: () => true,
    onDrag: handleDrag,
    onResize: handleResize,
    onTap: handleTap
  })
}

onBeforeUnmount(() => {
  board.stopPlacing(props.id)
  endKeyGesture()
  clearSettle()
  endGestureFrame()
  pointerCtl?.destroy()
})

function setRef(e) {
  exposeObj.el = e
}

const ESCAPE_Z = 2147483647

function boardViewportRect() {
  const el = exposeObj.el
  const parent = gestureParent || el?.offsetParent || el?.parentElement
  return parent ? parent.getBoundingClientRect() : null
}

function onEscapeScroll() {
  if (escapes.value) createStyle()
}

function createStyle() {
  const cols = columns.value

  if (props.x + props.w > cols) {
    state.innerX = 0
    state.innerW = props.w > cols ? cols : props.w
  } else {
    state.innerX = props.x
    state.innerW = props.w
  }

  const { innerX: x, innerY: y, innerW: w, innerH: h } = state
  const rh = rowHeight.value
  const [gx, gy] = gap.value
  const colExpr = `((100% - ${(cols + 1) * gx}px) / ${cols})`

  let top = `${rh * y + (y + 1) * gy}px`
  let left = `calc(${colExpr} * ${x} + ${(x + 1) * gx}px)`
  let offset = null

  if (state.isDragging) {
    const slot = calcPosition(x, y, w, h)
    dragSlot = slot
    top = `${slot.top}px`
    left = `${slot.left}px`
    offset = {
      dx: state.dragging.left - slot.left,
      dy: state.dragging.top - slot.top
    }
  } else {
    dragSlot = null
  }

  if (escapes.value) {
    const rect = boardViewportRect()
    if (rect) {
      const slot = state.isDragging ? dragSlot : calcPosition(x, y, w, h)
      const next = {
        position: 'fixed',
        top: `${rect.top + slot.top}px`,
        left: `${rect.left + slot.left}px`,
        width: `${state.isResizing ? state.resizing.width : slot.width}px`,
        height: `${state.isResizing ? state.resizing.height : slot.height}px`,
        zIndex: String(ESCAPE_Z),
        transition: 'none',
        ...(offset
          ? {
              transform: `translate3d(${offset.dx}px, ${offset.dy}px, 0)`,
              willChange: 'transform'
            }
          : {}),
        '--grid-radius': `${props.radius}px`
      }
      if (rawStyle && sameStyle(rawStyle, next)) return
      rawStyle = next
      state.style = next
      return
    }
  }

  const next = {
    position: 'absolute',
    top,
    left,
    width: state.isResizing
      ? `${state.resizing.width}px`
      : w === Infinity
        ? 'auto'
        : `calc(${colExpr} * ${w} + ${Math.max(0, w - 1) * gx}px)`,
    height: state.isResizing
      ? `${state.resizing.height}px`
      : h === Infinity
        ? 'auto'
        : `${rh * h + Math.max(0, h - 1) * gy}px`,
    ...(offset
      ? {
          transform: `translate3d(${offset.dx}px, ${offset.dy}px, 0)`,
          transition: 'none',
          willChange: 'transform'
        }
      : state.isResizing
        ? { transition: 'none' }
        : {}),
    '--grid-radius': `${props.radius}px`
  }

  if (rawStyle && sameStyle(rawStyle, next)) return

  rawStyle = next
  state.style = next
}

function sameStyle(a, b) {
  const keys = Object.keys(b)
  if (Object.keys(a).length !== keys.length) return false
  return keys.every((k) => a[k] === b[k])
}

function writeDragOffset(position) {
  const el = exposeObj.el
  if (!el || !rawStyle || !dragSlot) return
  const value = `translate3d(${position.left - dragSlot.left}px, ${position.top - dragSlot.top}px, 0)`
  if (rawStyle.transform === value) return
  rawStyle.transform = value
  el.style.transform = value
}

function emitSize() {
  const { width, height } = calcPosition(state.innerX, state.innerY, state.innerW, state.innerH)
  if (!Number.isFinite(width) || !Number.isFinite(height)) return
  emit('size', props.id, width, height)
}

function handleResize(event) {
  if (props.frozen && !(event.type === 'resizeend' && state.isResizing)) return
  if (event.type === 'resizestart') beginGestureFrame(event.target)
  const position = controlPosition(event)
  if (position == null) return
  const { x, y } = position

  const newSize = { width: 0, height: 0 }
  let live = null
  let pos
  switch (event.type) {
    case 'resizestart': {
      board.cancelPlacing()
      state.resizeMin = calcPosition(0, 0, props.minW, props.minH)
      state.resizeMax = calcPosition(0, 0, props.maxW, props.maxH)
      state.previousW = state.innerW
      state.previousH = state.innerH
      pos = calcPosition(state.innerX, state.innerY, state.innerW, state.innerH)
      newSize.width = pos.width
      newSize.height = pos.height
      state.resizing = newSize
      state.isResizing = true
      emit('resizestart', props.id, state.innerW, state.innerH)
      break
    }
    case 'resizemove': {
      const delta = getFrameDelta(state.lastW, state.lastH, x, y)
      newSize.width = Math.max(
        state.resizeMin.width,
        Math.min(state.resizeMax.width, state.resizing.width + delta.deltaX)
      )
      newSize.height = Math.max(
        state.resizeMin.height,
        Math.min(state.resizeMax.height, state.resizing.height + delta.deltaY)
      )
      state.resizing = newSize
      break
    }
    case 'resizeend': {
      live = state.resizing
      pos = calcPosition(state.innerX, state.innerY, state.innerW, state.innerH)
      newSize.width = pos.width
      newSize.height = pos.height
      state.resizing = null
      state.isResizing = false
      break
    }
  }
  createStyle()

  pos = clampSpan(calcWH(newSize.height, newSize.width))
  const settled = live ? clampSpan(calcWH(live.height, live.width)) : pos

  state.lastW = x
  state.lastH = y

  if (state.innerW !== pos.w || state.innerH !== pos.h) {
    emit('resize', props.id, pos.w, pos.h)
  }
  if (
    event.type === 'resizeend' &&
    (state.previousW !== settled.w || state.previousH !== settled.h)
  ) {
    emit('resizeend', props.id, settled.w, settled.h)
  }
  board.resizeEvent([event.type, props.id, state.innerX, state.innerY, settled.h, settled.w])
  if (event.type === 'resizeend') endGestureFrame()
}

function handleDrag(event) {
  if (state.isResizing) return
  if (props.frozen && !(event.type === 'dragend' && state.isDragging)) return

  if (event.type === 'dragstart') beginGestureFrame(event.target)
  const position = controlPosition(event)
  if (position === null) return
  const { x, y } = position

  const newPosition = { top: 0, left: 0 }
  switch (event.type) {
    case 'dragstart':
    case 'dragend': {
      if (event.type === 'dragend' && !state.isDragging) return
      if (event.type === 'dragstart') {
        board.cancelPlacing()
        state.previousX = state.innerX
        state.previousY = state.innerY
        clearSettle()
      }
      const parentRect = boardViewportRect() ?? { left: 0, top: 0 }
      const clientRect = event.target.getBoundingClientRect()
      newPosition.left = clientRect.left - parentRect.left
      newPosition.top = clientRect.top - parentRect.top
      state.dragging = event.type === 'dragstart' ? newPosition : null
      state.isDragging = event.type === 'dragstart'
      if (event.type === 'dragstart') {
        emit('dragstart', props.id, state.innerX, state.innerY)
      }
      break
    }
    case 'dragmove': {
      const delta = getFrameDelta(state.lastX, state.lastY, x, y)
      newPosition.left = state.dragging.left + delta.deltaX
      newPosition.top = state.dragging.top + delta.deltaY
      state.dragging = newPosition
      break
    }
  }
  if (event.type !== 'dragmove') createStyle()

  const pos = calcXY(newPosition.top, newPosition.left)
  const movesBoard = state.innerX !== pos.x || state.innerY !== pos.y

  if (event.type === 'dragmove') {
    if (movesBoard) createStyle()
    else writeDragOffset(newPosition)
  }

  state.lastX = x
  state.lastY = y

  if (movesBoard) {
    emit('drag', props.id, pos.x, pos.y)
  }
  if (
    event.type === 'dragend' &&
    (state.previousX !== state.innerX || state.previousY !== state.innerY)
  ) {
    emit('dragend', props.id, pos.x, pos.y)
  }
  board.dragEvent([event.type, props.id, pos.x, pos.y, state.innerH, state.innerW])

  if (event.type === 'dragend') {
    if (IS_BROWSER && exposeObj.el) {
      const settled = board.state.tiles.find((t) => t.id === props.id)
      if (settled) {
        const rest = calcPosition(settled.x, settled.y, settled.w, settled.h)
        settleFrom(newPosition.left - rest.left, newPosition.top - rest.top)
        createStyle()
      }
    }
    endGestureFrame()
  }
}

function readTranslate(value) {
  if (!value || value === 'none') return { dx: 0, dy: 0 }
  const n = value.match(/-?[\d.]+(?:e[-+]?\d+)?/g)?.map(Number)
  if (!n) return { dx: 0, dy: 0 }
  if (value.startsWith('matrix3d')) return { dx: n[12] ?? 0, dy: n[13] ?? 0 }
  if (value.startsWith('matrix')) return { dx: n[4] ?? 0, dy: n[5] ?? 0 }
  return { dx: n[0] ?? 0, dy: n[1] ?? 0 }
}

function takeSettleOffset(el) {
  if (settleAnims.size === 0) return { dx: 0, dy: 0 }

  const total = readTranslate(getComputedStyle(el).transform)
  const base = readTranslate(rawStyle?.transform)

  for (const anim of settleAnims) {
    anim.onfinish = null
    anim.oncancel = null
    anim.cancel()
  }
  settleAnims.clear()
  state.settling = false

  return { dx: total.dx - base.dx, dy: total.dy - base.dy }
}

function settleFrom(dx, dy, raise = true) {
  const el = exposeObj.el
  if (!el || typeof el.animate !== 'function') return

  const carry = takeSettleOffset(el)
  dx += carry.dx
  dy += carry.dy

  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return

  const { duration, easing } = board.settleTiming()
  if (duration === 0) return

  const anim = el.animate(
    [{ transform: `translate3d(${dx}px, ${dy}px, 0)` }, { transform: 'translate3d(0px, 0px, 0)' }],
    { duration, easing, composite: 'add' }
  )
  settleAnims.add(anim)
  if (raise) state.settling = true

  const done = () => {
    settleAnims.delete(anim)
    if (settleAnims.size === 0) state.settling = false
  }
  anim.onfinish = done
  anim.oncancel = done
}

function clearSettle() {
  for (const anim of settleAnims) {
    anim.onfinish = null
    anim.oncancel = null
    anim.cancel()
  }
  settleAnims.clear()
  state.settling = false
}

function beginGestureFrame(target) {
  endGestureFrame()
  gestureParent = target.offsetParent || null
  const offsetParent = gestureParent || document.body
  const frame = { offsetParent, left: 0, top: 0, measure: null }
  frame.measure = () => {
    const rect =
      offsetParent === document.body ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect()
    frame.left = rect.left - offsetParent.scrollLeft
    frame.top = rect.top - offsetParent.scrollTop
    onEscapeScroll()
  }
  frame.measure()
  gestureFrame = frame
  window.addEventListener('scroll', frame.measure, { passive: true, capture: true })
  window.addEventListener('resize', frame.measure, { passive: true })
}

function endGestureFrame() {
  gestureParent = null
  if (!gestureFrame) return
  window.removeEventListener('scroll', gestureFrame.measure, { capture: true })
  window.removeEventListener('resize', gestureFrame.measure)
  gestureFrame = null
}

function controlPosition(event) {
  if (!gestureFrame) return getPointerOffset(event)
  return { x: event.clientX - gestureFrame.left, y: event.clientY - gestureFrame.top }
}

function calcPosition(x, y, w, h) {
  const colWidth = calcColWidth()
  const rh = rowHeight.value
  const [gx, gy] = gap.value
  return {
    left: Math.round(colWidth * x + (x + 1) * gx),
    top: Math.round(rh * y + (y + 1) * gy),
    width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * gx),
    height: h === Infinity ? h : Math.round(rh * h + Math.max(0, h - 1) * gy)
  }
}

function calcXY(top, left) {
  const colWidth = calcColWidth()
  const [gx, gy] = gap.value
  const x = Math.round((left - gx) / (colWidth + gx))
  const y = Math.round((top - gy) / (rowHeight.value + gy))
  return {
    x: Math.max(Math.min(x, columns.value - state.innerW), 0),
    y: Math.max(y, 0)
  }
}

function calcColWidth() {
  const cols = columns.value
  return (boardWidth.value - gap.value[0] * (cols + 1)) / cols
}

function calcWH(height, width) {
  const colWidth = calcColWidth()
  const [gx, gy] = gap.value
  const w = Math.round((width + gx) / (colWidth + gx))
  const h = Math.round((height + gy) / (rowHeight.value + gy))
  return {
    w: Math.max(Math.min(w, columns.value - state.innerX), 0),
    h: Math.max(h, 0)
  }
}

function clampSpan(span) {
  return {
    w: Math.max(props.minW, Math.min(props.maxW, span.w), 1),
    h: Math.max(props.minH, Math.min(props.maxH, span.h), 1)
  }
}

const ARROW_DELTAS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1]
}

function currentSlot() {
  const tile = board.state.tiles.find((t) => t.id === props.id)
  if (tile) return { x: tile.x, y: tile.y, w: tile.w, h: tile.h }
  return { x: state.innerX, y: state.innerY, w: state.innerW, h: state.innerH }
}

function announceSlot(suffix) {
  const slot = currentSlot()
  const where = a11y.value.tileLabel({
    name: tileName.value,
    column: slot.x + 1,
    row: slot.y + 1,
    w: slot.w,
    h: slot.h
  })
  board.announce(suffix ? `${where}. ${suffix}` : where)
}

function beginKeyGesture(kind) {
  if (keyGesture === kind) return
  if (keyGesture) endKeyGesture()
  const slot = currentSlot()
  keyGesture = kind
  if (kind === 'drag') {
    emit('dragstart', props.id, slot.x, slot.y)
    board.dragEvent(['dragstart', props.id, slot.x, slot.y, slot.h, slot.w])
  } else {
    emit('resizestart', props.id, slot.w, slot.h)
    board.resizeEvent(['resizestart', props.id, slot.x, slot.y, slot.h, slot.w])
  }
}

function endKeyGesture() {
  if (!keyGesture) return
  const kind = keyGesture
  keyGesture = null
  const slot = currentSlot()
  if (kind === 'drag') {
    board.dragEvent(['dragend', props.id, slot.x, slot.y, slot.h, slot.w])
  } else {
    board.resizeEvent(['resizeend', props.id, slot.x, slot.y, slot.h, slot.w])
  }
}

function keyMoveBy(dx, dy) {
  if (!dragEnabled.value || props.frozen) return
  beginKeyGesture('drag')
  const slot = currentSlot()
  const next = findKeyboardSlot(
    toRaw(board.state.tiles),
    props.id,
    dx,
    dy,
    columns.value,
    board.props.gravity
  )
  if (next) {
    board.dragEvent(['dragmove', props.id, next.x, next.y, slot.h, slot.w])
    emit('drag', props.id, next.x, next.y)
  }
  nextTick(() => announceSlot())
}

function keyResizeBy(dw, dh) {
  if (!resizeEnabled.value || props.frozen) return
  beginKeyGesture('resize')
  const slot = currentSlot()
  const w = Math.max(props.minW, Math.min(props.maxW, columns.value - slot.x, slot.w + dw))
  const h = Math.max(props.minH, Math.min(props.maxH, slot.h + dh))
  if (w !== slot.w || h !== slot.h) {
    board.resizeEvent(['resizemove', props.id, slot.x, slot.y, h, w])
    emit('resize', props.id, w, h)
  }
  nextTick(() => announceSlot())
}

function grab(message = a11y.value.pickedUp) {
  grabOrigin = currentSlot()
  state.grabbed = true
  announceSlot(message)
}

function releaseGrab() {
  if (!state.grabbed) return
  const moved = keyGesture !== null
  endKeyGesture()
  endTap()
  state.grabbed = false
  grabOrigin = null
  nextTick(() => announceSlot(moved ? a11y.value.dropped : a11y.value.putDown))
}

function handleTap({ mode, target }) {
  if (!board.props.tapToMove || !unref(interactive)) return
  const waiting = board.placingId()
  if (waiting !== null && waiting !== props.id) return
  const control = target.closest?.(TAP_IGNORE)
  if (control && control !== exposeObj.el && exposeObj.el.contains(control)) return

  if (state.grabbed) {
    releaseGrab()
    return
  }
  tapMode = mode
  exposeObj.el.focus({ preventScroll: true })
  grab(mode === 'resize' ? a11y.value.pickedUpToResize : a11y.value.pickedUpToMove)
  board.startPlacing(props.id, placeAt, releaseGrab)
}

function placeAt(column, row) {
  const slot = currentSlot()
  if (tapMode === 'resize') {
    const w = Math.max(
      props.minW,
      Math.min(props.maxW, columns.value - slot.x, column - slot.x + 1)
    )
    const h = Math.max(props.minH, Math.min(props.maxH, row - slot.y + 1))
    if (w !== slot.w || h !== slot.h) {
      beginKeyGesture('resize')
      board.resizeEvent(['resizemove', props.id, slot.x, slot.y, h, w])
      emit('resize', props.id, w, h)
    }
  } else {
    const x = Math.max(0, Math.min(column, columns.value - slot.w))
    if (x !== slot.x || row !== slot.y) {
      beginKeyGesture('drag')
      board.dragEvent(['dragmove', props.id, x, row, slot.h, slot.w])
      emit('drag', props.id, x, row)
    }
  }
  releaseGrab()
}

function endTap() {
  if (!tapMode) return
  tapMode = null
  board.stopPlacing(props.id)
}

function cancelGrab(announce = true) {
  if (!state.grabbed) return
  const origin = grabOrigin
  endKeyGesture()
  endTap()

  if (origin) {
    let slot = currentSlot()
    if (slot.w !== origin.w || slot.h !== origin.h) {
      beginKeyGesture('resize')
      board.resizeEvent(['resizemove', props.id, slot.x, slot.y, origin.h, origin.w])
      endKeyGesture()
      slot = currentSlot()
    }
    if (slot.x !== origin.x || slot.y !== origin.y) {
      beginKeyGesture('drag')
      board.dragEvent(['dragmove', props.id, origin.x, origin.y, origin.h, origin.w])
      endKeyGesture()
    }
  }

  state.grabbed = false
  grabOrigin = null
  if (announce) nextTick(() => announceSlot(a11y.value.returned))
}

function onKeydown(e) {
  if (!unref(focusable)) return
  if (e.target !== exposeObj.el) return
  if (e.altKey || e.ctrlKey || e.metaKey) return

  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (!canRemove.value) return
    e.preventDefault()
    cancelGrab(false)
    board.remove(props.id, tileName.value)
    return
  }

  if (!unref(interactive)) return

  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (state.grabbed) releaseGrab()
    else grab()
    return
  }

  if (e.key === 'Escape') {
    if (!state.grabbed) return
    e.preventDefault()
    cancelGrab()
    return
  }

  const delta = ARROW_DELTAS[e.key]
  if (!delta || !state.grabbed) return
  e.preventDefault()
  if (e.shiftKey) keyResizeBy(delta[0], delta[1])
  else keyMoveBy(delta[0], delta[1])
}

function onBlur() {
  if (state.grabbed) releaseGrab()
}
</script>

<template>
  <div
    :ref="setRef"
    class="grid-tile"
    :class="classObj"
    :style="[state.style, gestureStyle]"
    :data-tile="id"
    :tabindex="focusable ? 0 : undefined"
    :role="focusable ? 'group' : undefined"
    :aria-roledescription="interactive ? a11y.roleDescription : undefined"
    :aria-label="focusable ? tileLabel : undefined"
    :aria-describedby="describedBy"
    :aria-hidden="shadow ? 'true' : undefined"
    :data-grabbed="state.grabbed ? 'true' : undefined"
    @keydown="onKeydown"
    @blur="onBlur"
  >
    <slot />
    <span
      v-if="canResize"
      class="grid-handle"
      :class="{ 'grid-handle--chevron': !$slots.handle }"
      :aria-hidden="$slots.handle ? undefined : 'true'"
    >
      <slot name="handle" />
    </span>
  </div>
</template>

<style scoped>
.grid-tile {
  border-radius: var(--grid-radius, 22px);
  transition:
    width var(--grid-tile-duration, 220ms) var(--grid-tile-easing, cubic-bezier(0.2, 0, 0, 1)),
    height var(--grid-tile-duration, 220ms) var(--grid-tile-easing, cubic-bezier(0.2, 0, 0, 1));
}

.grid-tile:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.grid-tile--draggable {
  cursor: grab;
}

.grid-tile--grabbed {
  cursor: grabbing;
  z-index: 100;
  outline: 2px dashed currentColor;
  outline-offset: 2px;
}

.grid-tile--dragging {
  cursor: grabbing;
  transition: none;
  user-select: none;
  z-index: 100;
}

.grid-tile--settling {
  z-index: 100;
}

.grid-tile--resizing {
  cursor: se-resize;
  opacity: 0.6;
  z-index: 100;
}

.grid-tile.grid-shadow {
  background: #62748e;
  border-radius: var(--grid-radius, 22px);
  opacity: 0.2;
  transition:
    left var(--grid-shadow-duration, 200ms) var(--grid-shadow-easing, ease),
    top var(--grid-shadow-duration, 200ms) var(--grid-shadow-easing, ease),
    width var(--grid-shadow-duration, 200ms) var(--grid-shadow-easing, ease),
    height var(--grid-shadow-duration, 200ms) var(--grid-shadow-easing, ease);
  z-index: 1;
  user-select: none;
}

.grid-tile > .grid-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: max(24px, var(--grid-radius, 22px));
  min-height: max(24px, var(--grid-radius, 22px));
  color: currentColor;
  cursor: se-resize;
}

.grid-tile > .grid-handle--chevron::before,
.grid-tile > .grid-handle--chevron::after {
  content: '';
  position: absolute;
  border: 0 solid currentColor;
  border-right-width: 2px;
  border-bottom-width: 2px;
}

.grid-tile > .grid-handle--chevron::before {
  right: 8px;
  bottom: 8px;
  width: calc(var(--grid-radius, 22px) - 8px);
  height: calc(var(--grid-radius, 22px) - 8px);
  border-bottom-right-radius: calc(var(--grid-radius, 22px) - 8px);
}

.grid-tile > .grid-handle--chevron::after {
  right: 13px;
  bottom: 13px;
  width: calc(var(--grid-radius, 22px) - 13px);
  height: calc(var(--grid-radius, 22px) - 13px);
  border-bottom-right-radius: calc(var(--grid-radius, 22px) - 13px);
}
</style>
