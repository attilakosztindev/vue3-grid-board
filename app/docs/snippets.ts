/**
 * Copy-pasteable source shown in the docs "Code" tabs. Kept as plain strings so
 * the rendered example and the snippet can't drift apart at a glance.
 */

export const installSnippet = `# The grid engine is a self-contained fork — no runtime grid
# dependency to install. Copy the building blocks in:
#
#   app/grid-fork/grid-layout.vue          container
#   app/grid-fork/grid-item.vue            tile
#   app/grid-fork/helpers/helpers.js       pure layout math
#   app/grid-fork/helpers/usePointerDragResize.js   native Pointer Events engine
#
# or clone the reference app and run it locally
git clone <repo> && cd vue3-grid-test && pnpm install && pnpm dev`

export const quickStartSnippet = `<script setup>
import { ref } from 'vue'
import GridLayout from '~/grid-fork/grid-layout.vue'
import GridItem from '~/grid-fork/grid-item.vue'

// Each item is a plain { i, x, y, w, h } cell in grid units.
const layout = ref([
  { i: '0', x: 0, y: 0, w: 2, h: 2 },
  { i: '1', x: 2, y: 0, w: 2, h: 4 },
  { i: '2', x: 4, y: 0, w: 2, h: 5 },
  { i: '3', x: 6, y: 0, w: 2, h: 3 }
])
</script>

<template>
  <GridLayout
    v-model:layout="layout"
    :col-num="12"
    :row-height="40"
    :margin="[10, 10]"
  >
    <GridItem
      v-for="item in layout"
      :key="item.i"
      v-bind="item"
    >
      <div class="tile">Item {{ item.i }}</div>
    </GridItem>
  </GridLayout>
</template>`

export const basicSnippet = `<script setup>
import { ref } from 'vue'
import GridLayout from '~/grid-fork/grid-layout.vue'
import GridItem from '~/grid-fork/grid-item.vue'

const layout = ref([
  { i: '0', x: 0, y: 0, w: 2, h: 2 },
  { i: '1', x: 2, y: 0, w: 2, h: 4 },
  { i: '2', x: 4, y: 0, w: 2, h: 5 },
  { i: '3', x: 6, y: 0, w: 2, h: 3 },
  { i: '4', x: 8, y: 0, w: 2, h: 3 }
])

// Flip both flags to freeze the board (static, lightweight) or
// re-enable the native drag + resize gestures.
const interactive = ref(true)
</script>

<template>
  <GridLayout
    v-model:layout="layout"
    :col-num="12"
    :row-height="40"
    :margin="[10, 10]"
    :is-draggable="interactive"
    :is-resizable="interactive"
    @layout-updated="(l) => console.log('new layout', l)"
  >
    <GridItem v-for="item in layout" :key="item.i" v-bind="item">
      <div class="tile">Item {{ item.i }}</div>
    </GridItem>
  </GridLayout>
</template>`

export const constraintsSnippet = `<script setup>
import { ref } from 'vue'
import GridLayout from '~/grid-fork/grid-layout.vue'
import GridItem from '~/grid-fork/grid-item.vue'

// Per-item constraints: min/max size, and a fully static tile that
// never moves and can't be moved through.
const layout = ref([
  { i: 'a', x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2, maxW: 5, maxH: 5 },
  { i: 'b', x: 3, y: 0, w: 3, h: 3 },
  { i: 'locked', x: 6, y: 0, w: 3, h: 3, static: true }
])
</script>

<template>
  <GridLayout v-model:layout="layout" :col-num="12" :row-height="40" :margin="[10, 10]">
    <GridItem
      v-for="item in layout"
      :key="item.i"
      :i="item.i"
      :x="item.x"
      :y="item.y"
      :w="item.w"
      :h="item.h"
      :min-w="item.minW"
      :min-h="item.minH"
      :max-w="item.maxW"
      :max-h="item.maxH"
      :static="item.static"
    >
      <div class="tile">{{ item.static ? 'Locked' : item.i }}</div>
    </GridItem>
  </GridLayout>
</template>`

export const backendSnippet = `<script setup>
// <GridBoard> is an auto-imported wrapper. It is CLIENT-SIDE by default;
// it only becomes server-sided when you point it at a dynamic endpoint,
// whose config is fetched (and awaited) before the client loads in.
</script>

<template>
  <!-- Client-side by default: no fetch, renders from props / defaults -->
  <GridBoard title="Client-side" />

  <!-- Server-sided: pass a dynamic endpoint. Its response must match the
       GridBoardResponse shape ({ config?, layout? }). -->
  <GridBoard title="Server-sourced" endpoint="/api/grid-layout" />
</template>`

