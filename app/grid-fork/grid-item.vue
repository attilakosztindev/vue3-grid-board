<script setup>
import { reactive, unref, watch, computed, onBeforeUnmount, onMounted, inject, nextTick } from 'vue'
import { getControlPosition, createCoreData } from './helpers/helpers'
import { usePointerDragResize } from './helpers/usePointerDragResize'

const props = defineProps({
  i: {
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
  isDraggable: {
    type: Boolean,
    default: null
  },
  isResizable: {
    type: Boolean,
    default: null
  },
  static: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: Boolean,
    default: false
  },
  dragIgnoreFrom: {
    type: String,
    default: 'a, button'
  },
  dragAllowFrom: {
    type: String,
    default: null
  },
  resizeIgnoreFrom: {
    type: String,
    default: 'a, button'
  },
  dragOption: {
    type: Object,
    default: () => ({})
  },
  resizeOption: {
    type: Object,
    default: () => ({})
  },
  radius: {
    type: Number,
    default: 22
  },
  ariaLabel: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['container-resized', 'resize', 'resized', 'move', 'moved'])

const exposeObj = {
  el: undefined
}
defineExpose(exposeObj)

const emitter = inject('emitter')
const gridLayout = inject('gridLayout')

const SETTLE_MS = 220
const SETTLE_EASING = 'cubic-bezier(0.2, 0, 0, 1)'

let pointerCtl
const settleAnims = new Set()
let gestureFrame = null
let rawStyle = null
let dragSlot = null
let keyGesture = null
let grabOrigin = null

const state = reactive({
  cols: 1,
  containerWidth: 100,
  rowHeight: 30,
  margin: [10, 10],
  draggable: null,
  resizable: null,

  isDragging: false,
  dragging: null,
  raised: false,
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

const resizableAndNotStatic = computed(() => state.resizable && !props.static && !props.placeholder)
const draggableOrResizableAndNotStatic = computed(
  () => (state.draggable || state.resizable) && !props.static && !props.placeholder
)

const gestureStyle = computed(() =>
  unref(draggableOrResizableAndNotStatic) ? { touchAction: 'none' } : {}
)

const classObj = computed(() => ({
  'vue-resizable': unref(resizableAndNotStatic),
  static: props.static,
  resizing: state.isResizing,
  'vue-draggable-dragging': state.isDragging,
  settling: state.raised,
  'disable-userselect': state.isDragging,
  'no-touch': unref(draggableOrResizableAndNotStatic),
  'vgl-grabbed': state.grabbed
}))

const itemName = computed(() => props.ariaLabel || `Item ${props.i}`)

const itemLabel = computed(
  () =>
    `${unref(itemName)}, column ${state.innerX + 1}, row ${state.innerY + 1}, ${state.innerW} wide, ${state.innerH} tall`
)

emitter.on('updateWidth', updateWidth)
emitter.on('setDraggable', setDraggableHandler)
emitter.on('setResizable', setResizableHandler)
emitter.on('setRowHeight', setRowHeightHandler)
emitter.on('setColNum', setColNum)

if (gridLayout && gridLayout.props && gridLayout.state) {
  const parent = { ...gridLayout.props, ...gridLayout.state }
  if (parent.colNum !== undefined) state.cols = parent.colNum
  if (parent.rowHeight !== undefined) state.rowHeight = parent.rowHeight
  if (parent.margin !== undefined) state.margin = parent.margin
  state.draggable = props.isDraggable === null ? parent.isDraggable : props.isDraggable
  state.resizable = props.isResizable === null ? parent.isResizable : props.isResizable
  createStyle()
}

watch(
  () => props.isDraggable,
  (v) => {
    state.draggable = v
  }
)
watch(
  () => props.isResizable,
  (v) => {
    state.resizable = v
  }
)

watch(
  () => state.rowHeight,
  () => {
    createStyle()
    emitContainerResized()
  }
)

watch(
  () => state.cols,
  () => {
    createStyle()
    emitContainerResized()
  }
)

watch(
  () => state.containerWidth,
  () => {
    if (state.isDragging || state.isResizing) createStyle()
    emitContainerResized()
  }
)

watch([() => props.x, () => props.y, () => props.w, () => props.h], (next, prev) => {
  state.innerX = props.x
  state.innerY = props.y
  state.innerW = props.w
  state.innerH = props.h
  createStyle()

  // The shadow is a readout of the slot the tile will land in, so it snaps. Gliding
  // would paint it, mid-flight, across tiles it is never going to land on.
  if (props.placeholder) return
  if (state.isDragging || state.isResizing) return
  if (state.raised) return

  const [nx, ny, nw, nh] = next
  const [ox, oy, ow, oh] = prev
  if (nx === ox && ny === oy) return

  const from = calcPosition(ox, oy, ow, oh)
  const to = calcPosition(nx, ny, nw, nh)
  settleFrom(from.left - to.left, from.top - to.top, false)
})

watch(() => props.radius, createStyle)

watch(
  () => gridLayout.props.margin,
  (margin) => {
    if (
      !margin ||
      (Number(margin[0]) === Number(state.margin[0]) &&
        Number(margin[1]) === Number(state.margin[1]))
    ) {
      return
    }
    state.margin = margin.map((m) => Number(m) || 0)
    createStyle()
    emitContainerResized()
  }
)

onMounted(() => {
  const parent = { ...gridLayout.props, ...gridLayout.state }
  state.cols = parent.colNum
  state.rowHeight = parent.rowHeight
  state.containerWidth = parent.width !== null ? parent.width : 100
  state.margin = parent.margin !== undefined ? parent.margin : [10, 10]
  createStyle()
  syncPointerCtl()
})

watch(draggableOrResizableAndNotStatic, syncPointerCtl)

function syncPointerCtl() {
  const want = unref(draggableOrResizableAndNotStatic)
  if (want === !!pointerCtl) return

  if (!want) {
    pointerCtl.destroy()
    pointerCtl = null
    return
  }
  if (!exposeObj.el) return

  pointerCtl = usePointerDragResize(exposeObj.el, {
    handleSelector: '.vue-resizable-handle',
    draggable: () => state.draggable && !props.static,
    resizable: () => state.resizable && !props.static,
    dragIgnoreFrom: () => props.dragIgnoreFrom,
    dragAllowFrom: () => props.dragAllowFrom,
    resizeIgnoreFrom: () => props.resizeIgnoreFrom,
    autoScroll: () => true,
    onDrag: handleDrag,
    onResize: handleResize
  })
}

onBeforeUnmount(() => {
  emitter.off('updateWidth', updateWidth)
  emitter.off('setDraggable', setDraggableHandler)
  emitter.off('setResizable', setResizableHandler)
  emitter.off('setRowHeight', setRowHeightHandler)
  emitter.off('setColNum', setColNum)
  endKeyGesture()
  clearSettle()
  endGestureFrame()
  pointerCtl?.destroy()
})

function setRef(e) {
  exposeObj.el = e
}

function setDraggableHandler(isDraggable) {
  if (props.isDraggable === null) state.draggable = isDraggable
}

function setResizableHandler(isResizable) {
  if (props.isResizable === null) state.resizable = isResizable
}

function setRowHeightHandler(rowHeight) {
  state.rowHeight = rowHeight
}

function setColNum(colNum) {
  state.cols = parseInt(colNum, 10)
}

function createStyle() {
  if (props.x + props.w > state.cols) {
    state.innerX = 0
    state.innerW = props.w > state.cols ? state.cols : props.w
  } else {
    state.innerX = props.x
    state.innerW = props.w
  }

  const { innerX: x, innerY: y, innerW: w, innerH: h, rowHeight: rh, cols } = state
  const [mx, my] = state.margin
  const colExpr = `((100% - ${(cols + 1) * mx}px) / ${cols})`

  let top = `${rh * y + (y + 1) * my}px`
  let left = `calc(${colExpr} * ${x} + ${(x + 1) * mx}px)`
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

  const next = {
    position: 'absolute',
    top,
    left,
    width: state.isResizing
      ? `${state.resizing.width}px`
      : w === Infinity
        ? 'auto'
        : `calc(${colExpr} * ${w} + ${Math.max(0, w - 1) * mx}px)`,
    height: state.isResizing
      ? `${state.resizing.height}px`
      : h === Infinity
        ? 'auto'
        : `${rh * h + Math.max(0, h - 1) * my}px`,
    ...(offset
      ? {
          transform: `translate3d(${offset.dx}px, ${offset.dy}px, 0)`,
          transition: 'none',
          willChange: 'transform'
        }
      : state.isResizing
        ? { transition: 'none' }
        : {}),
    '--vgl-radius': `${props.radius}px`
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

function emitContainerResized() {
  const { width, height } = calcPosition(state.innerX, state.innerY, state.innerW, state.innerH)
  if (!Number.isFinite(width) || !Number.isFinite(height)) return
  emit('container-resized', props.i, props.h, props.w, height, width)
}

function handleResize(event) {
  if (props.static && !(event.type === 'resizeend' && state.isResizing)) return
  if (event.type === 'resizestart') beginGestureFrame(event.target)
  const position = controlPosition(event)
  if (position == null) return
  const { x, y } = position

  const newSize = { width: 0, height: 0 }
  let pos
  switch (event.type) {
    case 'resizestart': {
      state.resizeMin = calcPosition(0, 0, props.minW, props.minH)
      state.resizeMax = calcPosition(0, 0, props.maxW, props.maxH)
      state.previousW = state.innerW
      state.previousH = state.innerH
      pos = calcPosition(state.innerX, state.innerY, state.innerW, state.innerH)
      newSize.width = pos.width
      newSize.height = pos.height
      state.resizing = newSize
      state.isResizing = true
      break
    }
    case 'resizemove': {
      const coreEvent = createCoreData(state.lastW, state.lastH, x, y)
      newSize.width = Math.max(
        state.resizeMin.width,
        Math.min(state.resizeMax.width, state.resizing.width + coreEvent.deltaX)
      )
      newSize.height = Math.max(
        state.resizeMin.height,
        Math.min(state.resizeMax.height, state.resizing.height + coreEvent.deltaY)
      )
      state.resizing = newSize
      break
    }
    case 'resizeend': {
      pos = calcPosition(state.innerX, state.innerY, state.innerW, state.innerH)
      newSize.width = pos.width
      newSize.height = pos.height
      state.resizing = null
      state.isResizing = false
      break
    }
  }
  createStyle()

  pos = calcWH(newSize.height, newSize.width)
  pos.w = Math.max(props.minW, Math.min(props.maxW, pos.w), 1)
  pos.h = Math.max(props.minH, Math.min(props.maxH, pos.h), 1)

  state.lastW = x
  state.lastH = y

  if (state.innerW !== pos.w || state.innerH !== pos.h) {
    emit('resize', props.i, pos.h, pos.w, newSize.height, newSize.width)
  }
  if (
    event.type === 'resizeend' &&
    (state.previousW !== state.innerW || state.previousH !== state.innerH)
  ) {
    emit('resized', props.i, pos.h, pos.w, newSize.height, newSize.width)
  }
  emitter.emit('resizeEvent', [event.type, props.i, state.innerX, state.innerY, pos.h, pos.w])
  if (event.type === 'resizeend') endGestureFrame()
}

function handleDrag(event) {
  if (state.isResizing) return
  if (props.static && !(event.type === 'dragend' && state.isDragging)) return

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
        state.previousX = state.innerX
        state.previousY = state.innerY
        clearSettle()
      }
      const parentRect = event.target.offsetParent.getBoundingClientRect()
      const clientRect = event.target.getBoundingClientRect()
      newPosition.left = clientRect.left - parentRect.left
      newPosition.top = clientRect.top - parentRect.top
      state.dragging = event.type === 'dragstart' ? newPosition : null
      state.isDragging = event.type === 'dragstart'
      break
    }
    case 'dragmove': {
      const coreEvent = createCoreData(state.lastX, state.lastY, x, y)
      newPosition.left = state.dragging.left + coreEvent.deltaX
      newPosition.top = state.dragging.top + coreEvent.deltaY
      state.dragging = newPosition
      break
    }
  }
  if (event.type !== 'dragmove') createStyle()

  const pos = calcXY(newPosition.top, newPosition.left)
  const movesLayout = state.innerX !== pos.x || state.innerY !== pos.y

  if (event.type === 'dragmove') {
    if (movesLayout) createStyle()
    else writeDragOffset(newPosition)
  }

  state.lastX = x
  state.lastY = y

  if (movesLayout) {
    emit('move', props.i, pos.x, pos.y)
  }
  if (
    event.type === 'dragend' &&
    (state.previousX !== state.innerX || state.previousY !== state.innerY)
  ) {
    emit('moved', props.i, pos.x, pos.y)
  }
  emitter.emit('dragEvent', [event.type, props.i, pos.x, pos.y, state.innerH, state.innerW])

  if (event.type === 'dragend') {
    if (import.meta.client && exposeObj.el) {
      const finalItem = gridLayout?.state?.layout?.find((it) => it.i === props.i)
      if (finalItem) {
        const rest = calcPosition(finalItem.x, finalItem.y, finalItem.w, finalItem.h)
        settleFrom(newPosition.left - rest.left, newPosition.top - rest.top)
      }
    }
    endGestureFrame()
  }
}

function settleFrom(dx, dy, raise = true) {
  const el = exposeObj.el
  if (!el || typeof el.animate !== 'function') return
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return

  const anim = el.animate(
    [{ transform: `translate3d(${dx}px, ${dy}px, 0)` }, { transform: 'translate3d(0px, 0px, 0)' }],
    { duration: SETTLE_MS, easing: SETTLE_EASING, composite: 'add' }
  )
  settleAnims.add(anim)
  if (raise) state.raised = true

  const done = () => {
    settleAnims.delete(anim)
    if (settleAnims.size === 0) state.raised = false
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
  state.raised = false
}

function beginGestureFrame(target) {
  endGestureFrame()
  const offsetParent = target.offsetParent || document.body
  const frame = { offsetParent, left: 0, top: 0, measure: null }
  frame.measure = () => {
    const rect =
      offsetParent === document.body ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect()
    frame.left = rect.left - offsetParent.scrollLeft
    frame.top = rect.top - offsetParent.scrollTop
  }
  frame.measure()
  gestureFrame = frame
  window.addEventListener('scroll', frame.measure, { passive: true, capture: true })
  window.addEventListener('resize', frame.measure, { passive: true })
}

function endGestureFrame() {
  if (!gestureFrame) return
  window.removeEventListener('scroll', gestureFrame.measure, { capture: true })
  window.removeEventListener('resize', gestureFrame.measure)
  gestureFrame = null
}

function controlPosition(event) {
  if (!gestureFrame) return getControlPosition(event)
  return { x: event.clientX - gestureFrame.left, y: event.clientY - gestureFrame.top }
}

function calcPosition(x, y, w, h) {
  const colWidth = calcColWidth()
  const [mx, my] = state.margin
  return {
    left: Math.round(colWidth * x + (x + 1) * mx),
    top: Math.round(state.rowHeight * y + (y + 1) * my),
    width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * mx),
    height: h === Infinity ? h : Math.round(state.rowHeight * h + Math.max(0, h - 1) * my)
  }
}

function calcXY(top, left) {
  const colWidth = calcColWidth()
  const [mx, my] = state.margin
  const x = Math.round((left - mx) / (colWidth + mx))
  const y = Math.round((top - my) / (state.rowHeight + my))
  return {
    x: Math.max(Math.min(x, state.cols - state.innerW), 0),
    y: Math.max(y, 0)
  }
}

function calcColWidth() {
  return (state.containerWidth - state.margin[0] * (state.cols + 1)) / state.cols
}

function calcWH(height, width) {
  const colWidth = calcColWidth()
  const [mx, my] = state.margin
  const w = Math.round((width + mx) / (colWidth + mx))
  const h = Math.round((height + my) / (state.rowHeight + my))
  return {
    w: Math.max(Math.min(w, state.cols - state.innerX), 0),
    h: Math.max(h, 0)
  }
}

function updateWidth(width, colNum) {
  state.containerWidth = width
  if (colNum !== undefined && colNum !== null) state.cols = colNum
}

const ARROW_DELTAS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1]
}

