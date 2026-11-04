# vue3-grid-board — design notes

Rationale extracted from the source before comments were stripped. Everything here
was established by measurement, not assumption. Read before "optimising" anything
in this folder — several of these are traps that look like obvious wins.

---

## 1. Geometry is CSS-driven

`createStyle` emits `left`/`width` as `calc()` against the container's own `100%`,
and `top`/`height` in pixels derived from the fixed `rowHeight`. Nothing in the
rendered box reads the measured pixel width.

Consequences:

- **A container resize does not need a restyle.** The browser re-resolves the
  `calc()` itself. The `state.containerWidth` watcher therefore only calls
  `createStyle()` when a gesture is in flight (the dragging branch resolves against
  real pixels). It still fires `container-resized`, because the _resolved_ size did
  change even though the emitted strings did not.
  Verified: mounting at width 1000 vs 600 produced byte-identical style strings
  while the rendered width went 238px → 138px.
- The measured width is still needed for gesture math (`calcColWidth`, and through
  it `calcPosition` / `calcXY` / `calcWH`), so it is kept current regardless.

### Inline styles that are load-bearing

- `position: relative` on the layout container and `position: absolute` on tiles are
  applied **inline**, not only via the scoped rules. The scoped CSS ships as a
  separate chunk; on a client-side route change the component can render a frame
  before that stylesheet applies. With no positioned ancestor, every tile would
  resolve against the viewport and the whole grid would pile up at the top-left at
  several times its real width until the CSS landed.
- `touch-action: none` is likewise inline — without it the browser claims the touch
  gesture and scrolls the page instead of dragging. It is emitted as an empty object
  (not `auto`) when gestures are off, so a consumer's own `touch-action` is never
  clobbered. The `.no-touch` class remains part of the documented class contract.

---

## 2. Why DevTools specifically breaks dragging

Chrome normally coalesces `mousemove`/`pointermove` to one dispatch per frame:
`MainThreadEventQueue` treats them as rAF-aligned, drains the queue just before the
frame's rAF callbacks, and exposes the skipped hardware samples via
`getCoalescedEvents()`.

It stops doing this whenever a debugger is attached. Opening DevTools makes the
frontend issue `Overlay.enable` on the page target **unconditionally** — every
panel, not just Elements. `InspectorOverlayAgent::enable()` responds with
`SetNeedsUnbufferedInputForDebugger(true)`, which makes `IsRafAlignedEvent()` return
false for `kMouseMove`. Every hardware sample then arrives as its own task: 125 Hz on
an ordinary mouse, up to 1000 Hz on a gaming one, against a 144 Hz display.

That is why dragging felt broken with the console open while everything else on the
page stayed smooth, and why `usePointerDragResize` does its own batching rather than
relying on the browser's.

**The coalescing is deliberately leading-edge.** The first move of a frame is emitted
synchronously inside the input handler; only the surplus behind it is folded into one
catch-up emit at the top of the next frame. Deferring _every_ move to rAF — the
obvious way to write it — bounds the work equally well but costs a guaranteed extra
frame of input-to-paint latency on every move. That does not show up as dropped
frames; it shows up as the tile sitting one frame behind the pointer for the whole
gesture, which reads as lag even at a rock-solid 144 Hz.

Related: with a debugger attached, scheduling a callback is not free either — the
inspector captures an async stack trace (depth 32) at the point every rAF is posted.
Hence the auto-scroll loop only spins up when the pointer is actually inside an edge
band, instead of scheduling a frame on every move that wakes up and finds nothing to
scroll.

---

## 3. The drag fast path

A gesture emits a frame on every pointer move, but the _layout_ only changes when the
tile crosses into a different cell — empirically about one frame in eight.

- `onDragEvent` / `onResizeEvent` in the container bail out early when the cell and
  shadow box are unchanged. Otherwise the collision pass, compaction, height
  recalc and the clone + `update:tiles` emit (which re-renders the consumer's whole
  page) all run and produce byte-identical results.
- `writeDragOffset` handles the non-crossing frames in the tile: exactly one thing
  has changed (how far the tile is offset from a slot that is standing still), so it
  writes `transform` straight to the element and skips the framework round trip.

What that round trip costs per frame when not skipped: a reactive set, a scheduler
microtask, the render function, a vnode, `normalizeStyle` merging the `:style` array
into a fresh object, and Vue's `patchStyle` — which does **not** diff per key. It
rewrites all nine declarations every time (two regex tests and a prefix lookup each,
plus the slow `setProperty` path for the custom property) to change one of them.

`writeDragOffset` mutates the **raw** style object (`rawStyle`), not `state.style`.
Vue's proxy is what triggers the render effect; the raw target is not observed. The
upshot is that if some _other_ change does re-render the tile mid-drag, the render
emits the current transform rather than a stale one.

This is also what separates the drag from the drop. The drop stays smooth with
DevTools open because it consumes no input events (so the unbuffered-input behaviour
above does not apply) and per frame does nothing but interpolate a transform.

