<script setup>
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [
    { rel: 'icon', href: asset('/favicon.ico'), sizes: '16x16 32x32 48x48' },
    { rel: 'icon', href: asset('/favicon.svg'), sizes: 'any', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: asset('/apple-touch-icon-180x180.png') },
    { rel: 'manifest', href: asset('/manifest.webmanifest') }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Grid board',
  description:
    'Backend-sourced, SSR-capable grid — server-rendered by default, client-only when flagged.'
})
</script>

<template>
  <UApp>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
