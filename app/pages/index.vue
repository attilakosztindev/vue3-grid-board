<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import GridLayout from '~/grid-fork/grid-layout.vue'
import GridItem from '~/grid-fork/grid-item.vue'
import {
  backendSnippet,
  basicSnippet,
  boardComposableSnippet,
  constraintsSnippet,
  cssSnippet,
  eventsSnippet,
  helpersSnippet,
  installSnippet,
  pointerComposableSnippet,
  quickStartSnippet,
  shapeSnippet
} from '~/docs/snippets'

definePageMeta({ title: 'Grid docs' })

const quickLayout = ref([
  { i: '0', x: 0, y: 0, w: 2, h: 2 },
  { i: '1', x: 2, y: 0, w: 2, h: 4 },
  { i: '2', x: 4, y: 0, w: 2, h: 5 },
  { i: '3', x: 6, y: 0, w: 2, h: 3 }
])

const basicLayout = ref([
  { i: '0', x: 0, y: 0, w: 2, h: 2 },
  { i: '1', x: 2, y: 0, w: 2, h: 4 },
  { i: '2', x: 4, y: 0, w: 2, h: 5 },
  { i: '3', x: 6, y: 0, w: 2, h: 3 },
  { i: '4', x: 8, y: 0, w: 2, h: 3 }
])
const basicInteractive = ref(true)

const constraintsLayout = ref([
  { i: 'a', x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2, maxW: 5, maxH: 5 },
  { i: 'b', x: 3, y: 0, w: 3, h: 3 },
  { i: 'locked', x: 6, y: 0, w: 3, h: 3, static: true }
])

const layoutPropRows = [
  ['layout', 'Array', '—', 'Required. Array of { i, x, y, w, h } items; v-model:layout.'],
  ['colNum', 'Number', '12', 'Number of columns the board is divided into.'],
  ['rowHeight', 'Number', '150', 'Height in px of a single grid row.'],
  ['margin', '[Number, Number]', '[10, 10]', 'Horizontal / vertical gap between tiles.'],
  ['isDraggable', 'Boolean', 'true', 'Enable dragging for all (non-static) items.'],
  ['isResizable', 'Boolean', 'true', 'Enable resizing for all (non-static) items.'],
  ['autoSize', 'Boolean', 'true', 'Container grows to fit the tallest column.'],
  ['verticalCompact', 'Boolean', 'true', 'Gravity — pull tiles up to close vertical gaps.']
]

const itemPropRows = [
  ['i', 'Number | String', '—', 'Required. Unique item id.'],
  ['x / y', 'Number', '—', 'Required. Grid position (column / row).'],
  ['w / h', 'Number', '—', 'Required. Size in grid units.'],
  ['minW / minH', 'Number', '1', 'Minimum size while resizing.'],
  ['maxW / maxH', 'Number', 'Infinity', 'Maximum size while resizing.'],
  ['isDraggable', 'Boolean | null', 'null', 'Override the container flag (null = inherit).'],
  ['isResizable', 'Boolean | null', 'null', 'Override the container flag (null = inherit).'],
  ['static', 'Boolean', 'false', 'Never moves and can\u2019t be moved through.'],
  ['dragIgnoreFrom', 'String', "'a, button'", 'Selector for elements that never start a drag.'],
  [
    'dragAllowFrom',
    'String | null',
    'null',
    'If set, only this selector starts a drag (a handle).'
  ],
  ['resizeIgnoreFrom', 'String', "'a, button'", 'Selector for elements that never start a resize.'],
  ['radius', 'Number', '22', 'Corner radius (px), exposed as the --vgl-radius var.']
]

const layoutEventRows = [
  ['update:layout', 'layout', 'The layout array changed (v-model:layout sync).'],
  ['layout-created', 'layout', 'Container setup, before mount.'],
  ['layout-before-mount', 'layout', 'Just before the DOM is mounted.'],
  ['layout-mounted', 'layout', 'After the DOM is mounted.'],
  ['layout-ready', 'layout', 'First render settled and interactive.'],
  ['layout-updated', 'layout', 'A gesture (drag / resize) committed new positions.']
]

