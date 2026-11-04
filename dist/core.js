import { inject as dt, computed as P, reactive as Ke, unref as ye, watch as K, onMounted as ct, onBeforeUnmount as Ve, openBlock as Ne, createElementBlock as Ae, normalizeStyle as Ze, normalizeClass as Pe, renderSlot as Ie, createCommentVNode as ft, nextTick as Me, toRaw as Re, useId as gt, useSlots as pt, provide as ht, onBeforeMount as mt, onBeforeUpdate as yt, onUpdated as wt, withDirectives as vt, createVNode as Ce, vShow as xt, createElementVNode as Le, toDisplayString as _e, Fragment as bt } from "vue";
const fe = typeof document < "u";
function Je(o, a) {
  return !(o === a || o.x + o.w <= a.x || o.x >= a.x + a.w || o.y + o.h <= a.y || o.y >= a.y + a.h);
}
function Xe(o, a) {
  return o.find((c) => Je(c, a));
}
function zt(o, a) {
  return o.filter((c) => Je(c, a));
}
function Et(o) {
  return o.filter((a) => a.frozen);
}
function Qe(o, a) {
  return [].concat(o).sort((c, e) => {
    if (c.y === e.y) {
      if (a !== void 0) {
        if (c.id === a) return -1;
        if (e.id === a) return 1;
      }
      if (c.x === e.x) return 0;
    }
    return c.y > e.y || c.y === e.y && c.x > e.x ? 1 : -1;
  });
}
function Mt(o, a) {
  return !(o.x + o.w <= a.x) && !(o.x >= a.x + a.w);
}
function St(o, a, c) {
  const e = o.filter((z) => Mt(z, a));
  if (c)
    for (; a.y > 0 && !Xe(e, a); )
      a.y--;
  let h;
  for (; h = Xe(e, a); )
    a.y = h.y + h.h;
}
function Oe(o, a, c, e) {
  if (e) {
    const h = {
      x: c.x,
      y: Math.max(a.y - c.h, 0),
      w: c.w,
      h: c.h
    };
    if (!Xe(o, h))
      return De(o, c, void 0, h.y, !1);
  }
  return De(o, c, void 0, c.y + 1, !1);
}
function $t(o) {
  return typeof o == "number" && !Number.isNaN(o);
}
function et(o) {
  let a = 0;
  for (let c = 0, e = o.length; c < e; c++) {
    const h = o[c].y + o[c].h;
    h > a && (a = h);
  }
  return a;
}
function He(o) {
  return (o || []).map((a) => ({ ...a }));
}
function We(o, a) {
  return o.find((c) => c.id === a);
}
function we(o, a, c) {
  const e = Et(o), h = Qe(o, c);
  for (let z = 0, f = h.length; z < f; z++) {
    const W = h[z];
    W.frozen || (St(e, W, a), e.push(W)), delete W.moved;
  }
}
function De(o, a, c, e, h, z) {
  if (a.frozen) return o;
  const f = a.x, W = a.y, S = e && a.y > e;
  typeof c == "number" && (a.x = c), typeof e == "number" && (a.y = e), a.moved = !0;
  let M = Qe(o);
  S && (M = M.reverse());
  const X = zt(M, a);
  if (z && X.length)
    return a.x = f, a.y = W, a.moved = !1, o;
  for (let x = 0, m = X.length; x < m; x++) {
    const s = X[x];
    s.moved || a.y > s.y && a.y - s.y > s.h / 4 || (s.frozen ? o = Oe(o, s, a, h) : o = Oe(o, a, s, h));
  }
  return o;
}
function Rt(o, a, c, e, h, z) {
  const f = We(o, a);
  if (!f) return null;
  const W = et(o);
  let S = f.x, M = f.y;
  for (; ; ) {
    const X = Math.max(0, Math.min(h - f.w, S + c)), x = Math.max(0, Math.min(W, M + e));
    if (X === S && x === M) return null;
    S = X, M = x;
    const m = He(o);
    if (De(m, We(m, a), S, M, !0, !1), we(m, z, a), m.some((s, $) => s.x !== o[$].x || s.y !== o[$].y)) return { x: S, y: M };
  }
}
function Fe(o, a = "tiles") {
  if (!Array.isArray(o)) throw new Error(`vue3-grid-board: ${a} must be an array.`);
  const c = /* @__PURE__ */ new Set();
  o.forEach((e, h) => {
    for (const z of ["x", "y", "w", "h"])
      if (typeof e[z] != "number")
        throw new Error(`vue3-grid-board: ${a}[${h}].${z} must be a number.`);
    if (e.id === void 0 || e.id === null)
      throw new Error(`vue3-grid-board: ${a}[${h}].id is required.`);
    if (typeof e.id != "number" && typeof e.id != "string")
      throw new Error(`vue3-grid-board: ${a}[${h}].id must be a string or a number.`);
    if (c.has(e.id))
      throw new Error(
        `vue3-grid-board: ${a}[${h}].id must be unique (saw "${e.id}" twice).`
      );
    if (c.add(e.id), e.frozen !== void 0 && typeof e.frozen != "boolean")
      throw new Error(`vue3-grid-board: ${a}[${h}].frozen must be a boolean.`);
  });
}
function Ht(o) {
  const a = o.target.offsetParent || document.body, c = a.getBoundingClientRect();
  return {
    x: o.clientX + a.scrollLeft - c.left,
    y: o.clientY + a.scrollTop - c.top
  };
}
function Ge(o, a, c, e) {
  return $t(o) ? { deltaX: c - o, deltaY: e - a, lastX: o, lastY: a, x: c, y: e } : { deltaX: 0, deltaY: 0, lastX: c, lastY: e, x: c, y: e };
}
const tt = /* @__PURE__ */ Symbol("gridBoard"), Wt = 3, j = 60, qe = 18;
function Dt(o, a) {
  const {
    handleSelector: c = ".grid-handle",
    draggable: e = () => !1,
    resizable: h = () => !1,
    dragIgnore: z = () => null,
    dragHandle: f = () => null,
    resizeIgnore: W = () => null,
    autoScroll: S = () => !0,
    onDrag: M = () => {
    },
    onResize: X = () => {
    },
    onTap: x = () => {
    }
  } = a;
  let m = null, s = null, $ = !1, V = 0, k = 0, N = 0, Y = 0, B = 0, F = 0, U = !1, n = 0, de = 0;
  function ae(w) {
    try {
      return w(), !0;
    } catch {
      return !1;
    }
  }
  function I(w, D) {
    if (!D) return !1;
    const O = w.closest?.(D);
    return !!O && o.contains(O);
  }
  function Z(w, D = N, O = Y) {
    const C = { type: w, target: o, clientX: D, clientY: O };
    s === "resize" ? X(C) : M(C);
  }
  function se() {
    F = requestAnimationFrame(() => {
      F = 0, !(m === null || !$ || !U) && (U = !1, Z(`${s}move`), se());
    });
  }
  function ve() {
    if (F) {
      U = !0;
      return;
    }
    Z(`${s}move`), se();
  }
  function _() {
    F && cancelAnimationFrame(F), F = 0, U = !1;
  }
  function ee() {
    _(), Z(`${s}move`);
  }
  function ge(w) {
    if (m !== null || w.pointerType === "mouse" && w.button !== 0) return;
    const D = I(w.target, c);
    if (D && h()) {
      if (I(w.target, W())) return;
      s = "resize";
    } else if (!D && e()) {
      const O = z(), C = f();
      if (O && I(w.target, O) || C && !I(w.target, C)) return;
      s = "drag";
    } else
      return;
    m = w.pointerId, $ = !1, V = N = w.clientX, k = Y = w.clientY, R(), ae(() => o.setPointerCapture(w.pointerId)), o.addEventListener("pointermove", ce), o.addEventListener("pointerup", J), o.addEventListener("pointercancel", J), o.addEventListener("lostpointercapture", J), window.addEventListener("resize", R, { passive: !0 });
  }
  function ce(w) {
    if (w.pointerId === m) {
      if (N = w.clientX, Y = w.clientY, !$) {
        if (Math.hypot(N - V, Y - k) < Wt) return;
        $ = !0, Z(`${s}start`, V, k);
      }
      w.preventDefault(), ve(), s === "drag" && !B && te() && S() && xe();
    }
  }
  function J(w) {
    if (w.pointerId !== m) return;
    const D = !$ && w.type === "pointerup" && s;
    $ && (U && ee(), Z(`${s}end`)), le(), D && x({ mode: D, target: w.target, clientX: w.clientX, clientY: w.clientY });
  }
  function le() {
    _(), G(), o.removeEventListener("pointermove", ce), o.removeEventListener("pointerup", J), o.removeEventListener("pointercancel", J), o.removeEventListener("lostpointercapture", J), window.removeEventListener("resize", R), ae(() => {
      m !== null && o.hasPointerCapture?.(m) && o.releasePointerCapture(m);
    }), m = null, s = null, $ = !1;
  }
  function ue(w) {
    return Math.min(qe, w / j * qe);
  }
  function R() {
    n = window.innerWidth, de = window.innerHeight;
  }
  function te() {
    return N < j || Y < j || N > n - j || Y > de - j;
  }
  function xe() {
    if (B) return;
    const w = () => {
      if (B = 0, m === null || !$) return;
      const D = n, O = de;
      let C = 0, ne = 0;
      Y < j ? ne = -ue(j - Y) : Y > O - j && (ne = ue(Y - (O - j))), N < j ? C = -ue(j - N) : N > D - j && (C = ue(N - (D - j))), (C || ne) && (window.scrollBy({ left: C, top: ne, behavior: "instant" }), ee(), B = requestAnimationFrame(w));
    };
    B = requestAnimationFrame(w);
  }
  function G() {
    B && cancelAnimationFrame(B), B = 0;
  }
  o.addEventListener("pointerdown", ge);
  function pe() {
    if (o.removeEventListener("pointerdown", ge), m === null) {
      G();
      return;
    }
    $ && (U && ee(), Z(`${s}end`)), le();
  }
  return { destroy: pe };
}
const nt = (o, a) => {
  const c = o.__vccOpts || o;
  for (const [e, h] of a)
    c[e] = h;
  return c;
}, Tt = ["data-tile", "tabindex", "role", "aria-roledescription", "aria-label", "aria-describedby", "aria-hidden", "data-grabbed"], kt = ["aria-hidden"], Nt = "a, button, input, select, textarea, label, [contenteditable]", At = 2147483647, Pt = {
  __name: "grid-tile",
  props: {
    id: {
      type: [Number, String],
      required: !0
    },
    x: {
      type: Number,
      required: !0
    },
    y: {
      type: Number,
      required: !0
    },
    w: {
      type: Number,
      required: !0
    },
    h: {
      type: Number,
      required: !0
    },
    minW: {
      type: Number,
      default: 1
    },
    minH: {
      type: Number,
      default: 1
    },
    maxW: {
      type: Number,
      default: 1 / 0
    },
    maxH: {
      type: Number,
      default: 1 / 0
    },
    draggable: {
      type: Boolean,
      default: null
    },
    resizable: {
      type: Boolean,
      default: null
    },
    frozen: {
      type: Boolean,
      default: !1
    },
    dragHandle: {
      type: String,
      default: null
    },
    dragIgnore: {
      type: String,
      default: "a, button"
    },
    resizeIgnore: {
      type: String,
      default: "a, button"
    },
    radius: {
      type: Number,
      default: 22
    },
    label: {
      type: String,
      default: null
    },
    shadow: {
      type: Boolean,
      default: !1
    }
  },
  emits: [
    "dragstart",
    "drag",
    "dragend",
    "resizestart",
    "resize",
    "resizeend",
    "size"
  ],
  setup(o, { expose: a, emit: c }) {
    const e = o, h = c, z = {
      el: void 0
    };
    a(z);
    const f = dt(tt, null);
    if (!f)
      throw new Error(
        "GridTile must be rendered inside a GridBoard. The two are a single component pair and cannot be used apart."
      );
    let W;
    const S = /* @__PURE__ */ new Set();
    let M = null, X = null, x = null, m = null, s = null, $ = null, V = null;
    const k = P(() => f.props.columns), N = P(() => f.props.rowHeight), Y = P(() => f.state.width ?? 100), B = P(() => f.gap.value), F = P(
      () => e.draggable === null ? f.props.draggable : e.draggable
    ), U = P(
      () => e.resizable === null ? f.props.resizable : e.resizable
    ), n = Ke({
      isDragging: !1,
      dragging: null,
      settling: !1,
      isResizing: !1,
      grabbed: !1,
      resizing: null,
      resizeMin: null,
      resizeMax: null,
      lastX: NaN,
      lastY: NaN,
      lastW: NaN,
      lastH: NaN,
      style: {},
      previousW: null,
      previousH: null,
      previousX: null,
      previousY: null,
      innerX: e.x,
      innerY: e.y,
      innerW: e.w,
      innerH: e.h
    }), de = P(() => U.value && !e.frozen && !e.shadow), ae = P(
      () => F.value && !e.frozen && !e.shadow && !e.dragHandle
    ), I = P(
      () => (F.value || U.value) && !e.frozen && !e.shadow
    ), Z = P(() => ye(I) ? { touchAction: "none" } : {}), se = P(
      () => fe && !e.shadow && f.props.overflow && (n.isDragging || n.isResizing || n.settling)
    ), ve = P(() => ({
      "grid-tile--draggable": ae.value,
      "grid-tile--frozen": e.frozen,
      "grid-tile--dragging": n.isDragging,
      "grid-tile--resizing": n.isResizing,
      "grid-tile--settling": n.settling,
      "grid-tile--grabbed": n.grabbed
    })), _ = P(() => f.a11y.value), ee = P(() => e.label || _.value.tileName(e.id)), ge = P(
      () => _.value.tileLabel({
        name: ee.value,
        column: n.innerX + 1,
        row: n.innerY + 1,
        w: n.innerW,
        h: n.innerH
      })
    );
    R(), K([N, k], () => {
      R(), G();
    }), K(Y, () => {
      (n.isDragging || n.isResizing) && R(), G();
    }), K([() => e.x, () => e.y, () => e.w, () => e.h], (t, r) => {
      if (n.innerX = e.x, n.innerY = e.y, n.innerW = e.w, n.innerH = e.h, R(), e.shadow || n.isDragging || n.isResizing || n.settling) return;
      const [l, d, p, E] = t, [b, v, A, Se] = r;
      if (l === b && d === v) return;
      const Ee = y(b, v, A, Se), Q = y(l, d, p, E);
      C(Ee.left - Q.left, Ee.top - Q.top, !1);
    }), K(se, R), K(() => e.radius, R), K(B, (t, r) => {
      t[0] === r[0] && t[1] === r[1] || (R(), G());
    }), ct(() => {
      R(), ce();
    }), K(I, ce);
    function ce() {
      const t = ye(I);
      if (t !== !!W) {
        if (!t) {
          W.destroy(), W = null;
          return;
        }
        z.el && (W = Dt(z.el, {
          handleSelector: ".grid-handle",
          draggable: () => F.value && !e.frozen,
          resizable: () => U.value && !e.frozen,
          dragIgnore: () => e.dragIgnore,
          dragHandle: () => e.dragHandle && `.${CSS.escape(e.dragHandle)}`,
          resizeIgnore: () => e.resizeIgnore,
          autoScroll: () => !0,
          onDrag: w,
          onResize: pe,
          onTap: ot
        }));
      }
    }
    Ve(() => {
      f.stopPlacing(e.id), me(), ne(), u(), W?.destroy();
    });
    function J(t) {
      z.el = t;
    }
    function le() {
      const t = z.el, r = X || t?.offsetParent || t?.parentElement;
      return r ? r.getBoundingClientRect() : null;
    }
    function ue() {
      se.value && R();
    }
    function R() {
      const t = k.value;
      e.x + e.w > t ? (n.innerX = 0, n.innerW = e.w > t ? t : e.w) : (n.innerX = e.x, n.innerW = e.w);
      const { innerX: r, innerY: l, innerW: d, innerH: p } = n, E = N.value, [b, v] = B.value, A = `((100% - ${(t + 1) * b}px) / ${t})`;
      let Se = `${E * l + (l + 1) * v}px`, Ee = `calc(${A} * ${r} + ${(r + 1) * b}px)`, Q = null;
      if (n.isDragging) {
        const oe = y(r, l, d, p);
        m = oe, Se = `${oe.top}px`, Ee = `${oe.left}px`, Q = {
          dx: n.dragging.left - oe.left,
          dy: n.dragging.top - oe.top
        };
      } else
        m = null;
      if (se.value) {
        const oe = le();
        if (oe) {
          const $e = n.isDragging ? m : y(r, l, d, p), ke = {
            position: "fixed",
            top: `${oe.top + $e.top}px`,
            left: `${oe.left + $e.left}px`,
            width: `${n.isResizing ? n.resizing.width : $e.width}px`,
            height: `${n.isResizing ? n.resizing.height : $e.height}px`,
            zIndex: String(At),
            transition: "none",
            ...Q ? {
              transform: `translate3d(${Q.dx}px, ${Q.dy}px, 0)`,
              willChange: "transform"
            } : {},
            "--grid-radius": `${e.radius}px`
          };
          if (x && te(x, ke)) return;
          x = ke, n.style = ke;
          return;
        }
      }
      const Te = {
        position: "absolute",
        top: Se,
        left: Ee,
        width: n.isResizing ? `${n.resizing.width}px` : d === 1 / 0 ? "auto" : `calc(${A} * ${d} + ${Math.max(0, d - 1) * b}px)`,
        height: n.isResizing ? `${n.resizing.height}px` : p === 1 / 0 ? "auto" : `${E * p + Math.max(0, p - 1) * v}px`,
        ...Q ? {
          transform: `translate3d(${Q.dx}px, ${Q.dy}px, 0)`,
          transition: "none",
          willChange: "transform"
        } : n.isResizing ? { transition: "none" } : {},
        "--grid-radius": `${e.radius}px`
      };
      x && te(x, Te) || (x = Te, n.style = Te);
    }
    function te(t, r) {
      const l = Object.keys(r);
      return Object.keys(t).length !== l.length ? !1 : l.every((d) => t[d] === r[d]);
    }
    function xe(t) {
      const r = z.el;
      if (!r || !x || !m) return;
      const l = `translate3d(${t.left - m.left}px, ${t.top - m.top}px, 0)`;
      x.transform !== l && (x.transform = l, r.style.transform = l);
    }
    function G() {
      const { width: t, height: r } = y(n.innerX, n.innerY, n.innerW, n.innerH);
      !Number.isFinite(t) || !Number.isFinite(r) || h("size", e.id, t, r);
    }
    function pe(t) {
      if (e.frozen && !(t.type === "resizeend" && n.isResizing)) return;
      t.type === "resizestart" && i(t.target);
      const r = g(t);
      if (r == null) return;
      const { x: l, y: d } = r, p = { width: 0, height: 0 };
      let E = null, b;
      switch (t.type) {
        case "resizestart": {
          f.cancelPlacing(), n.resizeMin = y(0, 0, e.minW, e.minH), n.resizeMax = y(0, 0, e.maxW, e.maxH), n.previousW = n.innerW, n.previousH = n.innerH, b = y(n.innerX, n.innerY, n.innerW, n.innerH), p.width = b.width, p.height = b.height, n.resizing = p, n.isResizing = !0, h("resizestart", e.id, n.innerW, n.innerH);
          break;
        }
        case "resizemove": {
          const A = Ge(n.lastW, n.lastH, l, d);
          p.width = Math.max(
            n.resizeMin.width,
            Math.min(n.resizeMax.width, n.resizing.width + A.deltaX)
          ), p.height = Math.max(
            n.resizeMin.height,
            Math.min(n.resizeMax.height, n.resizing.height + A.deltaY)
          ), n.resizing = p;
          break;
        }
        case "resizeend": {
          E = n.resizing, b = y(n.innerX, n.innerY, n.innerW, n.innerH), p.width = b.width, p.height = b.height, n.resizing = null, n.isResizing = !1;
          break;
        }
      }
      R(), b = T(L(p.height, p.width));
      const v = E ? T(L(E.height, E.width)) : b;
      n.lastW = l, n.lastH = d, (n.innerW !== b.w || n.innerH !== b.h) && h("resize", e.id, b.w, b.h), t.type === "resizeend" && (n.previousW !== v.w || n.previousH !== v.h) && h("resizeend", e.id, v.w, v.h), f.resizeEvent([t.type, e.id, n.innerX, n.innerY, v.h, v.w]), t.type === "resizeend" && u();
    }
    function w(t) {
      if (n.isResizing || e.frozen && !(t.type === "dragend" && n.isDragging)) return;
      t.type === "dragstart" && i(t.target);
      const r = g(t);
      if (r === null) return;
      const { x: l, y: d } = r, p = { top: 0, left: 0 };
      switch (t.type) {
        case "dragstart":
        case "dragend": {
          if (t.type === "dragend" && !n.isDragging) return;
          t.type === "dragstart" && (f.cancelPlacing(), n.previousX = n.innerX, n.previousY = n.innerY, ne());
          const v = le() ?? { left: 0, top: 0 }, A = t.target.getBoundingClientRect();
          p.left = A.left - v.left, p.top = A.top - v.top, n.dragging = t.type === "dragstart" ? p : null, n.isDragging = t.type === "dragstart", t.type === "dragstart" && h("dragstart", e.id, n.innerX, n.innerY);
          break;
        }
        case "dragmove": {
          const v = Ge(n.lastX, n.lastY, l, d);
          p.left = n.dragging.left + v.deltaX, p.top = n.dragging.top + v.deltaY, n.dragging = p;
          break;
        }
      }
      t.type !== "dragmove" && R();
      const E = H(p.top, p.left), b = n.innerX !== E.x || n.innerY !== E.y;
      if (t.type === "dragmove" && (b ? R() : xe(p)), n.lastX = l, n.lastY = d, b && h("drag", e.id, E.x, E.y), t.type === "dragend" && (n.previousX !== n.innerX || n.previousY !== n.innerY) && h("dragend", e.id, E.x, E.y), f.dragEvent([t.type, e.id, E.x, E.y, n.innerH, n.innerW]), t.type === "dragend") {
        if (fe && z.el) {
          const v = f.state.tiles.find((A) => A.id === e.id);
          if (v) {
            const A = y(v.x, v.y, v.w, v.h);
            C(p.left - A.left, p.top - A.top), R();
          }
        }
        u();
      }
    }
    function D(t) {
      if (!t || t === "none") return { dx: 0, dy: 0 };
      const r = t.match(/-?[\d.]+(?:e[-+]?\d+)?/g)?.map(Number);
      return r ? t.startsWith("matrix3d") ? { dx: r[12] ?? 0, dy: r[13] ?? 0 } : t.startsWith("matrix") ? { dx: r[4] ?? 0, dy: r[5] ?? 0 } : { dx: r[0] ?? 0, dy: r[1] ?? 0 } : { dx: 0, dy: 0 };
    }
    function O(t) {
      if (S.size === 0) return { dx: 0, dy: 0 };
      const r = D(getComputedStyle(t).transform), l = D(x?.transform);
      for (const d of S)
        d.onfinish = null, d.oncancel = null, d.cancel();
      return S.clear(), n.settling = !1, { dx: r.dx - l.dx, dy: r.dy - l.dy };
    }
    function C(t, r, l = !0) {
      const d = z.el;
      if (!d || typeof d.animate != "function") return;
      const p = O(d);
      if (t += p.dx, r += p.dy, Math.abs(t) < 0.5 && Math.abs(r) < 0.5) return;
      const { duration: E, easing: b } = f.settleTiming();
      if (E === 0) return;
      const v = d.animate(
        [{ transform: `translate3d(${t}px, ${r}px, 0)` }, { transform: "translate3d(0px, 0px, 0)" }],
        { duration: E, easing: b, composite: "add" }
      );
      S.add(v), l && (n.settling = !0);
      const A = () => {
        S.delete(v), S.size === 0 && (n.settling = !1);
      };
      v.onfinish = A, v.oncancel = A;
    }
    function ne() {
      for (const t of S)
        t.onfinish = null, t.oncancel = null, t.cancel();
      S.clear(), n.settling = !1;
    }
    function i(t) {
      u(), X = t.offsetParent || null;
      const r = X || document.body, l = { offsetParent: r, left: 0, top: 0, measure: null };
      l.measure = () => {
        const d = r === document.body ? { left: 0, top: 0 } : r.getBoundingClientRect();
        l.left = d.left - r.scrollLeft, l.top = d.top - r.scrollTop, ue();
      }, l.measure(), M = l, window.addEventListener("scroll", l.measure, { passive: !0, capture: !0 }), window.addEventListener("resize", l.measure, { passive: !0 });
    }
    function u() {
      X = null, M && (window.removeEventListener("scroll", M.measure, { capture: !0 }), window.removeEventListener("resize", M.measure), M = null);
    }
    function g(t) {
      return M ? { x: t.clientX - M.left, y: t.clientY - M.top } : Ht(t);
    }
    function y(t, r, l, d) {
      const p = q(), E = N.value, [b, v] = B.value;
      return {
        left: Math.round(p * t + (t + 1) * b),
        top: Math.round(E * r + (r + 1) * v),
        width: l === 1 / 0 ? l : Math.round(p * l + Math.max(0, l - 1) * b),
        height: d === 1 / 0 ? d : Math.round(E * d + Math.max(0, d - 1) * v)
      };
    }
    function H(t, r) {
      const l = q(), [d, p] = B.value, E = Math.round((r - d) / (l + d)), b = Math.round((t - p) / (N.value + p));
      return {
        x: Math.max(Math.min(E, k.value - n.innerW), 0),
        y: Math.max(b, 0)
      };
    }
    function q() {
      const t = k.value;
      return (Y.value - B.value[0] * (t + 1)) / t;
    }
    function L(t, r) {
      const l = q(), [d, p] = B.value, E = Math.round((r + d) / (l + d)), b = Math.round((t + p) / (N.value + p));
      return {
        w: Math.max(Math.min(E, k.value - n.innerX), 0),
        h: Math.max(b, 0)
      };
    }
    function T(t) {
      return {
        w: Math.max(e.minW, Math.min(e.maxW, t.w), 1),
        h: Math.max(e.minH, Math.min(e.maxH, t.h), 1)
      };
    }
    const re = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };
    function ie() {
      const t = f.state.tiles.find((r) => r.id === e.id);
      return t ? { x: t.x, y: t.y, w: t.w, h: t.h } : { x: n.innerX, y: n.innerY, w: n.innerW, h: n.innerH };
    }
    function be(t) {
      const r = ie(), l = _.value.tileLabel({
        name: ee.value,
        column: r.x + 1,
        row: r.y + 1,
        w: r.w,
        h: r.h
      });
      f.announce(t ? `${l}. ${t}` : l);
    }
    function he(t) {
      if (s === t) return;
      s && me();
      const r = ie();
      s = t, t === "drag" ? (h("dragstart", e.id, r.x, r.y), f.dragEvent(["dragstart", e.id, r.x, r.y, r.h, r.w])) : (h("resizestart", e.id, r.w, r.h), f.resizeEvent(["resizestart", e.id, r.x, r.y, r.h, r.w]));
    }
    function me() {
      if (!s) return;
      const t = s;
      s = null;
      const r = ie();
      t === "drag" ? f.dragEvent(["dragend", e.id, r.x, r.y, r.h, r.w]) : f.resizeEvent(["resizeend", e.id, r.x, r.y, r.h, r.w]);
    }
    function rt(t, r) {
      if (!F.value || e.frozen) return;
      he("drag");
      const l = ie(), d = Rt(
        Re(f.state.tiles),
        e.id,
        t,
        r,
        k.value,
        f.props.gravity
      );
      d && (f.dragEvent(["dragmove", e.id, d.x, d.y, l.h, l.w]), h("drag", e.id, d.x, d.y)), Me(() => be());
    }
    function it(t, r) {
      if (!U.value || e.frozen) return;
      he("resize");
      const l = ie(), d = Math.max(e.minW, Math.min(e.maxW, k.value - l.x, l.w + t)), p = Math.max(e.minH, Math.min(e.maxH, l.h + r));
      (d !== l.w || p !== l.h) && (f.resizeEvent(["resizemove", e.id, l.x, l.y, p, d]), h("resize", e.id, d, p)), Me(() => be());
    }
    function Ye(t = _.value.pickedUp) {
      $ = ie(), n.grabbed = !0, be(t);
    }
    function ze() {
      if (!n.grabbed) return;
      const t = s !== null;
      me(), Be(), n.grabbed = !1, $ = null, Me(() => be(t ? _.value.dropped : _.value.putDown));
    }
    function ot({ mode: t, target: r }) {
      if (!f.props.tapToMove || !ye(I)) return;
      const l = f.placingId();
      if (l !== null && l !== e.id) return;
      const d = r.closest?.(Nt);
      if (!(d && d !== z.el && z.el.contains(d))) {
        if (n.grabbed) {
          ze();
          return;
        }
        V = t, z.el.focus({ preventScroll: !0 }), Ye(t === "resize" ? _.value.pickedUpToResize : _.value.pickedUpToMove), f.startPlacing(e.id, at, ze);
      }
    }
    function at(t, r) {
      const l = ie();
      if (V === "resize") {
        const d = Math.max(
          e.minW,
          Math.min(e.maxW, k.value - l.x, t - l.x + 1)
        ), p = Math.max(e.minH, Math.min(e.maxH, r - l.y + 1));
        (d !== l.w || p !== l.h) && (he("resize"), f.resizeEvent(["resizemove", e.id, l.x, l.y, p, d]), h("resize", e.id, d, p));
      } else {
        const d = Math.max(0, Math.min(t, k.value - l.w));
        (d !== l.x || r !== l.y) && (he("drag"), f.dragEvent(["dragmove", e.id, d, r, l.h, l.w]), h("drag", e.id, d, r));
      }
      ze();
    }
    function Be() {
      V && (V = null, f.stopPlacing(e.id));
    }
    function st() {
      if (!n.grabbed) return;
      const t = $;
      if (me(), Be(), t) {
        let r = ie();
        (r.w !== t.w || r.h !== t.h) && (he("resize"), f.resizeEvent(["resizemove", e.id, r.x, r.y, t.h, t.w]), me(), r = ie()), (r.x !== t.x || r.y !== t.y) && (he("drag"), f.dragEvent(["dragmove", e.id, t.x, t.y, t.h, t.w]), me());
      }
      n.grabbed = !1, $ = null, Me(() => be(_.value.returned));
    }
    function lt(t) {
      if (!ye(I) || t.target !== z.el || t.altKey || t.ctrlKey || t.metaKey) return;
      if (t.key === "Enter" || t.key === " ") {
        t.preventDefault(), n.grabbed ? ze() : Ye();
        return;
      }
      if (t.key === "Escape") {
        if (!n.grabbed) return;
        t.preventDefault(), st();
        return;
      }
      const r = re[t.key];
      !r || !n.grabbed || (t.preventDefault(), t.shiftKey ? it(r[0], r[1]) : rt(r[0], r[1]));
    }
    function ut() {
      n.grabbed && ze();
    }
    return (t, r) => (Ne(), Ae("div", {
      ref: J,
      class: Pe(["grid-tile", ve.value]),
      style: Ze([n.style, Z.value]),
      "data-tile": o.id,
      tabindex: I.value ? 0 : void 0,
      role: I.value ? "group" : void 0,
      "aria-roledescription": I.value ? _.value.roleDescription : void 0,
      "aria-label": I.value ? ge.value : void 0,
      "aria-describedby": I.value ? ye(f).instructionsId : void 0,
      "aria-hidden": o.shadow ? "true" : void 0,
      "data-grabbed": n.grabbed ? "true" : void 0,
      onKeydown: lt,
      onBlur: ut
    }, [
      Ie(t.$slots, "default", {}, void 0, !0),
      de.value ? (Ne(), Ae("span", {
        key: 0,
        class: Pe(["grid-handle", { "grid-handle--chevron": !t.$slots.handle }]),
        "aria-hidden": t.$slots.handle ? void 0 : "true"
      }, [
        Ie(t.$slots, "handle", {}, void 0, !0)
      ], 10, kt)) : ft("", !0)
    ], 46, Tt));
  }
}, Xt = /* @__PURE__ */ nt(Pt, [["__scopeId", "data-v-60ad906f"]]), Yt = ["id", "lang"], Bt = ["lang"], Ue = 220, je = "cubic-bezier(0.2, 0, 0, 1)", It = {
  __name: "grid-board",
  props: {
    tiles: {
      type: Array,
      required: !0
    },
    columns: {
      type: Number,
      default: 12
    },
    rowHeight: {
      type: Number,
      default: 150
    },
    gap: {
      type: [Number, Array],
      default: 10
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    resizable: {
      type: Boolean,
      default: !0
    },
    autoHeight: {
      type: Boolean,
      default: !0
    },
    gravity: {
      type: Boolean,
      default: !0
    },
    overflow: {
      type: Boolean,
      default: !1
    },
    tapToMove: {
      type: Boolean,
      default: !1
    },
    a11y: {
      type: Object,
      default: null
    }
  },
  emits: ["update:tiles", "ready"],
  setup(o, { expose: a, emit: c }) {
    const e = o, h = c, z = {
      roleDescription: "Draggable tile",
      tileName: (i) => `Tile ${i}`,
      tileLabel: ({ name: i, column: u, row: g, w: y, h: H }) => `${i}, column ${u}, row ${g}, ${y} wide, ${H} tall`,
      instructions: "Press Enter or Space to pick the tile up. Then use the arrow keys to move it, or hold Shift with the arrow keys to resize it. Press Enter to drop it, or Escape to put it back.",
      tapInstructions: "Without a keyboard, tap the tile and then tap where it should go, or tap its corner grip and then tap where that corner should go.",
      pickedUp: "Picked up. Arrow keys move, Shift plus arrow keys resize, Enter drops, Escape cancels.",
      pickedUpToMove: "Picked up. Tap where it should go, or tap it again to put it down.",
      pickedUpToResize: "Picked up to resize. Tap where its corner should go, or tap it again to put it down.",
      dropped: "Dropped.",
      putDown: "Put down.",
      returned: "Returned to where it started."
    };
    let f = null, W = null, S = null, M = null, X = [], x = null;
    const m = {
      el: void 0,
      dispatch: n
    };
    a(m);
    const s = Ke({
      width: null,
      boardStyle: {},
      busy: !1,
      shadow: { x: 0, y: 0, w: 0, h: 0, id: -1 },
      tiles: [],
      announcement: ""
    }), $ = P(() => {
      const i = e.gap;
      if (Array.isArray(i)) return [Number(i[0]) || 0, Number(i[1]) || 0];
      const u = Number(i) || 0;
      return [u, u];
    }), V = gt(), k = P(() => ({ ...z, ...e.a11y })), N = pt();
    let Y = /* @__PURE__ */ new Map();
    const B = P(() => {
      if (s.busy) return Y;
      const i = [...s.tiles].sort((u, g) => u.y - g.y || u.x - g.x);
      return Y = new Map(i.map((u, g) => [String(u.id), g])), Y;
    });
    function F(i, u = []) {
      for (const g of i)
        g.type === bt && Array.isArray(g.children) ? F(g.children, u) : u.push(g);
      return u;
    }
    function U() {
      const i = B.value, u = (g) => {
        const y = i.get(String(g.props?.id));
        return y === void 0 ? Number.MAX_SAFE_INTEGER : y;
      };
      return F(N.default?.() ?? []).map((g, y) => ({ node: g, index: y })).sort((g, y) => u(g.node) - u(y.node) || g.index - y.index).map((g) => g.node);
    }
    ht(tt, {
      props: e,
      state: s,
      gap: $,
      instructionsId: V,
      dragEvent: O,
      resizeEvent: C,
      announce: le,
      settleTiming: I,
      a11y: k,
      startPlacing: se,
      stopPlacing: ve,
      cancelPlacing: _,
      placingId: () => x?.id ?? null
    }), ue(), fe && (K(
      () => e.tiles,
      () => {
        e.tiles !== W && (Fe(e.tiles), xe());
      },
      { immediate: !0 }
    ), K(
      () => s.busy,
      (i) => {
        i ? (window.getSelection()?.removeAllRanges(), document.addEventListener("selectstart", ae)) : document.removeEventListener("selectstart", ae);
      }
    )), K(
      () => s.width,
      async (i, u) => {
        G(), u === null && (await Me(), h("ready", s.tiles));
      }
    ), K(
      () => e.gravity,
      () => {
        const i = Re(s.tiles).slice();
        we(i, e.gravity), s.tiles = i, G(), fe && te();
      }
    ), K($, G), mt(G), yt(() => {
      const i = fe ? document.activeElement : null;
      M = i && m.el?.contains(i) ? i : null, X = M ? de() : [];
    }), wt(() => {
      const i = M, u = X;
      if (M = null, X = [], !i || document.activeElement === i || document.activeElement && document.activeElement !== document.body) return;
      if (i.isConnected) {
        i.focus({ preventScroll: !0 });
        return;
      }
      const g = u.findIndex((H) => H.contains(i));
      if (g === -1) return;
      [...u.slice(g + 1), ...u.slice(0, g).reverse()].find(
        (H) => H.isConnected && H.tabIndex >= 0
      )?.focus({ preventScroll: !0 });
    }), Ve(() => {
      f && m.el && f.disconnect(), fe && document.removeEventListener("selectstart", ae);
    });
    function n(i, u) {
      switch (i) {
        case "dragEvent":
          return O(u);
        case "resizeEvent":
          return C(u);
        case "announce":
          return le(u);
        case "measure":
          return pe();
        default:
          throw new Error(`GridBoard: dispatch received an unknown command "${String(i)}".`);
      }
    }
    function de() {
      return m.el ? [...m.el.querySelectorAll(":scope > .grid-tile:not(.grid-shadow)")] : [];
    }
    function ae(i) {
      i.preventDefault();
    }
    function I() {
      if (S) return S;
      if (!m.el) return { duration: Ue, easing: je };
      const i = getComputedStyle(m.el), u = i.getPropertyValue("--grid-tile-easing").trim();
      return S = {
        duration: Z(i.getPropertyValue("--grid-tile-duration"), Ue),
        easing: u && CSS.supports("transition-timing-function", u) ? u : je
      }, requestAnimationFrame(() => S = null), S;
    }
    function Z(i, u) {
      const g = i.trim().match(/^([\d.]+)(ms|s)?$/);
      if (!g) return u;
      const y = parseFloat(g[1]) * (g[2] === "s" ? 1e3 : 1);
      return Number.isFinite(y) ? y : u;
    }
    function se(i, u, g) {
      x && x.id !== i && x.putDown(), x = { id: i, place: u, putDown: g };
    }
    function ve(i) {
      x?.id === i && (x = null);
    }
    function _() {
      x?.putDown();
    }
    function ee(i) {
      if (!x) return null;
      const u = m.el?.querySelector(
        `.grid-tile[data-tile="${CSS.escape(String(x.id))}"]:not(.grid-shadow)`
      );
      return { tile: u, inside: !!u && u.contains(i) };
    }
    function ge(i) {
      const u = ee(i.target);
      u && !u.inside && i.preventDefault();
    }
    function ce(i) {
      const u = ee(i.target);
      if (!u || u.inside) return;
      i.preventDefault(), i.stopPropagation();
      const { x: g, y } = J(i.clientX, i.clientY);
      x.place(g, y);
    }
    function J(i, u) {
      const g = m.el.getBoundingClientRect(), [y, H] = $.value, q = e.columns, L = (g.width - y * (q + 1)) / q, T = Math.floor((i - g.left - y / 2) / (L + y)), re = Math.floor((u - g.top - H / 2) / (e.rowHeight + H));
      return { x: Math.min(Math.max(T, 0), q - 1), y: Math.max(re, 0) };
    }
    function le(i) {
      i && (s.announcement = i === s.announcement ? `${i}​` : i);
    }
    function ue() {
      Fe(e.tiles);
      const i = He(e.tiles);
      we(i, e.gravity), s.tiles = i, s.boardStyle = D(w());
    }
    function R(i, u) {
      return i?.length !== u?.length ? !0 : i.some((g, y) => {
        const H = u[y];
        return [.../* @__PURE__ */ new Set([...Object.keys(g), ...Object.keys(H)])].some((L) => g[L] !== H[L]);
      });
    }
    function te() {
      if (!R(e.tiles, s.tiles)) return;
      const i = He(s.tiles);
      W = i, h("update:tiles", i);
    }
    function xe() {
      if (!R(e.tiles, s.tiles)) return;
      const i = He(e.tiles);
      we(i, e.gravity), s.tiles = i, G(), fe && te();
    }
    function G() {
      const i = w();
      s.boardStyle.height !== i && (s.boardStyle = D(i, s.boardStyle.height));
    }
    function pe() {
      m.el && (s.width = m.el.offsetWidth);
    }
    function w() {
      if (!e.autoHeight) return;
      const i = $.value[1];
      return `${et(s.tiles) * (e.rowHeight + i) + i}px`;
    }
    function D(i, u) {
      const g = parseFloat(i) > parseFloat(u);
      return {
        position: "relative",
        height: i,
        ...g ? { transitionDuration: "var(--grid-board-grow-duration, 150ms)" } : {}
      };
    }
    function O([i, u, g, y, H, q] = []) {
      const L = Re(s.tiles).slice(), T = We(L, u) ?? { x: 0, y: 0 };
      if (i === "dragmove" && s.busy && T.x === g && T.y === y && s.shadow.w === q && s.shadow.h === H)
        return;
      const re = i === "dragmove" || i === "dragstart";
      De(L, T, g, y, !0, !1), we(L, e.gravity, u), s.tiles = L, re && (s.shadow = { ...s.shadow, x: T.x, y: T.y, w: q, h: H }), s.busy = re, G(), te();
    }
    function C([i, u, g, y, H, q] = []) {
      if (!i) return;
      const L = Re(s.tiles).slice(), T = We(L, u) ?? { x: g, y, h: 0, w: 0 };
      if (i === "resizemove" && s.busy && T.w === q && T.h === H && s.shadow.x === g && s.shadow.y === y)
        return;
      T.w = q, T.h = H;
      const re = i === "resizestart" || i === "resizemove";
      we(L, e.gravity, u), s.tiles = L, re && (s.shadow = { ...s.shadow, x: T.x, y: T.y, w: T.w, h: T.h }), s.busy = re, G(), te();
    }
    function ne(i) {
      !i || i === m.el || (m.el = i, typeof window < "u" && (f = new ResizeObserver(pe), f.observe(m.el), s.width = m.el.offsetWidth));
    }
    return (i, u) => (Ne(), Ae("div", {
      ref: ne,
      class: Pe(["grid-board", { "grid-board--busy": s.busy }]),
      style: Ze(s.boardStyle),
      onMousedownCapture: ge,
      onClickCapture: ce
    }, [
      vt(Ce(Xt, {
        id: "shadow",
        class: "grid-shadow",
        x: s.shadow.x,
        y: s.shadow.y,
        w: s.shadow.w,
        h: s.shadow.h,
        shadow: ""
      }, null, 8, ["x", "y", "w", "h"]), [
        [xt, s.busy]
      ]),
      Ce(U),
      Le("p", {
        id: ye(V),
        class: "grid-sr",
        lang: e.a11y ? void 0 : "en"
      }, _e(e.tapToMove ? `${k.value.instructions} ${k.value.tapInstructions}` : k.value.instructions), 9, Yt),
      Le("p", {
        class: "grid-sr",
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        lang: e.a11y ? void 0 : "en"
      }, _e(s.announcement), 9, Bt)
    ], 38));
  }
}, Lt = /* @__PURE__ */ nt(It, [["__scopeId", "data-v-3fe610cf"]]);
export {
  tt as GRID_BOARD,
  Lt as GridBoard,
  Xt as GridTile,
  fe as IS_BROWSER,
  we as applyGravity,
  He as copyTiles,
  Ge as getFrameDelta,
  et as getLastRow,
  Ht as getPointerOffset,
  We as getTileById,
  De as moveTile,
  Dt as usePointerDragResize,
  Fe as validateTiles
};
//# sourceMappingURL=core.js.map
