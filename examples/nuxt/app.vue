<script setup lang="ts">
import type { Tile } from 'vue3-grid-board'

const tiles = ref<Tile[]>([
  { id: 'a', x: 0, y: 0, w: 6, h: 4 },
  { id: 'b', x: 6, y: 0, w: 3, h: 2 },
  { id: 'c', x: 9, y: 0, w: 3, h: 2 },
  { id: 'd', x: 6, y: 2, w: 6, h: 2 }
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
      <div class="tile" />
    </GridTile>
  </GridBoard>
</template>

<style>
.tile {
  height: 100%;
  border-radius: inherit;
  background: #d1fae5;
  color: #065f46;
}
</style>
