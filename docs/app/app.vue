<script setup>
const site = 'https://attilakosztindev.github.io/vue3-grid-board'
const title = 'vue3-grid-board — a draggable, resizable board for Vue 3'
const description =
  'A draggable, resizable board for Vue 3. SSR friendly and accessible.'

const route = useRoute()
const url = computed(() => site + route.path.replace(/\/?$/, '/'))

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'google-site-verification', content: 'TvB5BEa-XBjy9F6iDmrTCkAZ7y7d-cvOp2J3ZLE20yw' }
  ],
  link: [
    { rel: 'icon', href: asset('/favicon.ico'), sizes: '16x16 32x32 48x48' },
    { rel: 'icon', href: asset('/favicon.svg'), sizes: 'any', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: asset('/apple-touch-icon-180x180.png') },
    { rel: 'manifest', href: asset('/manifest.webmanifest') },
    { rel: 'canonical', href: url }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogSiteName: 'vue3-grid-board',
  ogTitle: title,
  ogDescription: description,
  ogUrl: url,
  ogImage: `${site}/og-image.png`,
  ogImageWidth: 1280,
  ogImageHeight: 640,
  ogImageAlt: 'vue3-grid-board: a draggable, resizable board for Vue 3',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <NuxtPage />
</template>