### `createStyle` early-out

`createStyle` is called from eight places (mount, five watchers, both gesture
handlers) and several routinely produce output identical to what is already on the
element. Assigning `state.style` is what triggers the render effect, so `sameStyle`
compares first. Mount alone used to render every tile three times for one visible
result.

This is safe because `rawStyle` is an accurate mirror of the element's inline style —
`writeDragOffset` keeps its `transform` in step with the direct DOM write.

Measured at mount: renders per tile **3 → 1** (`patchStyle` calls 93 → 31 for 30
tiles, 453 → 151 for 150; the +1 is the shadow).

### Other gesture-path costs removed

- **Text selection.** Suppressed by cancelling `selectstart` for the duration of the
  gesture, not by toggling `user-select` on `<body>`. `user-select` is inherited, so
  each flip invalidates the computed style of every element in the document — twice
  per gesture, and the expensive one lands in the frame where the drag has to feel
  instant.
- **Container height.** `height` is a layout property, so transitioning it is a
  main-thread animation: a style recalc plus a layout of the container and a reflow
  of everything after it, every frame. During a gesture the height changes every time
  the tile crosses a cell, which restarts the transition back-to-back for the whole
  drag. It used to be switched off mid-gesture for that reason, which made the board
  jump a row at a time; it now runs during gestures too, by choice. Growing uses
  `--grid-board-grow-duration` (150ms) and shrinking `--grid-board-shrink-duration`
  (200ms): `boardStyle` sets the grow duration inline whenever the new height is the
  larger one. Growing faster keeps the board close behind a shadow that has just
  reached a new row, though a container that clips can still cut the shadow off for
  those 150ms. `0ms` brings the snapping back.
- **Gesture frame caching.** `getControlPosition` reads `offsetParent`,
  `scrollLeft`/`scrollTop` and a bounding rect — three synchronous layout flushes per
  frame. The answer only changes if something scrolls or resizes, so it is measured
  once at gesture start and refreshed only on `scroll` (capture, so ancestor
  containers count) or `resize`.
- **Viewport size.** `innerWidth`/`innerHeight` can flush pending layout, so they are
  sampled once per gesture rather than per frame.

---

## 4. The settle animation

`settleFrom` slides a tile from where it was to the slot it now occupies as a
composited transform that decays to zero.

It is deliberately a **Web Animation and not a CSS-transition FLIP**. A FLIP has to
force the start frame to commit (`void el.offsetWidth`) before flipping to the
target, and resuming an interrupted one has to read the live matrix back out
(`getComputedStyle().transform`). Both are synchronous style/layout flushes, landing
once per displaced neighbour per cell crossing — and with DevTools attached every
such flush is instrumented and costs a multiple of its normal price.

`composite: 'add'` removes the need to know where an interrupted animation got to:
each hop animates its own delta to zero and they sum, so a tile displaced again
mid-flight simply picks up a second offset that also decays.

> **Caveat before "optimising" this:** `composite: 'add'` disqualifies the animation
> from the compositor. Blink's `CompositorAnimations` rejects any keyframe effect
> whose composite mode is not `replace`
> (`kEffectHasNonReplaceCompositeMode`), so this ticks on the main thread. That is a
> deliberate trade — transform-only means style recalc and compositing but no layout
> and no repaint — whereas `replace` would need the live matrix read back on every
> interruption, which is exactly the forced-flush pattern that made dragging stutter
> in the first place.

Because animations composite with `add`, a settle left running from a previous
gesture would stack its offset onto the next one. `clearSettle()` exists for that.

The duration and easing come from `--grid-tile-duration` and `--grid-tile-easing`,
falling back to 220ms and `cubic-bezier(0.2, 0, 0, 1)`. Reading a custom property is
a `getComputedStyle` call, which is a forced style flush when styles are dirty — the
same cost that rules out the CSS FLIP above. So the board reads them once, from its
own element, and caches the result until the next animation frame
(`settleTiming`); every tile displaced in that frame reuses it. That is also why the
variables have to be set on the board or an ancestor rather than on a single tile.
A duration of `0` skips the animation, and an easing that `CSS.supports` rejects
falls back to the default.

`raise` lifts the tile above its neighbours: right for the tile you just dropped
(`state.raised` → `.settling`, `z-index: 100`), wrong for a tile merely being pushed
out of the way.

`left`/`top` are **not** transitioned in the scoped CSS, precisely because this FLIP
is what animates repositioning. Transitioning them would run a second, main-thread
animation of the same movement and fight it.

---

## 5. The shadow

The shadow is a ghost `GridTile` rendered by the container with `shadow`
set. It is a readout of where the dragged tile will land, so it is never interactive
— no resize handle, no pointer controller.

It **glides**, but not with the FLIP the tiles use. The position watcher in
`grid-tile.vue` returns early on `props.shadow` before it reaches `settleFrom`;
the movement comes from a plain CSS transition on `left` / `top` / `width` / `height`
in the shadow rule, timed by `--grid-shadow-duration` and `--grid-shadow-easing`. §15 has the measurements, but the two reasons are:

