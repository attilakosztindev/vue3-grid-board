# grid-fork — design notes

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
  placeholder box are unchanged. Otherwise the collision pass, compaction, height
  recalc and the clone + `update:layout` emit (which re-renders the consumer's whole
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
tiles, 453 → 151 for 150; the +1 is the placeholder).

### Other gesture-path costs removed

- **Text selection.** Suppressed by cancelling `selectstart` for the duration of the
  gesture, not by toggling `user-select` on `<body>`. `user-select` is inherited, so
  each flip invalidates the computed style of every element in the document — twice
  per gesture, and the expensive one lands in the frame where the drag has to feel
  instant.
- **Container height.** `height` is a layout property, so transitioning it is a
  main-thread animation: a style recalc plus a layout of the container and a reflow
  of everything after it, every frame. Fine for the one-off settle after a gesture,
  but during a gesture the height changes every time the tile crosses a cell, which
  restarts the transition and runs it back-to-back for the whole drag. The
  `.vgl-gesture` class disables it mid-gesture; snapping also tracks the placeholder
  more honestly.
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

`raise` lifts the tile above its neighbours: right for the tile you just dropped
(`state.raised` → `.settling`, `z-index: 100`), wrong for a tile merely being pushed
out of the way.

`left`/`top` are **not** transitioned in the scoped CSS, precisely because this FLIP
is what animates repositioning. Transitioning them would run a second, main-thread
animation of the same movement and fight it.

---

## 5. The placeholder (the "shadow")

The placeholder is a ghost `GridItem` rendered by the container with `placeholder`
set. It is a readout of where the dragged tile will land, so it is never interactive
— no resize handle, no pointer controller.

It **glides**, but not with the FLIP the tiles use. The position watcher in
`grid-item.vue` returns early on `props.placeholder` before it reaches `settleFrom`;
the movement comes from a plain CSS transition on `left` / `top` / `width` / `height`
in the placeholder rule. §15 has the measurements, but the two reasons are:

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

It also renders **before** `<slot />` in the container template and carries **no
`z-index`**. Every grid item is `position: absolute`, so with `z-index: auto` paint
order is DOM order, and being first puts the shadow underneath every tile. That is
deliberate: it means a tile reflowing out of the way covers the shadow rather than
the shadow bleeding across the tile. Moving it after the slot, or giving it a
`z-index`, reintroduces the bug in §15.

---

## 6. Static handling

**There are two different "static" concepts, and they are not linked.**

- `item.static` in the **layout data** drives the algorithm in `helpers.js`:
  `compact` skips it, `moveElement` returns early on it, collisions branch on it, and
  `validateLayout` type-checks it.
- The `static` **prop** on `<GridItem>` only controls grabbability and whether the
  resize handle renders.

Flipping only the prop leaves the tile still movable by its neighbours' collisions.

### Mid-gesture transitions

`isDraggable`/`isResizable` are live — the grid can be toggled between static and
interactive at runtime, both as props and over the `setDraggable`/`setResizable` bus.
The pointer engine is therefore attached and detached by a watcher, not built once at
mount (a fully static grid used to build a controller and bind a `pointerdown`
listener per tile that could never do anything).

Three things cooperate so a gesture in flight can still terminate when the tile goes
static underneath it:

- `usePointerDragResize.destroy()` emits `${mode}end` for an in-flight gesture instead
  of dropping it. Everything switched on at `${mode}start` — the dragging class, the
  inline transform, the container's placeholder — is only ever switched back off by
  `${mode}end`, so a controller that disappears mid-drag would strand the tile
  floating under the cursor forever. Reachable two ways: the grid toggled to static
  during a drag, and the tile unmounting during one.
- `handleDrag` and `handleResize` exempt the terminating event from their
  `props.static` guard. A bare `props.static` check swallows its own `dragend`.

---

## 7. Container ↔ item contract

- `props.layout` echoes back the exact array the container just emitted (v-model
  preserves the reference), so the watcher compares against `lastEmittedLayout` and
  skips its own echo. Otherwise every pointer frame would re-validate and re-compact.
- `emitContainerResized` computes the pixel size via `calcPosition` rather than
  parsing `state.style`. The rendered `width` is a `calc()` for a normal tile and
  `auto` for an unbounded one, so the old string-parsing version bailed on `width`
  before it ever looked at `height` — it only ever worked mid-resize-gesture, the one
  moment `width` happens to be plain pixels. An unbounded tile (`w`/`h` of `Infinity`)
  has no size to report and stays silent.

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
  subscriptions and 2 computeds per tile) plus `compact()`'s O(n²) pass.

---

## 9. Known latent issue

`getControlPosition` in `helpers.js` was written to special-case an `offsetParent` of
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

