<script setup>
import { reactive } from 'vue'
import BentoMusic from '~/components/examples/BentoMusic.vue'
import BentoTravel from '~/components/examples/BentoTravel.vue'
import BentoDashboard from '~/components/examples/BentoDashboard.vue'

definePageMeta({ title: 'Bento showcase' })

const examples = [
  {
    key: 'music',
    n: '01',
    name: 'Neon Music',
    desc: 'Dark, glowing, oversized play button + spinning vinyl overflow.',
    component: BentoMusic
  },
  {
    key: 'travel',
    n: '02',
    name: 'Wanderlust Travel',
    desc: 'Bright photo tiles, map-pin and paper-plane overflow accents.',
    component: BentoTravel
  },
  {
    key: 'dashboard',
    n: '03',
    name: 'Glass Dashboard',
    desc: 'SaaS analytics — area chart, avatar stack, live glow badge overflow.',
    component: BentoDashboard
  }
]

const dynamic = reactive({ music: false, travel: false, dashboard: false })
</script>

<template>
  <UContainer class="space-y-12 py-8">
    <div>
      <h1 class="mb-1 text-2xl font-bold">Bento grid — 3 example styles</h1>
      <p class="text-muted">
        Same grid engine, three visual directions. Each uses real images from
        <code>/public/bento</code> and absolutely-positioned accents that overflow their tiles. Pick
        a favorite.
      </p>
    </div>

    <section v-for="ex in examples" :key="ex.key">
      <div class="mb-3 flex items-center gap-3">
        <span class="text-sm font-black text-primary">{{ ex.n }}</span>
        <h2 class="text-lg font-semibold">{{ ex.name }}</h2>
        <p class="hidden text-sm text-muted sm:block">{{ ex.desc }}</p>
        <USwitch
          v-model="dynamic[ex.key]"
          :label="dynamic[ex.key] ? 'Dynamic — drag & resize' : 'Static'"
          class="ml-auto shrink-0"
        />
      </div>
      <component :is="ex.component" v-model:dynamic="dynamic[ex.key]" />
    </section>
  </UContainer>
</template>
