<script setup lang="ts">
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'
import type { Tile, TileWith } from 'vue3-grid-board'

type Panel = TileWith<{ title: string }>

type Equal<A, B> =
  (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B ? 1 : 2 ? true : false
type UpdatePayload<T extends Tile> = Parameters<
  NonNullable<Parameters<typeof GridBoard<T>>[0]['onUpdate:tiles']>
>[0]

const updatesKeepTheTileType: Equal<UpdatePayload<Panel>, Panel[]> = true
const plainTilesStillWork: Equal<UpdatePayload<Tile>, Tile[]> = true

const panels = ref<Panel[]>([{ id: 'a', x: 0, y: 0, w: 2, h: 2, title: 'Revenue' }])
const plain = ref<Tile[]>([{ id: 'b', x: 0, y: 0, w: 2, h: 2 }])

function titles(tiles: Panel[]) {
  return tiles.map((tile) => tile.title)
}

function remove(id: Panel['id']) {
  panels.value = panels.value.filter((tile) => tile.id !== id)
}

defineExpose({ updatesKeepTheTileType, plainTilesStillWork })
</script>

<template>
  <GridBoard v-model:tiles="panels" removable @ready="titles" @remove="remove">
    <GridTile
      v-for="tile in panels"
      :id="tile.id"
      :key="tile.id"
      :x="tile.x"
      :y="tile.y"
      :w="tile.w"
      :h="tile.h"
      :removable="tile.id !== 'a'"
    >
      {{ tile.title }}
    </GridTile>
  </GridBoard>

  <GridBoard v-model:tiles="plain" />
</template>
