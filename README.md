<p align="center" style="text-align: center">
  <img src="docs/public/vue3-grid-board-logo.svg" alt="" width="160" height="160">
</p>

<h1 align="center" style="text-align: center">vue3-grid-board</h1>

A draggable, resizable board for Vue 3

**[Documentation and live demos](https://attilakosztindev.github.io/vue3-grid-board/)**

- No dependencies beyond Vue.
- SSR friendly: the layout is already final in the server's HTML, so nothing moves when the page hydrates.
- Every gesture works from the keyboard, and without dragging when you turn on `tapToMove`. Every change is announced to screen readers.

## Install

```bash
pnpm add vue3-grid-board
```

```bash
npm install vue3-grid-board
```

```bash
yarn add vue3-grid-board
```

Vue 3.5 or newer is a peer dependency.

## Importing

With Vite, Nuxt or webpack:

```js
import { GridBoard, GridTile } from 'vue3-grid-board'
```

Without a bundler:

```js
import { GridBoard, GridTile } from 'vue3-grid-board/core'
import 'vue3-grid-board/style.css'
```

### Nuxt module

Register the module instead of importing anything: `GridBoard` and `GridTile` become auto-imports, and the stylesheet is added for you.

```bash
npx nuxi module add vue3-grid-board
```

That adds it to your config, or add it yourself:

```ts
export default defineNuxtConfig({
  modules: ['vue3-grid-board/nuxt'],
  vue3GridBoard: {
    prefix: '',
    autoImports: false
  }
})
```

| Option        | Description                                                                          | Type      | Default |
| ------------- | ------------------------------------------------------------------------------------ | --------- | ------- |
| `prefix`      | Put in front of the component names: `'Ui'` gives `<UiGridBoard>`.                   | `string`  | `''`    |
| `autoImports` | Auto-import the layout helpers too. Off by default, because their names are generic. | `boolean` | `false` |

[Try it on StackBlitz](https://stackblitz.com/github/attilakosztindev/vue3-grid-board/tree/main/examples/nuxt): a minimal Nuxt app with the module.

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { GridBoard, GridTile } from 'vue3-grid-board'

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

## Accessibility

### Keyboard

Focus a tile and press <kbd>Enter</kbd> or <kbd>Space</kbd> to pick it up. Arrow keys move it, <kbd>Shift</kbd> with the arrow keys resizes it. <kbd>Enter</kbd> drops it, <kbd>Escape</kbd> puts it back.

### Without dragging

Set `tap-to-move` on the board, and tiles move with taps instead of a drag: tap a tile, then tap where it should go. Tap its grip, then tap where its corner should go. Tap it again to put it down. It is off by default, so a plain click on a tile does nothing unless you ask for it.

### WCAG 2.2

With `tapToMove` on, the board meets the WCAG 2.2 AA criteria that concern a widget like it:

- Every unfrozen tile is a tab stop, and tabbing away from a picked-up tile drops it.
- Each tile is a group described as "Draggable tile" and named by its position and size, with the keys explained through `aria-describedby`.
- A polite live region announces the pick-up, every move, the drop and a cancel.
- Tiles sit in the DOM by row, then column, so Tab and screen readers follow the layout, and a tile keeps focus when a move reorders it.
- The resize grip is at least 24 by 24 pixels. It and the focus outline are drawn in the tile's text colour, so they are as visible as your text.
- The board's own text is marked as English. Pass `a11y` to give it in the page's language.
- Every animation turns off with the [transition variables](#transitions).

Three things depend on your page: `tapToMove`, or another single-click way to move and resize a tile (2.5.7); the contrast of your tile's text against its background (1.4.3); and `a11y` in the page's language when it is not English (3.1.2).

WAI-ARIA has no pattern for a draggable grid: `aria-grabbed` and `aria-dropeffect` were deprecated in ARIA 1.1, and screen readers ignore them.

### Screen-reader text

The `a11y` prop holds everything the board reads out: the role description, the tile labels, the instructions and the announcements. Keys you leave out keep their English default:

```vue
<GridBoard
  v-model:tiles="tiles"
  :a11y="{
    roleDescription: 'Movable widget',
    tileLabel: ({ name, column, row, w, h }) => `${name}: column ${column}, row ${row}, ${w} by ${h}`,
    pickedUp: 'Grabbed. Use the arrow keys to move it, and Enter to place it.'
  }"
>
```

## Transitions

Tiles, the placeholder and the board height animate. Each takes its timing from a CSS custom property, set on the board or any element above it.

| Variable                       | Times                                               | Default                      |
| ------------------------------ | --------------------------------------------------- | ---------------------------- |
| `--grid-tile-duration`         | A tile moving or resizing into place.               | `220ms`                      |
| `--grid-tile-easing`           |                                                     | `cubic-bezier(0.2, 0, 0, 1)` |
| `--grid-shadow-duration`       | The placeholder showing where a dragged tile lands. | `200ms`                      |
| `--grid-shadow-easing`         |                                                     | `ease`                       |
| `--grid-board-grow-duration`   | The board growing to fit its tiles.                 | `150ms`                      |
| `--grid-board-shrink-duration` | The board shrinking.                                | `200ms`                      |
| `--grid-board-easing`          | Both.                                               | `ease`                       |

A duration of `0ms` turns that animation off:

```css
@media (prefers-reduced-motion: reduce) {
  .grid-board {
    --grid-tile-duration: 0ms;
    --grid-shadow-duration: 0ms;
    --grid-board-grow-duration: 0ms;
    --grid-board-shrink-duration: 0ms;
  }
}
```

## GridBoard

| Prop         | Type                         | Default | Description                                                              |
| ------------ | ---------------------------- | ------- | ------------------------------------------------------------------------ |
| `tiles`      | `Tile[]`                     | —       | Required. The layout.                                                    |
| `columns`    | `number`                     | `12`    | Column count.                                                            |
| `rowHeight`  | `number`                     | `150`   | Row height in pixels.                                                    |
| `gap`        | `number \| [number, number]` | `10`    | Space between tiles. A pair sets the two axes apart.                     |
| `draggable`  | `boolean`                    | `true`  | Whether tiles can be dragged.                                            |
| `resizable`  | `boolean`                    | `true`  | Whether tiles can be resized.                                            |
| `autoHeight` | `boolean`                    | `true`  | Grow the board to fit its tiles.                                         |
| `gravity`    | `boolean`                    | `true`  | Pull tiles upward into free space.                                       |
| `overflow`   | `boolean`                    | `false` | Allow tiles to be dragged past the last row.                             |
| `tapToMove`  | `boolean`                    | `false` | Move and resize tiles with taps instead of a drag (WCAG 2.5.7).          |
| `a11y`       | `Partial<GridA11y>`          | `null`  | The text read to screen readers: labels, instructions and announcements. |

Emits `update:tiles` with the new layout, and `ready` once measured.

Takes one default slot, for the tiles.

## GridTile

| Prop                           | Type               | Description                                     |
| ------------------------------ | ------------------ | ----------------------------------------------- |
| `id`                           | `number \| string` | Required. Matches the tile's `id`.              |
| `x`, `y`, `w`, `h`             | `number`           | Required. Position and size, in grid units.     |
| `minW`, `minH`, `maxW`, `maxH` | `number`           | Resize bounds.                                  |
| `draggable`, `resizable`       | `boolean \| null`  | Override the board, per tile. `null` inherits.  |
| `frozen`                       | `boolean`          | Pin the tile. Others move around it.            |
| `dragHandle`                   | `string \| null`   | Class name of the drag handle, without the dot. |
| `dragIgnore`, `resizeIgnore`   | `string`           | Selectors that will not start a gesture.        |
| `radius`                       | `number`           | Corner radius in pixels.                        |
| `label`                        | `string \| null`   | Screen-reader name for the tile.                |

Emits `dragstart`, `drag`, `dragend`, `resizestart`, `resize`, `resizeend` and `size`.

Slots: `default` for the tile's content, `handle` to replace the resize handle.

## Helpers

`applyGravity`, `copyTiles`, `getLastRow`, `getTileById`, `moveTile` and `validateTiles` are exported for working with a layout outside the board. `usePointerDragResize` is the gesture composable the tiles use. TypeScript types (`Tile`, `TileId`, `Gap`, `GridA11y` and the prop, emit and slot interfaces) ship with the package. `GridBoard` is generic over the tile type, so `v-model:tiles` keeps a `TileWith<T>` type; in a render function, name it: `h(GridBoard<Panel>, …)`.

## Development

This repository is a pnpm workspace: the library at the root, a documentation site in `docs/`.

```bash
pnpm install
pnpm dev
pnpm test
pnpm run build:lib
```

## License

MIT
