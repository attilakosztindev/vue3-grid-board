<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { GridBoard, GridTile, getLastRow, validateTiles } from 'vue3-grid-board'
import {
  dynamicSnippet,
  extendSnippet,
  frozenSnippet,
  gravitySnippet,
  importSnippet,
  importStandaloneSnippet,
  installNpmSnippet,
  installPnpmSnippet,
  installYarnSnippet,
  interactiveSnippet,
  methodsSnippet,
  mutationSnippet,
  nuxtModuleSnippet,
  overflowSnippet,
  persistenceSnippet,
  slotsSnippet,
  stylingSnippet,
  typesSnippet,
  usageSnippet
} from '~/docs/snippets'

const logo = asset('/vue3-grid-board-logo.svg')

definePageMeta({ title: 'vue3-grid-board' })
useHead({
  title: 'vue3-grid-board — a draggable, resizable board for Vue 3',
  bodyAttrs: { class: 'doc-body' }
})

const usageTiles = ref([
  { id: 'a', x: 0, y: 0, w: 6, h: 4 },
  { id: 'b', x: 6, y: 0, w: 3, h: 2 },
  { id: 'c', x: 9, y: 0, w: 3, h: 2 },
  { id: 'd', x: 6, y: 2, w: 6, h: 2 },
  { id: 'e', x: 0, y: 4, w: 4, h: 2 },
  { id: 'f', x: 4, y: 4, w: 4, h: 2 },
  { id: 'g', x: 8, y: 4, w: 4, h: 2 }
])

const interactive = ref(true)
const liveTiles = ref([
  { id: 'a', x: 0, y: 0, w: 4, h: 4 },
  { id: 'b', x: 4, y: 0, w: 8, h: 2 },
  { id: 'c', x: 4, y: 2, w: 4, h: 2 },
  { id: 'd', x: 8, y: 2, w: 4, h: 2 },
  { id: 'e', x: 0, y: 4, w: 6, h: 2 },
  { id: 'f', x: 6, y: 4, w: 6, h: 2 }
])

const gravityGaps = [
  { id: 'a', x: 0, y: 1, w: 5, h: 3 },
  { id: 'b', x: 5, y: 0, w: 7, h: 2 },
  { id: 'c', x: 5, y: 4, w: 4, h: 3 },
  { id: 'd', x: 9, y: 3, w: 3, h: 3 },
  { id: 'e', x: 0, y: 6, w: 5, h: 2 }
]
const gravityTiles = ref(gravityGaps.map((t) => ({ ...t })))
const gravityMode = ref('off')
const gravityTabs = [
  { value: 'off', label: 'Gravity off' },
  { value: 'on', label: 'Gravity on' }
]

const frozenTiles = ref([
  { id: 'nav', x: 0, y: 0, w: 3, h: 6, frozen: true },
  { id: 'a', x: 3, y: 0, w: 5, h: 3 },
  { id: 'b', x: 8, y: 0, w: 4, h: 3 },
  { id: 'c', x: 3, y: 3, w: 4, h: 3 },
  { id: 'd', x: 7, y: 3, w: 5, h: 3 }
])

const escape = ref(true)
const overflowTabs = [
  { value: false, label: 'Clipped' },
  { value: true, label: 'Overflow' }
]
const overflowTiles = ref([
  { id: 'a', x: 0, y: 0, w: 6, h: 3 },
  { id: 'b', x: 6, y: 0, w: 6, h: 3 },
  { id: 'c', x: 0, y: 3, w: 4, h: 3 },
  { id: 'd', x: 4, y: 3, w: 8, h: 3 }
])

let seq = 6
const dynamicTiles = ref([
  { id: '1', x: 0, y: 0, w: 6, h: 3 },
  { id: '2', x: 6, y: 0, w: 3, h: 3 },
  { id: '3', x: 9, y: 0, w: 3, h: 3 },
  { id: '4', x: 0, y: 3, w: 4, h: 2 },
  { id: '5', x: 4, y: 3, w: 8, h: 2 }
])
function addTile() {
  dynamicTiles.value = [
    ...dynamicTiles.value,
    { id: String(seq++), x: 0, y: getLastRow(dynamicTiles.value), w: 4, h: 2 }
  ]
}
function removeTile(id) {
  dynamicTiles.value = dynamicTiles.value.filter((t) => t.id !== id)
}

