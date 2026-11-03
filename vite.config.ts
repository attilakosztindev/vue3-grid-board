import { cp, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

const root = dirname(fileURLToPath(import.meta.url))
const src = resolve(root, 'src')
const dist = resolve(root, 'dist')

function declarations(): Plugin {
  return {
    name: 'vue3-grid-board-declarations',
    apply: 'build',
    async closeBundle() {
      await cp(src, dist, {
        recursive: true,
        filter: async (entry) => {
          if (entry.endsWith('.d.ts')) return true
          try {
            await readdir(entry)
            return true
          } catch {
            return false
          }
        }
      })
      await cp(resolve(src, 'types.ts'), resolve(dist, 'types.d.ts'))
      await cp(resolve(dist, 'index.d.ts'), resolve(dist, 'core.d.ts'))
      await cp(resolve(src, 'nuxt.js'), resolve(dist, 'nuxt.js'))
      await writeFile(
        resolve(dist, 'index.js'),
        "import './style.css'\nexport * from './core.js'\n"
      )
    }
  }
}

export default defineConfig({
  plugins: [vue(), declarations()],
  build: {
    target: 'es2022',
    sourcemap: true,
    lib: {
      entry: resolve(src, 'index.js'),
      formats: ['es'],
      fileName: () => 'core.js',
      cssFileName: 'style'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue' }
      }
    }
  }
})
