import { inject as ut, computed as A, reactive as Ue, unref as ye, watch as j, onMounted as dt, onBeforeUnmount as je, openBlock as De, createElementBlock as Te, normalizeStyle as Ke, normalizeClass as ke, renderSlot as Ye, createCommentVNode as ct, nextTick as xe, useId as ft, useSlots as gt, provide as pt, onBeforeMount as ht, onBeforeUpdate as yt, onUpdated as mt, withDirectives as wt, createVNode as Be, vShow as vt, createElementVNode as Ie, toDisplayString as Le, Fragment as bt } from "vue";
const le = typeof document < "u";
function Ve(o, a) {
  return !(o === a || o.x + o.w <= a.x || o.x >= a.x + a.w || o.y + o.h <= a.y || o.y >= a.y + a.h);
}
function Ne(o, a) {
  return o.find((c) => Ve(c, a));
}
function xt(o, a) {
  return o.filter((c) => Ve(c, a));
}
function zt(o) {
  return o.filter((a) => a.frozen);
}
function Ze(o, a) {
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
function Et(o, a, c) {
  if (c)
    for (; a.y > 0 && !Ne(o, a); )
      a.y--;
  let e;
  for (; e = Ne(o, a); )
    a.y = e.y + e.h;
}
function _e(o, a, c, e) {
  if (e) {
    const h = {
      x: c.x,
      y: Math.max(a.y - c.h, 0),
      w: c.w,
      h: c.h
    };
    if (!Ne(o, h))
      return Re(o, c, void 0, h.y, !1);
  }
  return Re(o, c, void 0, c.y + 1, !1);
}
function Mt(o) {
  return typeof o == "number" && !Number.isNaN(o);
}
function Je(o) {
  let a = 0;
  for (let c = 0, e = o.length; c < e; c++) {
    const h = o[c].y + o[c].h;
    h > a && (a = h);
  }
  return a;
}
function Se(o) {
  return (o || []).map((a) => ({ ...a }));
}
function $e(o, a) {
  return o.find((c) => c.id === a);
}
function me(o, a, c) {
  const e = zt(o), h = Ze(o, c);
  for (let E = 0, f = h.length; E < f; E++) {
    const T = h[E];
    T.frozen || (Et(e, T, a), e.push(T)), delete T.moved;
  }
}
function Re(o, a, c, e, h, E) {
  if (a.frozen) return o;
  const f = a.x, T = a.y, S = e && a.y > e;
  typeof c == "number" && (a.x = c), typeof e == "number" && (a.y = e), a.moved = !0;
  let $ = Ze(o);
  S && ($ = $.reverse());
  const M = xt($, a);
  if (E && M.length)
    return a.x = f, a.y = T, a.moved = !1, o;
  for (let w = 0, s = M.length; w < s; w++) {
    const m = M[w];
    m.moved || a.y > m.y && a.y - m.y > m.h / 4 || (m.frozen ? o = _e(o, m, a, h) : o = _e(o, a, m, h));
  }
  return o;
}
function St(o, a, c, e, h, E) {
  const f = $e(o, a);
  if (!f) return null;
  const T = Je(o);
  let S = f.x, $ = f.y;
  for (; ; ) {
    const M = Math.max(0, Math.min(h - f.w, S + c)), w = Math.max(0, Math.min(T, $ + e));
    if (M === S && w === $) return null;
    S = M, $ = w;
    const s = Se(o);
    if (Re(s, $e(s, a), S, $, !0, !1), me(s, E, a), s.some((m, W) => m.x !== o[W].x || m.y !== o[W].y)) return { x: S, y: $ };
  }
}
function Ce(o, a = "tiles") {
  if (!Array.isArray(o)) throw new Error(`vue3-grid-board: ${a} must be an array.`);
  const c = /* @__PURE__ */ new Set();
  o.forEach((e, h) => {
    for (const E of ["x", "y", "w", "h"])
      if (typeof e[E] != "number")
        throw new Error(`vue3-grid-board: ${a}[${h}].${E} must be a number.`);
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
function $t(o) {
  const a = o.target.offsetParent || document.body, c = a.getBoundingClientRect();
  return {
    x: o.clientX + a.scrollLeft - c.left,
    y: o.clientY + a.scrollTop - c.top
  };
}
function Oe(o, a, c, e) {
  return Mt(o) ? { deltaX: c - o, deltaY: e - a, lastX: o, lastY: a, x: c, y: e } : { deltaX: 0, deltaY: 0, lastX: c, lastY: e, x: c, y: e };
}
const Qe = /* @__PURE__ */ Symbol("gridBoard"), Rt = 3, q = 60, Fe = 18;
function Ht(o, a) {
  const {
    handleSelector: c = ".grid-handle",
    draggable: e = () => !1,
    resizable: h = () => !1,
    dragIgnore: E = () => null,
    dragHandle: f = () => null,
    resizeIgnore: T = () => null,
    autoScroll: S = () => !0,
    onDrag: $ = () => {
    },
    onResize: M = () => {
    },
    onTap: w = () => {
    }
  } = a;
  let s = null, m = null, W = !1, O = 0, I = 0, D = 0, L = 0, P = 0, F = 0, G = !1, n = 0, se = 0;
  function ue(y) {
    try {
      return y(), !0;
    } catch {
      return !1;
    }
  }
  function Y(y, N) {
    if (!N) return !1;
    const C = y.closest?.(N);
    return !!C && o.contains(C);
  }
  function Z(y, N = D, C = L) {
    const i = { type: y, target: o, clientX: N, clientY: C };
    m === "resize" ? M(i) : $(i);
  }
  function re() {
    F = requestAnimationFrame(() => {
      F = 0, !(s === null || !W || !G) && (G = !1, Z(`${m}move`), re());
    });
  }
  function de() {
    if (F) {
      G = !0;
      return;
    }
    Z(`${m}move`), re();
  }
  function _() {
    F && cancelAnimationFrame(F), F = 0, G = !1;
  }
  function ie() {
    _(), Z(`${m}move`);
  }
  function ce(y) {
    if (s !== null || y.pointerType === "mouse" && y.button !== 0) return;
    const N = Y(y.target, c);
    if (N && h()) {
      if (Y(y.target, T())) return;
      m = "resize";
    } else if (!N && e()) {
      const C = E(), i = f();
      if (C && Y(y.target, C) || i && !Y(y.target, i)) return;
      m = "drag";
    } else
      return;
    s = y.pointerId, W = !1, O = D = y.clientX, I = L = y.clientY, k(), ue(() => o.setPointerCapture(y.pointerId)), o.addEventListener("pointermove", oe), o.addEventListener("pointerup", J), o.addEventListener("pointercancel", J), o.addEventListener("lostpointercapture", J), window.addEventListener("resize", k, { passive: !0 });
  }
  function oe(y) {
    if (y.pointerId === s) {
      if (D = y.clientX, L = y.clientY, !W) {
        if (Math.hypot(D - O, L - I) < Rt) return;
        W = !0, Z(`${m}start`, O, I);
      }
      y.preventDefault(), de(), m === "drag" && !P && U() && S() && fe();
    }
  }
  function J(y) {
    if (y.pointerId !== s) return;
    const N = !W && y.type === "pointerup" && m;
    W && (G && ie(), Z(`${m}end`)), ae(), N && w({ mode: N, target: y.target, clientX: y.clientX, clientY: y.clientY });
  }
  function ae() {
    _(), ee(), o.removeEventListener("pointermove", oe), o.removeEventListener("pointerup", J), o.removeEventListener("pointercancel", J), o.removeEventListener("lostpointercapture", J), window.removeEventListener("resize", k), ue(() => {
      s !== null && o.hasPointerCapture?.(s) && o.releasePointerCapture(s);
    }), s = null, m = null, W = !1;
  }
  function K(y) {
    return Math.min(Fe, y / q * Fe);
  }
  function k() {
    n = window.innerWidth, se = window.innerHeight;
  }
  function U() {
    return D < q || L < q || D > n - q || L > se - q;
  }
  function fe() {
    if (P) return;
    const y = () => {
      if (P = 0, s === null || !W) return;
      const N = n, C = se;
      let i = 0, u = 0;
      L < q ? u = -K(q - L) : L > C - q && (u = K(L - (C - q))), D < q ? i = -K(q - D) : D > N - q && (i = K(D - (N - q))), (i || u) && (window.scrollBy({ left: i, top: u, behavior: "instant" }), ie(), P = requestAnimationFrame(y));
    };
    P = requestAnimationFrame(y);
  }
  function ee() {
    P && cancelAnimationFrame(P), P = 0;
  }
  o.addEventListener("pointerdown", ce);
  function ge() {
    if (o.removeEventListener("pointerdown", ce), s === null) {
      ee();
      return;
    }
    W && (G && ie(), Z(`${m}end`)), ae();
  }
  return { destroy: ge };
}
const et = (o, a) => {
  const c = o.__vccOpts || o;
  for (const [e, h] of a)
    c[e] = h;
  return c;
}, Wt = ["data-tile", "tabindex", "role", "aria-roledescription", "aria-label", "aria-describedby", "aria-hidden", "data-grabbed"], Dt = ["aria-hidden"], Tt = "a, button, input, select, textarea, label, [contenteditable]", kt = 2147483647, Nt = {
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
    const e = o, h = c, E = {
      el: void 0
    };
    a(E);
    const f = ut(Qe, null);
    if (!f)
      throw new Error(
        "GridTile must be rendered inside a GridBoard. The two are a single component pair and cannot be used apart."
      );
    let T;
    const S = /* @__PURE__ */ new Set();
    let $ = null, M = null, w = null, s = null, m = null, W = null, O = null;
    const I = A(() => f.props.columns), D = A(() => f.props.rowHeight), L = A(() => f.state.width ?? 100), P = A(() => f.gap.value), F = A(
      () => e.draggable === null ? f.props.draggable : e.draggable
    ), G = A(
      () => e.resizable === null ? f.props.resizable : e.resizable
    ), n = Ue({
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
    }), se = A(() => G.value && !e.frozen && !e.shadow), ue = A(
      () => F.value && !e.frozen && !e.shadow && !e.dragHandle
    ), Y = A(
      () => (F.value || G.value) && !e.frozen && !e.shadow
    ), Z = A(() => ye(Y) ? { touchAction: "none" } : {}), re = A(
      () => le && !e.shadow && f.props.overflow && (n.isDragging || n.isResizing || n.settling)
    ), de = A(() => ({
      "grid-tile--draggable": ue.value,
      "grid-tile--frozen": e.frozen,
      "grid-tile--dragging": n.isDragging,
      "grid-tile--resizing": n.isResizing,
      "grid-tile--settling": n.settling,
      "grid-tile--grabbed": n.grabbed
    })), _ = A(() => f.a11y.value), ie = A(() => e.label || _.value.tileName(e.id)), ce = A(
      () => _.value.tileLabel({
        name: ie.value,
        column: n.innerX + 1,
        row: n.innerY + 1,
        w: n.innerW,
        h: n.innerH
      })
    );
    k(), j([D, I], () => {
      k(), ee();
    }), j(L, () => {
      (n.isDragging || n.isResizing) && k(), ee();
    }), j([() => e.x, () => e.y, () => e.w, () => e.h], (t, r) => {
      if (n.innerX = e.x, n.innerY = e.y, n.innerW = e.w, n.innerH = e.h, k(), e.shadow || n.isDragging || n.isResizing || n.settling) return;
      const [l, d, g, z] = t, [x, v, X, Ee] = r;
      if (l === x && d === v) return;
      const be = R(x, v, X, Ee), Q = R(l, d, g, z);
      i(be.left - Q.left, be.top - Q.top, !1);
    }), j(re, k), j(() => e.radius, k), j(P, (t, r) => {
      t[0] === r[0] && t[1] === r[1] || (k(), ee());
    }), dt(() => {
      k(), oe();
    }), j(Y, oe);
    function oe() {
      const t = ye(Y);
      if (t !== !!T) {
        if (!t) {
          T.destroy(), T = null;
          return;
        }
        E.el && (T = Ht(E.el, {
          handleSelector: ".grid-handle",
          draggable: () => F.value && !e.frozen,
          resizable: () => G.value && !e.frozen,
          dragIgnore: () => e.dragIgnore,
          dragHandle: () => e.dragHandle && `.${CSS.escape(e.dragHandle)}`,
          resizeIgnore: () => e.resizeIgnore,
          autoScroll: () => !0,
          onDrag: y,
          onResize: ge,
          onTap: it
        }));
      }
    }
    je(() => {
      f.stopPlacing(e.id), he(), u(), b(), T?.destroy();
    });
    function J(t) {
      E.el = t;
    }
    function ae() {
      const t = E.el, r = M || t?.offsetParent || t?.parentElement;
      return r ? r.getBoundingClientRect() : null;
    }
    function K() {
      re.value && k();
    }
    function k() {
      const t = I.value;
      e.x + e.w > t ? (n.innerX = 0, n.innerW = e.w > t ? t : e.w) : (n.innerX = e.x, n.innerW = e.w);
      const { innerX: r, innerY: l, innerW: d, innerH: g } = n, z = D.value, [x, v] = P.value, X = `((100% - ${(t + 1) * x}px) / ${t})`;
      let Ee = `${z * l + (l + 1) * v}px`, be = `calc(${X} * ${r} + ${(r + 1) * x}px)`, Q = null;
      if (n.isDragging) {
        const ne = R(r, l, d, g);
        s = ne, Ee = `${ne.top}px`, be = `${ne.left}px`, Q = {
          dx: n.dragging.left - ne.left,
          dy: n.dragging.top - ne.top
        };
      } else
        s = null;
      if (re.value) {
        const ne = ae();
        if (ne) {
          const Me = n.isDragging ? s : R(r, l, d, g), We = {
            position: "fixed",
            top: `${ne.top + Me.top}px`,
            left: `${ne.left + Me.left}px`,
            width: `${n.isResizing ? n.resizing.width : Me.width}px`,
            height: `${n.isResizing ? n.resizing.height : Me.height}px`,
            zIndex: String(kt),
            transition: "none",
            ...Q ? {
              transform: `translate3d(${Q.dx}px, ${Q.dy}px, 0)`,
              willChange: "transform"
            } : {},
            "--grid-radius": `${e.radius}px`
          };
          if (w && U(w, We)) return;
          w = We, n.style = We;
          return;
        }
      }
      const He = {
        position: "absolute",
        top: Ee,
        left: be,
        width: n.isResizing ? `${n.resizing.width}px` : d === 1 / 0 ? "auto" : `calc(${X} * ${d} + ${Math.max(0, d - 1) * x}px)`,
        height: n.isResizing ? `${n.resizing.height}px` : g === 1 / 0 ? "auto" : `${z * g + Math.max(0, g - 1) * v}px`,
        ...Q ? {
          transform: `translate3d(${Q.dx}px, ${Q.dy}px, 0)`,
          transition: "none",
          willChange: "transform"
        } : n.isResizing ? { transition: "none" } : {},
        "--grid-radius": `${e.radius}px`
      };
      w && U(w, He) || (w = He, n.style = He);
    }
    function U(t, r) {
      const l = Object.keys(r);
      return Object.keys(t).length !== l.length ? !1 : l.every((d) => t[d] === r[d]);
    }
    function fe(t) {
      const r = E.el;
      if (!r || !w || !s) return;
      const l = `translate3d(${t.left - s.left}px, ${t.top - s.top}px, 0)`;
      w.transform !== l && (w.transform = l, r.style.transform = l);
    }
    function ee() {
      const { width: t, height: r } = R(n.innerX, n.innerY, n.innerW, n.innerH);
      !Number.isFinite(t) || !Number.isFinite(r) || h("size", e.id, t, r);
    }
    function ge(t) {
      if (e.frozen && !(t.type === "resizeend" && n.isResizing)) return;
      t.type === "resizestart" && p(t.target);
      const r = B(t);
      if (r == null) return;
      const { x: l, y: d } = r, g = { width: 0, height: 0 };
      let z = null, x;
      switch (t.type) {
        case "resizestart": {
          f.cancelPlacing(), n.resizeMin = R(0, 0, e.minW, e.minH), n.resizeMax = R(0, 0, e.maxW, e.maxH), n.previousW = n.innerW, n.previousH = n.innerH, x = R(n.innerX, n.innerY, n.innerW, n.innerH), g.width = x.width, g.height = x.height, n.resizing = g, n.isResizing = !0, h("resizestart", e.id, n.innerW, n.innerH);
          break;
        }
        case "resizemove": {
          const X = Oe(n.lastW, n.lastH, l, d);
          g.width = Math.max(
            n.resizeMin.width,
            Math.min(n.resizeMax.width, n.resizing.width + X.deltaX)
          ), g.height = Math.max(
            n.resizeMin.height,
            Math.min(n.resizeMax.height, n.resizing.height + X.deltaY)
          ), n.resizing = g;
          break;
        }
        case "resizeend": {
          z = n.resizing, x = R(n.innerX, n.innerY, n.innerW, n.innerH), g.width = x.width, g.height = x.height, n.resizing = null, n.isResizing = !1;
          break;
        }
      }
      k(), x = Pe(ze(g.height, g.width));
      const v = z ? Pe(ze(z.height, z.width)) : x;
      n.lastW = l, n.lastH = d, (n.innerW !== x.w || n.innerH !== x.h) && h("resize", e.id, x.w, x.h), t.type === "resizeend" && (n.previousW !== v.w || n.previousH !== v.h) && h("resizeend", e.id, v.w, v.h), f.resizeEvent([t.type, e.id, n.innerX, n.innerY, v.h, v.w]), t.type === "resizeend" && b();
    }
    function y(t) {
      if (n.isResizing || e.frozen && !(t.type === "dragend" && n.isDragging)) return;
      t.type === "dragstart" && p(t.target);
      const r = B(t);
      if (r === null) return;
      const { x: l, y: d } = r, g = { top: 0, left: 0 };
      switch (t.type) {
        case "dragstart":
        case "dragend": {
          if (t.type === "dragend" && !n.isDragging) return;
          t.type === "dragstart" && (f.cancelPlacing(), n.previousX = n.innerX, n.previousY = n.innerY, u());
          const v = ae() ?? { left: 0, top: 0 }, X = t.target.getBoundingClientRect();
          g.left = X.left - v.left, g.top = X.top - v.top, n.dragging = t.type === "dragstart" ? g : null, n.isDragging = t.type === "dragstart", t.type === "dragstart" && h("dragstart", e.id, n.innerX, n.innerY);
          break;
        }
        case "dragmove": {
          const v = Oe(n.lastX, n.lastY, l, d);
          g.left = n.dragging.left + v.deltaX, g.top = n.dragging.top + v.deltaY, n.dragging = g;
          break;
        }
      }
      t.type !== "dragmove" && k();
      const z = H(g.top, g.left), x = n.innerX !== z.x || n.innerY !== z.y;
      if (t.type === "dragmove" && (x ? k() : fe(g)), n.lastX = l, n.lastY = d, x && h("drag", e.id, z.x, z.y), t.type === "dragend" && (n.previousX !== n.innerX || n.previousY !== n.innerY) && h("dragend", e.id, z.x, z.y), f.dragEvent([t.type, e.id, z.x, z.y, n.innerH, n.innerW]), t.type === "dragend") {
        if (le && E.el) {
          const v = f.state.tiles.find((X) => X.id === e.id);
          if (v) {
            const X = R(v.x, v.y, v.w, v.h);
            i(g.left - X.left, g.top - X.top), k();
          }
        }
        b();
      }
    }
    function N(t) {
      if (!t || t === "none") return { dx: 0, dy: 0 };
      const r = t.match(/-?[\d.]+(?:e[-+]?\d+)?/g)?.map(Number);
      return r ? t.startsWith("matrix3d") ? { dx: r[12] ?? 0, dy: r[13] ?? 0 } : t.startsWith("matrix") ? { dx: r[4] ?? 0, dy: r[5] ?? 0 } : { dx: r[0] ?? 0, dy: r[1] ?? 0 } : { dx: 0, dy: 0 };
    }
    function C(t) {
      if (S.size === 0) return { dx: 0, dy: 0 };
      const r = N(getComputedStyle(t).transform), l = N(w?.transform);
      for (const d of S)
        d.onfinish = null, d.oncancel = null, d.cancel();
      return S.clear(), n.settling = !1, { dx: r.dx - l.dx, dy: r.dy - l.dy };
    }
    function i(t, r, l = !0) {
      const d = E.el;
      if (!d || typeof d.animate != "function") return;
      const g = C(d);
      if (t += g.dx, r += g.dy, Math.abs(t) < 0.5 && Math.abs(r) < 0.5) return;
      const { duration: z, easing: x } = f.settleTiming();
      if (z === 0) return;
      const v = d.animate(
        [{ transform: `translate3d(${t}px, ${r}px, 0)` }, { transform: "translate3d(0px, 0px, 0)" }],
        { duration: z, easing: x, composite: "add" }
      );
      S.add(v), l && (n.settling = !0);
      const X = () => {
        S.delete(v), S.size === 0 && (n.settling = !1);
      };
      v.onfinish = X, v.oncancel = X;
    }
    function u() {
      for (const t of S)
        t.onfinish = null, t.oncancel = null, t.cancel();
      S.clear(), n.settling = !1;
    }
    function p(t) {
      b(), M = t.offsetParent || null;
      const r = M || document.body, l = { offsetParent: r, left: 0, top: 0, measure: null };
      l.measure = () => {
        const d = r === document.body ? { left: 0, top: 0 } : r.getBoundingClientRect();
        l.left = d.left - r.scrollLeft, l.top = d.top - r.scrollTop, K();
      }, l.measure(), $ = l, window.addEventListener("scroll", l.measure, { passive: !0, capture: !0 }), window.addEventListener("resize", l.measure, { passive: !0 });
    }
    function b() {
      M = null, $ && (window.removeEventListener("scroll", $.measure, { capture: !0 }), window.removeEventListener("resize", $.measure), $ = null);
    }
    function B(t) {
      return $ ? { x: t.clientX - $.left, y: t.clientY - $.top } : $t(t);
    }
    function R(t, r, l, d) {
      const g = V(), z = D.value, [x, v] = P.value;
      return {
        left: Math.round(g * t + (t + 1) * x),
        top: Math.round(z * r + (r + 1) * v),
        width: l === 1 / 0 ? l : Math.round(g * l + Math.max(0, l - 1) * x),
        height: d === 1 / 0 ? d : Math.round(z * d + Math.max(0, d - 1) * v)
      };
    }
    function H(t, r) {
      const l = V(), [d, g] = P.value, z = Math.round((r - d) / (l + d)), x = Math.round((t - g) / (D.value + g));
      return {
        x: Math.max(Math.min(z, I.value - n.innerW), 0),
        y: Math.max(x, 0)
      };
    }
    function V() {
      const t = I.value;
      return (L.value - P.value[0] * (t + 1)) / t;
    }
    function ze(t, r) {
      const l = V(), [d, g] = P.value, z = Math.round((r + d) / (l + d)), x = Math.round((t + g) / (D.value + g));
      return {
        w: Math.max(Math.min(z, I.value - n.innerX), 0),
        h: Math.max(x, 0)
      };
    }
    function Pe(t) {
      return {
        w: Math.max(e.minW, Math.min(e.maxW, t.w), 1),
        h: Math.max(e.minH, Math.min(e.maxH, t.h), 1)
      };
    }
    const tt = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };
    function te() {
      const t = f.state.tiles.find((r) => r.id === e.id);
      return t ? { x: t.x, y: t.y, w: t.w, h: t.h } : { x: n.innerX, y: n.innerY, w: n.innerW, h: n.innerH };
    }
    function we(t) {
      const r = te(), l = _.value.tileLabel({
        name: ie.value,
        column: r.x + 1,
        row: r.y + 1,
        w: r.w,
        h: r.h
      });
      f.announce(t ? `${l}. ${t}` : l);
    }
    function pe(t) {
      if (m === t) return;
      m && he();
      const r = te();
      m = t, t === "drag" ? (h("dragstart", e.id, r.x, r.y), f.dragEvent(["dragstart", e.id, r.x, r.y, r.h, r.w])) : (h("resizestart", e.id, r.w, r.h), f.resizeEvent(["resizestart", e.id, r.x, r.y, r.h, r.w]));
    }
    function he() {
      if (!m) return;
      const t = m;
      m = null;
      const r = te();
      t === "drag" ? f.dragEvent(["dragend", e.id, r.x, r.y, r.h, r.w]) : f.resizeEvent(["resizeend", e.id, r.x, r.y, r.h, r.w]);
    }
    function nt(t, r) {
      if (!F.value || e.frozen) return;
      pe("drag");
      const l = te(), d = St(
        f.state.tiles,
        e.id,
        t,
        r,
        I.value,
        f.props.gravity
      );
      d && (f.dragEvent(["dragmove", e.id, d.x, d.y, l.h, l.w]), h("drag", e.id, d.x, d.y)), xe(() => we());
    }
    function rt(t, r) {
      if (!G.value || e.frozen) return;
      pe("resize");
      const l = te(), d = Math.max(e.minW, Math.min(e.maxW, I.value - l.x, l.w + t)), g = Math.max(e.minH, Math.min(e.maxH, l.h + r));
      (d !== l.w || g !== l.h) && (f.resizeEvent(["resizemove", e.id, l.x, l.y, g, d]), h("resize", e.id, d, g)), xe(() => we());
    }
    function Xe(t = _.value.pickedUp) {
      W = te(), n.grabbed = !0, we(t);
    }
    function ve() {
      if (!n.grabbed) return;
      const t = m !== null;
      he(), Ae(), n.grabbed = !1, W = null, xe(() => we(t ? _.value.dropped : _.value.putDown));
    }
    function it({ mode: t, target: r }) {
      if (!f.props.tapToMove || !ye(Y)) return;
      const l = f.placingId();
      if (l !== null && l !== e.id) return;
      const d = r.closest?.(Tt);
      if (!(d && d !== E.el && E.el.contains(d))) {
        if (n.grabbed) {
          ve();
          return;
        }
        O = t, E.el.focus({ preventScroll: !0 }), Xe(t === "resize" ? _.value.pickedUpToResize : _.value.pickedUpToMove), f.startPlacing(e.id, ot, ve);
      }
    }
    function ot(t, r) {
      const l = te();
      if (O === "resize") {
        const d = Math.max(
          e.minW,
          Math.min(e.maxW, I.value - l.x, t - l.x + 1)
        ), g = Math.max(e.minH, Math.min(e.maxH, r - l.y + 1));
        (d !== l.w || g !== l.h) && (pe("resize"), f.resizeEvent(["resizemove", e.id, l.x, l.y, g, d]), h("resize", e.id, d, g));
      } else {
        const d = Math.max(0, Math.min(t, I.value - l.w));
        (d !== l.x || r !== l.y) && (pe("drag"), f.dragEvent(["dragmove", e.id, d, r, l.h, l.w]), h("drag", e.id, d, r));
      }
      ve();
    }
    function Ae() {
      O && (O = null, f.stopPlacing(e.id));
    }
    function at() {
      if (!n.grabbed) return;
      const t = W;
      if (he(), Ae(), t) {
        let r = te();
        (r.w !== t.w || r.h !== t.h) && (pe("resize"), f.resizeEvent(["resizemove", e.id, r.x, r.y, t.h, t.w]), he(), r = te()), (r.x !== t.x || r.y !== t.y) && (pe("drag"), f.dragEvent(["dragmove", e.id, t.x, t.y, t.h, t.w]), he());
      }
      n.grabbed = !1, W = null, xe(() => we(_.value.returned));
    }
    function st(t) {
      if (!ye(Y) || t.target !== E.el || t.altKey || t.ctrlKey || t.metaKey) return;
      if (t.key === "Enter" || t.key === " ") {
        t.preventDefault(), n.grabbed ? ve() : Xe();
        return;
      }
      if (t.key === "Escape") {
        if (!n.grabbed) return;
        t.preventDefault(), at();
        return;
      }
      const r = tt[t.key];
      !r || !n.grabbed || (t.preventDefault(), t.shiftKey ? rt(r[0], r[1]) : nt(r[0], r[1]));
    }
    function lt() {
      n.grabbed && ve();
    }
    return (t, r) => (De(), Te("div", {
      ref: J,
      class: ke(["grid-tile", de.value]),
      style: Ke([n.style, Z.value]),
      "data-tile": o.id,
      tabindex: Y.value ? 0 : void 0,
      role: Y.value ? "group" : void 0,
      "aria-roledescription": Y.value ? _.value.roleDescription : void 0,
      "aria-label": Y.value ? ce.value : void 0,
      "aria-describedby": Y.value ? ye(f).instructionsId : void 0,
      "aria-hidden": o.shadow ? "true" : void 0,
      "data-grabbed": n.grabbed ? "true" : void 0,
      onKeydown: st,
      onBlur: lt
    }, [
      Ye(t.$slots, "default", {}, void 0, !0),
      se.value ? (De(), Te("span", {
        key: 0,
        class: ke(["grid-handle", { "grid-handle--chevron": !t.$slots.handle }]),
        "aria-hidden": t.$slots.handle ? void 0 : "true"
      }, [
        Ye(t.$slots, "handle", {}, void 0, !0)
      ], 10, Dt)) : ct("", !0)
    ], 46, Wt));
  }
}, Pt = /* @__PURE__ */ et(Nt, [["__scopeId", "data-v-eaecd33c"]]), Xt = ["id", "lang"], At = ["lang"], Ge = 220, qe = "cubic-bezier(0.2, 0, 0, 1)", Yt = {
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
    const e = o, h = c, E = {
      roleDescription: "Draggable tile",
      tileName: (i) => `Tile ${i}`,
      tileLabel: ({ name: i, column: u, row: p, w: b, h: B }) => `${i}, column ${u}, row ${p}, ${b} wide, ${B} tall`,
      instructions: "Press Enter or Space to pick the tile up. Then use the arrow keys to move it, or hold Shift with the arrow keys to resize it. Press Enter to drop it, or Escape to put it back.",
      tapInstructions: "Without a keyboard, tap the tile and then tap where it should go, or tap its corner grip and then tap where that corner should go.",
      pickedUp: "Picked up. Arrow keys move, Shift plus arrow keys resize, Enter drops, Escape cancels.",
      pickedUpToMove: "Picked up. Tap where it should go, or tap it again to put it down.",
      pickedUpToResize: "Picked up to resize. Tap where its corner should go, or tap it again to put it down.",
      dropped: "Dropped.",
      putDown: "Put down.",
      returned: "Returned to where it started."
    };
    let f = null, T = null, S = null, $ = null, M = null;
    const w = {
      el: void 0,
      dispatch: G
    };
    a(w);
    const s = Ue({
      width: null,
      boardStyle: {},
      busy: !1,
      shadow: { x: 0, y: 0, w: 0, h: 0, id: -1 },
      tiles: [],
      announcement: ""
    }), m = A(() => {
      const i = e.gap;
      if (Array.isArray(i)) return [Number(i[0]) || 0, Number(i[1]) || 0];
      const u = Number(i) || 0;
      return [u, u];
    }), W = ft(), O = A(() => ({ ...E, ...e.a11y })), I = gt();
    let D = /* @__PURE__ */ new Map();
    const L = A(() => {
      if (s.busy) return D;
      const i = [...s.tiles].sort((u, p) => u.y - p.y || u.x - p.x);
      return D = new Map(i.map((u, p) => [String(u.id), p])), D;
    });
    function P(i, u = []) {
      for (const p of i)
        p.type === bt && Array.isArray(p.children) ? P(p.children, u) : u.push(p);
      return u;
    }
    function F() {
      const i = L.value, u = (p) => {
        const b = i.get(String(p.props?.id));
        return b === void 0 ? Number.MAX_SAFE_INTEGER : b;
      };
      return P(I.default?.() ?? []).map((p, b) => ({ node: p, index: b })).sort((p, b) => u(p.node) - u(b.node) || p.index - b.index).map((p) => p.node);
    }
    pt(Qe, {
      props: e,
      state: s,
      gap: m,
      instructionsId: W,
      dragEvent: y,
      resizeEvent: N,
      announce: oe,
      settleTiming: se,
      a11y: O,
      startPlacing: Y,
      stopPlacing: Z,
      cancelPlacing: re,
      placingId: () => M?.id ?? null
    }), J(), le && (j(
      () => e.tiles,
      () => {
        e.tiles !== T && (Ce(e.tiles), k());
      },
      { immediate: !0 }
    ), j(
      () => s.busy,
      (i) => {
        i ? (window.getSelection()?.removeAllRanges(), document.addEventListener("selectstart", n)) : document.removeEventListener("selectstart", n);
      }
    )), j(
      () => s.width,
      async (i, u) => {
        U(), u === null && (await xe(), h("ready", s.tiles));
      }
    ), j(
      () => e.gravity,
      () => {
        me(s.tiles, e.gravity), U(), le && K();
      }
    ), j(m, U), ht(U), yt(() => {
      const i = le ? document.activeElement : null;
      $ = i && w.el?.contains(i) ? i : null;
    }), mt(() => {
      const i = $;
      $ = null, !(!i || !i.isConnected || document.activeElement === i) && (document.activeElement && document.activeElement !== document.body || i.focus({ preventScroll: !0 }));
    }), je(() => {
      f && w.el && f.disconnect(), le && document.removeEventListener("selectstart", n);
    });
    function G(i, u) {
      switch (i) {
        case "dragEvent":
          return y(u);
        case "resizeEvent":
          return N(u);
        case "announce":
          return oe(u);
        case "measure":
          return fe();
        default:
          throw new Error(`GridBoard: dispatch received an unknown command "${String(i)}".`);
      }
    }
    function n(i) {
      i.preventDefault();
    }
    function se() {
      if (S) return S;
      if (!w.el) return { duration: Ge, easing: qe };
      const i = getComputedStyle(w.el), u = i.getPropertyValue("--grid-tile-easing").trim();
      return S = {
        duration: ue(i.getPropertyValue("--grid-tile-duration"), Ge),
        easing: u && CSS.supports("transition-timing-function", u) ? u : qe
      }, requestAnimationFrame(() => S = null), S;
    }
    function ue(i, u) {
      const p = i.trim().match(/^([\d.]+)(ms|s)?$/);
      if (!p) return u;
      const b = parseFloat(p[1]) * (p[2] === "s" ? 1e3 : 1);
      return Number.isFinite(b) ? b : u;
    }
    function Y(i, u, p) {
      M && M.id !== i && M.putDown(), M = { id: i, place: u, putDown: p };
    }
    function Z(i) {
      M?.id === i && (M = null);
    }
    function re() {
      M?.putDown();
    }
    function de(i) {
      if (!M) return null;
      const u = w.el?.querySelector(
        `.grid-tile[data-tile="${CSS.escape(String(M.id))}"]:not(.grid-shadow)`
      );
      return { tile: u, inside: !!u && u.contains(i) };
    }
    function _(i) {
      const u = de(i.target);
      u && !u.inside && i.preventDefault();
    }
    function ie(i) {
      const u = de(i.target);
      if (!u || u.inside) return;
      i.preventDefault(), i.stopPropagation();
      const { x: p, y: b } = ce(i.clientX, i.clientY);
      M.place(p, b);
    }
    function ce(i, u) {
      const p = w.el.getBoundingClientRect(), [b, B] = m.value, R = e.columns, H = (p.width - b * (R + 1)) / R, V = Math.floor((i - p.left - b / 2) / (H + b)), ze = Math.floor((u - p.top - B / 2) / (e.rowHeight + B));
      return { x: Math.min(Math.max(V, 0), R - 1), y: Math.max(ze, 0) };
    }
    function oe(i) {
      i && (s.announcement = i === s.announcement ? `${i}​` : i);
    }
    function J() {
      Ce(e.tiles), s.tiles = Se(e.tiles), me(s.tiles, e.gravity), s.boardStyle = ge(ee());
    }
    function ae(i, u) {
      return i?.length !== u?.length ? !0 : i.some((p, b) => {
        const B = u[b];
        return [.../* @__PURE__ */ new Set([...Object.keys(p), ...Object.keys(B)])].some((H) => p[H] !== B[H]);
      });
    }
    function K() {
      if (!ae(e.tiles, s.tiles)) return;
      const i = Se(s.tiles);
      T = i, h("update:tiles", i);
    }
    function k() {
      ae(e.tiles, s.tiles) && (s.tiles = Se(e.tiles), me(s.tiles, e.gravity), U(), le && K());
    }
    function U() {
      const i = ee();
      s.boardStyle.height !== i && (s.boardStyle = ge(i, s.boardStyle.height));
    }
    function fe() {
      w.el && (s.width = w.el.offsetWidth);
    }
    function ee() {
      if (!e.autoHeight) return;
      const i = m.value[1];
      return `${Je(s.tiles) * (e.rowHeight + i) + i}px`;
    }
    function ge(i, u) {
      const p = parseFloat(i) > parseFloat(u);
      return {
        position: "relative",
        height: i,
        ...p ? { transitionDuration: "var(--grid-board-grow-duration, 150ms)" } : {}
      };
    }
    function y([i, u, p, b, B, R] = []) {
      const H = $e(s.tiles, u) ?? { x: 0, y: 0 };
      if (i === "dragmove" && s.busy && H.x === p && H.y === b && s.shadow.w === R && s.shadow.h === B)
        return;
      const V = i === "dragmove" || i === "dragstart";
      s.tiles = Re(s.tiles, H, p, b, !0, !1), me(s.tiles, e.gravity, u), V && (s.shadow = { ...s.shadow, x: H.x, y: H.y, w: R, h: B }), s.busy = V, U(), K();
    }
    function N([i, u, p, b, B, R] = []) {
      if (!i) return;
      const H = $e(s.tiles, u) ?? { x: p, y: b, h: 0, w: 0 };
      if (i === "resizemove" && s.busy && H.w === R && H.h === B && s.shadow.x === p && s.shadow.y === b)
        return;
      H.w = R, H.h = B;
      const V = i === "resizestart" || i === "resizemove";
      me(s.tiles, e.gravity, u), V && (s.shadow = { ...s.shadow, x: H.x, y: H.y, w: H.w, h: H.h }), s.busy = V, U(), K();
    }
    function C(i) {
      !i || i === w.el || (w.el = i, typeof window < "u" && (f = new ResizeObserver(fe), f.observe(w.el), s.width = w.el.offsetWidth));
    }
    return (i, u) => (De(), Te("div", {
      ref: C,
      class: ke(["grid-board", { "grid-board--busy": s.busy }]),
      style: Ke(s.boardStyle),
      onMousedownCapture: _,
      onClickCapture: ie
    }, [
      wt(Be(Pt, {
        id: "shadow",
        class: "grid-shadow",
        x: s.shadow.x,
        y: s.shadow.y,
        w: s.shadow.w,
        h: s.shadow.h,
        shadow: ""
      }, null, 8, ["x", "y", "w", "h"]), [
        [vt, s.busy]
      ]),
      Be(F),
      Ie("p", {
        id: ye(W),
        class: "grid-sr",
        lang: e.a11y ? void 0 : "en"
      }, Le(e.tapToMove ? `${O.value.instructions} ${O.value.tapInstructions}` : O.value.instructions), 9, Xt),
      Ie("p", {
        class: "grid-sr",
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        lang: e.a11y ? void 0 : "en"
      }, Le(s.announcement), 9, At)
    ], 38));
  }
}, It = /* @__PURE__ */ et(Yt, [["__scopeId", "data-v-e072bfd4"]]);
export {
  Qe as GRID_BOARD,
  It as GridBoard,
  Pt as GridTile,
  le as IS_BROWSER,
  me as applyGravity,
  Se as copyTiles,
  Oe as getFrameDelta,
  Je as getLastRow,
  $t as getPointerOffset,
  $e as getTileById,
  Re as moveTile,
  Ht as usePointerDragResize,
  Ce as validateTiles
};
//# sourceMappingURL=core.js.map