1. **A transition converges, a FLIP does not.** The shadow re-targets every time the
   pointer crosses a cell, which is far more often than a 220ms glide can finish. A
   transition always interpolates from the value currently painted, so an interrupted
   glide just heads for the new slot. The FLIPs composite additively and were never
   cancelled, so they piled up instead.
2. **The hand-over suppresses itself.** The shadow is `display: none` between
   gestures (`v-show="state.isDragging"`), and a transition never runs on an element
   that was not rendered on the previous frame. So the one movement it must never
   animate — the jump at `dragstart` from whatever slot the _previously_ dragged tile
   left it in — costs nothing to prevent. An older version glided it with a FLIP and
   needed a `gestureId` / `shadowGesture` hand-over protocol for exactly this; that
   machinery is gone and should not come back.

### Stacking

The shadow carries **`z-index: 1`**, which puts it in the only band that works:

| element                                                                                                     | z-index | vs. the shadow |
| ----------------------------------------------------------------------------------------------------------- | ------- | -------------- |
| an idle tile, including one reflowing out of the way                                                        | `auto`  | shadow on top  |
| the shadow                                                                                                  | `1`     | —              |
| any active tile (`grid-tile--dragging`, `grid-tile--grabbed`, `grid-tile--resizing`, `grid-tile--settling`) | `100`   | tile on top    |

It has to be **above idle tiles** because it is translucent (`opacity: 0.2`) — under
them it simply vanishes whenever a tile glides across it. It has to stay **below the
active band** so the tile under the cursor is never covered by its own shadow.

Anything strictly between `0` and `100` would do; the spec asserts the relationship
rather than the literal `1`.

It also renders before `<slot />` in the container template, but nothing depends on
that any more — it is just where a backdrop belongs. Paint order is settled by
`z-index`, not by DOM order.

---

## 6. Frozen handling

**There are two different "frozen" concepts, and they are not linked.**

- `tile.frozen` in the **layout data** drives the algorithm in `helpers/helpers.js`:
  `applyGravity` skips it, `moveTile` returns early on it, collisions branch on it, and
  `validateTiles` type-checks it.
- The `frozen` **prop** on `<GridTile>` only controls grabbability and whether the
  resize handle renders.

Flipping only the prop leaves the tile still movable by its neighbours' collisions.

### Mid-gesture transitions

`draggable`/`resizable` are live — the grid can be toggled between static and
interactive at runtime, both as props and over the `setDraggable`/`setResizable` bus.
The pointer engine is therefore attached and detached by a watcher, not built once at
mount (a fully static grid used to build a controller and bind a `pointerdown`
listener per tile that could never do anything).

Three things cooperate so a gesture in flight can still terminate when the tile goes
static underneath it:

- `usePointerDragResize.destroy()` emits `${mode}end` for an in-flight gesture instead
  of dropping it. Everything switched on at `${mode}start` — the dragging class, the
  inline transform, the container's shadow — is only ever switched back off by
  `${mode}end`, so a controller that disappears mid-drag would strand the tile
  floating under the cursor forever. Reachable two ways: the grid toggled to static
  during a drag, and the tile unmounting during one.
- `handleDrag` and `handleResize` exempt the terminating event from their
  `props.frozen` guard. A bare `props.frozen` check swallows its own `dragend`.

---

## 7. Board ↔ tile contract

- `props.layout` echoes back the exact array the container just emitted (v-model
  preserves the reference), so the watcher compares against `lastEmittedLayout` and
  skips its own echo. Otherwise every pointer frame would re-validate and re-compact.
- `emitContainerResized` computes the pixel size via `calcPosition` rather than
  parsing `state.style`. The rendered `width` is a `calc()` for a normal tile and
  `auto` for an unbounded one, so the old string-parsing version bailed on `width`
  before it ever looked at `height` — it only ever worked mid-resize-gesture, the one
  moment `width` happens to be plain pixels. An unbounded tile (`w`/`h` of `Infinity`)
  has no size to report and stays silent.

### There is no event bus

The two directions are not symmetric, and were wrong to be carried by one mechanism.

**Board → tile is state, not events.** `columns`, `rowHeight`, `gap`, `draggable`
and `resizable` used to be _pushed_ down a `mitt` bus (`setColumns`, `setRowHeight`,
`setDraggable`, `setResizable`, `updateWidth`), each landing in a mirror field on the
tile's `reactive` state. That is a hand-rolled reactivity system running on top of
Vue's. The board now `provide`s its live `props`, `state` and `gap` under a Symbol
key, and the tile reads them through `computed`s. Five broadcast events, five mirror
fields, five subscriptions and their `off()` teardown all disappeared, and the tile
can no longer miss an update by mounting in the wrong order — the old
`onMounted` block that re-read every value existed only to paper over that race.

