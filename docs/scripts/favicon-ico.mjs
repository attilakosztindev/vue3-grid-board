import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { sharpsToIco } from 'sharp-ico'

const svg = fileURLToPath(new URL('../public/favicon.svg', import.meta.url))
const ico = fileURLToPath(new URL('../public/favicon.ico', import.meta.url))

await sharpsToIco([sharp(svg)], ico, {
  sizes: [16, 32, 48],
  resizeOptions: {}
})
