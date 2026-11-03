import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Regenerates every icon in public/ from favicon.svg: pnpm --filter playground icons
export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset: {
    ...minimal2023Preset,
    // favicon.svg already runs edge to edge, so the transparent icons match it without extra margin
    transparent: {
      ...minimal2023Preset.transparent,
      padding: 0
    }
  },
  images: ['public/favicon.svg']
})
