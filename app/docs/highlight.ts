import { createHighlighterCoreSync, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import bash from 'shiki/langs/bash.mjs'
import css from 'shiki/langs/css.mjs'
import typescript from 'shiki/langs/typescript.mjs'
import vue from 'shiki/langs/vue.mjs'
import githubDark from 'shiki/themes/github-dark-default.mjs'
import { CODE_FG } from './code-theme'

const THEME = 'github-dark-default'

let highlighter: HighlighterCore | null = null

function get(): HighlighterCore {
  if (!highlighter) {
    highlighter = createHighlighterCoreSync({
      themes: [githubDark],
      langs: [vue, typescript, css, bash],
      langAlias: { ts: 'typescript', sh: 'bash', shell: 'bash' },
      engine: createJavaScriptRegexEngine({ forgiving: true })
    })
  }
  return highlighter
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function highlight(code: string, lang = 'vue'): string {
  const shiki = get()
  if (!shiki.getLoadedLanguages().includes(lang)) {
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
  }

  return shiki.codeToHtml(code, {
    lang,
    theme: THEME,
    transformers: [
      {
        pre(node) {
          node.properties.style = `color:${CODE_FG}`
          delete node.properties.tabindex
        }
      }
    ]
  })
}
