<script setup>
import { defineComponent } from 'vue'
import GridLayout from '~/grid-fork/grid-layout.vue'
import GridItem from '~/grid-fork/grid-item.vue'

const props = defineProps({
  endpoint: { type: String, default: '' },
  layout: { type: Array, default: () => [] },
  config: { type: Object, default: () => ({}) },
  title: { type: String, default: '' }
})

const { layout, config, isDynamic, clientFallback, skeletonStyle, skeletonHeight } =
  await useGridBoard({
    endpoint: props.endpoint,
    layout: props.layout,
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
      <GridLayout
        v-model:layout="layout"
        :col-num="config.colNum"
        :row-height="config.rowHeight"
        :margin="config.margin"
        :is-draggable="isDynamic"
        :is-resizable="isDynamic"
      >
        <GridItem
          v-for="item in layout"
          :key="item.i"
          :i="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
        >
          <div class="size-full bg-primary-500/20 rounded-[inherit] p-2 text-center">
            Item {{ item.i }}
          </div>
        </GridItem>
      </GridLayout>

      <template #fallback>
        <div class="vue-grid-layout relative w-full" :style="{ height: skeletonHeight }">
          <div
            v-for="item in layout"
            :key="item.i"
            :style="skeletonStyle(item)"
            class="rounded bg-elevated animate-pulse"
          />
        </div>
      </template>
    </component>
  </div>
</template>
