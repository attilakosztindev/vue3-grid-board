<script setup lang="ts">
import { ref, useSlots } from 'vue'

defineProps<{
  code: string
  lang?: string
}>()

defineSlots<{ default?: () => unknown }>()

const hasPreview = !!useSlots().default
const tab = ref<'preview' | 'code'>(hasPreview ? 'preview' : 'code')
const copied = ref(false)

async function copy(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-neutral-200">
    <div class="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
      <button
        v-if="hasPreview"
        type="button"
        class="rounded-md px-3 py-1 text-sm font-medium transition"
        :class="
          tab === 'preview'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-500 hover:text-neutral-800'
        "
        @click="tab = 'preview'"
      >
        Preview
      </button>
      <button
        type="button"
        class="rounded-md px-3 py-1 text-sm font-medium transition"
        :class="
          tab === 'code'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-500 hover:text-neutral-800'
        "
        @click="tab = 'code'"
      >
        Code
      </button>
      <span class="ml-auto text-xs text-neutral-400">{{ lang ?? 'vue' }}</span>
      <button
        type="button"
        class="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800"
        @click="copy(code)"
      >
        {{ copied ? 'Copied ✓' : 'Copy' }}
      </button>
    </div>

    <div v-if="hasPreview" v-show="tab === 'preview'" class="bg-white p-6">
      <slot />
    </div>

    <div v-show="tab === 'code'" class="max-h-[28rem] overflow-auto bg-neutral-950">
      <pre class="p-4 text-[0.8rem] leading-relaxed text-neutral-100"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>
