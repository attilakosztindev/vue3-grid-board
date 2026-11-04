import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

export default withNuxt(prettier, {
  files: ['app/components/DocExample.vue'],
  rules: {
    'vue/no-v-html': 'off'
  }
})
