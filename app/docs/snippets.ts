export const usageSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import GridBoard from '~/grid/grid-board.vue'
import GridTile from '~/grid/grid-tile.vue'
import type { Tile } from '~/grid/types'

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
    <GridTile v-for="tile in tiles" :key="tile.id" v-bind="tile">
      {{ tile.id }}
    </GridTile>
  </GridBoard>
</template>`

export const interactiveSnippet = `<GridBoard v-model:tiles="tiles" :draggable="live" :resizable="live">
  <GridTile v-for="tile in tiles" :key="tile.id" v-bind="tile" />
</GridBoard>`

export const gravitySnippet = `<GridBoard v-model:tiles="tiles" :gravity="gravity">
  <GridTile v-for="tile in tiles" :key="tile.id" v-bind="tile" />
</GridBoard>`

export const frozenSnippet = `const tiles = ref<Tile[]>([
  { id: 'sidebar', x: 0, y: 0, w: 3, h: 6, frozen: true },
  { id: 'a', x: 3, y: 0, w: 5, h: 3 },
  { id: 'b', x: 8, y: 0, w: 4, h: 3 }
])`

export const slotsSnippet = `<GridTile v-bind="tile" drag-handle=".card-header">
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

<style>
.grid-tile > .grid-handle { color: var(--ui-primary); }
</style>`

export const overflowSnippet = `<div class="panel">
  <GridBoard v-model:tiles="tiles" overflow>
    <GridTile v-for="tile in tiles" :key="tile.id" v-bind="tile" />
  </GridBoard>
</div>

<style>
.panel {
  max-width: 34rem;
  overflow: hidden;
}
</style>`

export const dynamicSnippet = `import { getLastRow } from '~/grid/helpers/helpers'

let seq = 4

function add() {
  const tile = { id: String(seq++), x: 0, y: getLastRow(tiles.value), w: 3, h: 2 }
  tiles.value = [...tiles.value, tile]
}

function remove(id: string) {
  tiles.value = tiles.value.filter((t) => t.id !== id)
}`

export const mutationSnippet = `tiles.value = [...tiles.value, tile]
tiles.value = tiles.value.map((t) => (t.id === 'a' ? { ...t, w: 6 } : t))
tiles.value = tiles.value.filter((t) => t.id !== 'c')`

export const persistenceSnippet = `import { validateTiles } from '~/grid/helpers/helpers'

const KEY = 'dashboard'

watch(tiles, (next) => localStorage.setItem(KEY, JSON.stringify(next)))

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
}`

export const keyboardSnippet = `<GridBoard v-model:tiles="tiles">
  <GridTile v-for="tile in tiles" :key="tile.id" v-bind="tile" :label="tile.title" />
</GridBoard>`

export const ssrSnippet = `<script setup lang="ts">
const { data } = await useFetch('/api/grid-tiles')
const tiles = ref(data.value?.tiles ?? [])
</script>

<template>
  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="40">
    <GridTile v-for="tile in tiles" :key="tile.id" v-bind="tile" />
  </GridBoard>
</template>`

export const eventsSnippet = `<GridBoard v-model:tiles="tiles" @ready="onReady">
  <GridTile
    v-for="tile in tiles"
    :key="tile.id"
    v-bind="tile"
    @dragstart="(id, x, y) => {}"
    @drag="(id, x, y) => {}"
    @dragend="(id, x, y) => {}"
    @resizestart="(id, w, h) => {}"
    @resize="(id, w, h) => {}"
    @resizeend="(id, w, h) => {}"
    @size="(id, width, height) => {}"
  />
</GridBoard>`

export const typesSnippet = `import type {
  Tile,
  TileId,
  Gap,
  GridBoardProps,
  GridTileProps,
  GridTileEmits,
  GridTileSlots,
  GridBoardExposed
} from '~/grid/types'

const tiles = ref<Tile[]>([{ id: 'a', x: 0, y: 0, w: 2, h: 2 }])

const board = ref<GridBoardExposed | null>(null)
board.value?.dispatch('dragEvent', ['dragmove', 'a', 3, 1, 2, 2])
board.value?.dispatch('measure')`

export const extendSnippet = `import type { TileWith } from '~/grid/types'
import { getTileById } from '~/grid/helpers/helpers'

type Panel = TileWith<{
  title: string
  kind: 'chart' | 'table' | 'notes'
}>

const tiles = ref<Panel[]>([
  { id: 'a', x: 0, y: 0, w: 4, h: 3, title: 'Revenue', kind: 'chart' }
])

const found = getTileById(tiles.value, 'a')
found?.title`

export const methodsSnippet = `import {
  applyGravity,
  copyTiles,
  getTileById,
  moveTile
} from '~/grid/helpers/helpers'

const next = copyTiles(tiles.value)
const tile = getTileById(next, 'a')!

moveTile(next, tile, 3, 1, true, false)
applyGravity(next, true, 'a')

tiles.value = next`

export const stylingSnippet = `.grid-tile {
  background: var(--ui-bg-elevated);
  border-radius: inherit;
}

.grid-tile--dragging { cursor: grabbing; }
.grid-tile--resizing { opacity: 0.9; }
.grid-tile--grabbed  { outline: 2px solid var(--ui-primary); }

.grid-shadow {
  background: var(--ui-primary);
  opacity: 0.2;
}`