const PERSIST_KEY = 'vue3-grid-board-docs-demo'
const persistDefault = [
  { id: 'a', x: 0, y: 0, w: 8, h: 3 },
  { id: 'b', x: 8, y: 0, w: 4, h: 3 },
  { id: 'c', x: 0, y: 3, w: 4, h: 2 },
  { id: 'd', x: 4, y: 3, w: 4, h: 2 },
  { id: 'e', x: 8, y: 3, w: 4, h: 2 }
]
const persistTiles = ref(persistDefault.map((t) => ({ ...t })))
const persistStatus = ref('Nothing saved yet.')

let settled = JSON.stringify(persistTiles.value)
function setStatus(message) {
  persistStatus.value = message
  settled = JSON.stringify(persistTiles.value)
}
watch(persistTiles, (next) => {
  if (JSON.stringify(next) === settled) return
  persistStatus.value = 'Unsaved changes.'
})

function save() {
  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(persistTiles.value))
  } catch (error) {
    setStatus(`Could not reach localStorage: ${error.message}`)
    return
  }
  setStatus(`Saved ${persistTiles.value.length} tiles.`)
}
function restore() {
  let raw = null
  try {
    raw = localStorage.getItem(PERSIST_KEY)
  } catch (error) {
    setStatus(`Could not reach localStorage: ${error.message}`)
    return
  }
  if (!raw) {
    setStatus('Nothing saved yet.')
    return
  }
  try {
    const parsed = JSON.parse(raw)
    validateTiles(parsed, 'stored tiles')
    persistTiles.value = parsed
    setStatus('Restored from localStorage.')
  } catch (error) {
    setStatus(`Ignored a bad saved board: ${error.message}`)
  }
}
function reset() {
  persistTiles.value = persistDefault.map((t) => ({ ...t }))
  setStatus('Reset to the built-in board.')
}

const keyboardTiles = ref([
  { id: 'one', x: 0, y: 0, w: 6, h: 4, title: 'Revenue' },
  { id: 'two', x: 6, y: 0, w: 6, h: 2, title: 'Signups' },
  { id: 'three', x: 6, y: 2, w: 3, h: 2, title: 'Churn' },
  { id: 'four', x: 9, y: 2, w: 3, h: 2, title: 'Sessions' }
])


const boardProps = [
  [
    'tiles',
    'The tiles on the board. Watched by identity, so replace the array rather than mutating it.',
    'Tile[]',
    '—'
  ],
  ['columns', 'How many columns the board is divided into.', 'number', '12'],
  ['rowHeight', 'The height of one row, in pixels.', 'number', '150'],
  ['gap', 'Space between tiles, in pixels. A pair sets the two axes apart.', 'number | Gap', '10'],
  ['draggable', 'Board-wide default. A tile can override it.', 'boolean', 'true'],
  ['resizable', 'Board-wide default. A tile can override it.', 'boolean', 'true'],
  ['autoHeight', 'Grow the board to fit its lowest tile.', 'boolean', 'true'],
  [
    'gravity',
    'Pull every tile up until it rests on the one above. Reactive — switching it back on settles immediately.',
    'boolean',
    'true'
  ],
  [
    'overflow',
    'Let the tile being dragged or resized paint over anything that would otherwise clip it.',
    'boolean',
    'false'
  ]
]

const boardEvents = [
  [
    'update:tiles',
    'What v-model:tiles binds. Fires with a fresh array whenever a change commits.',
    '(tiles: Tile[]) => void'
  ],
  ['ready', 'Once the board has been measured and has settled.', '(tiles: Tile[]) => void']
]

const tileProps = [
  [
    'id',
    "Unique within the board. Compared with ===, so 1 and '1' are two different tiles.",
    'number | string',
    '—'
  ],
  ['x', 'Column index, from 0.', 'number', '—'],
  ['y', 'Row index, from 0. Must be finite — Infinity hangs the settle loop.', 'number', '—'],
  ['w', 'Width, in columns.', 'number', '—'],
  ['h', 'Height, in rows.', 'number', '—'],
  ['minW', 'Smallest width a resize may reach.', 'number', '1'],
  ['minH', 'Smallest height a resize may reach.', 'number', '1'],
  ['maxW', 'Largest width a resize may reach. Also clamped by columns.', 'number', 'Infinity'],
  ['maxH', 'Largest height a resize may reach.', 'number', 'Infinity'],
  ['draggable', 'Overrides the board. null inherits it.', 'boolean | null', 'null'],
  ['resizable', 'Overrides the board. null inherits it.', 'boolean | null', 'null'],
  ['frozen', 'Fix the tile in place and take it out of the reflow.', 'boolean', 'false'],
  [
    'dragHandle',
    'Class name, without the dot. When set, only a press inside an element with that class drags.',
    'string | null',
    'null'
  ],
  ['dragIgnore', 'CSS selector for descendants that never drag.', 'string', "'a, button'"],
  ['resizeIgnore', 'The same, for descendants of the resize handle.', 'string', "'a, button'"],
  ['radius', 'Corner radius in pixels, published to CSS as --grid-radius.', 'number', '22'],
  ['label', 'Screen-reader name for the tile.', 'string | null', "'Tile {id}'"]
]