const itemEventRows = [
  ['move', 'i, x, y', 'Fires continuously while a tile is dragged.'],
  ['moved', 'i, x, y', 'Fires once when the drag ends.'],
  ['resize', 'i, h, w', 'Fires continuously while a tile is resized.'],
  ['resized', 'i, h, w', 'Fires once when the resize ends.'],
  ['container-resized', 'i, h, w', 'Fires when the container width recomputes cell size.']
]

const classRows = [
  ['.vue-grid-layout', 'The container element.'],
  ['.vue-grid-item', 'Every tile.'],
  ['.vue-resizable', 'A tile that can be resized (carries the handle).'],
  ['.vue-resizable-handle', 'The bottom-right resize affordance.'],
  ['.vue-draggable-dragging', 'On the tile currently being dragged.'],
  ['.resizing', 'On the tile currently being resized.'],
  ['.static', 'On a static (locked) tile.'],
  ['.vue-grid-placeholder', 'The ghost preview of the drop target.'],
  ['.no-touch / .disable-userselect', 'Applied during gestures to suppress touch/selection.']
]

const itemShapeRows = [
  ['i', 'Number | String', 'Unique id — used as the :key and in every event.'],
  ['x', 'Number', 'Column index (0-based).'],
  ['y', 'Number', 'Row index (0-based).'],
  ['w', 'Number', 'Width in columns.'],
  ['h', 'Number', 'Height in rows.'],
  ['minW / minH / maxW / maxH', 'Number?', 'Optional per-item resize bounds.'],
  ['static', 'Boolean?', 'Optional — locks the tile in place.']
]

const boardPropRows = [
  [
    'endpoint',
    'String',
    "''",
    'Dynamic source URL. Omitted = client-side; provided = fetched (awaited) server-side before hydration.'
  ],
  ['layout', 'Array', '[]', 'Seed layout (used client-side, or as a fallback for an empty fetch).'],
  [
    'config',
    'Object',
    '{}',
    'Partial config merged over the defaults (and under any fetched config).'
  ],
  ['title', 'String', "''", 'Optional heading rendered above the board.']
]

const composableRows = [
  [
    'useGridBoard',
    'Client-side by default; fetches (awaits) config from a dynamic endpoint only when one is provided, and exposes the skeleton geometry.'
  ],
  [
    'usePointerDragResize',
    'The native Pointer Events engine (setPointerCapture, edge auto-scroll) that replaced interact.js.'
  ]
]

const helperRows = [
  ['bottom(layout)', 'Lowest occupied row — used to size the container.'],
  ['cloneLayout(layout)', 'Deep clone of the layout array.'],
  ['getLayoutItem(layout, id)', 'Find an item by its i.'],
  ['compact(layout, vertical)', 'Apply gravity, pulling tiles up to close gaps.'],
  ['moveElement(layout, l, x, y, user, prevent)', 'Move an item and push / reflow collisions.'],
  ['validateLayout(layout, name?)', 'Throw on a malformed layout array.'],
  ['getControlPosition(e)', 'Extract client coordinates from a gesture event.'],
  ['createCoreData(lastX, lastY, x, y)', 'Build the delta payload for a gesture.']
]

const nav = [
  {
    group: 'Getting started',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'installation', label: 'Installation' },
      { id: 'quick-start', label: 'Quick start' }
    ]
  },
  {
    group: 'Examples',
    items: [
      { id: 'example-basic', label: 'Drag & resize' },
      { id: 'example-constraints', label: 'Constraints & static' },
      { id: 'example-backend', label: 'Backend-sourced' }
    ]
  },
  {
    group: 'API',
    items: [
      { id: 'api-layout', label: 'GridLayout props' },
      { id: 'api-item', label: 'GridItem props' },
      { id: 'api-events', label: 'Events' },
      { id: 'api-board', label: 'GridBoard props' },
      { id: 'api-contract', label: 'Class & shape contract' }
    ]
  },
  {
    group: 'Advanced',
    items: [
      { id: 'composables', label: 'Composables' },
      { id: 'helpers', label: 'Layout helpers' },
      { id: 'styling', label: 'Styling' }
    ]
  }
]