Upstream vue-grid-layout is pointer-only, which fails WCAG 2.1.1 _Keyboard_ (A) and
2.5.7 _Dragging Movements_ (AA). The fork now ships a keyboard controller alongside
the pointer one.

### Key map

| Key                                 | While idle        | While grabbed             |
| ----------------------------------- | ----------------- | ------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | pick the item up  | drop it where it is       |
| <kbd>↑↓←→</kbd>                     | _not intercepted_ | move one cell             |
| <kbd>Shift</kbd> + <kbd>↑↓←→</kbd>  | _not intercepted_ | resize by one column/row  |
| <kbd>Esc</kbd>                      | —                 | restore the original slot |

Arrow keys are deliberately inert until the item is grabbed, so a merely-focused tile
never steals page scroll. `preventDefault()` is only called on keys the controller
actually consumes.

### Why it needed no new geometry

The pointer engine already funnels everything through two `mitt` tuples that are
expressed in **grid units, not pixels**:

```
emitter.emit('dragEvent',   ['dragmove',   id, x, y, h, w])
emitter.emit('resizeEvent', ['resizemove', id, x, y, h, w])
```

The keyboard path emits the _same_ tuples, so collision resolution, `compact()`, the
placeholder, `update:layout` and every consumer event work unchanged. No pixel math,
no second code path through `calcXY` / `calcWH`.

It also deliberately does **not** set the item's own `state.isDragging`. That leaves
the existing `[x, y, w, h]` props watcher free to FLIP-animate the tile between slots,
so keyboard moves glide exactly like pointer moves for free.

### Lazy gesture start

`grab()` only sets `state.grabbed`; it does not open a gesture. The `dragstart` /
`resizestart` is emitted by the first arrow press (`beginKeyGesture`), which is what
decides whether this is a move or a resize. Consequences:

- Grab-then-drop with no arrow press emits nothing at all, so no spurious
  `update:layout` and no placeholder flash.
- Switching from moving to resizing mid-grab closes the drag gesture and opens a
  resize one.

That second point is why `cancelGrab()` cannot simply reverse the _current_ gesture —
the earlier one is already committed. It instead diffs the live slot against
`grabOrigin` and replays whichever channels are needed, **size first, then position**,
so the width clamp (`cols - x`) is evaluated against the original width.

### Announcements

`grid-layout.vue` owns one visually-hidden `role="status" aria-live="polite"` region
and listens for an `announce` event on the bus. Identical consecutive messages get a
trailing zero-width space appended, otherwise a repeated string is not re-announced
(e.g. pressing <kbd>↓</kbd> against vertical compaction, which is a legitimate no-op).

Each tile carries `role="group"`, `aria-roledescription="Draggable grid item"`, a live
`aria-label` ("Item 0, column 5, row 1, 4 wide, 2 tall") and an `aria-describedby`
pointing at a single shared instructions paragraph — one `useId()` per grid, not per
tile.