**Tile → board is a call, not a broadcast.** The same context carries `dragEvent`,
`resizeEvent` and `announce`. A bus implies many listeners; there was always exactly
one, and the tuple was already shaped like a function call.

**`dispatch()` replaces the exposed `emitter`.** Emitting on a bus from outside meant
the public API was "anything anyone happens to listen for". `dispatch` is a closed
set — `dragEvent`, `resizeEvent`, `announce`, `measure` — and throws on anything
else. `measure` is the one genuinely new capability: it re-reads `offsetWidth` for
callers whose container changes size in a way `ResizeObserver` misses, and it is how
the specs give a board a width in a DOM where `offsetWidth` is always `0`.

**The pair is now enforced.** `GridTile` throws if it cannot inject the board. It has
never been usable alone — it read `board.props.columns` for its own geometry — but it
used to fail by silently laying itself out against defaults of 1 column and 30px rows.

---

## 8. Benchmarks

Production build, median of 5, identical DOM, both variants Vue-rendered.
"CSS grid" is a plain `grid-template-columns: repeat(12, 1fr)` reference implementation.

| tiles | CSS grid | fork before | fork after | ratio before → after |
| ----- | -------- | ----------- | ---------- | -------------------- |
| 12    | 1.4 ms   | 8.8 ms      | 4.6 ms     | 6.3× → 3.3×          |
| 30    | 2.8 ms   | 22.3 ms     | 14.5 ms    | 6.8× → 5.2×          |
| 60    | 4.4 ms   | 39.2 ms     | 24.7 ms    | 7.3× → 5.6×          |
| 150   | 10.6 ms  | 113 ms      | 88 ms      | 10.6× → 8.3×         |

- Static mode was originally identical in cost to dynamic (the "lightweight" toggle
  bought nothing). After the lazy pointer engine it is ~10% cheaper (88 vs 97.8 ms at
  150 tiles).
- DOM nodes at 150 tiles: CSS grid 601, fork static 602, fork dynamic 753.
- The remaining 5–8× is per-component cost (a 25-key reactive state, 7 watchers, 5 bus
  subscriptions and 2 computeds per tile) plus `applyGravity()`'s O(n²) pass.

### Gravity off the reactive path

Profiling a keyboard move on 500 tiles put 80% of the time in `applyGravity()`: 40% in
`firstOverlap()` scanning every settled tile for every row a tile fell, and 38% in Vue's
proxy `get`, because the pass ran on `state.tiles` itself. The board now runs gravity
and moves on a plain copy of the array (`toRaw(...).slice()`) and assigns it back once,
which triggers the same dependents. `fall()` first keeps the settled tiles that share
a column with the falling tile, in their original order, so `firstOverlap()` returns
the same tile it did before; a randomized comparison against the previous helpers
(20,000 layouts, 320,000 checks) found no difference.

Chromium, production build, median of 5, default props:

| tiles | mount       | replace all | key move    | drag, per pointer move |
| ----- | ----------- | ----------- | ----------- | ---------------------- |
| 20    | 16.7 → 18.9 | 7.6 → 8.3   | 4.4 → 3.8   | 1.8 → 1.6              |
| 100   | 52.3 → 45.0 | 34.5 → 29.9 | 26.8 → 14.8 | 17.7 → 10.9            |
| 500   | 374 → 168   | 338 → 146   | 400 → 79    | 325 → 30               |

At 20 tiles the difference is within run-to-run noise. `tapToMove` and
`overflow` cost nothing measurable either way; a static board (no drag, resize, gravity
or auto-height) skips the pointer listener, the grip and the tab stop.

---

## 9. Known latent issue

`getControlPosition` in `helpers/helpers.js` was written to special-case an `offsetParent` of
`document.body`, but the test was `e.offsetParent === document.body` — `e` is the
event, which has no `offsetParent`, so the test was always false and the branch was
dead. The dead branch has been removed, preserving existing behaviour exactly
(always use `getBoundingClientRect()`). If the body special-case was actually
intended, the correct test is `offsetParent === document.body`; restoring it would be
a **behaviour change**, so it was left alone.

Note this is only a fallback path — `controlPosition` uses the cached gesture frame
whenever a gesture is in flight.

---

## 10. Keyboard drag and resize

Upstream the grid is pointer-only, which fails WCAG 2.1.1 _Keyboard_ (A) and
2.5.7 _Dragging Movements_ (AA). The fork now ships a keyboard controller alongside
the pointer one.

### Key map

| Key                                 | While idle        | While grabbed             |
| ----------------------------------- | ----------------- | ------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | pick the item up  | drop it where it is       |
| <kbd>↑↓←→</kbd>                     | _not intercepted_ | move one cell (see below) |
| <kbd>Shift</kbd> + <kbd>↑↓←→</kbd>  | _not intercepted_ | resize by one column/row  |
| <kbd>Esc</kbd>                      | —                 | restore the original slot |

Arrow keys are deliberately inert until the item is grabbed, so a merely-focused tile
never steals page scroll. `preventDefault()` is only called on keys the controller
actually consumes.