const tileEvents = [
  ['dragstart', 'Once, as the drag begins.', '(id, x, y) => void'],
  ['drag', 'Continuously while dragging, in grid units.', '(id, x, y) => void'],
  ['dragend', 'Once on release, at the drop position — before gravity.', '(id, x, y) => void'],
  ['resizestart', 'Once, as the resize begins.', '(id, w, h) => void'],
  ['resize', 'Continuously while resizing, in grid units.', '(id, w, h) => void'],
  ['resizeend', 'Once, when the resize is released.', '(id, w, h) => void'],
  ['size', "The tile's pixel box, whenever the board changes width.", '(id, width, height) => void']
]

const boardExposed = [
  ['el', 'The board element, once mounted.', 'HTMLElement | undefined'],
  [
    'dispatch',
    'Drives the board from code: apply a gesture, re-measure, or announce to screen readers.',
    'GridDispatch'
  ]
]

const tileExposed = [['el', 'The tile element, once mounted.', 'HTMLElement | undefined']]

const boardSlots = [['default', 'The tiles. Only GridTile children belong here.', '—']]

const tileSlots = [
  ['default', "The tile's content.", '—'],
  ['handle', 'Replaces the corner grip. Anything inside it still starts a resize.', '—']
]

const cssRows = [
  ['.grid-board', 'The board. The positioning context for every tile.', 'always'],
  ['.grid-board--busy', 'A gesture is in flight somewhere on the board.', 'during a gesture'],
  ['.grid-sr', 'Visually-hidden instructions and the live region.', 'always'],
  ['.grid-tile', 'Every tile.', 'always'],
  ['.grid-tile--draggable', 'The tile can be picked up by its own body.', 'draggable'],
  ['.grid-shadow', 'The slot the dragged tile will land in.', 'during a gesture'],
  ['.grid-tile--frozen', 'The tile is frozen.', 'frozen'],
  ['.grid-tile--dragging', 'The tile is being dragged.', 'mid-drag'],
  ['.grid-tile--resizing', 'The tile is being resized.', 'mid-resize'],
  ['.grid-tile--settling', 'The tile is gliding to its new slot.', 'after a gesture'],
  ['.grid-tile--grabbed', 'The tile was picked up from the keyboard.', 'keyboard drag'],
  ['.grid-handle', 'The resize grip, whether or not you filled it.', 'resizable'],
  ['.grid-handle--chevron', 'The grip, when no #handle slot was given.', 'resizable']
]

const nuxtOptionRows = [
  ['prefix', "Put in front of the component names: 'Ui' gives <UiGridBoard>.", 'string', "''"],
  ['css', 'Add the stylesheet to the app.', 'boolean', 'true'],
  ['autoImports', 'Auto-import the layout helpers.', 'boolean', 'true']
]

const typeRows = [
  ['Tile', 'One tile: id, x, y, w, h, plus the optional bounds and flags.'],
  ['TileWith<T>', 'A tile carrying your own fields alongside the geometry.'],
  ['TileId', 'string | number.'],
  ['Gap', 'number | [number, number].'],
  ['GridBoardProps', "The board's props, if you wrap it in your own component."],
  ['GridTileProps', "A tile's props, for the same reason."],
  ['GridBoardEmits', 'update:tiles and ready, with their payloads.'],
  ['GridTileEmits', 'The seven gesture events, with their payloads.'],
  ['GridTileSlots', 'default and handle.'],
  ['GridBoardExposed', 'What a board ref gives you: el and dispatch.'],
  ['GridTileExposed', 'What a tile ref gives you: el.'],
  ['GridDispatch', "The dispatch signature, overloaded per command."],
  ['DragEventTuple', 'The payload dispatch takes for a drag, and ResizeEventTuple for a resize.'],
  ['PointerDragResizeOptions', 'Options for usePointerDragResize, with its controller type.']
]

const methodRows = [
  ['getLastRow(tiles)', 'The first free row under everything. Where a new tile starts.', 'number'],
  ['copyTiles(tiles)', 'Shallow-copies every tile, your own keys included.', 'T[]'],
  ['getTileById(tiles, id)', 'Look one tile up by id.', 'T | undefined'],
  [
    'applyGravity(tiles, gravity, priorityId?)',
    'Settle the board in place. priorityId settles first on its row.',
    'void'
  ],
  [
    'moveTile(tiles, tile, x, y, fromUser, preventOverlap)',
    'Move one tile in place, pushing whatever it hits.',
    'T[]'
  ],
  ['validateTiles(tiles, name?)', 'Throw on a bad type, a missing id or a duplicate id.', 'void']
]