export const shapeSnippet = `// shared/types/grid.ts — the contract every endpoint is expected to meet.
export interface GridConfig {
  colNum: number
  rowHeight: number
  margin: [number, number]
  interactive: boolean
}

export interface GridLayoutItem {
  i: number | string
  x: number
  y: number
  w: number
  h: number
  minW?: number; minH?: number; maxW?: number; maxH?: number
  static?: boolean
}

// The board doesn't know the endpoint URL ahead of time — only this shape.
export interface GridBoardResponse {
  config?: Partial<GridConfig>
  layout?: GridLayoutItem[]
}`

export const eventsSnippet = `<GridLayout
  v-model:layout="layout"
  @layout-created="(l) => console.log('created', l)"
  @layout-before-mount="(l) => console.log('before mount', l)"
  @layout-mounted="(l) => console.log('mounted', l)"
  @layout-ready="(l) => console.log('ready', l)"
  @layout-updated="(l) => console.log('updated', l)"
  @update:layout="(l) => (layout = l)"
>
  <GridItem
    v-for="item in layout"
    :key="item.i"
    v-bind="item"
    @move="(i, x, y) => console.log('moving', i, x, y)"
    @moved="(i, x, y) => console.log('moved', i, x, y)"
    @resize="(i, h, w) => console.log('resizing', i, h, w)"
    @resized="(i, h, w) => console.log('resized', i, h, w)"
    @container-resized="(i, h, w) => console.log('container', i, h, w)"
  >
    <div class="tile">Item {{ item.i }}</div>
  </GridItem>
</GridLayout>`

export const boardComposableSnippet = `<script setup lang="ts">
import type { GridBoardResponse } from '#shared/types/grid'

// Client-side by default. Pass a dynamic \`endpoint\` to fetch (and await)
// the config server-side before hydration; omit it to stay client-only.
// The endpoint is opaque — only its response shape is known.
const {
  layout,          // reactive GridLayoutItem[]
  config,          // resolved GridConfig
  isDynamic,       // v-model target for a "drag & resize" toggle
  clientFallback,  // true when there's no endpoint (or the fetch failed)
  skeletonStyle,   // (item) => CSSProperties for a placeholder tile
  skeletonHeight   // total board height while loading
} = await useGridBoard({
  endpoint: '/api/grid-layout', // omit for a purely client-side board
  layout: [],
  config: {}
})
</script>`

export const pointerComposableSnippet = `import { usePointerDragResize } from '~/grid-fork/helpers/usePointerDragResize'

// The native Pointer Events engine that replaced interact.js. GridItem
// wires it up in onMounted; you only touch it to build a custom tile.
const { destroy } = usePointerDragResize(el, {
  handleSelector: '.vue-resizable-handle',
  draggable: () => true,
  resizable: () => true,
  dragIgnoreFrom: () => 'a, button',
  dragAllowFrom: () => null,
  resizeIgnoreFrom: () => 'a, button',
  autoScroll: () => true,
  // Synthetic gesture events: { type, target, clientX, clientY }
  onDrag: (event) => {
    // event.type is 'dragstart' | 'dragmove' | 'dragend'
  },
  onResize: (event) => {
    // event.type is 'resizestart' | 'resizemove' | 'resizeend'
  }
})

// Call on unmount to remove listeners and release pointer capture.
onBeforeUnmount(destroy)`

export const helpersSnippet = `import {
  bottom,
  cloneLayout,
  getLayoutItem,
  compact,
  moveElement,
  validateLayout,
  getControlPosition,
  createCoreData
} from '~/grid-fork/helpers/helpers'

// Pure functions — no Vue, no DOM. The container drives them on every gesture.
const rows = bottom(layout)                       // lowest occupied row
const copy = cloneLayout(layout)                  // deep clone
const item = getLayoutItem(layout, '2')           // find by id
compact(copy, true)                               // gravity: pull tiles up
moveElement(copy, item, 3, 0, true, false)        // move + push collisions
validateLayout(layout, 'my-board')                // throws on a bad shape`

export const cssSnippet = `/* GridItem renders structural markup + a class contract and no theme.
   Style the classes yourself (Tailwind or plain CSS). */
.vue-grid-item {
  transition: transform 200ms ease;      /* animate reflow */
}
.vue-grid-item.vue-draggable-dragging {
  transition: none;                      /* follow the pointer 1:1 */
  z-index: 3;
}
.vue-grid-item.resizing {
  opacity: 0.9;
}
.vue-grid-item.vue-grid-placeholder {
  background: var(--rdp-accent, #10b981);
  opacity: 0.2;
}
/* The resize affordance in the bottom-right corner. */
.vue-grid-item .vue-resizable-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: se-resize;
}
/* Corner radius is exposed as a CSS var, fed by the \`radius\` prop. */
.vue-grid-item {
  border-radius: var(--vgl-radius);
}`