### Why it needed no new geometry

The pointer engine already funnels everything through two tuples that are
expressed in **grid units, not pixels**:

```
board.dragEvent(  ['dragmove',   id, x, y, h, w])
board.resizeEvent(['resizemove', id, x, y, h, w])
```

The keyboard path emits the _same_ tuples, so collision resolution, `applyGravity()`, the
shadow, `update:tiles` and every consumer event work unchanged. No pixel math,
no second code path through `calcXY` / `calcWH`.

It also deliberately does **not** set the item's own `state.isDragging`. That leaves
the existing `[x, y, w, h]` props watcher free to FLIP-animate the tile between slots,
so keyboard moves glide exactly like pointer moves for free.

### Vertical moves step past their neighbour

With gravity on, a one-row step is almost always undone by the board: moving a tile down onto
the tiles beneath it pushes them down, and `applyGravity()` then floats everything back to
where it started. Moving up fails too: `moveTile()` only displaces the tile above once the
moving tile's top edge comes within a quarter of that tile's height of its top, so a one-row
step just overlaps it and `applyGravity()` drops the moving tile back below. A pointer drag
never notices, because the pointer keeps travelling until the tile overlaps far enough to swap.

So `keyMoveBy()` asks `findKeyboardSlot()` for its target instead of adding one to `y`. It
replays the move on a copy of the layout with the same `moveTile()` and `applyGravity()` the
board runs, one cell further each time, and returns the first slot that changes anything. The
board then receives one ordinary `dragmove` tuple for that slot. With gravity off the first
step always changes the layout, so moves stay exactly one cell.

### Lazy gesture start

`grab()` only sets `state.grabbed`; it does not open a gesture. The `dragstart` /
`resizestart` is emitted by the first arrow press (`beginKeyGesture`), which is what
decides whether this is a move or a resize. Consequences:

- Grab-then-drop with no arrow press emits nothing at all, so no spurious
  `update:tiles` and no shadow flash.
- Switching from moving to resizing mid-grab closes the drag gesture and opens a
  resize one.

That second point is why `cancelGrab()` cannot simply reverse the _current_ gesture —
the earlier one is already committed. It instead diffs the live slot against
`grabOrigin` and replays whichever channels are needed, **size first, then position**,
so the width clamp (`cols - x`) is evaluated against the original width.

### Announcements

`grid-board.vue` owns one visually-hidden `role="status" aria-live="polite"` region
and listens for an `announce` event on the bus. Identical consecutive messages get a
trailing zero-width space appended, otherwise a repeated string is not re-announced
(e.g. pressing <kbd>↓</kbd> on the bottom tile, which is a legitimate no-op).

Each tile carries `role="group"`, `aria-roledescription="Draggable grid item"`, a live
`aria-label` ("Item 0, column 5, row 1, 4 wide, 2 tall") and an `aria-describedby`
pointing at a single shared instructions paragraph — one `useId()` per grid, not per
tile.

Static tiles, non-interactive grids and the shadow get no `tabindex` and no ARIA;
the shadow is additionally `aria-hidden`, as is the resize handle.

### Moving without dragging

It is opt-in, through `tapToMove` on the board. With it on by default, a plain click
changed a tile's state, which surprised mouse users who were only clicking, so the page
decides. Without the prop the tile ignores taps, and the instructions leave out the
`tapInstructions` sentence.

WCAG 2.5.7 asks for a single-pointer alternative to every drag, and keyboard support
does not count. A press that never passes the drag threshold is reported by the pointer
engine as a tap (`onTap`, only on a real `pointerup`, after `teardown`). The tile then
picks itself up through the same `grab()` as <kbd>Enter</kbd>, and registers with the
board as the tile waiting to be placed (`startPlacing`). The next tap anywhere on the
board lands in the board's capture-phase `click` handler, which turns the coordinates
into a cell (`cellAt`) and hands it to the tile's `placeAt`: the top-left for a tap
that started on the body, the bottom-right corner for one that started on the grip.
`placeAt` runs the move through the keyboard's gesture path, so the events, gravity and
announcements match.

Three details keep it from fighting the rest:

- The board cancels `mousedown` in the capture phase while a tile waits, unless the
  press is on that tile. Otherwise the press would move focus off the waiting tile,
  its `blur` would put it down, and the `click` would find nothing to place.
- A tap on another tile does not pick that one up while a tile waits
  (`placingId`); it falls through to the board's `click` and places the waiting tile
  there. A pointer drag of any tile puts the waiting one down (`cancelPlacing`).
- Taps on controls inside a tile (`a, button, input, select, textarea, label,
[contenteditable]`) are left to the control, whatever `dragIgnore` says.

### Screen-reader text

Every string the board reads out comes from the `a11y` prop, merged over English defaults.
`tileLabel` receives a 1-based column and row. Without the prop, the instructions and
the live region carry `lang="en"` (WCAG 3.1.2); with it, they inherit the page's
language. The tile's `aria-label` and `aria-roledescription` are attributes, which
`lang` cannot mark without also marking the tile's content, so on a page that is not in
English only `a11y` fixes them.