const keyboardRows = [
  ['Tab', 'Move focus between tiles. Frozen tiles are skipped.'],
  ['Enter or Space', 'Pick the focused tile up, and drop it again.'],
  ['Arrow keys', 'Move the picked-up tile by one cell, or past the next tile when gravity is on.'],
  ['Shift + Arrows', 'Resize the picked-up tile by one cell.'],
  ['Escape', 'Cancel, putting every tile back where the gesture started.']
]

const nav = [
  {
    title: 'Guide',
    items: [
      { id: 'installation', label: 'Installation' },
      { id: 'usage', label: 'Usage' },
      { id: 'gestures', label: 'Drag & resize' },
      { id: 'gravity', label: 'Gravity' },
      { id: 'frozen', label: 'Frozen tiles' },
      { id: 'slots', label: 'Slots' },
      { id: 'overflow', label: 'Overflow' },
      { id: 'dynamic', label: 'Add & remove' },
      { id: 'persistence', label: 'Save & restore' },
      { id: 'keyboard', label: 'Keyboard' },
      { id: 'ssr', label: 'Server rendering' },
      { id: 'events', label: 'Events' }
    ]
  },
  {
    title: 'TypeScript',
    items: [
      { id: 'types', label: 'Types' },
      { id: 'custom-fields', label: 'Custom fields' }
    ]
  },
  {
    title: 'API',
    items: [
      { id: 'api-board', label: 'GridBoard' },
      { id: 'api-tile', label: 'GridTile' },
      { id: 'api-css', label: 'CSS' },
      { id: 'api-methods', label: 'Methods' }
    ]
  }
]

const activeSection = ref('installation')
const SPY_LINE = 88

let spySections = []
let spyResizeObserver = null

function readActiveSection() {
  if (!spySections.length) return

  const scroller = document.scrollingElement ?? document.documentElement
  if (Math.ceil(window.scrollY + window.innerHeight) >= scroller.scrollHeight - 2) {
    activeSection.value = spySections[spySections.length - 1].id
    return
  }

  const line = window.scrollY + SPY_LINE
  let current = spySections[0].id
  for (const section of spySections) {
    if (section.top > line) break
    current = section.id
  }
  activeSection.value = current
}

function measureSections() {
  spySections = [...document.querySelectorAll('section[id]')].map((el) => ({
    id: el.id,
    top: Math.round(el.getBoundingClientRect().top + window.scrollY)
  }))
  readActiveSection()
}

