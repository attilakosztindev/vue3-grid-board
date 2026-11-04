import { addComponent, addImports, defineNuxtModule } from 'nuxt/kit'

const PACKAGE = 'vue3-grid-board'

const COMPONENTS = ['GridBoard', 'GridTile']

const HELPERS = [
  'applyGravity',
  'copyTiles',
  'getLastRow',
  'getTileById',
  'moveTile',
  'validateTiles'
]

export default defineNuxtModule({
  meta: {
    name: PACKAGE,
    configKey: 'vue3GridBoard',
    compatibility: { nuxt: '>=3.13.0' }
  },
  defaults: {
    prefix: '',
    autoImports: true
  },
  setup(options, nuxt) {
    nuxt.options.css.push(`${PACKAGE}/style.css`)

    for (const name of COMPONENTS) {
      addComponent({
        name: `${options.prefix}${name}`,
        export: name,
        filePath: `${PACKAGE}/core`
      })
    }

    if (options.autoImports) {
      addImports(HELPERS.map((name) => ({ name, from: `${PACKAGE}/core` })))
    }
  }
})