### Focus survives a reorder

Tiles are rendered in reading order, which is frozen while the board is busy and
recomputed once the gesture ends. A drop that changes the order makes Vue move tile
elements, and moving the focused element out of the document and back in drops its
focus to `<body>` — after a keyboard drop the user lost their place, and the next key
went nowhere. `onBeforeUpdate` remembers the focused element if it is inside the
board, and `onUpdated` focuses it again (`preventScroll`) when focus has fallen to
`<body>`. It never takes focus from anything else, so tabbing away or clicking
elsewhere mid-update is left alone.

### Focus after a removal

Removing a tile is the app's job, usually through a button inside the tile; the board
has no key for it, because that button already works from the keyboard and a stray
Backspace with no undo is worse than one more Tab. What the board does is keep the
user's place: `onBeforeUpdate` also snapshots the tile elements in reading order when
focus is inside the board, and if the focused element is gone afterwards, `onUpdated`
focuses the next tab stop after its tile, or the nearest one before it. If no tile is
left, focus stays with the browser. An app that wants the removal read out can send it
through `dispatch('announce', …)`.

---

## 11. A dragged tile must not be clipped by an ancestor

A tile in flight is `position: absolute` with a `translate3d` offset that tracks the
cursor without clamping — it is _supposed_ to leave the grid's box. Nothing in the
fork clips it, but **any ancestor with `overflow` other than `visible` will**, and the
tile then vanishes at that ancestor's edge mid-drag.

This bit the docs page: `DocExample.vue`'s card used `overflow-hidden` purely to keep
the header bar and the code panel inside the rounded border. Since `overflow` clips
every descendant, it also ate the dragged tile.

The fix is not to clip at the card at all. `border-radius` already clips an element's
**own background and border** without clipping overflowing children, so rounding moved
onto the panels themselves:

- card root: `rounded-xl border` (no `overflow-hidden`)
- header bar: `+ rounded-t-xl`
- preview panel: `+ rounded-b-xl`
- code panel: `+ rounded-b-xl` (keeps its own `overflow-auto` — it never contains a grid)

Only one of the two body panels is ever visible, so the bottom corners are always
supplied by whichever is showing.

### The scrollbar this uncovers

Once the tile can escape, dragging it toward the right edge extends the document's
scrollable width and pops a horizontal scrollbar mid-drag. That is worse than the
original bug: the scrollbar steals viewport height, which fires the grid's
`ResizeObserver` and makes the layout jitter under the cursor.

`#__nuxt` therefore gets `overflow-x: clip` (in `app/assets/css/main.css`). Clipping
now happens at the viewport edge rather than at the card, which is roomy enough that a
tile never visibly disappears while under the cursor.

`clip` is load-bearing here, not a synonym for `hidden`:

- `overflow-x: hidden` would force `overflow-y` to compute to `auto`, turning `#__nuxt`
  into a scroll container and breaking page scrolling and `position: sticky`.
- `overflow-x: clip` leaves `overflow-y: visible` genuinely visible. Verified computed:
  `clip/visible`.

