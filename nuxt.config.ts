export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-01-15',

  hooks: {
    'vite:extendConfig'(config) {
      const build = ((config as { build?: NonNullable<typeof config.build> }).build ??= {})
      build.rollupOptions ||= {}
      build.rollupOptions.onwarn = (warning, defaultHandler) => {
        if (warning.code === 'SOURCEMAP_BROKEN') return
        defaultHandler(warning)
      }
    }
  },

  eslint: {
    config: {
      stylistic: false
    }
  }
})
