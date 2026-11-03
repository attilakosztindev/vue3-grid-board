# Vue Grid

A draggable, resizable board for Vue 3. Server-rendered, keyboard-operable, and correct on the first paint.

- No dependencies beyond Vue.
- Renders the final layout on the server. No measure-then-jump on hydration.
- Every gesture has a keyboard equivalent, announced to screen readers.

## Install

The package is published from GitHub, not npm.

```bash
pnpm add github:attilakosztindev/vue3-grid
```

```bash
npm install github:attilakosztindev/vue3-grid
```

Vue 3.5 or newer is a peer dependency.

**On pnpm, allow the build first.** pnpm 10 refuses to build a dependency installed from git, and the install fails. List the package in `pnpm-workspace.yaml`, then install:

```yaml
onlyBuiltDependencies:
  - '@attilakosztin/vue-grid'
```

## Importing

With Vite, Nuxt or webpack:

```js
import { GridBoard, GridTile } from '@attilakosztin/vue-grid'
```

Without a bundler:

```js
import { GridBoard, GridTile } from '@attilakosztin/vue-grid/core'
import '@attilakosztin/vue-grid/style.css'
```

### Nuxt module

Register the module instead of importing anything: `GridBoard`, `GridTile` and the layout helpers become auto-imports, and the stylesheet is added for you.

```ts
export default defineNuxtConfig({
  modules: ['@attilakosztin/vue-grid/nuxt']
})
```

| Option        | Description                                                        | Type      | Default |
| ------------- | ------------------------------------------------------------------ | --------- | ------- |
| `prefix`      | Put in front of the component names: `'Ui'` gives `<UiGridBoard>`. | `string`  | `''`    |
| `css`         | Add the stylesheet to the app.                                     | `boolean` | `true`  |
| `autoImports` | Auto-import the layout helpers.                                    | `boolean` | `true`  |

Set them under `vueGrid` in `nuxt.config`.

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { GridBoard, GridTile } from '@attilakosztin/vue-grid'

const tiles = ref([
  { id: 'a', x: 0, y: 0, w: 4, h: 2 },
  { id: 'b', x: 4, y: 0, w: 4, h: 2 },
  { id: 'c', x: 8, y: 0, w: 4, h: 2 }
])
</script>

<template>
  <GridBoard v-model:tiles="tiles" :columns="12" :row-height="150" :gap="10">
    <GridTile v-for="tile in tiles" :key="tile.id" v-bind="tile">
      {{ tile.id }}
    </GridTile>
  </GridBoard>
</template>
```

Tile positions are yours. The board never mutates the array you pass — it emits `update:tiles` with a new one, which `v-model:tiles` writes back.

## Keyboard

Focus a tile and press <kbd>Enter</kbd> or <kbd>Space</kbd> to pick it up. Arrow keys move it, <kbd>Shift</kbd> with the arrow keys resizes it. <kbd>Enter</kbd> drops it, <kbd>Escape</kbd> puts it back.

## GridBoard

| Prop         | Type                         | Default | Description                                          |
| ------------ | ---------------------------- | ------- | ---------------------------------------------------- |
| `tiles`      | `Tile[]`                     | —       | Required. The layout.                                |
| `columns`    | `number`                     | `12`    | Column count.                                        |
| `rowHeight`  | `number`                     | `150`   | Row height in pixels.                                |
| `gap`        | `number \| [number, number]` | `10`    | Space between tiles. A pair sets the two axes apart. |
| `draggable`  | `boolean`                    | `true`  | Whether tiles can be dragged.                        |
| `resizable`  | `boolean`                    | `true`  | Whether tiles can be resized.                        |
| `autoHeight` | `boolean`                    | `true`  | Grow the board to fit its tiles.                     |
| `gravity`    | `boolean`                    | `true`  | Pull tiles upward into free space.                   |
| `overflow`   | `boolean`                    | `false` | Allow tiles to be dragged past the last row.         |

Emits `update:tiles` with the new layout, and `ready` once measured.

Takes one default slot, for the tiles.

## GridTile

| Prop                           | Type               | Description                                    |
| ------------------------------ | ------------------ | ---------------------------------------------- |
| `id`                           | `number \| string` | Required. Matches the tile's `id`.             |
| `x`, `y`, `w`, `h`             | `number`           | Required. Position and size, in grid units.    |
| `minW`, `minH`, `maxW`, `maxH` | `number`           | Resize bounds.                                 |
| `draggable`, `resizable`       | `boolean \| null`  | Override the board, per tile. `null` inherits. |
| `frozen`                       | `boolean`          | Pin the tile. Others move around it.           |
| `dragHandle`                   | `string \| null`   | Selector for the drag handle.                  |
| `dragIgnore`, `resizeIgnore`   | `string`           | Selectors that will not start a gesture.       |
| `radius`                       | `number`           | Corner radius in pixels.                       |
| `label`                        | `string \| null`   | Screen-reader name for the tile.               |

Emits `dragstart`, `drag`, `dragend`, `resizestart`, `resize`, `resizeend` and `size`.

Slots: `default` for the tile's content, `handle` to replace the resize handle.

## Helpers

`applyGravity`, `copyTiles`, `getLastRow`, `getTileById`, `moveTile` and `validateTiles` are exported for working with a layout outside the board. `usePointerDragResize` is the gesture composable the tiles use. TypeScript types (`Tile`, `TileId`, `Gap` and the prop, emit and slot interfaces) ship with the package.

## Development

This repository is a pnpm workspace: the library at the root, a documentation site in `playground/`.

```bash
pnpm install
pnpm dev
pnpm test
pnpm run build
```

## License

MIT
