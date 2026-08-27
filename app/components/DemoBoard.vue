<script setup>
import { defineComponent } from 'vue'
import GridBoard from '~/grid/grid-board.vue'
import GridTile from '~/grid/grid-tile.vue'

const props = defineProps({
  endpoint: { type: String, default: '' },
  tiles: { type: Array, default: () => [] },
  config: { type: Object, default: () => ({}) },
  title: { type: String, default: '' }
})

const { tiles, config, isDynamic, clientFallback, skeletonStyle, skeletonHeight } =
  await useDemoBoard({
    endpoint: props.endpoint,
    tiles: props.tiles,
    config: props.config
  })

const Passthrough = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      slots.default?.()
})
const ClientOnly = resolveComponent('ClientOnly')
const RenderStrategy = computed(() => (clientFallback.value ? ClientOnly : Passthrough))
</script>

<template>
  <div>
    <h2 v-if="title" class="text-lg font-semibold mb-2">
      {{ title }}
    </h2>

    <div class="mb-4">
      <USwitch
        v-model="isDynamic"
        :label="isDynamic ? 'Dynamic — drag & resize' : 'Static — rock solid (lightweight)'"
      />
    </div>

    <component :is="RenderStrategy">
      <GridBoard
        v-model:tiles="tiles"
        :columns="config.columns"
        :row-height="config.rowHeight"
        :gap="config.gap"
        :draggable="isDynamic"
        :resizable="isDynamic"
      >
        <GridTile
          v-for="tile in tiles"
          :id="tile.id"
          :key="tile.id"
          :x="tile.x"
          :y="tile.y"
          :w="tile.w"
          :h="tile.h"
        >
          <div class="size-full bg-primary-500/20 rounded-[inherit] p-2 text-center">
            Tile {{ tile.id }}
          </div>
        </GridTile>
      </GridBoard>

      <template #fallback>
        <div class="grid-board relative w-full" :style="{ height: skeletonHeight }">
          <div
            v-for="tile in tiles"
            :key="tile.id"
            :style="skeletonStyle(tile)"
            class="rounded bg-elevated animate-pulse"
          />
        </div>
      </template>
    </component>
  </div>
</template>
