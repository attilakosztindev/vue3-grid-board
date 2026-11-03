import type { NuxtModule } from 'nuxt/schema'

export interface ModuleOptions {
  prefix?: string
  css?: boolean
  autoImports?: boolean
}

declare const module: NuxtModule<ModuleOptions>
export default module

declare module 'nuxt/schema' {
  interface NuxtConfig {
    vueGrid?: ModuleOptions
  }
  interface NuxtOptions {
    vueGrid?: ModuleOptions
  }
}
