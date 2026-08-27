import { configDefaults } from 'vitest/config'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // Agent worktrees under .claude/worktrees are full checkouts, so the default
    // include glob picks their spec files up as well and the suite runs twice --
    // the second time against a tree that may be mid-edit. Not covered by the
    // default exclude list.
    exclude: [...configDefaults.exclude, '**/.claude/**']
  }
})
