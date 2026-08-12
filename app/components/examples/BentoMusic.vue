<script setup>
import { computed, ref } from 'vue'
import GridLayout from '~/grid-fork/grid-layout.vue'
import GridItem from '~/grid-fork/grid-item.vue'

const dynamic = defineModel('dynamic', { type: Boolean, default: false })

const L = {
  hero: { i: 1, x: 0, y: 0, w: 7, h: 4 },
  tracks: { i: 2, x: 7, y: 0, w: 5, h: 2 },
  listeners: { i: 3, x: 7, y: 2, w: 5, h: 2 },
  player: { i: 4, x: 0, y: 4, w: 12, h: 1 }
}
const layout = ref(Object.values(L))

const at = computed(() => {
  const byId = Object.fromEntries(layout.value.map((it) => [it.i, it]))
  return Object.fromEntries(Object.entries(L).map(([k, v]) => [k, byId[v.i]]))
})

const tracks = [
  { title: 'Midnight Signal', artist: 'Kavsky', img: '/bento/album2.jpg', len: '3:42' },
  { title: 'Neon Rivers', artist: 'HALO', img: '/bento/album3.jpg', len: '4:08' },
  { title: 'Afterglow', artist: 'Mira Sol', img: '/bento/album4.jpg', len: '2:57' }
]

const eq = [14, 26, 18, 30, 22, 12, 24]

const wave = Array.from({ length: 56 }, (_, i) => {
  const n = i + 1
  const h = Math.round((Math.abs(Math.sin(n * 0.55)) * 14 + 3) * 100) / 100
  return { x: n * 10, y: Math.round((20 - h / 2) * 100) / 100, h, active: n < 22 }
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[28px] bg-[#0a0710] p-6 text-white ring-1 ring-white/10"
  >
    <div
      class="pointer-events-none absolute -left-20 -top-24 size-80 rounded-full bg-fuchsia-600/25 blur-3xl"
    />
    <div
      class="pointer-events-none absolute -bottom-24 right-10 size-80 rounded-full bg-indigo-600/25 blur-3xl"
    />

    <div class="relative">
      <GridLayout
        v-model:layout="layout"
        :col-num="12"
        :row-height="86"
        :margin="[18, 18]"
        :is-draggable="dynamic"
        :is-resizable="dynamic"
      >
        <GridItem v-bind="at.hero">
          <div
            class="relative flex size-full flex-col justify-between overflow-hidden rounded-[22px] p-7"
          >
            <img
              src="/bento/album1.jpg"
              class="absolute inset-0 size-full scale-105 object-cover"
              alt=""
            />
            <div
              class="absolute inset-0 bg-gradient-to-tr from-[#0a0710] via-[#0a0710]/60 to-fuchsia-900/20"
            />

            <div class="relative flex items-center gap-3">
              <span class="relative flex size-2">
                <span class="absolute size-2 animate-ping rounded-full bg-fuchsia-400/70" />
                <span class="size-2 rounded-full bg-fuchsia-400" />
              </span>
              <span class="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
                Now Playing
              </span>
              <div class="ml-auto flex h-6 items-end gap-1">
                <span
                  v-for="(bar, k) in eq"
                  :key="k"
                  class="w-1.5 animate-pulse rounded-full bg-gradient-to-t from-fuchsia-500 to-fuchsia-300"
                  :style="{ height: bar + 'px', animationDelay: k * 110 + 'ms' }"
                />
              </div>
            </div>

            <div class="relative">
              <h3 class="text-4xl font-black leading-none tracking-tight">Solar Static</h3>
              <p class="mt-1.5 text-white/55">Nova Kane · Interstellar EP</p>
              <div class="mt-4 flex items-center gap-3">
                <span class="text-xs tabular-nums text-white/50">1:12</span>
                <span class="relative h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                  <span class="absolute inset-y-0 left-0 w-1/3 rounded-full bg-fuchsia-400" />
                </span>
                <span class="text-xs tabular-nums text-white/50">3:42</span>
                <button
                  class="ml-1 grid size-11 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/40 ring-1 ring-white/20 transition hover:scale-105"
                >
                  <span
                    class="ml-0.5 border-y-[8px] border-l-[13px] border-y-transparent border-l-white"
                  />
                </button>
              </div>
            </div>
          </div>
        </GridItem>

        <GridItem v-bind="at.tracks">
          <div
            class="flex size-full flex-col rounded-[22px] bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur"
          >
            <div class="mb-1 flex items-center justify-between">
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Up Next
              </p>
              <span class="text-[11px] text-white/40">Queue · 12</span>
            </div>
            <div class="flex flex-1 flex-col justify-between py-1">
              <div
                v-for="t in tracks"
                :key="t.title"
                class="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/[0.06]"
              >
                <img
                  :src="t.img"
                  class="size-11 rounded-lg object-cover ring-1 ring-white/10"
                  alt=""
                />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold">{{ t.title }}</p>
                  <p class="truncate text-xs text-white/45">{{ t.artist }}</p>
                </div>
                <span class="text-xs tabular-nums text-white/35">{{ t.len }}</span>
              </div>
            </div>
          </div>
        </GridItem>

        <GridItem v-bind="at.listeners" class="z-20">
          <div class="relative size-full">
            <div
              class="flex size-full flex-col justify-between overflow-hidden rounded-[22px] bg-gradient-to-br from-indigo-600/40 via-fuchsia-600/20 to-transparent p-5 ring-1 ring-white/10"
            >
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                Monthly Listeners
              </p>
              <div>
                <p class="text-5xl font-black tracking-tight">2.4M</p>
                <p class="mt-1 text-sm font-medium text-emerald-400">▲ 12.5% this week</p>
              </div>
              <div class="flex items-end gap-1.5">
                <span
                  v-for="(bar, k) in eq"
                  :key="k"
                  class="w-full flex-1 rounded-full bg-white/70"
                  :style="{ height: bar * 1.4 + 'px' }"
                />
              </div>
            </div>
            <div
              class="absolute -right-3.5 -top-3.5 size-16 animate-spin rounded-full bg-[radial-gradient(circle,#000_28%,#2a2a2a_30%,#111_34%,#2a2a2a_40%,#111_44%)] shadow-2xl ring-4 ring-black/60 [animation-duration:8s]"
            >
              <span
                class="absolute inset-0 m-auto size-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500"
              />
              <span class="absolute inset-0 m-auto size-1.5 rounded-full bg-black" />
            </div>
          </div>
        </GridItem>

        <GridItem v-bind="at.player">
          <div
            class="flex size-full items-center gap-6 rounded-[22px] bg-white/[0.04] px-6 ring-1 ring-white/10 backdrop-blur"
          >
            <div class="flex items-center gap-4 text-white/70">
              <span class="cursor-pointer transition hover:text-white">⏮</span>
              <span
                class="grid size-9 cursor-pointer place-items-center rounded-full bg-white text-black"
                >❚❚</span
              >
              <span class="cursor-pointer transition hover:text-white">⏭</span>
            </div>
            <svg
              viewBox="0 0 560 40"
              preserveAspectRatio="none"
              class="h-8 flex-1 text-fuchsia-400"
            >
              <g fill="currentColor">
                <rect
                  v-for="bar in wave"
                  :key="bar.x"
                  :x="bar.x"
                  :y="bar.y"
                  width="4"
                  :height="bar.h"
                  rx="2"
                  :opacity="bar.active ? 1 : 0.3"
                />
              </g>
            </svg>
            <span class="text-xs tabular-nums text-white/50">1:12 / 3:42</span>
          </div>
        </GridItem>
      </GridLayout>
    </div>
  </div>
</template>
