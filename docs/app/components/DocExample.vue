<script setup lang="ts">
import { onMounted, ref, useId, useSlots } from 'vue'
import { CODE_BG } from '~/docs/code-theme'

const props = defineProps<{
  code?: string
  lang?: string
}>()

defineSlots<{ default?: () => unknown }>()

const hasPreview = !!useSlots().default
const open = ref(!hasPreview)
const copied = ref(false)
const status = ref('')

const panelId = `${useId()}-code`

function hash(value: string): string {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (Math.imul(31, h) + value.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

const lang = props.lang ?? 'vue'
const highlighted = useState(`code:${lang}:${hash(props.code ?? '')}`, () => '')

if (import.meta.server && props.code && !highlighted.value) {
  const { highlight } = await import('~/docs/highlight')
  highlighted.value = highlight(props.code, lang)
}

onMounted(async () => {
  if (!props.code || highlighted.value) return
  const { highlight } = await import('~/docs/highlight')
  highlighted.value = highlight(props.code, lang)
})

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
  <div class="doc-example" :class="{ 'doc-example--with-preview': hasPreview }">
    <div v-if="hasPreview" class="doc-example__preview">
      <slot />
    </div>

    <div v-if="code" class="doc-example__toolbar">
      <button
        v-if="hasPreview"
        type="button"
        class="doc-btn doc-btn--quiet"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click="open = !open"
      >
        <span
          aria-hidden="true"
          class="doc-example__chevron"
          :class="{ 'doc-example__chevron--open': open }"
        >
          ›
        </span>
        {{ open ? 'Hide code' : 'Show code' }}
      </button>
      <span class="doc-example__lang">{{ lang ?? 'vue' }}</span>
      <button
        type="button"
        class="doc-btn doc-btn--quiet"
        @click="copy(code)"
      >
        {{ copied ? 'Copied ✓' : 'Copy' }}
      </button>
    </div>

    <p v-if="code" class="doc-sr" role="status" aria-live="polite">{{ status }}</p>

    <div
      v-if="code"
      v-show="open"
      :id="panelId"
      tabindex="0"
      class="doc-example__code"
      :style="{ backgroundColor: CODE_BG }"
      v-html="highlighted"
    />
  </div>
</template>