function currentSlot() {
  const item = gridLayout?.state?.layout?.find((it) => it.i === props.i)
  if (item) return { x: item.x, y: item.y, w: item.w, h: item.h }
  return { x: state.innerX, y: state.innerY, w: state.innerW, h: state.innerH }
}

function announce(message) {
  emitter.emit('announce', message)
}

function announceSlot(suffix) {
  const slot = currentSlot()
  const where = `${unref(itemName)}, column ${slot.x + 1}, row ${slot.y + 1}, ${slot.w} wide, ${slot.h} tall`
  announce(suffix ? `${where}. ${suffix}` : where)
}

function beginKeyGesture(kind) {
  if (keyGesture === kind) return
  if (keyGesture) endKeyGesture()
  const slot = currentSlot()
  keyGesture = kind
  if (kind === 'drag') {
    emitter.emit('dragEvent', ['dragstart', props.i, slot.x, slot.y, slot.h, slot.w])
  } else {
    emitter.emit('resizeEvent', ['resizestart', props.i, slot.x, slot.y, slot.h, slot.w])
  }
}

function endKeyGesture() {
  if (!keyGesture) return
  const kind = keyGesture
  keyGesture = null
  const slot = currentSlot()
  if (kind === 'drag') {
    emitter.emit('dragEvent', ['dragend', props.i, slot.x, slot.y, slot.h, slot.w])
  } else {
    emitter.emit('resizeEvent', ['resizeend', props.i, slot.x, slot.y, slot.h, slot.w])
  }
}

