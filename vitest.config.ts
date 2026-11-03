import { configDefaults, defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.spec.ts'],
    // Agent worktrees under .claude/worktrees are full checkouts, so the default
    // include glob picks their spec files up as well and the suite runs twice --
    // the second time against a tree that may be mid-edit. Not covered by the
    // default exclude list.
    exclude: [...configDefaults.exclude, '**/.claude/**']
  }
})
