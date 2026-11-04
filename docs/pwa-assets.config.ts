import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset: {
    ...minimal2023Preset,
    png: {
      compressionLevel: 9
    },
    transparent: {
      ...minimal2023Preset.transparent,
      padding: 0,
      favicons: []
    }
  },
  images: ['public/favicon.svg']
})