onMounted(() => {
  measureSections()
  window.addEventListener('scroll', readActiveSection, { passive: true })
  window.addEventListener('resize', measureSections, { passive: true })

  const main = document.querySelector('main')
  if (main && typeof ResizeObserver !== 'undefined') {
    spyResizeObserver = new ResizeObserver(measureSections)
    spyResizeObserver.observe(main)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', readActiveSection)
  window.removeEventListener('resize', measureSections)
  spyResizeObserver?.disconnect()
})
</script>

<template>
  <div class="doc-root">
    <div class="mx-auto flex max-w-7xl gap-16 px-6">
      <aside class="sticky top-0 -mx-2 hidden h-screen w-fit shrink-0 overflow-y-auto px-2 py-10 lg:block">
        <a
          href="#top"
          class="mb-6 flex flex-col items-center gap-2 text-sm font-semibold tracking-tight text-neutral-900"
        >
          <img :src="logo" alt="" width="24" height="24" class="w-full max-w-56" />
          <span class="text-2xl font-bold">vue3-grid-board</span>
        </a>
        <nav aria-label="Documentation">
          <div v-for="group in nav" :key="group.title" class="mb-6">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {{ group.title }}
            </p>
            <ul class="space-y-0.5">
              <li v-for="item in group.items" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  class="block rounded-md px-2 py-1 text-sm transition"
                  :class="
                    activeSection === item.id
                      ? 'bg-primary-50 font-medium text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900'
                  "
                  :aria-current="activeSection === item.id ? 'true' : undefined"
                >
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <main id="top" class="min-w-0 flex-1 pb-24">
        <h1 class="sr-only">vue3-grid-board</h1>

        <section id="installation" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Installation</h2>
          <p class="doc-lead mt-2">
            vue3-grid-board installs from npm. Vue 3.5 is the only peer dependency, and there is
            no runtime dependency beyond it.
          </p>
          <p class="mt-6 text-sm font-medium text-neutral-900">pnpm</p>
          <div class="mt-2">
            <DocExample :code="installPnpmSnippet" lang="bash" />
          </div>
          <p class="mt-6 text-sm font-medium text-neutral-900">npm</p>
          <div class="mt-2">
            <DocExample :code="installNpmSnippet" lang="bash" />
          </div>
          <p class="mt-6 text-sm font-medium text-neutral-900">Yarn</p>
          <div class="mt-2">
            <DocExample :code="installYarnSnippet" lang="bash" />
          </div>

          <h3 class="doc-h2-sub mt-8">Importing</h3>
          <p class="mt-3 text-sm font-medium text-neutral-900">With Vite, Nuxt or webpack</p>
          <div class="mt-2">
            <DocExample :code="importSnippet" lang="ts" />
          </div>
          <p class="mt-6 text-sm font-medium text-neutral-900">Without a bundler</p>
          <div class="mt-2">
            <DocExample :code="importStandaloneSnippet" lang="ts" />
          </div>

          <div class="doc-note mt-6">
            <p class="font-medium text-neutral-900">One component, split in two</p>
            <p class="mt-1">
              A tile reads its geometry from the board it is nested in, so rendering one outside a
              board throws rather than silently laying itself out wrong. Import both, always.
            </p>
          </div>

          <h3 id="nuxt" class="doc-h2-sub mt-8 scroll-mt-20">Nuxt</h3>
          <p class="doc-lead mt-3">
            Register the module instead of importing anything:
            <code class="doc-inline">GridBoard</code>, <code class="doc-inline">GridTile</code> and
            the layout helpers become auto-imports, and the stylesheet is added for you.
          </p>
          <div class="mt-6">
            <DocExample :code="nuxtModuleSnippet" lang="ts" />
          </div>
          <div class="doc-table-wrap mt-4">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Option</th>
                  <th scope="col">Description</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in nuxtOptionRows" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>
                    <code class="doc-inline">{{ row[2] }}</code>
                  </td>
                  <td>
                    <code class="doc-inline">{{ row[3] }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="usage" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Usage</h2>
          <p class="doc-lead mt-2">
            Put <code class="doc-inline">&lt;GridTile&gt;</code> children inside a
            <code class="doc-inline">&lt;GridBoard&gt;</code> and bind
            <code class="doc-inline">v-model:tiles</code>.
          </p>
          <div class="mt-6">
            <DocExample :code="usageSnippet">
              <GridBoard v-model:tiles="usageTiles" :columns="12" :row-height="40" :gap="10">
                <GridTile v-for="tile in usageTiles" :key="tile.id" v-bind="tile">
                  <div class="doc-tile">{{ tile.id }}</div>
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
          <div class="doc-note mt-4">
            <p class="font-medium text-neutral-900">Cells, not pixels</p>
            <p class="mt-1">A tile's <code class="doc-inline">x</code>, <code class="doc-inline">y</code>, <code class="doc-inline">w</code> and <code class="doc-inline">h</code> are grid cells. Only <code class="doc-inline">rowHeight</code> and <code class="doc-inline">gap</code> are measured in pixels; a column is whatever a twelfth of the board comes to.</p>
          </div>
        </section>

        <section id="gestures" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Drag &amp; resize</h2>
          <p class="doc-lead mt-2">
            Use <code class="doc-inline">draggable</code> and
            <code class="doc-inline">resizable</code> to freeze the board or bring the gestures
            back.
          </p>
          <div class="mt-6">
            <label class="doc-check mb-3">
              <input v-model="interactive" type="checkbox" />
              Interactive
            </label>
            <DocExample :code="interactiveSnippet">
              <GridBoard
                v-model:tiles="liveTiles"
                :columns="12"
                :row-height="40"
                :draggable="interactive"
                :resizable="interactive"
              >
                <GridTile v-for="tile in liveTiles" :key="tile.id" v-bind="tile">
                  <div class="doc-tile">{{ tile.id }}</div>
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
        </section>

        <section id="gravity" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Gravity</h2>
          <p class="doc-lead mt-2">
            <code class="doc-inline">gravity</code> pulls every tile up until it rests on the tile
            above it. Defaults to <code class="doc-inline">true</code>.
          </p>
          <div class="mt-6">
            <div class="doc-tabs mb-3" role="tablist" aria-label="Gravity">
              <button
                v-for="tab in gravityTabs"
                :key="tab.value"
                type="button"
                role="tab"
                class="doc-tab"
                :aria-selected="gravityMode === tab.value"
                @click="gravityMode = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
            <DocExample :code="gravitySnippet">
              <GridBoard
                v-model:tiles="gravityTiles"
                :columns="12"
                :row-height="40"
                :gravity="gravityMode === 'on'"
              >
                <GridTile v-for="tile in gravityTiles" :key="tile.id" v-bind="tile">
                  <div class="doc-tile">{{ tile.id }}</div>
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
          <div class="doc-note mt-4">
            <p class="font-medium text-neutral-900">Off is not free positioning</p>
            <p class="mt-1">Tiles keep the row you gave them and gaps survive, but they still cannot overlap.</p>
          </div>
        </section>

        <section id="frozen" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Frozen tiles</h2>
          <p class="doc-lead mt-2">
            A <code class="doc-inline">frozen</code> tile is a wall: it never moves, and the rest of
            the board settles around it.
          </p>
          <div class="mt-6">
            <DocExample :code="frozenSnippet" lang="ts">
              <GridBoard v-model:tiles="frozenTiles" :columns="12" :row-height="40">
                <GridTile v-for="tile in frozenTiles" :key="tile.id" v-bind="tile">
                  <div class="doc-tile" :class="{ 'doc-tile--locked': tile.frozen }">
                    {{ tile.frozen ? 'Frozen' : tile.id }}
                  </div>
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
        </section>

        <section id="slots" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Slots</h2>
          <p class="doc-lead mt-2">
            A tile has two slots: <code class="doc-inline">default</code> for its content, and
            <code class="doc-inline">#handle</code> for the corner grip that starts a resize.
          </p>
          <div class="mt-6">
            <DocExample :code="slotsSnippet" />
          </div>
        </section>

        <section id="overflow" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Overflow</h2>
          <p class="doc-lead mt-2">
            Boards live inside cards, drawers and scroll panes that clip whatever leaves them.
            <code class="doc-inline">overflow</code> lets the tile you are dragging stay visible
            past the edge instead of being sliced at it.
          </p>
          <div class="mt-6">
            <div class="doc-tabs mb-3" role="tablist" aria-label="Overflow">
              <button
                v-for="tab in overflowTabs"
                :key="String(tab.value)"
                type="button"
                role="tab"
                class="doc-tab"
                :aria-selected="escape === tab.value"
                @click="escape = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
            <DocExample :code="overflowSnippet">
              <div class="doc-panel">
                <GridBoard
                  v-model:tiles="overflowTiles"
                  :columns="12"
                  :row-height="40"
                  :overflow="escape"
                >
                  <GridTile v-for="tile in overflowTiles" :key="tile.id" v-bind="tile">
                    <div class="doc-tile">{{ tile.id }}</div>
                  </GridTile>
                </GridBoard>
              </div>
            </DocExample>
          </div>
          <div class="doc-note mt-6">
            <p class="font-medium text-neutral-900">Self-contained, with one exception</p>
            <p class="mt-1">
              You add no CSS: for the length of the gesture the tile pins itself to the viewport and
              takes the top of the stacking order, and it tracks the page as you scroll. The one
              thing it cannot escape is an ancestor with
              <code class="doc-inline">transform</code>, <code class="doc-inline">filter</code>,
              <code class="doc-inline">perspective</code> or
              <code class="doc-inline">contain</code>, because such an element becomes the
              containing block for everything inside it.
            </p>
          </div>
        </section>

        <section id="dynamic" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Add &amp; remove</h2>
          <p class="doc-lead mt-2">
            Replace the array to change the board.
            <code class="doc-inline">getLastRow()</code> gives a new tile somewhere to start.
          </p>
          <div class="doc-note mt-4">
            <p class="font-medium text-neutral-900">Number what you render, never what you track</p>
            <p class="mt-1">
              The number on a tile is its position in the array, not its
              <code class="doc-inline">id</code>. The board looks tiles up by id, Vue keys the DOM
              on it, and a saved layout refers to it — hand a new tile the id of a deleted one and
              all three quietly point at the wrong tile. The counter here only ever climbs.
            </p>
          </div>
          <div class="mt-6">
            <div class="mb-3 flex items-center gap-2">
              <button
                type="button"
                class="doc-btn doc-btn--primary"
                @click="addTile"
              >
                Add tile
              </button>
              <span class="text-sm text-neutral-500">{{ dynamicTiles.length }} on the board</span>
            </div>
            <DocExample :code="dynamicSnippet" lang="ts">
              <GridBoard v-model:tiles="dynamicTiles" :columns="12" :row-height="40">
                <GridTile
                  v-for="(tile, index) in dynamicTiles"
                  :key="tile.id"
                  v-bind="tile"
                  :label="`Tile ${index + 1}`"
                >
                  <div class="doc-tile">
                    {{ index + 1 }}
                    <button
                      type="button"
                      class="doc-btn doc-btn--icon absolute right-2 top-1 text-2xl!"
                      :aria-label="`Remove tile ${index + 1}`"
                      @click="removeTile(tile.id)"
                    >
                      ×
                    </button>
                  </div>
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
          <div class="doc-note mt-6">
            <p class="font-medium text-neutral-900">Replace the array, never mutate it</p>
            <p class="mt-1">
              The board watches <code class="doc-inline">tiles</code> by identity, not deeply. A
              <code class="doc-inline">push</code>, a <code class="doc-inline">splice</code> or an
              assignment to <code class="doc-inline">tiles[0].w</code> renders, but the engine never
              sees it — the tile is not settled, not collision-checked, and not counted in the board
              height.
            </p>
          </div>
          <div class="mt-4">
            <DocExample :code="mutationSnippet" lang="ts" />
          </div>
          <div class="doc-note mt-4">
            <p class="font-medium text-neutral-900">Give a new tile a finite y</p>
            <p class="mt-1"><code class="doc-inline">Infinity</code> passes validation and then hangs the settle loop. Use <code class="doc-inline">getLastRow()</code> for the first free row.</p>
          </div>
        </section>

        <section id="persistence" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Save &amp; restore</h2>
          <p class="doc-lead mt-2">
            <code class="doc-inline">update:tiles</code> fires with a plain array, so persistence is
            a watcher and <code class="doc-inline">JSON.stringify</code>.
          </p>
          <div class="mt-6">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="doc-btn doc-btn--primary"
                @click="save"
              >
                Save
              </button>
              <button
                type="button"
                class="doc-btn doc-btn--secondary"
                @click="restore"
              >
                Restore
              </button>
              <button
                type="button"
                class="doc-btn doc-btn--secondary"
                @click="reset"
              >
                Reset
              </button>
              <span class="text-sm text-neutral-500" role="status" aria-live="polite">
                {{ persistStatus }}
              </span>
            </div>
            <DocExample :code="persistenceSnippet" lang="ts">
              <GridBoard v-model:tiles="persistTiles" :columns="12" :row-height="40">
                <GridTile v-for="tile in persistTiles" :key="tile.id" v-bind="tile">
                  <div class="doc-tile">{{ tile.id }}</div>
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
          <div class="doc-note mt-4">
            <p class="font-medium text-neutral-900">Validate what you read back</p>
            <p class="mt-1">Run <code class="doc-inline">validateTiles()</code> over stored tiles — a layout written by an older build would otherwise throw from inside the engine on first render.</p>
          </div>
        </section>

        <section id="keyboard" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Keyboard</h2>
          <p class="doc-lead mt-2">
            Every unfrozen tile is focusable and fully operable from the keyboard. Nothing to
            configure.
          </p>
          <div class="mt-6">
            <DocExample>
              <GridBoard v-model:tiles="keyboardTiles" :columns="12" :row-height="40">
                <GridTile
                  v-for="tile in keyboardTiles"
                  :key="tile.id"
                  v-bind="tile"
                  :label="tile.title"
                >
                  <div class="doc-tile">{{ tile.title }}</div>
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
          <div class="doc-table-wrap mt-6">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Key</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in keyboardRows" :key="row[0]">
                  <th scope="row">
                    <kbd class="doc-kbd">{{ row[0] }}</kbd>
                  </th>
                  <td>{{ row[1] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ssr" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Server rendering</h2>
          <p class="doc-lead mt-2">
            The server emits the real board — no
            <code class="doc-inline">&lt;ClientOnly&gt;</code>, no hydration mismatch, no flash.
          </p>
        </section>

        <section id="events" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Events</h2>
          <p class="doc-lead mt-2">
            Tiles report their own gestures. Each one is bracketed — a
            <code class="doc-inline">start</code> and an <code class="doc-inline">end</code> once
            apiece, with the continuous event between them every time the tile crosses into a new
            cell. The keyboard raises the same events as the pointer.
          </p>
          <div class="doc-table-wrap mt-6">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tileEvents" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>
                    <code class="doc-inline">{{ row[2] }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="doc-note mt-6">
            <p class="font-medium text-neutral-900">
              <code class="doc-inline">dragend</code> is the drop, not the destination
            </p>
            <p class="mt-1">
              Gravity runs after the drop, so the tile may settle several rows higher than the
              coordinates <code class="doc-inline">dragend</code> reports. Persist from
              <code class="doc-inline">update:tiles</code> instead.
            </p>
          </div>
        </section>

        <section id="types" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Types</h2>
          <p class="doc-lead mt-2">
            The components are plain JavaScript, so import the types to get inference back.
          </p>
          <div class="doc-table-wrap mt-6">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">What it is</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in typeRows" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-6">
            <DocExample :code="typesSnippet" lang="ts" />
          </div>
        </section>

        <section id="custom-fields" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">Custom fields</h2>
          <p class="doc-lead mt-2">
            Put your own data on a tile with <code class="doc-inline">TileWith&lt;T&gt;</code>. The
            engine carries unknown keys through untouched.
          </p>
          <div class="mt-6">
            <DocExample :code="extendSnippet" lang="ts" />
          </div>
        </section>

        <section id="api-board" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">GridBoard</h2>

          <h3 class="doc-h2-sub mt-6">Props</h3>
          <div class="doc-table-wrap mt-3">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in boardProps" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>
                    <code class="doc-inline">{{ row[2] }}</code>
                  </td>
                  <td>
                    <code class="doc-inline">{{ row[3] }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="doc-h2-sub mt-8">Events</h3>
          <div class="doc-table-wrap mt-3">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in boardEvents" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>
                    <code class="doc-inline">{{ row[2] }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="doc-h2-sub mt-8">Slots</h3>
          <div class="doc-table-wrap mt-3">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Props</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in boardSlots" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>{{ row[2] }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="doc-h2-sub mt-8">Exposed</h3>
          <div class="doc-table-wrap mt-3">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in boardExposed" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>
                    <code class="doc-inline">{{ row[2] }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="api-tile" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">GridTile</h2>

          <h3 class="doc-h2-sub mt-6">Props</h3>
          <div class="doc-table-wrap mt-3">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tileProps" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>
                    <code class="doc-inline">{{ row[2] }}</code>
                  </td>
                  <td>
                    <code class="doc-inline">{{ row[3] }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="doc-h2-sub mt-8">Events</h3>
          <div class="doc-table-wrap mt-3">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tileEvents" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>
                    <code class="doc-inline">{{ row[2] }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="doc-h2-sub mt-8">Slots</h3>
          <div class="doc-table-wrap mt-3">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Props</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tileSlots" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>{{ row[2] }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="doc-h2-sub mt-8">Exposed</h3>
          <div class="doc-table-wrap mt-3">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tileExposed" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>
                    <code class="doc-inline">{{ row[2] }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="api-css" class="scroll-mt-20 border-b border-neutral-100 py-12">
          <h2 class="doc-h2">CSS</h2>
          <p class="doc-lead mt-2">
            vue3-grid-board ships structural CSS only — position, size, cursor and the settle transition.
            Every visual decision is yours.
          </p>
          <div class="doc-table-wrap mt-6">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Class</th>
                  <th scope="col">Description</th>
                  <th scope="col">Present</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in cssRows" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td class="text-neutral-500">{{ row[2] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-6">
            <DocExample :code="stylingSnippet" lang="css" />
          </div>
                    <h3 class="doc-h2-sub mt-8">Cursors</h3>
          <p class="mt-2 max-w-[46rem] text-sm leading-relaxed text-neutral-600">
            Set for you, and only where the gesture is available:
            <code class="doc-inline">grab</code> on a tile you can pick up,
            <code class="doc-inline">grabbing</code> while it is held, and
            <code class="doc-inline">se-resize</code> on the grip. With
            <code class="doc-inline">dragHandle</code> the body is not the handle, so style
            your own with <code class="doc-inline">cursor: grab</code>.
          </p>
          <div class="doc-note mt-4">
            <p class="font-medium text-neutral-900">Never transition top, left, width or height</p>
            <p class="mt-1">The board already animates those to settle a tile, and a second transition fights the first. Colour, shadow and opacity are free.</p>
          </div>
        </section>

        <section id="api-methods" class="scroll-mt-20 py-12">
          <h2 class="doc-h2">Methods</h2>
          <p class="doc-lead mt-2">
            The layout engine is pure and importable on its own, with no component involved.
          </p>
          <div class="doc-table-wrap mt-6">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Signature</th>
                  <th scope="col">Description</th>
                  <th scope="col">Returns</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in methodRows" :key="row[0]">
                  <th scope="row">
                    <code class="doc-inline">{{ row[0] }}</code>
                  </th>
                  <td>{{ row[1] }}</td>
                  <td>
                    <code class="doc-inline">{{ row[2] }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-6">
            <DocExample :code="methodsSnippet" lang="ts" />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
