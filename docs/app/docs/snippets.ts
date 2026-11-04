export const usageSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { Tile } from 'vue3-grid-board'

const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 0, w: 6, h: 4 },
  { id: 'b', x: 6, y: 0, w: 3, h: 2 },
  { id: 'c', x: 9, y: 0, w: 3, h: 2 },
  { id: 'd', x: 6, y: 2, w: 6, h: 2 },
  { id: 'e', x: 0, y: 4, w: 4, h: 2 },
  { id: 'f', x: 4, y: 4, w: 4, h: 2 },
  { id: 'g', x: 8, y: 4, w: 4, h: 2 }
])
</script>

<template>
  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40" :gap="10">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
    >
      {{ tile.id }}
    </GridTile>
  </GridBoard>
</template>`

export const interactiveSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { Tile } from 'vue3-grid-board'

const interactive = ref(true)
const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 0, w: 4, h: 4 },
  { id: 'b', x: 4, y: 0, w: 8, h: 2 },
  { id: 'c', x: 4, y: 2, w: 4, h: 2 },
  { id: 'd', x: 8, y: 2, w: 4, h: 2 },
  { id: 'e', x: 0, y: 4, w: 6, h: 2 },
  { id: 'f', x: 6, y: 4, w: 6, h: 2 }
])
</script>

<template>
  <label>
    <input v-model="interactive" type="checkbox">
    Interactive
  </label>

  <GridBoard
    v-model:tiles="tiles"
    :columns="12"
    :row-height="40"
    :draggable="interactive"
    :resizable="interactive"
  >
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
    />
  </GridBoard>
</template>`

export const gravitySnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { Tile } from 'vue3-grid-board'

const gravity = ref(false)
const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 1, w: 5, h: 3 },
  { id: 'b', x: 5, y: 0, w: 7, h: 2 },
  { id: 'c', x: 5, y: 4, w: 4, h: 3 },
  { id: 'd', x: 9, y: 3, w: 3, h: 3 },
  { id: 'e', x: 0, y: 6, w: 5, h: 2 }
])
</script>

<template>
  <label>
    <input v-model="gravity" type="checkbox">
    Gravity
  </label>

  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40" :gravity="gravity">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
    />
  </GridBoard>
</template>`

export const frozenSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { Tile } from 'vue3-grid-board'

const tiles = ref<Tile[]>([
  { id: 'nav', x: 0, y: 0, w: 3, h: 6, frozen: true },
  { id: 'a', x: 3, y: 0, w: 5, h: 3 },
  { id: 'b', x: 8, y: 0, w: 4, h: 3 },
  { id: 'c', x: 3, y: 3, w: 4, h: 3 },
  { id: 'd', x: 7, y: 3, w: 5, h: 3 }
])
</script>

<template>
  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
      :frozen="tile.frozen"
    >
      {{ tile.frozen ? 'Frozen' : tile.id }}
    </GridTile>
  </GridBoard>
</template>`

export const slotsSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { TileWith } from 'vue3-grid-board'

const tiles = ref<TileWith<{ title: string; note: string }>[]>([
  { id: 'a', x: 0, y: 0, w: 4, h: 3, title: 'Notes', note: '' }
])
</script>

<template>
  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
      drag-handle="card-header"
    >
      <header class="card-header">{{ tile.title }}</header>
      <input v-model="tile.note">

      <template #handle>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path
            d="M3 13 L13 3 M13 3 H8 M13 3 V8"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </template>
    </GridTile>
  </GridBoard>
</template>

<style>
.grid-tile > .grid-handle {
  color: #047857;
}
</style>`

export const overflowSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { Tile } from 'vue3-grid-board'

const escape = ref(true)
const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 0, w: 6, h: 3 },
  { id: 'b', x: 6, y: 0, w: 6, h: 3 },
  { id: 'c', x: 0, y: 3, w: 4, h: 3 },
  { id: 'd', x: 4, y: 3, w: 8, h: 3 }
])
</script>

<template>
  <label>
    <input v-model="escape" type="checkbox">
    Overflow
  </label>

  <div class="panel">
    <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40" :overflow="escape">
      <GridTile
        v-for="tile in tiles"
        :key="tile.id"
        :id="tile.id"
        :x="tile.x"
        :y="tile.y"
        :w="tile.w"
        :h="tile.h"
      />
    </GridBoard>
  </div>
</template>

<style>
.panel {
  max-width: 34rem;
  overflow: hidden;
}
</style>`