function keyMoveBy(dx, dy) {
  if (!state.draggable || props.static) return
  beginKeyGesture('drag')
  const slot = currentSlot()
  const x = Math.max(0, Math.min(state.cols - slot.w, slot.x + dx))
  const y = Math.max(0, slot.y + dy)
  if (x !== slot.x || y !== slot.y) {
    emitter.emit('dragEvent', ['dragmove', props.i, x, y, slot.h, slot.w])
    emit('move', props.i, x, y)
  }
  nextTick(() => announceSlot())
}

function keyResizeBy(dw, dh) {
  if (!state.resizable || props.static) return
  beginKeyGesture('resize')
  const slot = currentSlot()
  const w = Math.max(props.minW, Math.min(props.maxW, state.cols - slot.x, slot.w + dw))
  const h = Math.max(props.minH, Math.min(props.maxH, slot.h + dh))
  if (w !== slot.w || h !== slot.h) {
    emitter.emit('resizeEvent', ['resizemove', props.i, slot.x, slot.y, h, w])
    emit('resize', props.i, h, w)
  }
  nextTick(() => announceSlot())
}

function grab() {
  grabOrigin = currentSlot()
  state.grabbed = true
  announceSlot(
    'Picked up. Arrow keys move, Shift plus arrow keys resize, Enter drops, Escape cancels.'
  )
}