Static tiles, non-interactive grids and the placeholder get no `tabindex` and no ARIA;
the placeholder is additionally `aria-hidden`, as is the resize handle.

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
a drag. On a normal element it clips as expected (measured `scrollX` pinned at 0 with
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

## 13. The dragged item must win exact position ties in `compact`

Dragging the full-width item 6 up past the side-by-side items 4 and 5 used to split them:
item 4 ended up **above** item 6 and item 5 an entire band **below** it. Dragging all the
way up corrected itself, so it read as a feel problem. It was not — symmetric input was
producing asymmetric output.

Starting board (`colNum: 12`):

```
1(0,0,2x3)  2(2,0,6x3)  3(8,0,4x3)
4(0,3,6x4)              5(6,3,6x4)
6(0,7,12x3)
```

`moveElement` is symmetric and behaves correctly: dragging item 6 to `y4` pushes **both**
item 4 and item 5 to `y4`. But item 6 is at `y4` too, so all three overlap and the pile is
handed to `compact()` to untangle.

`compact()` resolves collisions in `sortLayoutItemsByRowCol` order, and that comparator
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

Fix: `compact` takes an optional `priorityId`, and the item under the cursor wins exact
`(y, x)` ties. `grid-layout.vue` passes the gesture's `id` from both `onDragEvent` and
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
- The related `moveElement` heuristic `l.y - collision.y > collision.h / 4` is still there
  and unchanged. It governs when a partial overlap counts as a push, and is not what
  caused this.

## 14. The placeholder must be read after the move, not before

The shadow lagged the drag by exactly one frame: it showed the slot the item was
_leaving_ rather than the one it was landing in, and only caught up once the pointer
moved again. Holding still left it wrong indefinitely, and at drag end the item settled
somewhere the shadow had never been.

`onDragEvent` assigned the placeholder from the live layout item **before** applying the
move to that same object:

```js
const l = getLayoutItem(state.layout, id)
state.placeholder = { ...state.placeholder, x: l.x, y: l.y, w, h } // l is still where it was
state.layout = moveElement(state.layout, l, x, y, true, false) // now l.x / l.y change
compact(state.layout, props.verticalCompact, id) // and compaction can change l.y again
```

`moveElement` mutates `l` in place and `compact` can move it again afterwards, so by the
end of the handler `l` held the real slot — but the placeholder had already been snapshotted
from the pre-move values. Fix: assign it last, off the settled `l`.

The giveaway is that the shadow could **overlap a real tile**, which is impossible for a
compacted layout and therefore proves the placeholder had drifted out of sync with
`state.layout`. Sweeping every item across every slot on the reference board:

|        | drag frames | shadow showing the wrong slot | shadow overlapping a tile |
| ------ | ----------- | ----------------------------- | ------------------------- |
| before | 462         | 429 (92.9%)                   | 19                        |
| after  | 462         | 0                             | 0                         |

Confirmed the same way on a live board by driving synthetic pointer events and comparing
`state.placeholder` against `state.layout` frame by frame — 6 mismatches and one
tile-overlap before, none after.

`onResizeEvent` had the same shape: it took the placeholder's `x`/`y` straight from the
event arguments, but `compact` runs afterwards and can still move the item, so those
coordinates could be stale too. Both handlers now read the placeholder as the last thing
they do.

Worth remembering when touching these handlers: `l` is a **live reference into
`state.layout`**, not a copy. Anything read off it before `moveElement`/`compact` is a
snapshot of the past.

---

## 15. The shadow must never paint over another tile

Symptom: "the shadow sometimes slightly crossing other grid items". Two independent
causes, and a measurement trap that made one of them look far worse than it is.

### Cause 1 — the shadow outranked the tile getting out of its way

This is the one that produced the reported artefact. Reflowing tiles call
`settleFrom(..., false)`, so `state.raised` stays false, they get no `.settling`
class, and they keep `z-index: auto`. The placeholder had `z-index: 2`. Net effect:
the shadow painted **on top of** the very tile that was gliding aside to make room
for it.

Fix: render the shadow first in the container and drop its `z-index` (see §5). Note
this makes a mid-flight shadow harmless rather than impossible — tiles caught
reflowing still _geometrically_ intersect it, they now simply occlude it.

### Cause 2 — stacked FLIPs

`settleFrom` animations use `composite: 'add'` and nothing cancelled the previous
one, so re-targeting mid-flight summed the legs instead of replacing them. Up to
**4** were live at once on the shadow. `settleFrom` now measures the offset an
in-flight settle is still painting, folds it into the new delta, and cancels the old
animation, so at most one is ever live and it always starts from what is on screen.

This applies to tiles too, not just the shadow: after the fix a tile never has more
than one live settle and always comes to rest at exactly `transform: none`.

### Why the shadow does not use `settleFrom` at all

Even fixed, a FLIP is the wrong mechanism for the shadow. It re-targets on every cell
the pointer crosses, far faster than a 220ms glide finishes, so it spends its whole
life being interrupted. A CSS transition handles that natively — it interpolates from
the currently painted value — and it cannot run at all on an element that was
`display: none` last frame, which is exactly the `dragstart` hand-over that used to
need the `gestureId` protocol.

### Measurements

Serpentine drag across every slot for every item, adjacent cells only, ~1 cell per
100ms. The tab is hidden during automation so the document timeline is frozen; the
animation clock is therefore advanced by hand, 16ms per frame. **Getting this wrong
is the trap**: leaving the clock frozen pins every animation at its first keyframe
and reports drift figures in the 700–2000px range that are pure artefact.

"Excursion" is how far outside the corridor between the slot it left and the slot it
is heading for the shadow was ever painted — i.e. actual overshoot, not lag.

|                        | live anims on the shadow | max excursion | gestures gliding in at `dragstart` | painted over a tile | offset once settled |
| ---------------------- | ------------------------ | ------------- | ---------------------------------- | ------------------- | ------------------- |
| FLIP                   | 4                        | 511px         | 5 of 5                             | 0                   | 0                   |
| CSS transition (fixed) | 2 (`left` + `top`)       | 79px          | 0                                  | 0                   | 0                   |

Both columns show 0 paint-overs because the §15 cause-1 fix is in both — that one is
what closes the reported bug. The transition's win is the other three columns.

### Regression coverage

`test/nuxt/grid-placeholder.spec.ts` stubs `el.animate` on the placeholder and
asserts it is never called (the shadow must glide by transition, not FLIP), and
asserts the shadow precedes the first real tile in DOM order. The `z-index` half
cannot be asserted under test because scoped SFC styles are not injected there, and
neither can the transition itself — both were verified in the browser instead.