export const dynamicSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile, getLastRow } from 'vue3-grid-board'
import type { Tile } from 'vue3-grid-board'

const tiles = ref<Tile[]>([
  { id: '1', x: 0, y: 0, w: 6, h: 3 },
  { id: '2', x: 6, y: 0, w: 3, h: 3 },
  { id: '3', x: 9, y: 0, w: 3, h: 3 },
  { id: '4', x: 0, y: 3, w: 4, h: 2 },
  { id: '5', x: 4, y: 3, w: 8, h: 2 }
])

let seq = 6

function add() {
  const tile = { id: String(seq++), x: 0, y: getLastRow(tiles.value), w: 4, h: 2 }
  tiles.value = [...tiles.value, tile]
}

function remove(id: Tile['id']) {
  tiles.value = tiles.value.filter((t) => t.id !== id)
}
</script>

<template>
  <button type="button" @click="add">Add tile</button>
  <span>{{ tiles.length }} on the board</span>

  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40">
    <GridTile
      v-for="(tile, index) in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
      :label="\`Tile \${index + 1}\`"
    >
      {{ index + 1 }}
      <button type="button" :aria-label="\`Remove tile \${index + 1}\`" @click="remove(tile.id)">
        ×
      </button>
    </GridTile>
  </GridBoard>
</template>`

export const mutationSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { Tile } from 'vue3-grid-board'

const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 0, w: 4, h: 2 },
  { id: 'c', x: 4, y: 0, w: 4, h: 2 }
])

function add() {
  const tile: Tile = { id: 'd', x: 0, y: 2, w: 4, h: 2 }
  tiles.value = [...tiles.value, tile]
}

function widen() {
  tiles.value = tiles.value.map((t) => (t.id === 'a' ? { ...t, w: 6 } : t))
}

function remove() {
  tiles.value = tiles.value.filter((t) => t.id !== 'c')
}
</script>

<template>
  <button type="button" @click="add">Add d</button>
  <button type="button" @click="widen">Widen a</button>
  <button type="button" @click="remove">Remove c</button>

  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
    />
  </GridBoard>
</template>`

export const persistenceSnippet = `<script setup lang="ts">
import { ref, watch } from 'vue'
import { GridBoard, GridTile, validateTiles } from 'vue3-grid-board'
import type { Tile } from 'vue3-grid-board'

const KEY = 'dashboard'

const defaults: Tile[] = [
  { id: 'a', x: 0, y: 0, w: 8, h: 3 },
  { id: 'b', x: 8, y: 0, w: 4, h: 3 },
  { id: 'c', x: 0, y: 3, w: 4, h: 2 },
  { id: 'd', x: 4, y: 3, w: 4, h: 2 },
  { id: 'e', x: 8, y: 3, w: 4, h: 2 }
]

function restore(fallback: Tile[]): Tile[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    validateTiles(parsed, 'stored tiles')
    return parsed as Tile[]
  } catch {
    return fallback
  }
}

const tiles = ref<Tile[]>(restore(defaults))

watch(tiles, (next) => localStorage.setItem(KEY, JSON.stringify(next)))
</script>

<template>
  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
    />
  </GridBoard>
</template>`

export const ssrPageSnippet = `<script setup lang="ts">
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { Tile } from 'vue3-grid-board'

const { data: tiles } = await useFetch<Tile[]>('/api/grid', { default: () => [] })
</script>

<template>
  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
    >
      {{ tile.id }}
    </GridTile>
  </GridBoard>
</template>`

export const ssrRouteSnippet = `import type { Tile } from 'vue3-grid-board'

export default defineEventHandler((): Tile[] => [
  { id: 'revenue', x: 0, y: 0, w: 8, h: 3 },
  { id: 'signups', x: 8, y: 0, w: 4, h: 3 },
  { id: 'churn', x: 0, y: 3, w: 12, h: 2 }
])`

export const typesSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { GridBoardExposed, Tile } from 'vue3-grid-board'