It also has to sit on `#__nuxt` rather than on `html`. Overflow on the root element is
supposed to propagate to the viewport, but Chrome does not honour `clip` that way —
with `html { overflow-x: clip }` the page still scrolled horizontally to 730px during
a drag. On a normal element it clips as expected (measured `scrollX` frozen at 0 with
a tile 412px past the card's right edge).

---

## 12. Edge auto-scroll must opt out of CSS `scroll-behavior`

`runAutoScroll` in `usePointerDragResize.js` used to call:

```js
window.scrollBy(dx, dy)
```

Per CSSOM View, the two-argument form is equivalent to `behavior: 'auto'`, and `auto`
resolves to the **CSS `scroll-behavior` of the scrolling box**. This app sets
`html { scroll-behavior: smooth }` for the docs anchor navigation, so every auto-scroll
tick was queuing an _animated_ scroll rather than applying an instant delta — each new
frame superseding the previous animation, so the page crawled instead of tracking the
cursor.

Measured on the live page, same call, only the CSS differing:

| `scroll-behavior` | `window.scrollBy(0, 18)` immediate delta |
| ----------------- | ---------------------------------------- |
| `smooth`          | **0 px**                                 |
| `auto`            | 18 px                                    |

`scrollBy(0, 18)` under `smooth` is indistinguishable from an explicit
`behavior: 'smooth'` call. Fixed by naming the behaviour instead of inheriting it:

```js
window.scrollBy({ left: dx, top: dy, behavior: 'instant' })
```

After the fix, holding the pointer 40 px into the 60 px edge band scrolls 12 px/frame,
exactly matching `speed()`'s `(40 / 60) * MAX_SPEED` ramp (252 px over 20 frames).

Two things made this easy to miss:

- The `prefers-reduced-motion: reduce` block in `main.css` sets `scroll-behavior: auto`,
  so the old code worked **by accident** for reduced-motion users. The bug only appeared
  for everyone else.
- It is invisible until a consumer sets `scroll-behavior: smooth`. A grid dropped into a
  page without it behaves fine, so the fork looked correct in isolation.

`behavior: 'instant'` is the only correct value here — `'auto'` is what re-introduces the
bug, since it defers to the CSS.

## 13. The dragged tile must win exact position ties in `applyGravity`

Dragging the full-width item 6 up past the side-by-side items 4 and 5 used to split them:
item 4 ended up **above** item 6 and item 5 an entire band **below** it. Dragging all the
way up corrected itself, so it read as a feel problem. It was not — symmetric input was
producing asymmetric output.

Starting board (`columns: 12`):

```
1(0,0,2x3)  2(2,0,6x3)  3(8,0,4x3)
4(0,3,6x4)              5(6,3,6x4)
6(0,7,12x3)
```

`moveTile` is symmetric and behaves correctly: dragging item 6 to `y4` pushes **both**
item 4 and item 5 to `y4`. But item 6 is at `y4` too, so all three overlap and the pile is
handed to `applyGravity()` to untangle.

`applyGravity()` resolves collisions in `sortByRowThenColumn` order, and that comparator
had no tie-break:

```js
if (a.y === b.y && a.x === b.x) return 0
```

Items 4 and 6 are both at exactly `(x0, y4)`, so the tie fell through to array order and
item 4 went first. From there the cascade is forced: item 4 floats to `y3`, which blocks
item 6 down to `y7`, which blocks item 5 down to `y10`.

The tie is load-bearing — a control run with item 4 moved to `x1` makes item 6 sort first
and yields the correct result, confirming the outcome hinged on two items coincidentally
sharing an exact coordinate rather than on anything about the gesture.

Fix: `applyGravity` takes an optional `priorityId`, and the item under the cursor wins exact
`(y, x)` ties. `grid-board.vue` passes the gesture's `id` from both `onDragEvent` and
`onResizeEvent`.

```js
if (a.y === b.y && a.x === b.x) {
  if (priorityId !== undefined) {
    if (a.i === priorityId) return -1
    if (b.i === priorityId) return 1
  }
  return 0
}
```

Item 6 dragged to `y4`, before and after:

|        | result                         |
| ------ | ------------------------------ |
| before | `6@y7` with `4@y3` and `5@y10` |
| after  | `6@y3` with `4@y6` and `5@y6`  |

`y4` now matches `y3`/`y2`/`y1`, so the drag is continuous instead of snapping back a band
mid-gesture.

Scope of the change, swept over every item dragged to every `(x, y)` on this board:
**2 of 462 cases change (0.4%)**, and both are the bug. Neither version leaves overlapping
tiles, so the tie-break only picks a winner where the old code picked one arbitrarily.

Two things worth keeping in mind:

- A tie-break is the whole fix. Compacting the dragged item **globally first** was tried
  and rejected — it lets item 6 float to `y0` and wrongly shoves items 1, 2 and 3 down.
  Priority must apply only to exact ties, not to ordering in general.
- The related `moveTile` heuristic `l.y - collision.y > collision.h / 4` is still there
  and unchanged. It governs when a partial overlap counts as a push, and is not what
  caused this.

## 14. The shadow must be read after the move, not before

The shadow lagged the drag by exactly one frame: it showed the slot the item was
_leaving_ rather than the one it was landing in, and only caught up once the pointer
moved again. Holding still left it wrong indefinitely, and at drag end the item settled
somewhere the shadow had never been.

`onDragEvent` assigned the shadow from the live layout item **before** applying the
move to that same object:

```js
const l = getTileById(state.tiles, id)
state.shadow = { ...state.shadow, x: l.x, y: l.y, w, h } // l is still where it was
state.tiles = moveTile(state.tiles, l, x, y, true, false) // now l.x / l.y change
applyGravity(state.tiles, props.gravity, id) // and compaction can change l.y again
```

`moveTile` mutates `l` in place and `applyGravity` can move it again afterwards, so by the
end of the handler `l` held the real slot — but the shadow had already been snapshotted
from the pre-move values. Fix: assign it last, off the settled `l`.

The giveaway is that the shadow could **overlap a real tile**, which is impossible for a
compacted layout and therefore proves the shadow had drifted out of sync with
`state.tiles`. Sweeping every item across every slot on the reference board:

|        | drag frames | shadow showing the wrong slot | shadow overlapping a tile |
| ------ | ----------- | ----------------------------- | ------------------------- |
| before | 462         | 429 (92.9%)                   | 19                        |
| after  | 462         | 0                             | 0                         |

Confirmed the same way on a live board by driving synthetic pointer events and comparing
`state.shadow` against `state.tiles` frame by frame — 6 mismatches and one
tile-overlap before, none after.

`onResizeEvent` had the same shape: it took the shadow's `x`/`y` straight from the
event arguments, but `applyGravity` runs afterwards and can still move the item, so those
coordinates could be stale too. Both handlers now read the shadow as the last thing
they do.

Worth remembering when touching these handlers: `l` is a **live reference into
`state.tiles`**, not a copy. Anything read off it before `moveTile`/`applyGravity` is a
snapshot of the past.

---

## 15. Shadow stacking, and two ways to measure it wrongly

Symptom: "the shadow sometimes slightly crossing other grid items", later followed by
"now the shadow slips beneath them". Both are the same axis — where the shadow sits in
the stacking order — and the answer is the band in §5: above idle tiles, below active
ones.

The original bug was `z-index: 2` on the shadow against `z-index: 100` on the dragged
tile but **`auto` on tiles merely reflowing out of the way** (they settle with
`raise = false`, so they never get `.settling`). So the shadow painted over the very
tile gliding aside to make room for it. The first attempt over-corrected — dropping
the z-index entirely put the shadow under _everything_, and since it is translucent it
disappeared instead. `z-index: 1` is the fix: one band above idle tiles, still two
orders of magnitude below the active band.

### Stacked FLIPs (separate, real, fixed)

`settleFrom` animations use `composite: 'add'` and nothing cancelled the previous one,
so re-targeting mid-flight summed the legs instead of replacing them — up to **4** live
at once. `settleFrom` now measures the offset an in-flight settle is still painting,
folds it into the new delta, and cancels the old animation. After the fix a tile never
has more than one live settle and always comes to rest at exactly `transform: none`.

### Two measurement traps, both of which produced confident nonsense

Automation runs with the tab hidden, and that breaks two things independently:

1. **The document timeline is frozen**, so every WAAPI animation sits frozen at its
   first keyframe. Measuring drift like that reported 700–2000px excursions that do
   not exist. Fix: advance `anim.currentTime` by hand, ~16ms per simulated frame.
2. **`scroll-behavior: smooth` never lands** (same root cause as §12), so scrolling the
   grid into view silently does nothing. `document.elementFromPoint` only hit-tests
   inside the viewport and returns `null` outside it — which reads as "no paint-over
   found" no matter what is on screen. An entire 4300-probe run scored a clean zero
   purely because the grid was 1660px below the fold. Fix: set
   `scrollBehavior = 'auto'`, scroll with `behavior: 'instant'`, and **count skipped
   probes** so a vacuous run cannot masquerade as a passing one.

A third, milder trap: tiles have a 22px `border-radius`, so a probe at the centre of a
thin overlap sliver lands in a rounded corner and hit-tests through to whatever is
behind. That alone accounted for 18 apparent "shadow is underneath" results. Only probe
overlaps wider than twice the radius.

### Results

Serpentine drag across every slot of every item, adjacent cells only, ~1 cell per
100ms, grid parked in view, corner-safe probes:

| probe                                   | result                                   |
| --------------------------------------- | ---------------------------------------- |
| shadow above an idle tile it overlaps   | 91 / 91                                  |
| shadow above the tile being dragged     | 0 / 12 (correct — the tile stays on top) |
| tile z-index during a real pointer drag | 100 vs the shadow's 1                    |

The dragged-tile row needs a **real** pointer drag: driving `dispatch('dragEvent', …)`
directly never adds `.vue-draggable-dragging`, so the tile keeps `z-index: auto` and the
shadow appears to cover it. That is a harness artefact, not a bug — dispatch real
`PointerEvent`s to check anything that depends on gesture classes.

### Regression coverage

`test/grid-shadow.spec.ts` stubs `el.animate` on the shadow and asserts
it is never called (the shadow glides by transition, not FLIP), and parses the SFC
stylesheet to assert the shadow's z-index is above 0 and below the dragging one. It
reads the stylesheet because scoped SFC styles are not injected under test, so a
computed-style assertion would silently pass on an empty string.

---

## 16. `GridBoard` is typed as a generic component

`index.d.ts` declares `GridBoard` as a generic function signature, the shape vue-tsc
generates for `<script setup generic="T">`, not as a `DefineComponent`. A
`DefineComponent` cannot carry a type parameter, so its `update:tiles` and `ready`
were typed `Tile[]`, and `v-model:tiles` on a `TileWith<T>[]` ref failed under
`strictTemplates`: Vue compiles the binding to `tiles = $event`, and a `Tile[]` cannot
be assigned to the narrower array. Default template checking never looks at that
assignment, which is why it went unnoticed.

The signature infers `T` from the `tiles` prop and types both events with it. The
runtime component is untouched. `h()` cannot infer a generic component's parameter
through its overloads and falls back to `Tile`, as the old declaration did; a render
function names it instead: `h(GridBoard<Panel>, …)`.

`test/types/custom-tiles.vue` is type-checked with `strictTemplates` as part of
`pnpm typecheck`. Against the old declaration it fails on the `v-model:tiles`
binding, the `@ready` handler and two type-level assertions.
