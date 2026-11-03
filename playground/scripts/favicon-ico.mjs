import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { sharpsToIco } from 'sharp-ico'

// pwa-assets-generator can only put one size into favicon.ico, so it is built here instead, with
// the sizes browsers that fall back to it pick from: 16 for tabs, 32 for high-density tabs and
// bookmarks, 48 for desktop shortcuts
const svg = fileURLToPath(new URL('../public/favicon.svg', import.meta.url))
const ico = fileURLToPath(new URL('../public/favicon.ico', import.meta.url))

await sharpsToIco([sharp(svg)], ico, {
  sizes: [16, 32, 48],
  resizeOptions: {}
})