function releaseGrab() {
  if (!state.grabbed) return
  const moved = keyGesture !== null
  endKeyGesture()
  state.grabbed = false
  grabOrigin = null
  nextTick(() => announceSlot(moved ? 'Dropped.' : 'Put down.'))
}

function cancelGrab() {
  if (!state.grabbed) return
  const origin = grabOrigin
  endKeyGesture()

  if (origin) {
    let slot = currentSlot()
    if (slot.w !== origin.w || slot.h !== origin.h) {
      beginKeyGesture('resize')
      emitter.emit('resizeEvent', ['resizemove', props.i, slot.x, slot.y, origin.h, origin.w])
      endKeyGesture()
      slot = currentSlot()
    }
    if (slot.x !== origin.x || slot.y !== origin.y) {
      beginKeyGesture('drag')
      emitter.emit('dragEvent', ['dragmove', props.i, origin.x, origin.y, origin.h, origin.w])
      endKeyGesture()
    }
  }

  state.grabbed = false
  grabOrigin = null
  nextTick(() => announceSlot('Returned to its original place.'))
}

function onKeydown(e) {
  if (!unref(draggableOrResizableAndNotStatic)) return
  if (e.target !== exposeObj.el) return
  if (e.altKey || e.ctrlKey || e.metaKey) return

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
    :id="i"
    :ref="setRef"
    class="vue-grid-item"
    :class="classObj"
    :style="[state.style, gestureStyle]"
    :tabindex="draggableOrResizableAndNotStatic ? 0 : undefined"
    :role="draggableOrResizableAndNotStatic ? 'group' : undefined"
    :aria-roledescription="draggableOrResizableAndNotStatic ? 'Draggable grid item' : undefined"
    :aria-label="draggableOrResizableAndNotStatic ? itemLabel : undefined"
    :aria-describedby="draggableOrResizableAndNotStatic ? gridLayout.instructionsId : undefined"
    :aria-hidden="placeholder ? 'true' : undefined"
    :data-grabbed="state.grabbed ? 'true' : undefined"
    @keydown="onKeydown"
    @blur="onBlur"
  >
    <slot />
    <span v-if="resizableAndNotStatic" class="vue-resizable-handle" aria-hidden="true" />
  </div>
</template>

<style scoped>
.vue-grid-item {
  border-radius: var(--vgl-radius, 22px);
  transition:
    width 200ms ease,
    height 200ms ease;
}

.vue-grid-item.no-touch {
  touch-action: none;
}

.vue-grid-item:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.vue-grid-item.vgl-grabbed {
  z-index: 100;
  outline: 2px dashed currentColor;
  outline-offset: 2px;
}

.vue-grid-item.vue-draggable-dragging {
  transition: none;
  z-index: 100;
}

.vue-grid-item.settling {
  z-index: 100;
}

.vue-grid-item.resizing {
  opacity: 0.6;
  z-index: 100;
}

.vue-grid-item.vue-grid-placeholder {
  background: red;
  border-radius: var(--vgl-radius, 22px);
  opacity: 0.2;
  /* Snaps, like the FLIP above: a lagging width/height would spill the shadow
     over neighbours that have already moved out of the way. */
  transition: none;
  /* No z-index on purpose. Every tile is absolutely positioned, so paint order is
     DOM order, and the container renders this one first -- putting it below the
     tiles without needing it to outrank the dragged tile's z-index. */
  user-select: none;
}

.vue-grid-item > .vue-resizable-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: var(--vgl-radius, 22px);
  height: var(--vgl-radius, 22px);
  color: currentColor;
  cursor: se-resize;
}

.vue-grid-item > .vue-resizable-handle::before,
.vue-grid-item > .vue-resizable-handle::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  border: 0 solid currentColor;
  border-right-width: 2px;
  border-bottom-width: 2px;
  opacity: 0.35;
}

.vue-grid-item > .vue-resizable-handle::before {
  width: calc(var(--vgl-radius, 22px) - 8px);
  height: calc(var(--vgl-radius, 22px) - 8px);
  border-bottom-right-radius: calc(var(--vgl-radius, 22px) - 8px);
}

.vue-grid-item > .vue-resizable-handle::after {
  width: calc(var(--vgl-radius, 22px) - 13px);
  height: calc(var(--vgl-radius, 22px) - 13px);
  border-bottom-right-radius: calc(var(--vgl-radius, 22px) - 13px);
}

.vue-grid-item.disable-userselect {
  user-select: none;
}
</style>
