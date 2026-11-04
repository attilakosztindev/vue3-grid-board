<script setup>
import {
  Fragment,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
  watch,
  provide,
  computed,
  nextTick,
  useId,
  useSlots
} from 'vue'
import {
  IS_BROWSER,
  applyGravity,
  getLastRow,
  copyTiles,
  getTileById,
  moveTile,
  validateTiles
} from './helpers/helpers'
import { GRID_BOARD } from './context'
import GridTile from './grid-tile.vue'

const props = defineProps({
  tiles: {
    type: Array,
    required: true
  },
  columns: {
    type: Number,
    default: 12
  },
  rowHeight: {
    type: Number,
    default: 150
  },
  gap: {
    type: [Number, Array],
    default: 10
  },
  draggable: {
    type: Boolean,
    default: true
  },
  resizable: {
    type: Boolean,
    default: true
  },
  autoHeight: {
    type: Boolean,
    default: true
  },
  gravity: {
    type: Boolean,
    default: true
  },
  overflow: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:tiles', 'ready'])

const SETTLE_MS = 220
const SETTLE_EASING = 'cubic-bezier(0.2, 0, 0, 1)'

let resizeObserver = null
let lastEmitted = null
let settleCache = null

const exposeObj = {
  el: undefined,
  dispatch
}
defineExpose(exposeObj)

const state = reactive({
  width: null,
  boardStyle: {},
  busy: false,
  shadow: { x: 0, y: 0, w: 0, h: 0, id: -1 },
  tiles: [],
  announcement: ''
})

const gap = computed(() => {
  const g = props.gap
  if (Array.isArray(g)) return [Number(g[0]) || 0, Number(g[1]) || 0]
  const n = Number(g) || 0
  return [n, n]
})

const instructionsId = useId()

const slots = useSlots()

let lastReadingOrder = new Map()

const readingOrder = computed(() => {
  if (state.busy) return lastReadingOrder
  const sorted = [...state.tiles].sort((a, b) => a.y - b.y || a.x - b.x)
  lastReadingOrder = new Map(sorted.map((tile, index) => [String(tile.id), index]))
  return lastReadingOrder
})

function flattenTiles(nodes, out = []) {
  for (const node of nodes) {
    if (node.type === Fragment && Array.isArray(node.children)) flattenTiles(node.children, out)
    else out.push(node)
  }
  return out
}

function OrderedTiles() {
  const order = readingOrder.value
  const rank = (node) => {
    const seat = order.get(String(node.props?.id))
    return seat === undefined ? Number.MAX_SAFE_INTEGER : seat
  }
  return flattenTiles(slots.default?.() ?? [])
    .map((node, index) => ({ node, index }))
    .sort((a, b) => rank(a.node) - rank(b.node) || a.index - b.index)
    .map((entry) => entry.node)
}

provide(GRID_BOARD, {
  props,
  state,
  gap,
  instructionsId,
  dragEvent: onDragEvent,
  resizeEvent: onResizeEvent,
  announce: onAnnounce,
  settleTiming
})

seedTiles()

if (IS_BROWSER) {
  watch(
    () => props.tiles,
    () => {
      if (props.tiles === lastEmitted) return
      validateTiles(props.tiles)
      adoptTiles()
    },
    { immediate: true }
  )

  watch(
    () => state.busy,
    (busy) => {
      if (busy) {
        window.getSelection()?.removeAllRanges()
        document.addEventListener('selectstart', preventSelection)
      } else {
        document.removeEventListener('selectstart', preventSelection)
      }
    }
  )
}

watch(
  () => state.width,
  async (next, previous) => {
    updateHeight()
    if (previous === null) {
      await nextTick()
      emit('ready', state.tiles)
    }
  }
)

watch(
  () => props.gravity,
  () => {
    applyGravity(state.tiles, props.gravity)
    updateHeight()
    if (IS_BROWSER) commit()
  }
)
watch(gap, updateHeight)

onBeforeMount(updateHeight)

onBeforeUnmount(() => {
  if (resizeObserver && exposeObj.el) resizeObserver.disconnect()
  if (IS_BROWSER) document.removeEventListener('selectstart', preventSelection)
})

function dispatch(type, payload) {
  switch (type) {
    case 'dragEvent':
      return onDragEvent(payload)
    case 'resizeEvent':
      return onResizeEvent(payload)
    case 'announce':
      return onAnnounce(payload)
    case 'measure':
      return onContainerResize()
    default:
      throw new Error(`GridBoard: dispatch received an unknown command "${String(type)}".`)
  }
}

function preventSelection(e) {
  e.preventDefault()
}

function settleTiming() {
  if (settleCache) return settleCache
  if (!exposeObj.el) return { duration: SETTLE_MS, easing: SETTLE_EASING }
  const style = getComputedStyle(exposeObj.el)
  const easing = style.getPropertyValue('--grid-tile-easing').trim()
  settleCache = {
    duration: readDuration(style.getPropertyValue('--grid-tile-duration'), SETTLE_MS),
    easing: easing && CSS.supports('transition-timing-function', easing) ? easing : SETTLE_EASING
  }
  requestAnimationFrame(() => (settleCache = null))
  return settleCache
}

function readDuration(value, fallback) {
  const match = value.trim().match(/^([\d.]+)(ms|s)?$/)
  if (!match) return fallback
  const ms = parseFloat(match[1]) * (match[2] === 's' ? 1000 : 1)
  return Number.isFinite(ms) ? ms : fallback
}

function onAnnounce(message) {
  if (!message) return
  state.announcement = message === state.announcement ? `${message}\u200b` : message
}

function seedTiles() {
  validateTiles(props.tiles)
  state.tiles = copyTiles(props.tiles)
  applyGravity(state.tiles, props.gravity)
  state.boardStyle = boardStyle(boardHeight())
}

function differs(a, b) {
  if (a?.length !== b?.length) return true
  return a.some((next, i) => {
    const previous = b[i]
    const keys = new Set([...Object.keys(next), ...Object.keys(previous)])
    return [...keys].some((k) => next[k] !== previous[k])
  })
}

function commit() {
  if (!differs(props.tiles, state.tiles)) return
  const tiles = copyTiles(state.tiles)
  lastEmitted = tiles
  emit('update:tiles', tiles)
}

function adoptTiles() {
  if (!differs(props.tiles, state.tiles)) return
  state.tiles = copyTiles(props.tiles)
  applyGravity(state.tiles, props.gravity)
  updateHeight()
  if (IS_BROWSER) commit()
}

function updateHeight() {
  const height = boardHeight()
  if (state.boardStyle.height !== height)
    state.boardStyle = boardStyle(height, state.boardStyle.height)
}

function onContainerResize() {
  if (exposeObj.el) state.width = exposeObj.el.offsetWidth
}

function boardHeight() {
  if (!props.autoHeight) return
  const gy = gap.value[1]
  return `${getLastRow(state.tiles) * (props.rowHeight + gy) + gy}px`
}

function boardStyle(height, previous) {
  const grows = parseFloat(height) > parseFloat(previous)
  return {
    position: 'relative',
    height,
    ...(grows ? { transitionDuration: 'var(--grid-board-grow-duration, 150ms)' } : {})
  }
}

function onDragEvent([phase, id, x, y, h, w] = []) {
  const tile = getTileById(state.tiles, id) ?? { x: 0, y: 0 }

  if (
    phase === 'dragmove' &&
    state.busy &&
    tile.x === x &&
    tile.y === y &&
    state.shadow.w === w &&
    state.shadow.h === h
  ) {
    return
  }

  const gesturing = phase === 'dragmove' || phase === 'dragstart'

  state.tiles = moveTile(state.tiles, tile, x, y, true, false)
  applyGravity(state.tiles, props.gravity, id)

  if (gesturing) state.shadow = { ...state.shadow, x: tile.x, y: tile.y, w, h }
  state.busy = gesturing

  updateHeight()
  commit()
}

function onResizeEvent([phase, id, x, y, h, w] = []) {
  if (!phase) return
  const tile = getTileById(state.tiles, id) ?? { x, y, h: 0, w: 0 }

  if (
    phase === 'resizemove' &&
    state.busy &&
    tile.w === w &&
    tile.h === h &&
    state.shadow.x === x &&
    state.shadow.y === y
  ) {
    return
  }

  tile.w = w
  tile.h = h

  const gesturing = phase === 'resizestart' || phase === 'resizemove'

  applyGravity(state.tiles, props.gravity, id)

  if (gesturing) state.shadow = { ...state.shadow, x: tile.x, y: tile.y, w: tile.w, h: tile.h }
  state.busy = gesturing

  updateHeight()
  commit()
}

function setRef(e) {
  if (!e || e === exposeObj.el) return
  exposeObj.el = e
  if (typeof window !== 'undefined') {
    resizeObserver = new ResizeObserver(onContainerResize)
    resizeObserver.observe(exposeObj.el)
    state.width = exposeObj.el.offsetWidth
  }
}
</script>

<template>
  <div
    :ref="setRef"
    class="grid-board"
    :class="{ 'grid-board--busy': state.busy }"
    :style="state.boardStyle"
  >
    <GridTile
      v-show="state.busy"
      id="shadow"
      class="grid-shadow"
      :x="state.shadow.x"
      :y="state.shadow.y"
      :w="state.shadow.w"
      :h="state.shadow.h"
      shadow
    />
    <OrderedTiles />
    <p :id="instructionsId" class="grid-sr">
      Press Enter or Space to pick the tile up. Then use the arrow keys to move it, or hold Shift
      with the arrow keys to resize it. Press Enter to drop it, or Escape to put it back.
    </p>
    <p class="grid-sr" role="status" aria-live="polite" aria-atomic="true">
      {{ state.announcement }}
    </p>
  </div>
</template>

<style scoped>
.grid-board {
  position: relative;
  transition: height var(--grid-board-shrink-duration, 200ms) var(--grid-board-easing, ease);
}

.grid-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