const tiles = ref<Tile[]>([{ id: 'a', x: 0, y: 0, w: 2, h: 2 }])

const board = ref<GridBoardExposed | null>(null)

function nudge() {
  board.value?.dispatch('dragEvent', ['dragmove', 'a', 3, 1, 2, 2])
}

function measure() {
  board.value?.dispatch('measure')
}
</script>

<template>
  <button type="button" @click="nudge">Move a</button>
  <button type="button" @click="measure">Measure</button>

  <GridBoard ref="board" v-model:tiles="tiles" :columns="12" :row-height="40">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
    />
  </GridBoard>
</template>`

export const extendSnippet = `<script setup lang="ts">
import { computed, ref } from 'vue'
import { GridBoard, GridTile, getTileById } from 'vue3-grid-board'
import type { TileWith } from 'vue3-grid-board'

type Panel = TileWith<{
  title: string
  kind: 'chart' | 'table' | 'notes'
}>

const tiles = ref<Panel[]>([
  { id: 'a', x: 0, y: 0, w: 4, h: 3, title: 'Revenue', kind: 'chart' }
])

const firstTitle = computed(() => getTileById(tiles.value, 'a')?.title)
</script>

<template>
  <h2>{{ firstTitle }}</h2>

  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
    >
      {{ tile.title }} ({{ tile.kind }})
    </GridTile>
  </GridBoard>
</template>`

export const methodsSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import {
  GridBoard,
  GridTile,
  applyGravity,
  copyTiles,
  getTileById,
  moveTile
} from 'vue3-grid-board'
import type { Tile } from 'vue3-grid-board'

const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 0, w: 4, h: 2 },
  { id: 'b', x: 4, y: 0, w: 4, h: 2 }
])

function moveA() {
  const next = copyTiles(tiles.value)
  const tile = getTileById(next, 'a')!

  moveTile(next, tile, 3, 1, true, false)
  applyGravity(next, true, 'a')

  tiles.value = next
}
</script>

<template>
  <button type="button" @click="moveA">Move a</button>

  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
    />
  </GridBoard>
</template>`

export const stylingSnippet = `.grid-tile {
  background: #f8fafc;
  border-radius: inherit;
}

.grid-tile--resizing {
  opacity: 0.9;
}

.grid-tile--grabbed {
  outline: 2px solid #10b981;
}

.grid-shadow {
  background: #10b981;
  opacity: 0.2;
}`

export const a11ySnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { GridA11y, Tile } from 'vue3-grid-board'

const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 0, w: 6, h: 2 },
  { id: 'b', x: 6, y: 0, w: 6, h: 2 }
])

const a11y: Partial<GridA11y> = {
  roleDescription: 'Movable widget',
  tileName: (id) => \`Widget \${id}\`,
  tileLabel: ({ name, column, row, w, h }) =>
    \`\${name}: column \${column}, row \${row}, \${w} by \${h}\`,
  pickedUp: 'Grabbed. Use the arrow keys to move it, and Enter to place it.',
  dropped: 'Placed.'
}
</script>

<template>
  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40" :a11y="a11y">
    <GridTile
      v-for="tile in tiles"
      :key="tile.id"
      :id="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
    />
  </GridBoard>
</template>`

export const motionSnippet = `.grid-board {
  --grid-tile-duration: 300ms;
  --grid-board-grow-duration: 100ms;
}

@media (prefers-reduced-motion: reduce) {
  .grid-board {
    --grid-tile-duration: 0ms;
    --grid-shadow-duration: 0ms;
    --grid-board-grow-duration: 0ms;
    --grid-board-shrink-duration: 0ms;
  }
}`

export const installPnpmSnippet = `pnpm add vue3-grid-board`

export const installNpmSnippet = `npm install vue3-grid-board`

export const installYarnSnippet = `yarn add vue3-grid-board`

export const importSnippet = `import { GridBoard, GridTile } from 'vue3-grid-board'`

export const importStandaloneSnippet = `import { GridBoard, GridTile } from 'vue3-grid-board/core'
import 'vue3-grid-board/style.css'`

export const nuxtModuleSnippet = `export default defineNuxtConfig({
  modules: ['vue3-grid-board/nuxt'],
  vue3GridBoard: {
    prefix: '',
    autoImports: true
  }
})`
