<script setup>
import mitt from 'mitt'
import {
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  reactive,
  watch,
  provide,
  nextTick,
  useId
} from 'vue'
import {
  bottom,
  compact,
  getLayoutItem,
  moveElement,
  validateLayout,
  cloneLayout
} from './helpers/helpers'
import GridItem from './grid-item.vue'

const props = defineProps({
  layout: {
    type: Array,
    required: true
  },
  colNum: {
    type: Number,
    default: 12
  },
  rowHeight: {
    type: Number,
    default: 150
  },
  margin: {
    type: Array,
    default() {
      return [10, 10]
    }
  },
  isDraggable: {
    type: Boolean,
    default: true
  },
  isResizable: {
    type: Boolean,
    default: true
  },
  autoSize: {
    type: Boolean,
    default: true
  },
  verticalCompact: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:layout',
  'layout-ready',
  'layout-created',
  'layout-before-mount',
  'layout-mounted',
  'layout-updated'
])

const emitter = mitt()
let resizeObserver = null
let lastEmittedLayout = null

const exposeObj = {
  el: undefined,
  emitter
}
defineExpose(exposeObj)

const state = reactive({
  width: null,
  mergedStyle: {},
  isDragging: false,
  placeholder: {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    i: -1
  },
  layout: [],
  gestureId: 0,
  announcement: ''
})

const instructionsId = useId()

provide('emitter', emitter)
provide('gridLayout', { props, state, instructionsId })

emitter.on('resizeEvent', onResizeEvent)
emitter.on('dragEvent', onDragEvent)
emitter.on('announce', onAnnounce)
emit('layout-created', props.layout)

seedLayout()

if (import.meta.client) {
  watch(
    () => props.layout,
    () => {
      if (props.layout === lastEmittedLayout) return
      validateLayout(props.layout)
      layoutUpdate()
    },
    { immediate: true }
  )

  watch(
    () => state.isDragging,
    (dragging) => {
      if (dragging) {
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
  async (newval, oldval) => {
    emitter.emit('updateWidth', state.width)
    updateHeight()
    if (oldval === null) {
      await nextTick()
      emit('layout-ready', state.layout)
    }
  }
)

watch(
  () => props.colNum,
  () => emitter.emit('setColNum', props.colNum),
  { immediate: true }
)
watch(
  () => props.rowHeight,
  () => emitter.emit('setRowHeight', props.rowHeight)
)
watch(
  () => props.isDraggable,
  () => emitter.emit('setDraggable', props.isDraggable)
)
watch(
  () => props.isResizable,
  () => emitter.emit('setResizable', props.isResizable)
)
watch(() => props.margin, updateHeight, { deep: true })

onBeforeMount(() => emit('layout-before-mount', state.layout))
onMounted(() => emit('layout-mounted', state.layout))

onBeforeUnmount(() => {
  emitter.off('resizeEvent', onResizeEvent)
  emitter.off('dragEvent', onDragEvent)
  emitter.off('announce', onAnnounce)
  if (resizeObserver && exposeObj.el) resizeObserver.disconnect()
  if (import.meta.client) document.removeEventListener('selectstart', preventSelection)
})

function preventSelection(e) {
  e.preventDefault()
}

function onAnnounce(message) {
  if (!message) return
  state.announcement = message === state.announcement ? `${message}\u200b` : message
}

function seedLayout() {
  validateLayout(props.layout)
  state.layout = cloneLayout(props.layout)
  compact(state.layout, props.verticalCompact)
  state.mergedStyle = containerStyle(containerHeight())
}

function layoutIsDiff(a, b) {
  if (a?.length !== b?.length) return true
  return a.some((nItem, i) => {
    const oItem = b[i]
    const keys = new Set([...Object.keys(nItem), ...Object.keys(oItem)])
    return [...keys].some((k) => nItem[k] !== oItem[k])
  })
}

function emitIfChanged() {
  if (layoutIsDiff(props.layout, state.layout)) {
    const layout = cloneLayout(state.layout)
    lastEmittedLayout = layout
    emit('layout-updated', layout)
    emit('update:layout', layout)
  }
}

function layoutUpdate() {
  if (!layoutIsDiff(props.layout, state.layout)) return
  state.layout = cloneLayout(props.layout)
  compact(state.layout, props.verticalCompact)
  emitter.emit('updateWidth', state.width)
  updateHeight()
  if (import.meta.client) emitIfChanged()
}

function updateHeight() {
  const height = containerHeight()
  if (state.mergedStyle.height !== height) state.mergedStyle = containerStyle(height)
}

function onContainerResize() {
  if (exposeObj.el) state.width = exposeObj.el.offsetWidth
}

function containerHeight() {
  if (!props.autoSize) return
  const m2 = props.margin?.[1] || 0
  return `${bottom(state.layout) * (props.rowHeight + m2) + m2}px`
}

function containerStyle(height) {
  return { position: 'relative', height }
}

function onDragEvent([eventName, id, x, y, h, w] = []) {
  const l = getLayoutItem(state.layout, id) ?? { x: 0, y: 0 }

  if (
    eventName === 'dragmove' &&
    state.isDragging &&
    l.x === x &&
    l.y === y &&
    state.placeholder.w === w &&
    state.placeholder.h === h
  ) {
    return
  }

  if (eventName === 'dragmove' || eventName === 'dragstart') {
    if (eventName === 'dragstart') state.gestureId++
    state.placeholder = { ...state.placeholder, x: l.x, y: l.y, w, h }
    state.isDragging = true
  } else {
    state.isDragging = false
  }

  state.layout = moveElement(state.layout, l, x, y, true, false)
  compact(state.layout, props.verticalCompact)
  updateHeight()
  emitIfChanged()
}

function onResizeEvent([eventName, id, x, y, h, w] = []) {
  if (!eventName) return
  const l = getLayoutItem(state.layout, id) ?? { h: 0, w: 0 }

  if (
    eventName === 'resizemove' &&
    state.isDragging &&
    l.w === w &&
    l.h === h &&
    state.placeholder.x === x &&
    state.placeholder.y === y
  ) {
    return
  }

  l.w = w
  l.h = h

  if (eventName === 'resizestart' || eventName === 'resizemove') {
    if (eventName === 'resizestart') state.gestureId++
    state.placeholder = { ...state.placeholder, x, y, w: l.w, h: l.h }
    state.isDragging = true
  } else {
    state.isDragging = false
  }

  compact(state.layout, props.verticalCompact)
  updateHeight()
  emitIfChanged()
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
    class="vue-grid-layout"
    :class="{ 'vgl-gesture': state.isDragging }"
    :style="state.mergedStyle"
  >
    <slot />
    <GridItem
      v-show="state.isDragging"
      class="vue-grid-placeholder"
      :x="state.placeholder.x"
      :y="state.placeholder.y"
      :w="state.placeholder.w"
      :h="state.placeholder.h"
      i="placeholder"
      placeholder
      :gesture-id="state.gestureId"
    />
    <p :id="instructionsId" class="vgl-sr">
      Press Enter or Space to pick the item up. Then use the arrow keys to move it, or hold Shift
      with the arrow keys to resize it. Press Enter to drop it, or Escape to put it back.
    </p>
    <p class="vgl-sr" role="status" aria-live="polite" aria-atomic="true">
      {{ state.announcement }}
    </p>
  </div>
</template>

<style scoped>
.vue-grid-layout {
  position: relative;
  transition: height 200ms ease;
}

.vue-grid-layout.vgl-gesture {
  transition: none;
}

.vgl-sr {
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