const activeId = ref('overview')
const drawerOpen = ref(false)
const drawerRef = ref(null)
const openBtnRef = ref(null)
const closeBtnRef = ref(null)
let restoreFocusOnClose = true

function go(id) {
  restoreFocusOnClose = false
  drawerOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  history.replaceState(null, '', `#${id}`)
}

function drawerFocusables() {
  const root = drawerRef.value
  if (!root) return []
  return [...root.querySelectorAll('a[href], button:not([disabled])')].filter(
    (el) => el.offsetParent !== null
  )
}

function onDrawerKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    drawerOpen.value = false
    return
  }
  if (e.key !== 'Tab') return
  const items = drawerFocusables()
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

watch(drawerOpen, async (open) => {
  if (open) {
    restoreFocusOnClose = true
    document.addEventListener('keydown', onDrawerKeydown)
    await nextTick()
    closeBtnRef.value?.focus()
    return
  }
  document.removeEventListener('keydown', onDrawerKeydown)
  if (restoreFocusOnClose) openBtnRef.value?.focus()
  restoreFocusOnClose = true
})

let observer = null
onMounted(() => {
  const ids = nav.flatMap((g) => g.items.map((i) => i.id))
  const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeId.value = entry.target.id
      }
    },
    { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
  )
  els.forEach((el) => observer.observe(el))
})
onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('keydown', onDrawerKeydown)
})
</script>

