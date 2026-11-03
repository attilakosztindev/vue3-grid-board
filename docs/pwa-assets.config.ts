import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Regenerates every icon in public/ from favicon.svg: pnpm icons
export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset: {
    ...minimal2023Preset,
    // the generator's default (quality: 60) squeezes each icon into a tiny palette, which strips
    // the anti-aliasing and leaves every curve stair-stepped; keep full colour, compress losslessly
    png: {
      compressionLevel: 9
    },
    // favicon.svg already runs edge to edge, so the transparent icons match it without extra margin
    transparent: {
      ...minimal2023Preset.transparent,
      padding: 0,
      // scripts/favicon-ico.mjs builds favicon.ico with more than the one size this would give it
      favicons: []
    }
  },
  images: ['public/favicon.svg']
})
