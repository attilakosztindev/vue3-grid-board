<script setup>
import { computed, ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'

const dynamic = defineModel('dynamic', { type: Boolean, default: false })

const L = {
  city: { id: 1, x: 0, y: 0, w: 5, h: 4 },
  beach: { id: 2, x: 5, y: 0, w: 4, h: 2 },
  mountain: { id: 3, x: 9, y: 0, w: 3, h: 4 },
  forest: { id: 4, x: 5, y: 2, w: 2, h: 2 },
  desert: { id: 5, x: 7, y: 2, w: 2, h: 2 },
  coast: { id: 6, x: 0, y: 4, w: 9, h: 2 }
}
const tiles = ref(Object.values(L))

const at = computed(() => {
  const byId = Object.fromEntries(tiles.value.map((it) => [it.id, it]))
  return Object.fromEntries(Object.entries(L).map(([k, v]) => [k, byId[v.id]]))
})

const small = [
  { key: 'forest', img: asset('/bento/forest.jpg'), name: 'Redwood', temp: '18°', tag: 'Hike' },
  { key: 'desert', img: asset('/bento/desert.jpg'), name: 'Sahara', temp: '34°', tag: 'Camp' }
]
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-100 via-white to-emerald-100 p-6 ring-1 ring-black/5"
  >
    <div
      class="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-sky-300/30 blur-3xl"
    />
    <div
      class="pointer-events-none absolute -bottom-16 left-1/3 size-72 rounded-full bg-emerald-300/30 blur-3xl"
    />

    <div class="relative">
      <GridBoard
        v-model:tiles="tiles"
        :columns="12"
        :row-height="86"
        :gap="18"
        :draggable="dynamic"
        :resizable="dynamic"
      >
        <GridTile v-bind="at.city" class="z-20">
          <div class="relative size-full">
            <div class="absolute inset-0 overflow-hidden rounded-[22px] shadow-xl">
              <img :src="asset('/bento/city.jpg')" class="size-full scale-105 object-cover" alt="" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/20"
              />
            </div>
            <div class="relative flex size-full flex-col justify-between p-7 text-white">
              <span
                class="w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur"
              >
                ✦ Featured
              </span>
              <div>
                <p class="text-sm font-medium text-white/70">Portugal</p>
                <h3 class="text-5xl font-black leading-none tracking-tight drop-shadow">Lisbon</h3>
                <div class="mt-4 flex items-center gap-4">
                  <p class="text-lg font-bold">
                    $780 <span class="text-sm font-normal text-white/60">/ 4 days</span>
                  </p>
                  <span class="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-slate-900">
                    Explore
                  </span>
                </div>
              </div>
            </div>
            <div class="absolute -left-3.5 -top-3.5 drop-shadow-2xl">
              <div
                class="grid size-14 place-items-center rounded-full rounded-bl-none bg-rose-500 ring-4 ring-white/70 [rotate:-45deg]"
              >
                <img
                  :src="asset('/bento/beach.jpg')"
                  class="size-9 rounded-full object-cover [rotate:45deg]"
                  alt=""
                />
              </div>
            </div>
          </div>
        </GridTile>

        <GridTile v-bind="at.beach">
          <div class="relative size-full overflow-hidden rounded-[22px] shadow-lg">
            <img :src="asset('/bento/beach.jpg')" class="size-full object-cover" alt="" />
            <div
              class="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent"
            />
            <div class="absolute bottom-4 left-4 text-white">
              <p class="text-2xl font-black tracking-tight">Algarve Coast</p>
              <p class="text-sm text-white/75">Golden-hour surf breaks</p>
            </div>
            <span
              class="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-800"
            >
              ★ 4.9
            </span>
          </div>
        </GridTile>

        <GridTile v-bind="at.mountain" class="z-20">
          <div class="relative size-full">
            <div class="absolute inset-0 overflow-hidden rounded-[22px] shadow-lg">
              <img :src="asset('/bento/mountain.jpg')" class="size-full object-cover" alt="" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"
              />
            </div>
            <div class="relative flex size-full flex-col justify-end p-5 text-white">
              <p class="text-2xl font-black tracking-tight">Dolomites</p>
              <p class="text-sm text-white/70">Alta Badia · Italy</p>
              <div class="mt-3 flex gap-1">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="h-1.5 flex-1 rounded-full"
                  :class="n <= 4 ? 'bg-amber-400' : 'bg-white/30'"
                />
              </div>
              <p class="mt-1.5 text-xs text-white/60">Difficulty · Advanced</p>
            </div>
            <div
              class="absolute -right-3.5 -top-3.5 grid size-14 place-items-center rounded-2xl bg-white text-2xl shadow-2xl [rotate:12deg] [animation:float_3.5s_ease-in-out_infinite]"
            >
              ✈️
            </div>
          </div>
        </GridTile>

        <GridTile v-for="s in small" :key="s.key" v-bind="at[s.key]">
          <div class="relative size-full overflow-hidden rounded-[22px] shadow-md">
            <img :src="s.img" class="size-full object-cover" alt="" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
            <span
              class="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-slate-800"
            >
              {{ s.temp }}
            </span>
            <div class="absolute bottom-3 left-3 text-white">
              <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                {{ s.tag }}
              </p>
              <p class="text-lg font-black leading-none drop-shadow">{{ s.name }}</p>
            </div>
          </div>
        </GridTile>

        <GridTile v-bind="at.coast">
          <div class="relative size-full overflow-hidden rounded-[22px] shadow-lg">
            <img :src="asset('/bento/coast.jpg')" class="absolute inset-0 size-full object-cover" alt="" />
            <div
              class="absolute inset-0 bg-gradient-to-r from-sky-950/80 via-sky-900/30 to-transparent"
            />
            <div class="absolute inset-0 flex items-center justify-between px-8 text-white">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">
                  Next Departure
                </p>
                <p class="mt-1 text-3xl font-black tracking-tight">Amalfi → Santorini</p>
                <p class="text-sm text-white/70">Sun 09:40 · 2 seats left</p>
              </div>
              <button
                class="rounded-full bg-white px-7 py-3 font-bold text-sky-800 shadow-lg transition hover:scale-105"
              >
                Book now
              </button>
            </div>
          </div>
        </GridTile>
      </GridBoard>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: rotate(12deg) translateY(0);
  }
  50% {
    transform: rotate(12deg) translateY(-9px);
  }
}
</style>
