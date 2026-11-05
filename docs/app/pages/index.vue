<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { GridBoard, GridTile, getLastRow, validateTiles } from 'vue3-grid-board'
import {
  a11ySnippet,
  dynamicSnippet,
  extendSnippet,
  frozenSnippet,
  gravitySnippet,
  importSnippet,
  importStandaloneSnippet,
  installNpmSnippet,
  installPnpmSnippet,
  installYarnSnippet,
  gesturesSnippet,
  methodsSnippet,
  motionSnippet,
  mutationSnippet,
  nuxiAddSnippet,
  nuxtModuleSnippet,
  overflowSnippet,
  persistenceSnippet,
  slotsSnippet,
  ssrPageSnippet,
  ssrRouteSnippet,
  typesSnippet,
  usageSnippet
} from '~/docs/snippets'

const logo = asset('/vue3-grid-board-logo.svg')
const logoDark = asset('/vue3-grid-board-logo-dark.svg')

const THEME_KEY = 'vue3-grid-board-theme'
const dark = ref(false)
let colorScheme = null

function storedTheme() {
  try {
    return localStorage.getItem(THEME_KEY)
  } catch {
    return null
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  dark.value = theme === 'dark'
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
    return true
  } catch {
    return false
  }
}

function toggleTheme() {
  const theme = dark.value ? 'light' : 'dark'
  applyTheme(theme)
  saveTheme(theme)
}

function followSystemTheme(e) {
  if (storedTheme()) return
  applyTheme(e.matches ? 'dark' : 'light')
}

const usageTiles = ref([
  { id: 'a', x: 0, y: 0, w: 6, h: 4 },
  { id: 'b', x: 6, y: 0, w: 3, h: 2 },
  { id: 'c', x: 9, y: 0, w: 3, h: 2 },
  { id: 'd', x: 6, y: 2, w: 6, h: 2 },
  { id: 'e', x: 0, y: 4, w: 4, h: 2 },
  { id: 'f', x: 4, y: 4, w: 4, h: 2 },
  { id: 'g', x: 8, y: 4, w: 4, h: 2 }
])