<template>
  <div class="doc-root mx-auto flex max-w-7xl bg-white text-neutral-900">
    <div
      class="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden"
    >
      <button
        ref="openBtnRef"
        type="button"
        class="rounded-md border border-neutral-300 px-2.5 py-1 text-sm"
        aria-label="Open navigation"
        aria-controls="site-nav"
        :aria-expanded="drawerOpen"
        @click="drawerOpen = true"
      >
        <span aria-hidden="true">☰</span>
      </button>
      <span class="font-semibold">Vue Grid</span>
    </div>

    <div
      v-if="drawerOpen"
      class="fixed inset-0 z-40 bg-black/30 lg:hidden"
      aria-hidden="true"
      @click="drawerOpen = false"
    />

    <aside
      id="site-nav"
      ref="drawerRef"
      class="fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto border-r border-neutral-200 bg-white px-4 py-6 transition-transform duration-200 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0"
      :class="drawerOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="mb-6 flex items-center justify-between">
        <a
          href="#overview"
          class="text-base font-bold tracking-tight"
          @click.prevent="go('overview')"
        >
          Vue Grid
        </a>
        <button
          ref="closeBtnRef"
          type="button"
          class="rounded-md px-2 py-1 text-sm text-neutral-500 lg:hidden"
          aria-label="Close navigation"
          @click="drawerOpen = false"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <nav class="space-y-5" aria-label="Documentation sections">
        <div v-for="section in nav" :key="section.group">
          <p class="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {{ section.group }}
          </p>
          <ul class="space-y-0.5">
            <li v-for="item in section.items" :key="item.id">
              <a
                :href="`#${item.id}`"
                :aria-current="activeId === item.id ? 'true' : undefined"
                class="block rounded-md px-2 py-1.5 text-sm transition"
                :class="
                  activeId === item.id
                    ? 'bg-emerald-50 font-medium text-emerald-600'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                "
                @click.prevent="go(item.id)"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <main class="min-w-0 flex-1 px-6 pb-24 pt-20 lg:px-12 lg:pt-12">
      <section id="overview" class="scroll-mt-20 border-b border-neutral-100 pb-12">
        <h1 class="text-4xl font-bold tracking-tight">Vue Grid</h1>
        <p class="mt-3 max-w-2xl text-lg text-neutral-600">
          A draggable, resizable grid layout for Vue 3 / Nuxt 4 — a fork of vue-grid-layout with the
          gesture engine rebuilt on native
          <code class="doc-inline">Pointer Events</code>. Structural markup plus a class contract,
          no bundled theme.
        </p>
        <ul class="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
          <li class="rounded-lg border border-neutral-200 p-3 text-sm text-neutral-600">
            <strong class="text-neutral-900">Zero gesture deps.</strong> interact.js removed — drag
            &amp; resize run on <code class="doc-inline">setPointerCapture</code> and edge
            auto-scroll.
          </li>
          <li class="rounded-lg border border-neutral-200 p-3 text-sm text-neutral-600">
            <strong class="text-neutral-900">Reactive layout.</strong> One
            <code class="doc-inline">v-model:layout</code> of
            <code class="doc-inline">{ i, x, y, w, h }</code>
            drives everything.
          </li>
          <li class="rounded-lg border border-neutral-200 p-3 text-sm text-neutral-600">
            <strong class="text-neutral-900">Client-first.</strong>
            <code class="doc-inline">&lt;GridBoard&gt;</code> renders client-side by default; pass
            an <code class="doc-inline">endpoint</code> to fetch config server-side before
            hydration.
          </li>
          <li class="rounded-lg border border-neutral-200 p-3 text-sm text-neutral-600">
            <strong class="text-neutral-900">Headless styling.</strong> Class contract +
            <code class="doc-inline">--vgl-radius</code> var. You author every pixel.
          </li>
        </ul>
        <p class="mt-6 text-sm text-neutral-500">
          Pure layout math lives in <code class="doc-inline">helpers.js</code> (no Vue, no DOM); the
          container and tiles are thin reactive wrappers around it.
        </p>
      </section>

      <section id="installation" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Installation</h2>
        <p class="doc-lead">
          No runtime grid dependency — the engine is a self-contained fork. Copy the building blocks
          in, or run the reference app locally.
        </p>
        <DocExample :code="installSnippet" lang="bash">
          <p class="text-sm text-neutral-600">
            The building blocks live in <code class="doc-inline">app/grid-fork</code> —
            <code class="doc-inline">grid-layout.vue</code>,
            <code class="doc-inline">grid-item.vue</code>, and the
            <code class="doc-inline">helpers/</code> folder (pure math + the Pointer Events engine).
          </p>
        </DocExample>
      </section>

      <section id="quick-start" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Quick start</h2>
        <p class="doc-lead">
          Wrap a set of <code class="doc-inline">&lt;GridItem&gt;</code> in a
          <code class="doc-inline">&lt;GridLayout&gt;</code> and bind
          <code class="doc-inline">v-model:layout</code>. Drag a tile or grab its bottom-right
          corner to resize.
        </p>
        <DocExample :code="quickStartSnippet">
          <GridLayout
            v-model:layout="quickLayout"
            :col-num="12"
            :row-height="40"
            :margin="[10, 10]"
          >
            <GridItem v-for="item in quickLayout" :key="item.i" v-bind="item">
              <div class="doc-tile">Item {{ item.i }}</div>
            </GridItem>
          </GridLayout>
        </DocExample>
      </section>

      <section id="example-basic" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Drag &amp; resize</h2>
        <p class="doc-lead">
          Toggle <code class="doc-inline">isDraggable</code> and
          <code class="doc-inline">isResizable</code> to freeze the board (static, lightweight) or
          re-enable the native gestures. Reflow uses vertical gravity.
        </p>
        <DocExample :code="basicSnippet">
          <div class="flex flex-col items-start gap-3">
            <label class="flex items-center gap-2 text-sm text-neutral-600">
              <input v-model="basicInteractive" type="checkbox" />
              Interactive
              <span class="text-neutral-400">
                ({{ basicInteractive ? 'drag & resize' : 'static' }})
              </span>
            </label>
            <GridLayout
              v-model:layout="basicLayout"
              class="w-full"
              :col-num="12"
              :row-height="40"
              :margin="[10, 10]"
              :is-draggable="basicInteractive"
              :is-resizable="basicInteractive"
            >
              <GridItem v-for="item in basicLayout" :key="item.i" v-bind="item">
                <div class="doc-tile">Item {{ item.i }}</div>
              </GridItem>
            </GridLayout>
          </div>
        </DocExample>
      </section>

      <section id="example-constraints" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Constraints &amp; static tiles</h2>
        <p class="doc-lead">
          Per-item <code class="doc-inline">minW/minH</code> and
          <code class="doc-inline">maxW/maxH</code> clamp resizing; a
          <code class="doc-inline">static</code> tile never moves and can't be moved through. Tile
          <strong>a</strong> is clamped to 2–5 in each axis; <strong>Locked</strong> is static.
        </p>
        <DocExample :code="constraintsSnippet">
          <GridLayout
            v-model:layout="constraintsLayout"
            class="w-full"
            :col-num="12"
            :row-height="40"
            :margin="[10, 10]"
          >
            <GridItem
              v-for="item in constraintsLayout"
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
              <div class="doc-tile" :class="{ 'doc-tile--locked': item.static }">
                {{ item.static ? 'Locked' : item.i }}
              </div>
            </GridItem>
          </GridLayout>
        </DocExample>
      </section>

      <section id="example-backend" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">
          Client-side &amp; server-sourced <span class="doc-h2-sub">GridBoard</span>
        </h2>
        <p class="doc-lead">
          <code class="doc-inline">&lt;GridBoard&gt;</code> is an auto-imported wrapper that is
          <strong>client-side by default</strong> — it renders from its props and never touches the
          network. It only becomes <strong>server-sided</strong> when you point it at a dynamic
          <code class="doc-inline">endpoint</code>, whose config is fetched (and awaited) before the
          client loads in. The endpoint URL is opaque; only its response <em>shape</em> is known.
          Below is the live server-sourced board (with its built-in dynamic / static switch).
        </p>
        <DocExample :code="backendSnippet">
          <GridBoard title="Server-sourced (endpoint provided)" endpoint="/api/grid-layout" />
        </DocExample>
        <p class="mt-4 mb-2 text-sm font-semibold text-neutral-500">Expected response shape</p>
        <DocExample :code="shapeSnippet" lang="ts" />
        <p class="mt-4 text-sm text-neutral-500">
          A richer set of real-world layouts lives on the
          <NuxtLink to="/showcase" class="text-emerald-600 underline">bento showcase</NuxtLink>
          page.
        </p>
      </section>

      <section id="api-layout" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Props <span class="doc-h2-sub">GridLayout</span></h2>
        <div class="doc-table-wrap">
          <table class="doc-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in layoutPropRows" :key="row[0]">
                <td>
                  <code class="doc-inline">{{ row[0] }}</code>
                </td>
                <td>
                  <code class="doc-mono">{{ row[1] }}</code>
                </td>
                <td>
                  <code class="doc-mono">{{ row[2] }}</code>
                </td>
                <td>{{ row[3] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="api-item" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Props <span class="doc-h2-sub">GridItem</span></h2>
        <div class="doc-table-wrap">
          <table class="doc-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in itemPropRows" :key="row[0]">
                <td>
                  <code class="doc-inline">{{ row[0] }}</code>
                </td>
                <td>
                  <code class="doc-mono">{{ row[1] }}</code>
                </td>
                <td>
                  <code class="doc-mono">{{ row[2] }}</code>
                </td>
                <td>{{ row[3] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="api-events" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Events &amp; lifecycle hooks</h2>
        <p class="doc-lead">
          <code class="doc-inline">&lt;GridLayout&gt;</code> emits lifecycle hooks as the board
          mounts and whenever a gesture commits;
          <code class="doc-inline">&lt;GridItem&gt;</code> emits the per-tile move / resize stream.
        </p>
        <h3 class="mb-2 mt-2 text-sm font-semibold text-neutral-500">GridLayout</h3>
        <div class="doc-table-wrap">
          <table class="doc-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Payload</th>
                <th>Fires when</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in layoutEventRows" :key="row[0]">
                <td>
                  <code class="doc-inline">@{{ row[0] }}</code>
                </td>
                <td>
                  <code class="doc-mono">{{ row[1] }}</code>
                </td>
                <td>{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="mb-2 mt-6 text-sm font-semibold text-neutral-500">GridItem</h3>
        <div class="doc-table-wrap">
          <table class="doc-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Payload</th>
                <th>Fires when</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in itemEventRows" :key="row[0]">
                <td>
                  <code class="doc-inline">@{{ row[0] }}</code>
                </td>
                <td>
                  <code class="doc-mono">{{ row[1] }}</code>
                </td>
                <td>{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4">
          <DocExample :code="eventsSnippet" />
        </div>
      </section>

      <section id="api-board" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Props <span class="doc-h2-sub">GridBoard</span></h2>
        <p class="doc-lead">
          The batteries-included wrapper around <code class="doc-inline">&lt;GridLayout&gt;</code> +
          <code class="doc-inline">useGridBoard</code>.
        </p>
        <div class="doc-table-wrap">
          <table class="doc-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in boardPropRows" :key="row[0]">
                <td>
                  <code class="doc-inline">{{ row[0] }}</code>
                </td>
                <td>
                  <code class="doc-mono">{{ row[1] }}</code>
                </td>
                <td>
                  <code class="doc-mono">{{ row[2] }}</code>
                </td>
                <td>{{ row[3] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4">
          <DocExample :code="backendSnippet" />
        </div>
      </section>

      <section id="api-contract" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Class &amp; shape contract</h2>
        <p class="doc-lead">
          Tiles render structural markup and toggle these classes through the gesture lifecycle —
          this
          <em>is</em> the styling API. Target them with plain CSS or Tailwind variants.
        </p>
        <div class="doc-table-wrap">
          <table class="doc-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in classRows" :key="row[0]">
                <td>
                  <code class="doc-inline">{{ row[0] }}</code>
                </td>
                <td>{{ row[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="mb-2 mt-6 text-sm font-semibold text-neutral-500">Layout item shape</h3>
        <div class="doc-table-wrap">
          <table class="doc-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in itemShapeRows" :key="row[0]">
                <td>
                  <code class="doc-inline">{{ row[0] }}</code>
                </td>
                <td>
                  <code class="doc-mono">{{ row[1] }}</code>
                </td>
                <td>{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="composables" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Composables (hooks)</h2>
        <p class="doc-lead">
          Two composables carry the non-visual work. Reuse them to build your own board, or lean on
          the shipped components.
        </p>
        <div class="doc-table-wrap">
          <table class="doc-table">
            <thead>
              <tr>
                <th>Composable</th>
                <th>Responsibility</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in composableRows" :key="row[0]">
                <td>
                  <code class="doc-inline">{{ row[0] }}</code>
                </td>
                <td>{{ row[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 space-y-4">
          <DocExample :code="boardComposableSnippet" />
          <DocExample :code="pointerComposableSnippet" lang="ts" />
        </div>
      </section>

      <section id="helpers" class="scroll-mt-20 border-b border-neutral-100 py-12">
        <h2 class="doc-h2">Layout helpers <span class="doc-h2-sub">helpers.js</span></h2>
        <p class="doc-lead">
          Pure functions — no Vue, no DOM. The container drives them on every gesture; you can call
          them directly to transform a layout array.
        </p>
        <div class="doc-table-wrap">
          <table class="doc-table">
            <thead>
              <tr>
                <th>Function</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in helperRows" :key="row[0]">
                <td>
                  <code class="doc-mono">{{ row[0] }}</code>
                </td>
                <td>{{ row[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4">
          <DocExample :code="helpersSnippet" lang="ts" />
        </div>
      </section>

      <section id="styling" class="scroll-mt-20 py-12">
        <h2 class="doc-h2">Styling</h2>
        <p class="doc-lead">
          The components ship no visual theme — only structure and the class contract above. Style
          the classes yourself; animate <code class="doc-inline">transform</code> for a smooth
          reflow, and feed the corner radius through the <code class="doc-inline">radius</code> prop
          / <code class="doc-inline">--vgl-radius</code> var.
        </p>
        <DocExample :code="cssSnippet" lang="css" />
      </section>
    </main>
  </div>
</template>
