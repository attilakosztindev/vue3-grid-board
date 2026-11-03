export const usageSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from '@attilakosztin/vue-grid'
import type { Tile } from '@attilakosztin/vue-grid'

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
import type { Tile } from '@attilakosztin/vue-grid'

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
import type { Tile } from '@attilakosztin/vue-grid'

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

export const frozenSnippet = `const tiles = ref<Tile[]>([
  { id: 'nav', x: 0, y: 0, w: 3, h: 6, frozen: true },
  { id: 'a', x: 3, y: 0, w: 5, h: 3 },
  { id: 'b', x: 8, y: 0, w: 4, h: 3 },
  { id: 'c', x: 3, y: 3, w: 4, h: 3 },
  { id: 'd', x: 7, y: 3, w: 5, h: 3 }
])`

export const slotsSnippet = `<script setup lang="ts">
import type { TileWith } from '@attilakosztin/vue-grid'

const tile = reactive<TileWith<{ title: string; note: string }>>({
  id: 'a',
  x: 0,
  y: 0,
  w: 4,
  h: 3,
  title: 'Notes',
  note: ''
})
</script>

<template>
  <GridTile
    :id="tile.id"
    :x="tile.x"
    :y="tile.y"
    :w="tile.w"
    :h="tile.h"
    drag-handle=".card-header"
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
</template>

<style>
.grid-tile > .grid-handle {
  color: var(--ui-primary);
}
</style>`

export const overflowSnippet = `<script setup lang="ts">
import type { Tile } from '@attilakosztin/vue-grid'

const escape = ref(true)
const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 0, w: 6, h: 3 },
  { id: 'b', x: 6, y: 0, w: 6, h: 3 },
  { id: 'c', x: 0, y: 3, w: 4, h: 3 },
  { id: 'd', x: 4, y: 3, w: 8, h: 3 }
])
</script>

<template>
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

export const dynamicSnippet = `import { getLastRow } from '@attilakosztin/vue-grid'
import type { Tile } from '@attilakosztin/vue-grid'

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

function remove(id: string) {
  tiles.value = tiles.value.filter((t) => t.id !== id)
}`

export const mutationSnippet = `import type { Tile } from '@attilakosztin/vue-grid'

const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 0, w: 4, h: 2 },
  { id: 'c', x: 4, y: 0, w: 4, h: 2 }
])
const tile: Tile = { id: 'd', x: 0, y: 2, w: 4, h: 2 }

tiles.value = [...tiles.value, tile]
tiles.value = tiles.value.map((t) => (t.id === 'a' ? { ...t, w: 6 } : t))
tiles.value = tiles.value.filter((t) => t.id !== 'c')`

export const persistenceSnippet = `import { validateTiles } from '@attilakosztin/vue-grid'
import type { Tile } from '@attilakosztin/vue-grid'

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

watch(tiles, (next) => localStorage.setItem(KEY, JSON.stringify(next)))`

export const keyboardSnippet = `<script setup lang="ts">
import type { TileWith } from '@attilakosztin/vue-grid'

type Panel = TileWith<{ title: string }>

const tiles = ref<Panel[]>([
  { id: 'one', x: 0, y: 0, w: 6, h: 4, title: 'Revenue' },
  { id: 'two', x: 6, y: 0, w: 6, h: 2, title: 'Signups' },
  { id: 'three', x: 6, y: 2, w: 3, h: 2, title: 'Churn' },
  { id: 'four', x: 9, y: 2, w: 3, h: 2, title: 'Sessions' }
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
      :label="tile.title"
    />
  </GridBoard>
</template>`

export const ssrSnippet = `<script setup lang="ts">
const { data } = await useFetch('/api/grid-tiles')
const tiles = ref(data.value?.tiles ?? [])
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

export const typesSnippet = `import type {
  Tile,
  TileId,
  Gap,
  GridBoardProps,
  GridTileProps,
  GridTileEmits,
  GridTileSlots,
  GridBoardExposed
} from '@attilakosztin/vue-grid'

const tiles = ref<Tile[]>([{ id: 'a', x: 0, y: 0, w: 2, h: 2 }])

const board = ref<GridBoardExposed | null>(null)
board.value?.dispatch('dragEvent', ['dragmove', 'a', 3, 1, 2, 2])
board.value?.dispatch('measure')`

export const extendSnippet = `import type { TileWith } from '@attilakosztin/vue-grid'
import { getTileById } from '@attilakosztin/vue-grid'

type Panel = TileWith<{
  title: string
  kind: 'chart' | 'table' | 'notes'
}>

const tiles = ref<Panel[]>([
  { id: 'a', x: 0, y: 0, w: 4, h: 3, title: 'Revenue', kind: 'chart' }
])

const panel = getTileById(tiles.value, 'a')
const title = panel?.title`

export const methodsSnippet = `import {
  applyGravity,
  copyTiles,
  getTileById,
  moveTile
} from '@attilakosztin/vue-grid'
import type { Tile } from '@attilakosztin/vue-grid'

const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 0, w: 4, h: 2 },
  { id: 'b', x: 4, y: 0, w: 4, h: 2 }
])

const next = copyTiles(tiles.value)
const tile = getTileById(next, 'a')!

moveTile(next, tile, 3, 1, true, false)
applyGravity(next, true, 'a')

tiles.value = next`

export const stylingSnippet = `.grid-tile {
  background: var(--ui-bg-elevated);
  border-radius: inherit;
}

.grid-tile--resizing {
  opacity: 0.9;
}

.grid-tile--grabbed {
  outline: 2px solid var(--ui-primary);
}

.grid-shadow {
  background: var(--ui-primary);
  opacity: 0.2;
}`

export const installSnippet = `pnpm add github:attilakosztindev/vue3-grid`

export const importSnippet = `import { GridBoard, GridTile } from '@attilakosztin/vue-grid'`

export const importStandaloneSnippet = `import { GridBoard, GridTile } from '@attilakosztin/vue-grid/core'
import '@attilakosztin/vue-grid/style.css'`