const draggable = ref(true)
const resizable = ref(true)
const gestureTiles = ref([
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
const gravity = ref(false)
const gravityTabs = [
  { value: false, label: 'Gravity off' },
  { value: true, label: 'Gravity on' }
]

const frozenTiles = ref([
  { id: 'nav', x: 0, y: 0, w: 3, h: 6, frozen: true },
  { id: 'a', x: 3, y: 0, w: 5, h: 3 },
  { id: 'b', x: 8, y: 0, w: 4, h: 3 },
  { id: 'c', x: 3, y: 3, w: 4, h: 3 },
  { id: 'd', x: 7, y: 3, w: 5, h: 3 }
])

const overflow = ref(true)
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
function add() {
  dynamicTiles.value = [
    ...dynamicTiles.value,
    { id: String(seq++), x: 0, y: getLastRow(dynamicTiles.value), w: 4, h: 2 }
  ]
}
function remove(id) {
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
  { id: 'one', x: 0, y: 0, w: 6, h: 4, label: 'Revenue' },
  { id: 'two', x: 6, y: 0, w: 6, h: 2, label: 'Signups' },
  { id: 'three', x: 6, y: 2, w: 3, h: 2, label: 'Churn' },
  { id: 'four', x: 9, y: 2, w: 3, h: 2, label: 'Sessions' }
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
  ],
  [
    'tapToMove',
    'Move and resize tiles with taps instead of a drag. Needed for WCAG 2.2 AA (2.5.7).',
    'boolean',
    'false'
  ],
  [
    'a11y',
    'The text the board gives screen readers: role description, tile labels, instructions and announcements. Keys left out stay English.',
    'Partial<GridA11y>',
    'null'
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

const motionRows = [
  ['--grid-tile-duration', 'A tile moving or resizing into place.', '220ms'],
  ['--grid-tile-easing', 'The same, its curve.', 'cubic-bezier(0.2, 0, 0, 1)'],
  ['--grid-shadow-duration', 'The placeholder showing where a dragged tile lands.', '200ms'],
  ['--grid-shadow-easing', 'The same, its curve.', 'ease'],
  ['--grid-board-grow-duration', 'The board growing to fit its tiles.', '150ms'],
  ['--grid-board-shrink-duration', 'The board shrinking.', '200ms'],
  ['--grid-board-easing', 'Both, their curve.', 'ease']
]

const nuxtOptionRows = [
  ['prefix', "Put in front of the component names: 'Ui' gives <UiGridBoard>.", 'string', "''"],
  [
    'autoImports',
    'Auto-import the layout helpers too. Off by default, because their names are generic.',
    'boolean',
    'false'
  ]
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
  ['GridA11y', 'The text behind the a11y prop, and GridTileDescription for tileLabel.'],
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

const a11yRows = [
  ['Keyboard', '2.1.1', 'Every unfrozen tile is a tab stop, and every gesture has a key.'],
  ['No keyboard trap', '2.1.2', 'Tabbing away from a picked-up tile drops it where it is.'],
  [
    'Name and role',
    '4.1.2',
    'Each tile is a group described as "Draggable tile" and named by its position and size: "Revenue, column 1, row 1, 6 wide, 4 tall". Set the name with label.'
  ],
  ['Instructions', '3.3.2', 'A visually hidden paragraph, linked with aria-describedby, explains the keys.'],
  ['Status messages', '4.1.3', 'A polite live region announces the pick-up, every move, the drop and a cancel.'],
  [
    'Reading and focus order',
    '1.3.2, 2.4.3',
    'Tiles sit in the DOM by row, then column, so Tab and screen readers follow the layout. A tile keeps focus when a move reorders it, and when a tile is removed, focus moves to the next one.'
  ],
  ['Focus visible', '2.4.7', "A 2px outline in the tile's text colour, dashed while the tile is picked up."],
  [
    'Non-text contrast',
    '1.4.11',
    "The grip and the focus outline are drawn in the tile's text colour, so they are as visible as your text."
  ],
  ['Target size', '2.5.8', 'The resize grip is at least 24 by 24 pixels.'],
  [
    'Language',
    '3.1.2',
    "The board's own text is marked as English, or given in the page's language through a11y."
  ],
  ['Animation', '2.3.3', 'Every animation turns off with the transition variables.']
]

const a11yGaps = [
  [
    'Dragging movements',
    '2.5.7',
    'Turn on tapToMove, or offer another way to move and resize a tile with single clicks.'
  ],
  [
    'Text contrast',
    '1.4.3',
    "Your tile's text against its background. The grip and the focus outline follow the text colour."
  ],
  ['Language', '3.1.2', 'On a page that is not in English, pass a11y in its language.']
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
      { id: 'accessibility', label: 'Accessibility' },
      { id: 'ssr', label: 'SSR' },
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
  dark.value = document.documentElement.dataset.theme === 'dark'
  colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
  colorScheme.addEventListener('change', followSystemTheme)

  window.addEventListener('scroll', readActiveSection, { passive: true })
  window.addEventListener('resize', measureSections, { passive: true })

  const main = document.querySelector('main')
  if (main && typeof ResizeObserver !== 'undefined') {
    spyResizeObserver = new ResizeObserver(measureSections)
    spyResizeObserver.observe(main)
  } else {
    measureSections()
  }
})

onBeforeUnmount(() => {
  colorScheme?.removeEventListener('change', followSystemTheme)
  window.removeEventListener('scroll', readActiveSection)
  window.removeEventListener('resize', measureSections)
  spyResizeObserver?.disconnect()
})
</script>

<template>
  <div class="doc-root">
    <div class="doc-layout">
      <aside class="doc-sidebar">
        <a
          href="#top"
          class="doc-sidebar__brand"
        >
          <img
            :src="logo"
            alt=""
            width="24"
            height="24"
            class="doc-sidebar__logo doc-sidebar__logo--light"
          />
          <img
            :src="logoDark"
            alt=""
            width="24"
            height="24"
            class="doc-sidebar__logo doc-sidebar__logo--dark"
          />
          <span class="doc-sidebar__name">vue3-grid-board</span>
        </a>
        <nav aria-label="Documentation">
          <div v-for="group in nav" :key="group.title" class="doc-nav__group">
            <p class="doc-nav__title">
              {{ group.title }}
            </p>
            <ul>
              <li v-for="item in group.items" :key="item.id" class="doc-nav__item">
                <a
                  :href="`#${item.id}`"
                  class="doc-nav__link"
                  :class="{ 'doc-nav__link--active': activeSection === item.id }"
                  :aria-current="activeSection === item.id ? 'true' : undefined"
                >
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <div class="doc-theme">
          <button
            type="button"
            role="switch"
            class="doc-switch"
            :aria-checked="dark ? 'true' : 'false'"
            @click="toggleTheme"
          >
            <span class="doc-switch__track" aria-hidden="true">
              <span class="doc-switch__thumb" />
            </span>
            Dark mode
          </button>
        </div>
      </aside>

      <main id="top" class="doc-main">
        <h1 class="doc-sr">vue3-grid-board</h1>

        <section id="installation" class="doc-section">
          <h2 class="doc-h2">Installation</h2>
          <p class="doc-lead">
            vue3-grid-board installs from npm. Vue 3.5 is the only peer dependency, and there is
            no runtime dependency beyond it.
          </p>
          <p class="doc-label">pnpm</p>
          <div class="doc-demo">
            <DocExample :code="installPnpmSnippet" lang="bash" />
          </div>
          <p class="doc-label">npm</p>
          <div class="doc-demo">
            <DocExample :code="installNpmSnippet" lang="bash" />
          </div>
          <p class="doc-label">Yarn</p>
          <div class="doc-demo">
            <DocExample :code="installYarnSnippet" lang="bash" />
          </div>

          <h3 class="doc-h2-sub">Importing</h3>
          <p class="doc-label">With Vite, Nuxt or webpack</p>
          <div class="doc-demo">
            <DocExample :code="importSnippet" lang="ts" />
          </div>
          <p class="doc-label">Without a bundler</p>
          <div class="doc-demo">
            <DocExample :code="importStandaloneSnippet" lang="ts" />
          </div>

          <div class="doc-heading-row">
            <h3 id="nuxt" class="doc-h2-sub">Nuxt</h3>
            <a
              class="doc-chip"
              href="https://stackblitz.com/github/attilakosztindev/vue3-grid-board/tree/main/examples/nuxt"
              target="_blank"
              rel="noopener"
            >
              Try it on StackBlitz
              <span class="doc-sr">(opens in a new tab)</span>
            </a>
          </div>
          <p class="doc-lead">
            Register the module instead of importing anything:
            <code class="doc-inline">GridBoard</code> and <code class="doc-inline">GridTile</code>
            become auto-imports, and the stylesheet is added for you.
          </p>
          <div class="doc-demo">
            <DocExample :code="nuxiAddSnippet" lang="bash" />
          </div>
          <p class="doc-label">That adds it to your config, or add it yourself</p>
          <div class="doc-demo">
            <DocExample :code="nuxtModuleSnippet" lang="ts" />
          </div>
          <div class="doc-table-wrap doc-table-wrap--compact" tabindex="0" role="region" aria-label="Nuxt module options">
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

        <section id="usage" class="doc-section">
          <h2 class="doc-h2">Usage</h2>
          <p class="doc-lead">
            Put <code class="doc-inline">&lt;GridTile&gt;</code> children inside a
            <code class="doc-inline">&lt;GridBoard&gt;</code> and bind
            <code class="doc-inline">v-model:tiles</code>. A tile is an empty container: what you
            put inside it is its content.
          </p>
          <div class="doc-demo">
            <DocExample :code="usageSnippet">
              <GridBoard v-model:tiles="usageTiles" :columns="12" :row-height="40" :gap="10">
                <GridTile v-for="tile in usageTiles" :key="tile.id" v-bind="tile">
                  <div class="doc-tile" />
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
          <div class="doc-note doc-note--compact">
            <p class="doc-note__title">Cells, not pixels</p>
            <p class="doc-note__body">A tile's <code class="doc-inline">x</code>, <code class="doc-inline">y</code>, <code class="doc-inline">w</code> and <code class="doc-inline">h</code> are grid cells. Only <code class="doc-inline">rowHeight</code> and <code class="doc-inline">gap</code> are measured in pixels; a column is whatever a twelfth of the board comes to.</p>
          </div>
        </section>

        <section id="gestures" class="doc-section">
          <h2 class="doc-h2">Drag &amp; resize</h2>
          <p class="doc-lead">
            Use <code class="doc-inline">draggable</code> and
            <code class="doc-inline">resizable</code> to freeze the board or bring the gestures
            back.
          </p>
          <div class="doc-demo">
            <div class="doc-controls">
              <label class="doc-check">
                <input v-model="draggable" type="checkbox" />
                Draggable
              </label>
              <label class="doc-check">
                <input v-model="resizable" type="checkbox" />
                Resizable
              </label>
            </div>
            <DocExample :code="gesturesSnippet">
              <GridBoard
                v-model:tiles="gestureTiles"
                :columns="12"
                :row-height="40"
                :draggable="draggable"
                :resizable="resizable"
              >
                <GridTile v-for="tile in gestureTiles" :key="tile.id" v-bind="tile">
                  <div class="doc-tile" />
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
        </section>

        <section id="gravity" class="doc-section">
          <h2 class="doc-h2">Gravity</h2>
          <p class="doc-lead">
            <code class="doc-inline">gravity</code> pulls every tile up until it rests on the tile
            above it. Defaults to <code class="doc-inline">true</code>.
          </p>
          <div class="doc-demo">
            <div class="doc-tabs" role="tablist" aria-label="Gravity">
              <button
                v-for="tab in gravityTabs"
                :key="String(tab.value)"
                type="button"
                role="tab"
                class="doc-tab"
                :aria-selected="gravity === tab.value"
                @click="gravity = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
            <DocExample :code="gravitySnippet">
              <GridBoard
                v-model:tiles="gravityTiles"
                :columns="12"
                :row-height="40"
                :gravity="gravity"
              >
                <GridTile v-for="tile in gravityTiles" :key="tile.id" v-bind="tile">
                  <div class="doc-tile" />
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
          <div class="doc-note doc-note--compact">
            <p class="doc-note__title">Off is not free positioning</p>
            <p class="doc-note__body">Tiles keep the row you gave them and gaps survive, but they still cannot overlap.</p>
          </div>
        </section>

        <section id="frozen" class="doc-section">
          <h2 class="doc-h2">Frozen tiles</h2>
          <p class="doc-lead">
            A <code class="doc-inline">frozen</code> tile is a wall: it never moves, and the rest of
            the board settles around it.
          </p>
          <div class="doc-demo">
            <DocExample :code="frozenSnippet">
              <GridBoard v-model:tiles="frozenTiles" :columns="12" :row-height="40">
                <GridTile v-for="tile in frozenTiles" :key="tile.id" v-bind="tile">
                  <div class="doc-tile" :class="{ 'doc-tile--locked': tile.frozen }">
                    <span v-if="tile.frozen">Frozen</span>
                  </div>
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
        </section>

        <section id="slots" class="doc-section">
          <h2 class="doc-h2">Slots</h2>
          <p class="doc-lead">
            A tile has two slots: <code class="doc-inline">default</code> for its content, and
            <code class="doc-inline">#handle</code> for the corner grip that starts a resize.
          </p>
          <div class="doc-demo">
            <DocExample :code="slotsSnippet" />
          </div>
        </section>

        <section id="overflow" class="doc-section">
          <h2 class="doc-h2">Overflow</h2>
          <p class="doc-lead">
            Boards live inside cards, drawers and scroll panes that clip whatever leaves them.
            <code class="doc-inline">overflow</code> lets the tile you are dragging stay visible
            past the edge instead of being sliced at it.
          </p>
          <div class="doc-demo">
            <div class="doc-tabs" role="tablist" aria-label="Overflow">
              <button
                v-for="tab in overflowTabs"
                :key="String(tab.value)"
                type="button"
                role="tab"
                class="doc-tab"
                :aria-selected="overflow === tab.value"
                @click="overflow = tab.value"
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
                  :overflow="overflow"
                >
                  <GridTile v-for="tile in overflowTiles" :key="tile.id" v-bind="tile">
                    <div class="doc-tile" />
                  </GridTile>
                </GridBoard>
              </div>
            </DocExample>
          </div>
          <div class="doc-note">
            <p class="doc-note__title">Self-contained, with one exception</p>
            <p class="doc-note__body">
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

        <section id="dynamic" class="doc-section">
          <h2 class="doc-h2">Add &amp; remove</h2>
          <p class="doc-lead">
            Replace the array to change the board.
            <code class="doc-inline">getLastRow()</code> gives a new tile somewhere to start. When
            the focused tile is removed, focus moves to the next tile, or the one before it.
          </p>
          <div class="doc-note doc-note--compact">
            <p class="doc-note__title">Number what you render, never what you track</p>
            <p class="doc-note__body">
              The number on a tile is its position in the array, not its
              <code class="doc-inline">id</code>. The board looks tiles up by id, Vue keys the DOM
              on it, and a saved layout refers to it — hand a new tile the id of a deleted one and
              all three quietly point at the wrong tile. The counter here only ever climbs.
            </p>
          </div>
          <div class="doc-demo">
            <div class="doc-controls">
              <button
                type="button"
                class="doc-btn doc-btn--primary"
                @click="add"
              >
                Add tile
              </button>
              <span class="doc-controls__status">{{ dynamicTiles.length }} on the board</span>
            </div>
            <DocExample :code="dynamicSnippet">
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
                      class="doc-btn doc-btn--icon doc-tile__remove"
                      :aria-label="`Remove tile ${index + 1}`"
                      @click="remove(tile.id)"
                    >
                      ×
                    </button>
                  </div>
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
          <div class="doc-note">
            <p class="doc-note__title">Replace the array, never mutate it</p>
            <p class="doc-note__body">
              The board watches <code class="doc-inline">tiles</code> by identity, not deeply. A
              <code class="doc-inline">push</code>, a <code class="doc-inline">splice</code> or an
              assignment to <code class="doc-inline">tiles[0].w</code> renders, but the engine never
              sees it — the tile is not settled, not collision-checked, and not counted in the board
              height.
            </p>
          </div>
          <div class="doc-demo doc-demo--compact">
            <DocExample :code="mutationSnippet" />
          </div>
          <div class="doc-note doc-note--compact">
            <p class="doc-note__title">Give a new tile a finite y</p>
            <p class="doc-note__body"><code class="doc-inline">Infinity</code> passes validation and then hangs the settle loop. Use <code class="doc-inline">getLastRow()</code> for the first free row.</p>
          </div>
        </section>

        <section id="persistence" class="doc-section">
          <h2 class="doc-h2">Save &amp; restore</h2>
          <p class="doc-lead">
            <code class="doc-inline">update:tiles</code> fires with a plain array, so persistence is
            a watcher and <code class="doc-inline">JSON.stringify</code>.
          </p>
          <div class="doc-demo">
            <div class="doc-controls">
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
              <span class="doc-controls__status" role="status" aria-live="polite">
                {{ persistStatus }}
              </span>
            </div>
            <DocExample :code="persistenceSnippet">
              <GridBoard v-model:tiles="persistTiles" :columns="12" :row-height="40">
                <GridTile v-for="tile in persistTiles" :key="tile.id" v-bind="tile">
                  <div class="doc-tile" />
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
          <div class="doc-note doc-note--compact">
            <p class="doc-note__title">Validate what you read back</p>
            <p class="doc-note__body">Run <code class="doc-inline">validateTiles()</code> over stored tiles — a layout written by an older build would otherwise throw from inside the engine on first render.</p>
          </div>
        </section>

        <section id="accessibility" class="doc-section">
          <h2 class="doc-h2">Accessibility</h2>
          <p class="doc-lead">
            Every gesture works from the keyboard, with nothing to configure. Turn on
            <code class="doc-inline">tapToMove</code> and every gesture works without dragging too,
            and the board meets the WCAG 2.2 AA criteria that concern a widget like it.
          </p>

          <h3 id="keyboard" class="doc-h2-sub">Keyboard</h3>
          <p class="doc-text">
            Every unfrozen tile is a tab stop. Pick it up, move or resize it, and drop it again.
          </p>
          <div class="doc-demo">
            <DocExample>
              <GridBoard
                v-model:tiles="keyboardTiles"
                :columns="12"
                :row-height="40"
                tap-to-move
              >
                <GridTile
                  v-for="tile in keyboardTiles"
                  :key="tile.id"
                  v-bind="tile"
                >
                  <div class="doc-tile">{{ tile.label }}</div>
                </GridTile>
              </GridBoard>
            </DocExample>
          </div>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="Keyboard commands">
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

          <h3 class="doc-h2-sub">Without dragging</h3>
          <p class="doc-text">
            With <code class="doc-inline">tap-to-move</code> on the board, tap a tile, then tap where
            it should go. Tap its grip, then tap where its corner should go. Tap it again to put it
            down. The board above has it turned on.
          </p>

          <h3 class="doc-h2-sub">WCAG 2.2</h3>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="What the board does">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Criterion</th>
                  <th scope="col">WCAG</th>
                  <th scope="col">How</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in a11yRows" :key="row[0]">
                  <th scope="row">{{ row[0] }}</th>
                  <td>{{ row[1] }}</td>
                  <td>{{ row[2] }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="doc-h2-sub">Up to you</h3>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="What is up to you">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Criterion</th>
                  <th scope="col">WCAG</th>
                  <th scope="col">What to do</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in a11yGaps" :key="row[0]">
                  <th scope="row">{{ row[0] }}</th>
                  <td>{{ row[1] }}</td>
                  <td>{{ row[2] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 class="doc-h2-sub">Screen-reader text</h3>
          <p class="doc-text">
            Everything the board reads out comes from the
            <code class="doc-inline">a11y</code> prop: the role description, the tile labels, the
            instructions and the announcements. Keys you leave out keep their English default. Here
            the wording changes; on a page in another language, give the same keys in that
            language.
          </p>
          <div class="doc-demo">
            <DocExample :code="a11ySnippet" />
          </div>
        </section>

        <section id="ssr" class="doc-section">
          <h2 class="doc-h2">SSR</h2>
          <p class="doc-lead">
            The board is SSR friendly: it renders in its final layout on the server, with no
            <code class="doc-inline">&lt;ClientOnly&gt;</code>. The following example is
            demonstrated with Nuxt.
          </p>
          <p class="doc-label">pages/dashboard.vue</p>
          <div class="doc-demo">
            <DocExample :code="ssrPageSnippet" />
          </div>
          <p class="doc-label">server/api/grid.get.ts</p>
          <div class="doc-demo">
            <DocExample :code="ssrRouteSnippet" lang="ts" />
          </div>
        </section>

        <section id="events" class="doc-section">
          <h2 class="doc-h2">Events</h2>
          <p class="doc-lead">
            Tiles report their own gestures. Each one is bracketed — a
            <code class="doc-inline">start</code> and an <code class="doc-inline">end</code> once
            apiece, with the continuous event between them every time the tile crosses into a new
            cell. The keyboard raises the same events as the pointer.
          </p>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="Tile events">
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
          <div class="doc-note">
            <p class="doc-note__title">
              <code class="doc-inline">dragend</code> is the drop, not the destination
            </p>
            <p class="doc-note__body">
              Gravity runs after the drop, so the tile may settle several rows higher than the
              coordinates <code class="doc-inline">dragend</code> reports. Persist from
              <code class="doc-inline">update:tiles</code> instead.
            </p>
          </div>
        </section>

        <section id="types" class="doc-section">
          <h2 class="doc-h2">Types</h2>
          <p class="doc-lead">
            The components are plain JavaScript, so import the types to get inference back.
          </p>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="Types">
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
          <div class="doc-demo">
            <DocExample :code="typesSnippet" />
          </div>
        </section>

        <section id="custom-fields" class="doc-section">
          <h2 class="doc-h2">Custom fields</h2>
          <p class="doc-lead">
            Put your own data on a tile with <code class="doc-inline">TileWith&lt;T&gt;</code>. The
            engine carries unknown keys through untouched, and
            <code class="doc-inline">v-model:tiles</code> keeps your type.
          </p>
          <div class="doc-demo">
            <DocExample :code="extendSnippet" />
          </div>
        </section>

        <section id="api-board" class="doc-section">
          <h2 class="doc-h2">GridBoard</h2>

          <h3 class="doc-h2-sub">Props</h3>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="GridBoard props">
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

          <h3 class="doc-h2-sub">Events</h3>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="GridBoard events">
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

          <h3 class="doc-h2-sub">Slots</h3>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="GridBoard slots">
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

          <h3 class="doc-h2-sub">Exposed</h3>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="GridBoard exposed">
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

        <section id="api-tile" class="doc-section">
          <h2 class="doc-h2">GridTile</h2>

          <h3 class="doc-h2-sub">Props</h3>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="GridTile props">
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

          <h3 class="doc-h2-sub">Events</h3>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="GridTile events">
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

          <h3 class="doc-h2-sub">Slots</h3>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="GridTile slots">
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

          <h3 class="doc-h2-sub">Exposed</h3>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="GridTile exposed">
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

        <section id="api-css" class="doc-section">
          <h2 class="doc-h2">CSS</h2>
          <p class="doc-lead">
            vue3-grid-board ships structural CSS only — position, size, cursor and the settle transition.
            Every visual decision is yours.
          </p>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="CSS classes">
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
                  <td>{{ row[2] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 class="doc-h2-sub">Cursors</h3>
          <p class="doc-text">
            Set for you, and only where the gesture is available:
            <code class="doc-inline">grab</code> on a tile you can pick up,
            <code class="doc-inline">grabbing</code> while it is held, and
            <code class="doc-inline">se-resize</code> on the grip. With
            <code class="doc-inline">dragHandle</code> the body is not the handle, so style
            your own with <code class="doc-inline">cursor: grab</code>.
          </p>
          <h3 class="doc-h2-sub">Transitions</h3>
          <p class="doc-text">
            Tiles, the placeholder and the board height animate. Each takes its timing from a CSS
            custom property, set on the board or any element above it. A duration of
            <code class="doc-inline">0ms</code> turns that animation off.
          </p>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="Transition variables">
            <table class="doc-table">
              <thead>
                <tr>
                  <th scope="col">Variable</th>
                  <th scope="col">Times</th>
                  <th scope="col">Default</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in motionRows" :key="row[0]">
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
          <div class="doc-demo">
            <DocExample :code="motionSnippet" lang="css" />
          </div>
          <div class="doc-note">
            <p class="doc-note__title">Never transition top, left, width or height</p>
            <p class="doc-note__body">The board already animates those, and a second transition fights the first. Change their timing with the variables above. Colour, shadow and opacity are free.</p>
          </div>
        </section>

        <section id="api-methods" class="doc-section">
          <h2 class="doc-h2">Methods</h2>
          <p class="doc-lead">
            The layout engine is pure and importable on its own, with no component involved.
          </p>
          <div class="doc-table-wrap" tabindex="0" role="region" aria-label="Methods">
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
          <div class="doc-demo">
            <DocExample :code="methodsSnippet" />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
