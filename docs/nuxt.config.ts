const site = 'https://attilakosztindev.github.io/vue3-grid-board'
const base = (process.env.NUXT_APP_BASE_URL ?? '/').replace(/\/?$/, '/')
const title = 'vue3-grid-board — a draggable, resizable board for Vue 3'
const description = 'A draggable, resizable board for Vue 3'
const image = `${site}/og-image.png`
const themeScript = `try{var t=localStorage.getItem('vue3-grid-board-theme')}catch(e){}document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'`
const imageAlt =
  'The vue3-grid-board logo and name, above the line: A draggable, resizable board for Vue 3'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/fonts'],

  fonts: {
    defaults: {
      weights: ['400 700']
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title,
      meta: [
        { name: 'description', content: description },
        { name: 'author', content: 'Attila Kosztin' },
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#14161b', media: '(prefers-color-scheme: dark)' },
        { name: 'google-site-verification', content: 'TvB5BEa-XBjy9F6iDmrTCkAZ7y7d-cvOp2J3ZLE20yw' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'vue3-grid-board' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: `${site}/` },
        { property: 'og:image', content: image },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1280' },
        { property: 'og:image:height', content: '640' },
        { property: 'og:image:alt', content: imageAlt },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
        { name: 'twitter:image:alt', content: imageAlt }
      ],
      script: [{ innerHTML: themeScript, tagPosition: 'head' }],
      link: [
        { rel: 'canonical', href: `${site}/` },
        { rel: 'icon', href: `${base}favicon.ico`, sizes: '16x16 32x32 48x48' },
        { rel: 'icon', href: `${base}favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: `${base}apple-touch-icon-180x180.png` },
        { rel: 'manifest', href: `${base}manifest.webmanifest` }
      ]
    }
  },

  features: {
    inlineStyles: true
  },

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
