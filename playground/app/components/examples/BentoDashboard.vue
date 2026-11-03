<script setup>
import { computed, ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'

const dynamic = defineModel('dynamic', { type: Boolean, default: false })

const L = {
  revenue: { id: 1, x: 0, y: 0, w: 7, h: 3 },
  mrr: { id: 2, x: 7, y: 0, w: 5, h: 1 },
  users: { id: 3, x: 7, y: 1, w: 5, h: 2 },
  spark: { id: 4, x: 0, y: 3, w: 4, h: 2 },
  region: { id: 5, x: 4, y: 3, w: 3, h: 2 },
  cta: { id: 6, x: 7, y: 3, w: 5, h: 2 }
}
const tiles = ref(Object.values(L))

const at = computed(() => {
  const byId = Object.fromEntries(tiles.value.map((it) => [it.id, it]))
  return Object.fromEntries(Object.entries(L).map(([k, v]) => [k, byId[v.id]]))
})

const data = [12, 20, 16, 28, 24, 40, 34, 52, 46, 64, 58, 78]
const W = 560
const H = 150
const r = (v) => Math.round(v * 100) / 100
const coords = data.map((p, i) => ({ x: r((i / (data.length - 1)) * W), y: r(H - (p / 80) * H) }))
const line = 'M ' + coords.map((c) => `${c.x},${c.y}`).join(' L ')
const area = `${line} L ${W},${H} L 0,${H} Z`

const faces = [asset('/bento/face1.jpg'), asset('/bento/face2.jpg'), asset('/bento/face3.jpg')]
const bars = [40, 62, 48, 80, 56, 90, 70]
const spark = [30, 55, 42, 68, 50, 82, 60, 95]
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-900 via-slate-950 to-fuchsia-900 p-6 ring-1 ring-white/10"
  >
    <div class="relative">
      <GridBoard
        v-model:tiles="tiles"
        :columns="12"
        :row-height="94"
        :gap="18"
        :draggable="dynamic"
        :resizable="dynamic"
      >
        <GridTile v-bind="at.revenue">
          <div
            class="relative size-full overflow-hidden rounded-[22px] bg-white/5 p-7 shadow-xl shadow-black/20 ring-1 ring-white/15 backdrop-blur-lg"
          >
            <div class="relative z-10 flex items-start justify-between">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Total Revenue
                </p>
                <p class="mt-1 text-4xl font-black tracking-tight text-white">$482,900</p>
                <p class="mt-1 text-sm text-slate-400">vs $408k last quarter</p>
              </div>
              <span
                class="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/30"
              >
                ▲ 18.2%
              </span>
            </div>
            <svg
              :viewBox="`0 0 ${W} ${H}`"
              preserveAspectRatio="none"
              class="absolute inset-x-0 bottom-0 h-3/5 w-full"
            >
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#818cf8" stop-opacity="0.55" />
                  <stop offset="100%" stop-color="#818cf8" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path :d="area" fill="url(#rev)" />
              <path
                :d="line"
                fill="none"
                stroke="#a5b4fc"
                stroke-width="2.5"
                vector-effect="non-scaling-stroke"
              />
            </svg>
          </div>
        </GridTile>

        <GridTile v-bind="at.mrr" class="z-20">
          <div class="relative size-full">
            <div
              class="flex size-full items-center justify-between overflow-hidden rounded-[22px] bg-gradient-to-r from-indigo-500/40 to-violet-500/40 px-6 shadow-lg shadow-indigo-900/40 ring-1 ring-white/20 backdrop-blur-lg"
            >
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  Recurring / mo
                </p>
                <p class="text-2xl font-black text-white">$38.2k</p>
              </div>
              <div class="flex items-end gap-1">
                <span
                  v-for="(b, k) in bars"
                  :key="k"
                  class="w-2 rounded-full bg-white/80"
                  :style="{ height: b / 2.6 + 'px' }"
                />
              </div>
            </div>
            <span
              class="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-[0_4px_20px] shadow-emerald-500/60 ring-1 ring-white/30"
            >
              <span class="relative flex size-2">
                <span class="absolute size-2 animate-ping rounded-full bg-white/80" />
                <span class="size-2 rounded-full bg-white" />
              </span>
              LIVE
            </span>
          </div>
        </GridTile>

        <GridTile v-bind="at.users">
          <div
            class="flex size-full flex-col justify-between rounded-[22px] bg-white/5 p-6 shadow-xl shadow-black/20 ring-1 ring-white/15 backdrop-blur-lg"
          >
            <div class="flex items-center justify-between">
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Active Now
              </p>
              <span class="text-xs font-medium text-emerald-400">● online</span>
            </div>
            <div class="flex items-center">
              <img
                v-for="f in faces"
                :key="f"
                :src="f"
                class="-ml-2.5 size-12 rounded-full object-cover ring-2 ring-slate-900 first:ml-0"
                alt=""
              />
              <span
                class="-ml-2.5 grid size-12 place-items-center rounded-full bg-white/10 text-xs font-bold text-white ring-2 ring-slate-900"
              >
                +842
              </span>
            </div>
            <p class="text-3xl font-black tracking-tight text-white">
              1,204 <span class="text-base font-medium text-slate-500">sessions</span>
            </p>
          </div>
        </GridTile>

        <GridTile v-bind="at.spark">
          <div
            class="flex size-full flex-col justify-between rounded-[22px] bg-white/5 p-6 shadow-xl shadow-black/20 ring-1 ring-white/15 backdrop-blur-lg"
          >
            <div class="flex items-center justify-between">
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Conversions
              </p>
              <span class="text-sm font-semibold text-emerald-400">+2.1%</span>
            </div>
            <div class="flex flex-1 items-end gap-2 pt-3">
              <div
                v-for="(b, k) in spark"
                :key="k"
                class="flex-1 rounded-md bg-gradient-to-t from-indigo-500 to-fuchsia-400"
                :class="k === spark.length - 1 ? 'opacity-100' : 'opacity-70'"
                :style="{ height: b + '%' }"
              />
            </div>
            <p class="text-2xl font-black tracking-tight text-white">7.9%</p>
          </div>
        </GridTile>

        <GridTile v-bind="at.region">
          <div
            class="flex size-full flex-col items-center justify-center gap-3 rounded-[22px] bg-white/5 shadow-xl shadow-black/20 ring-1 ring-white/15 backdrop-blur-lg"
          >
            <div class="relative grid size-24 place-items-center">
              <svg viewBox="0 0 36 36" class="size-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" stroke-width="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#34d399"
                  stroke-width="3.5"
                  stroke-dasharray="68 100"
                  stroke-linecap="round"
                />
              </svg>
              <div class="absolute text-center">
                <p class="text-xl font-black text-white">68%</p>
                <p class="text-[10px] text-slate-500">EMEA</p>
              </div>
            </div>
          </div>
        </GridTile>

        <GridTile v-bind="at.cta">
          <div
            class="relative flex size-full flex-col justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-fuchsia-500/40 via-purple-500/40 to-indigo-500/40 p-7 shadow-lg shadow-purple-900/40 ring-1 ring-white/20 backdrop-blur-lg"
          >
            <div class="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
            <p class="text-xl font-black tracking-tight text-white">Upgrade to Scale</p>
            <p class="mt-1 text-sm text-white/70">Unlimited seats, SSO & audit logs.</p>
            <button
              class="mt-4 w-fit rounded-full bg-white px-6 py-2.5 text-sm font-bold text-purple-700 shadow transition hover:scale-105"
            >
              View plans →
            </button>
          </div>
        </GridTile>
      </GridBoard>
    </div>
  </div>
</template>
