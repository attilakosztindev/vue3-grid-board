<script setup lang="ts">
import { ref, useId, useSlots } from 'vue'

defineProps<{
  code: string
  lang?: string
}>()

defineSlots<{ default?: () => unknown }>()

const hasPreview = !!useSlots().default
const tab = ref<'preview' | 'code'>(hasPreview ? 'preview' : 'code')
const copied = ref(false)
const status = ref('')

const uid = useId()
const tabId = (name: string) => `${uid}-tab-${name}`
const panelId = (name: string) => `${uid}-panel-${name}`

const tabsRef = ref<HTMLElement | null>(null)

function onTablistKeydown(e: KeyboardEvent) {
  if (!hasPreview) return
  const order = ['preview', 'code'] as const
  const i = order.indexOf(tab.value)
  let next: (typeof order)[number] | null = null
  if (e.key === 'ArrowRight') next = order[(i + 1) % order.length]!
  else if (e.key === 'ArrowLeft') next = order[(i - 1 + order.length) % order.length]!
  else if (e.key === 'Home') next = order[0]!
  else if (e.key === 'End') next = order[order.length - 1]!
  if (!next) return
  e.preventDefault()
  tab.value = next
  tabsRef.value?.querySelector<HTMLElement>(`#${CSS.escape(tabId(next))}`)?.focus()
}

async function copy(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    copied.value = true
    status.value = 'Code copied to clipboard'
    setTimeout(() => {
      copied.value = false
      status.value = ''
    }, 1500)
  } catch {
    copied.value = false
    status.value = 'Copying failed — copy the code manually'
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-neutral-200">
    <div class="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
      <div
        v-if="hasPreview"
        ref="tabsRef"
        role="tablist"
        aria-label="Example view"
        class="flex items-center gap-1"
        @keydown="onTablistKeydown"
      >
        <button
          :id="tabId('preview')"
          type="button"
          role="tab"
          :aria-selected="tab === 'preview'"
          :aria-controls="panelId('preview')"
          :tabindex="tab === 'preview' ? 0 : -1"
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
          :id="tabId('code')"
          type="button"
          role="tab"
          :aria-selected="tab === 'code'"
          :aria-controls="panelId('code')"
          :tabindex="tab === 'code' ? 0 : -1"
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
      </div>
      <span class="ml-auto text-xs text-neutral-400">{{ lang ?? 'vue' }}</span>
      <button
        type="button"
        class="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800"
        @click="copy(code)"
      >
        {{ copied ? 'Copied ✓' : 'Copy' }}
      </button>
    </div>

    <p class="sr-only" role="status" aria-live="polite">{{ status }}</p>

    <div
      v-if="hasPreview"
      v-show="tab === 'preview'"
      :id="panelId('preview')"
      role="tabpanel"
      :aria-labelledby="tabId('preview')"
      tabindex="0"
      class="bg-white p-6"
    >
      <slot />
    </div>

    <div
      v-show="tab === 'code'"
      :id="panelId('code')"
      :role="hasPreview ? 'tabpanel' : undefined"
      :aria-labelledby="hasPreview ? tabId('code') : undefined"
      tabindex="0"
      class="max-h-[28rem] overflow-auto bg-neutral-950"
    >
      <pre class="p-4 text-[0.8rem] leading-relaxed text-neutral-100"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>
