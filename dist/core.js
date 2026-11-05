import { inject as ct, computed as X, reactive as Ke, unref as ye, watch as K, onMounted as ft, onBeforeUnmount as Ve, openBlock as Ne, createElementBlock as Ae, normalizeStyle as Ze, normalizeClass as Pe, renderSlot as Ie, createCommentVNode as gt, nextTick as Me, toRaw as He, useId as pt, useSlots as ht, provide as mt, onBeforeMount as yt, onBeforeUpdate as wt, onUpdated as vt, withDirectives as xt, createVNode as Ce, vShow as bt, createElementVNode as Le, toDisplayString as _e, Fragment as zt } from "vue";
const fe = typeof document < "u";
function Je(a, o) {
  return !(a === o || a.x + a.w <= o.x || a.x >= o.x + o.w || a.y + a.h <= o.y || a.y >= o.y + o.h);
}
function Xe(a, o) {
  return a.find((d) => Je(d, o));
}
function Et(a, o) {
  return a.filter((d) => Je(d, o));
}
function Mt(a) {
  return a.filter((o) => o.frozen);
}
function Qe(a, o) {
  return [].concat(a).sort((d, e) => {
    if (d.y === e.y) {
      if (o !== void 0) {
        if (d.id === o) return -1;
        if (e.id === o) return 1;
      }
      if (d.x === e.x) return 0;
    }
    return d.y > e.y || d.y === e.y && d.x > e.x ? 1 : -1;
  });
}
function et(a, o) {
  return !(a.x + a.w <= o.x) && !(a.x >= o.x + o.w);
}
function St(a, o, d) {
  const e = a.filter((x) => et(x, o));
  if (d)
    for (; o.y > 0 && !Xe(e, o); )
      o.y--;
  let m;
  for (; m = Xe(e, o); )
    o.y = m.y + m.h;
}
function Oe(a, o, d, e) {
  if (e) {
    const m = {
      x: d.x,
      y: Math.max(o.y - d.h, 0),
      w: d.w,
      h: d.h
    };
    if (!Xe(a, m))
      return Se(a, d, void 0, m.y, !1);
  }
  return Se(a, d, void 0, d.y + 1, !1);
}
function $t(a, o, d) {
  const e = d > o.x ? 1 : -1, m = a.filter((E) => E !== o && !E.frozen && E.y === o.y), x = /* @__PURE__ */ new Map();
  let f = o.x;
  for (let E = o.x + e; e > 0 ? E <= d : E >= d; E += e) {
    const M = { x: e > 0 ? Math.max(f, E) : Math.min(f, E), w: o.w }, S = m.filter((g) => !x.has(g) && et(g, M)).sort((g, s) => e * (g.x - s.x));
    if (!S.length) {
      f = M.x;
      continue;
    }
    const H = [];
    for (const g of S) {
      const s = g.x + g.w / 2;
      if (e > 0 ? M.x + o.w > s : M.x < s) H.push(g);
      else break;
    }
    if (!H.length) continue;
    let y = e > 0 ? f : f + o.w;
    for (const g of H)
      e > 0 ? (x.set(g, y), y += g.w) : (y -= g.w, x.set(g, y));
    f = e > 0 ? y : y - o.w;
  }
  return { at: f, placed: x };
}
function Rt(a) {
  return typeof a == "number" && !Number.isNaN(a);
}
function tt(a) {
  let o = 0;
  for (let d = 0, e = a.length; d < e; d++) {
    const m = a[d].y + a[d].h;
    m > o && (o = m);
  }
  return o;
}
function We(a) {
  return (a || []).map((o) => ({ ...o }));
}
function De(a, o) {
  return a.find((d) => d.id === o);
}
function we(a, o, d) {
  const e = Mt(a), m = Qe(a, d);
  for (let x = 0, f = m.length; x < f; x++) {
    const E = m[x];
    E.frozen || (St(e, E, o), e.push(E)), delete E.moved;
  }
}
function Se(a, o, d, e, m, x) {
  if (o.frozen) return a;
  const f = o.x, E = o.y;
  if (m && !x && typeof d == "number" && d !== f && (e === void 0 || e === E) && a.includes(o)) {
    const { at: y, placed: g } = $t(a, o, d);
    d = y, o.x = y, o.moved = !0;
    for (const [s, R] of g) Se(a, s, R, s.y, !1);
  }
  const M = e && o.y > e;
  typeof d == "number" && (o.x = d), typeof e == "number" && (o.y = e), o.moved = !0;
  let S = Qe(a);
  M && (S = S.reverse());
  const H = Et(S, o);
  if (x && H.length)
    return o.x = f, o.y = E, o.moved = !1, a;
  for (let y = 0, g = H.length; y < g; y++) {
    const s = H[y];
    s.moved || o.y > s.y && o.y - s.y > s.h / 4 || (s.frozen ? a = Oe(a, s, o, m) : a = Oe(a, o, s, m));
  }
  return a;
}
function Ht(a, o, d, e, m, x) {
  const f = De(a, o);
  if (!f) return null;
  const E = tt(a);
  let M = f.x, S = f.y;
  for (; ; ) {
    const H = Math.max(0, Math.min(m - f.w, M + d)), y = Math.max(0, Math.min(E, S + e));
    if (H === M && y === S) return null;
    M = H, S = y;
    const g = We(a);
    if (Se(g, De(g, o), M, S, !0, !1), we(g, x, o), g.some((s, R) => s.x !== a[R].x || s.y !== a[R].y)) return { x: M, y: S };
  }
}
function Fe(a, o = "tiles") {
  if (!Array.isArray(a)) throw new Error(`vue3-grid-board: ${o} must be an array.`);
  const d = /* @__PURE__ */ new Set();
  a.forEach((e, m) => {
    for (const x of ["x", "y", "w", "h"])
      if (typeof e[x] != "number")
        throw new Error(`vue3-grid-board: ${o}[${m}].${x} must be a number.`);
    if (e.id === void 0 || e.id === null)
      throw new Error(`vue3-grid-board: ${o}[${m}].id is required.`);
    if (typeof e.id != "number" && typeof e.id != "string")
      throw new Error(`vue3-grid-board: ${o}[${m}].id must be a string or a number.`);
    if (d.has(e.id))
      throw new Error(
        `vue3-grid-board: ${o}[${m}].id must be unique (saw "${e.id}" twice).`
      );
    if (d.add(e.id), e.frozen !== void 0 && typeof e.frozen != "boolean")
      throw new Error(`vue3-grid-board: ${o}[${m}].frozen must be a boolean.`);
  });
}
function Wt(a) {
  const o = a.target.offsetParent || document.body, d = o.getBoundingClientRect();
  return {
    x: a.clientX + o.scrollLeft - d.left,
    y: a.clientY + o.scrollTop - d.top
  };
}
function Ge(a, o, d, e) {
  return Rt(a) ? { deltaX: d - a, deltaY: e - o, lastX: a, lastY: o, x: d, y: e } : { deltaX: 0, deltaY: 0, lastX: d, lastY: e, x: d, y: e };
}
const nt = /* @__PURE__ */ Symbol("gridBoard"), Dt = 3, j = 60, qe = 18;
function Tt(a, o) {
  const {
    handleSelector: d = ".grid-handle",
    draggable: e = () => !1,
    resizable: m = () => !1,
    dragIgnore: x = () => null,
    dragHandle: f = () => null,
    resizeIgnore: E = () => null,
    autoScroll: M = () => !0,
    onDrag: S = () => {
    },
    onResize: H = () => {
    },
    onTap: y = () => {
    }
  } = o;
  let g = null, s = null, R = !1, V = 0, N = 0, A = 0, Y = 0, B = 0, F = 0, U = !1, n = 0, de = 0;
  function ae(v) {
    try {
      return v(), !0;
    } catch {
      return !1;
    }
  }
  function I(v, T) {
    if (!T) return !1;
    const O = v.closest?.(T);
    return !!O && a.contains(O);
  }
  function Z(v, T = A, O = Y) {
    const C = { type: v, target: a, clientX: T, clientY: O };
    s === "resize" ? H(C) : S(C);
  }
  function se() {
    F = requestAnimationFrame(() => {
      F = 0, !(g === null || !R || !U) && (U = !1, Z(`${s}move`), se());
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
  function ge(v) {
    if (g !== null || v.pointerType === "mouse" && v.button !== 0) return;
    const T = I(v.target, d);
    if (T && m()) {
      if (I(v.target, E())) return;
      s = "resize";
    } else if (!T && e()) {
      const O = x(), C = f();
      if (O && I(v.target, O) || C && !I(v.target, C)) return;
      s = "drag";
    } else
      return;
    g = v.pointerId, R = !1, V = A = v.clientX, N = Y = v.clientY, W(), ae(() => a.setPointerCapture(v.pointerId)), a.addEventListener("pointermove", ce), a.addEventListener("pointerup", J), a.addEventListener("pointercancel", J), a.addEventListener("lostpointercapture", J), window.addEventListener("resize", W, { passive: !0 });
  }
  function ce(v) {
    if (v.pointerId === g) {
      if (A = v.clientX, Y = v.clientY, !R) {
        if (Math.hypot(A - V, Y - N) < Dt) return;
        R = !0, Z(`${s}start`, V, N);
      }
      v.preventDefault(), ve(), s === "drag" && !B && te() && M() && xe();
    }
  }
  function J(v) {
    if (v.pointerId !== g) return;
    const T = !R && v.type === "pointerup" && s;
    R && (U && ee(), Z(`${s}end`)), le(), T && y({ mode: T, target: v.target, clientX: v.clientX, clientY: v.clientY });
  }
  function le() {
    _(), G(), a.removeEventListener("pointermove", ce), a.removeEventListener("pointerup", J), a.removeEventListener("pointercancel", J), a.removeEventListener("lostpointercapture", J), window.removeEventListener("resize", W), ae(() => {
      g !== null && a.hasPointerCapture?.(g) && a.releasePointerCapture(g);
    }), g = null, s = null, R = !1;
  }
  function ue(v) {
    return Math.min(qe, v / j * qe);
  }
  function W() {
    n = window.innerWidth, de = window.innerHeight;
  }
  function te() {
    return A < j || Y < j || A > n - j || Y > de - j;
  }
  function xe() {
    if (B) return;
    const v = () => {
      if (B = 0, g === null || !R) return;
      const T = n, O = de;
      let C = 0, ne = 0;
      Y < j ? ne = -ue(j - Y) : Y > O - j && (ne = ue(Y - (O - j))), A < j ? C = -ue(j - A) : A > T - j && (C = ue(A - (T - j))), (C || ne) && (window.scrollBy({ left: C, top: ne, behavior: "instant" }), ee(), B = requestAnimationFrame(v));
    };
    B = requestAnimationFrame(v);
  }
  function G() {
    B && cancelAnimationFrame(B), B = 0;
  }
  a.addEventListener("pointerdown", ge);
  function pe() {
    if (a.removeEventListener("pointerdown", ge), g === null) {
      G();
      return;
    }
    R && (U && ee(), Z(`${s}end`)), le();
  }
  return { destroy: pe };
}
const rt = (a, o) => {
  const d = a.__vccOpts || a;
  for (const [e, m] of o)
    d[e] = m;
  return d;
}, kt = ["data-tile", "tabindex", "role", "aria-roledescription", "aria-label", "aria-describedby", "aria-hidden", "data-grabbed"], Nt = ["aria-hidden"], At = "a, button, input, select, textarea, label, [contenteditable]", Pt = 2147483647, Xt = {
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
  setup(a, { expose: o, emit: d }) {
    const e = a, m = d, x = {
      el: void 0
    };
    o(x);
    const f = ct(nt, null);
    if (!f)
      throw new Error(
        "GridTile must be rendered inside a GridBoard. The two are a single component pair and cannot be used apart."
      );
    let E;
    const M = /* @__PURE__ */ new Set();
    let S = null, H = null, y = null, g = null, s = null, R = null, V = null;
    const N = X(() => f.props.columns), A = X(() => f.props.rowHeight), Y = X(() => f.state.width ?? 100), B = X(() => f.gap.value), F = X(
      () => e.draggable === null ? f.props.draggable : e.draggable
    ), U = X(
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
    }), de = X(() => U.value && !e.frozen && !e.shadow), ae = X(
      () => F.value && !e.frozen && !e.shadow && !e.dragHandle
    ), I = X(
      () => (F.value || U.value) && !e.frozen && !e.shadow
    ), Z = X(() => ye(I) ? { touchAction: "none" } : {}), se = X(
      () => fe && !e.shadow && f.props.overflow && (n.isDragging || n.isResizing || n.settling)
    ), ve = X(() => ({
      "grid-tile--draggable": ae.value,
      "grid-tile--frozen": e.frozen,
      "grid-tile--dragging": n.isDragging,
      "grid-tile--resizing": n.isResizing,
      "grid-tile--settling": n.settling,
      "grid-tile--grabbed": n.grabbed
    })), _ = X(() => f.a11y.value), ee = X(() => e.label || _.value.tileName(e.id)), ge = X(
      () => _.value.tileLabel({
        name: ee.value,
        column: n.innerX + 1,
        row: n.innerY + 1,
        w: n.innerW,
        h: n.innerH
      })
    );
    W(), K([A, N], () => {
      W(), G();
    }), K(Y, () => {
      (n.isDragging || n.isResizing) && W(), G();
    }), K([() => e.x, () => e.y, () => e.w, () => e.h], (t, r) => {
      if (n.innerX = e.x, n.innerY = e.y, n.innerW = e.w, n.innerH = e.h, W(), e.shadow || n.isDragging || n.isResizing || n.settling) return;
      const [l, c, h, $] = t, [z, b, P, $e] = r;
      if (l === z && c === b) return;
      const Ee = w(z, b, P, $e), Q = w(l, c, h, $);
      C(Ee.left - Q.left, Ee.top - Q.top, !1);
    }), K(se, W), K(() => e.radius, W), K(B, (t, r) => {
      t[0] === r[0] && t[1] === r[1] || (W(), G());
    }), ft(() => {
      W(), ce();
    }), K(I, ce);
    function ce() {
      const t = ye(I);
      if (t !== !!E) {
        if (!t) {
          E.destroy(), E = null;
          return;
        }
        x.el && (E = Tt(x.el, {
          handleSelector: ".grid-handle",
          draggable: () => F.value && !e.frozen,
          resizable: () => U.value && !e.frozen,
          dragIgnore: () => e.dragIgnore,
          dragHandle: () => e.dragHandle && `.${CSS.escape(e.dragHandle)}`,
          resizeIgnore: () => e.resizeIgnore,
          autoScroll: () => !0,
          onDrag: v,
          onResize: pe,
          onTap: at
        }));
      }
    }
    Ve(() => {
      f.stopPlacing(e.id), me(), ne(), u(), E?.destroy();
    });
    function J(t) {
      x.el = t;
    }
    function le() {
      const t = x.el, r = H || t?.offsetParent || t?.parentElement;
      return r ? r.getBoundingClientRect() : null;
    }
    function ue() {
      se.value && W();
    }
    function W() {
      const t = N.value;
      e.x + e.w > t ? (n.innerX = 0, n.innerW = e.w > t ? t : e.w) : (n.innerX = e.x, n.innerW = e.w);
      const { innerX: r, innerY: l, innerW: c, innerH: h } = n, $ = A.value, [z, b] = B.value, P = `((100% - ${(t + 1) * z}px) / ${t})`;
      let $e = `${$ * l + (l + 1) * b}px`, Ee = `calc(${P} * ${r} + ${(r + 1) * z}px)`, Q = null;
      if (n.isDragging) {
        const oe = w(r, l, c, h);
        g = oe, $e = `${oe.top}px`, Ee = `${oe.left}px`, Q = {
          dx: n.dragging.left - oe.left,
          dy: n.dragging.top - oe.top
        };
      } else
        g = null;
      if (se.value) {
        const oe = le();
        if (oe) {
          const Re = n.isDragging ? g : w(r, l, c, h), ke = {
            position: "fixed",
            top: `${oe.top + Re.top}px`,
            left: `${oe.left + Re.left}px`,
            width: `${n.isResizing ? n.resizing.width : Re.width}px`,
            height: `${n.isResizing ? n.resizing.height : Re.height}px`,
            zIndex: String(Pt),
            transition: "none",
            ...Q ? {
              transform: `translate3d(${Q.dx}px, ${Q.dy}px, 0)`,
              willChange: "transform"
            } : {},
            "--grid-radius": `${e.radius}px`
          };
          if (y && te(y, ke)) return;
          y = ke, n.style = ke;
          return;
        }
      }
      const Te = {
        position: "absolute",
        top: $e,
        left: Ee,
        width: n.isResizing ? `${n.resizing.width}px` : c === 1 / 0 ? "auto" : `calc(${P} * ${c} + ${Math.max(0, c - 1) * z}px)`,
        height: n.isResizing ? `${n.resizing.height}px` : h === 1 / 0 ? "auto" : `${$ * h + Math.max(0, h - 1) * b}px`,
        ...Q ? {
          transform: `translate3d(${Q.dx}px, ${Q.dy}px, 0)`,
          transition: "none",
          willChange: "transform"
        } : n.isResizing ? { transition: "none" } : {},
        "--grid-radius": `${e.radius}px`
      };
      y && te(y, Te) || (y = Te, n.style = Te);
    }
    function te(t, r) {
      const l = Object.keys(r);
      return Object.keys(t).length !== l.length ? !1 : l.every((c) => t[c] === r[c]);
    }
    function xe(t) {
      const r = x.el;
      if (!r || !y || !g) return;
      const l = `translate3d(${t.left - g.left}px, ${t.top - g.top}px, 0)`;
      y.transform !== l && (y.transform = l, r.style.transform = l);
    }
    function G() {
      const { width: t, height: r } = w(n.innerX, n.innerY, n.innerW, n.innerH);
      !Number.isFinite(t) || !Number.isFinite(r) || m("size", e.id, t, r);
    }
    function pe(t) {
      if (e.frozen && !(t.type === "resizeend" && n.isResizing)) return;
      t.type === "resizestart" && i(t.target);
      const r = p(t);
      if (r == null) return;
      const { x: l, y: c } = r, h = { width: 0, height: 0 };
      let $ = null, z;
      switch (t.type) {
        case "resizestart": {
          f.cancelPlacing(), n.resizeMin = w(0, 0, e.minW, e.minH), n.resizeMax = w(0, 0, e.maxW, e.maxH), n.previousW = n.innerW, n.previousH = n.innerH, z = w(n.innerX, n.innerY, n.innerW, n.innerH), h.width = z.width, h.height = z.height, n.resizing = h, n.isResizing = !0, m("resizestart", e.id, n.innerW, n.innerH);
          break;
        }
        case "resizemove": {
          const P = Ge(n.lastW, n.lastH, l, c);
          h.width = Math.max(
            n.resizeMin.width,
            Math.min(n.resizeMax.width, n.resizing.width + P.deltaX)
          ), h.height = Math.max(
            n.resizeMin.height,
            Math.min(n.resizeMax.height, n.resizing.height + P.deltaY)
          ), n.resizing = h;
          break;
        }
        case "resizeend": {
          $ = n.resizing, z = w(n.innerX, n.innerY, n.innerW, n.innerH), h.width = z.width, h.height = z.height, n.resizing = null, n.isResizing = !1;
          break;
        }
      }
      W(), z = k(L(h.height, h.width));
      const b = $ ? k(L($.height, $.width)) : z;
      n.lastW = l, n.lastH = c, (n.innerW !== z.w || n.innerH !== z.h) && m("resize", e.id, z.w, z.h), t.type === "resizeend" && (n.previousW !== b.w || n.previousH !== b.h) && m("resizeend", e.id, b.w, b.h), f.resizeEvent([t.type, e.id, n.innerX, n.innerY, b.h, b.w]), t.type === "resizeend" && u();
    }
    function v(t) {
      if (n.isResizing || e.frozen && !(t.type === "dragend" && n.isDragging)) return;
      t.type === "dragstart" && i(t.target);
      const r = p(t);
      if (r === null) return;
      const { x: l, y: c } = r, h = { top: 0, left: 0 };
      switch (t.type) {
        case "dragstart":
        case "dragend": {
          if (t.type === "dragend" && !n.isDragging) return;
          t.type === "dragstart" && (f.cancelPlacing(), n.previousX = n.innerX, n.previousY = n.innerY, ne());
          const b = le() ?? { left: 0, top: 0 }, P = t.target.getBoundingClientRect();
          h.left = P.left - b.left, h.top = P.top - b.top, n.dragging = t.type === "dragstart" ? h : null, n.isDragging = t.type === "dragstart", t.type === "dragstart" && m("dragstart", e.id, n.innerX, n.innerY);
          break;
        }
        case "dragmove": {
          const b = Ge(n.lastX, n.lastY, l, c);
          h.left = n.dragging.left + b.deltaX, h.top = n.dragging.top + b.deltaY, n.dragging = h;
          break;
        }
      }
      t.type !== "dragmove" && W();
      const $ = D(h.top, h.left), z = n.innerX !== $.x || n.innerY !== $.y;
      if (t.type === "dragmove" && (z ? W() : xe(h)), n.lastX = l, n.lastY = c, z && m("drag", e.id, $.x, $.y), t.type === "dragend" && (n.previousX !== n.innerX || n.previousY !== n.innerY) && m("dragend", e.id, $.x, $.y), f.dragEvent([t.type, e.id, $.x, $.y, n.innerH, n.innerW]), t.type === "dragend") {
        if (fe && x.el) {
          const b = f.state.tiles.find((P) => P.id === e.id);
          if (b) {
            const P = w(b.x, b.y, b.w, b.h);
            C(h.left - P.left, h.top - P.top), W();
          }
        }
        u();
      }
    }
    function T(t) {
      if (!t || t === "none") return { dx: 0, dy: 0 };
      const r = t.match(/-?[\d.]+(?:e[-+]?\d+)?/g)?.map(Number);
      return r ? t.startsWith("matrix3d") ? { dx: r[12] ?? 0, dy: r[13] ?? 0 } : t.startsWith("matrix") ? { dx: r[4] ?? 0, dy: r[5] ?? 0 } : { dx: r[0] ?? 0, dy: r[1] ?? 0 } : { dx: 0, dy: 0 };
    }
    function O(t) {
      if (M.size === 0) return { dx: 0, dy: 0 };
      const r = T(getComputedStyle(t).transform), l = T(y?.transform);
      for (const c of M)
        c.onfinish = null, c.oncancel = null, c.cancel();
      return M.clear(), n.settling = !1, { dx: r.dx - l.dx, dy: r.dy - l.dy };
    }
    function C(t, r, l = !0) {
      const c = x.el;
      if (!c || typeof c.animate != "function") return;
      const h = O(c);
      if (t += h.dx, r += h.dy, Math.abs(t) < 0.5 && Math.abs(r) < 0.5) return;
      const { duration: $, easing: z } = f.settleTiming();
      if ($ === 0) return;
      const b = c.animate(
        [{ transform: `translate3d(${t}px, ${r}px, 0)` }, { transform: "translate3d(0px, 0px, 0)" }],
        { duration: $, easing: z, composite: "add" }
      );
      M.add(b), l && (n.settling = !0);
      const P = () => {
        M.delete(b), M.size === 0 && (n.settling = !1);
      };
      b.onfinish = P, b.oncancel = P;
    }
    function ne() {
      for (const t of M)
        t.onfinish = null, t.oncancel = null, t.cancel();
      M.clear(), n.settling = !1;
    }
    function i(t) {
      u(), H = t.offsetParent || null;
      const r = H || document.body, l = { offsetParent: r, left: 0, top: 0, measure: null };
      l.measure = () => {
        const c = r === document.body ? { left: 0, top: 0 } : r.getBoundingClientRect();
        l.left = c.left - r.scrollLeft, l.top = c.top - r.scrollTop, ue();
      }, l.measure(), S = l, window.addEventListener("scroll", l.measure, { passive: !0, capture: !0 }), window.addEventListener("resize", l.measure, { passive: !0 });
    }
    function u() {
      H = null, S && (window.removeEventListener("scroll", S.measure, { capture: !0 }), window.removeEventListener("resize", S.measure), S = null);
    }
    function p(t) {
      return S ? { x: t.clientX - S.left, y: t.clientY - S.top } : Wt(t);
    }
    function w(t, r, l, c) {
      const h = q(), $ = A.value, [z, b] = B.value;
      return {
        left: Math.round(h * t + (t + 1) * z),
        top: Math.round($ * r + (r + 1) * b),
        width: l === 1 / 0 ? l : Math.round(h * l + Math.max(0, l - 1) * z),
        height: c === 1 / 0 ? c : Math.round($ * c + Math.max(0, c - 1) * b)
      };
    }
    function D(t, r) {
      const l = q(), [c, h] = B.value, $ = Math.round((r - c) / (l + c)), z = Math.round((t - h) / (A.value + h));
      return {
        x: Math.max(Math.min($, N.value - n.innerW), 0),
        y: Math.max(z, 0)
      };
    }
    function q() {
      const t = N.value;
      return (Y.value - B.value[0] * (t + 1)) / t;
    }
    function L(t, r) {
      const l = q(), [c, h] = B.value, $ = Math.round((r + c) / (l + c)), z = Math.round((t + h) / (A.value + h));
      return {
        w: Math.max(Math.min($, N.value - n.innerX), 0),
        h: Math.max(z, 0)
      };
    }
    function k(t) {
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
      s = t, t === "drag" ? (m("dragstart", e.id, r.x, r.y), f.dragEvent(["dragstart", e.id, r.x, r.y, r.h, r.w])) : (m("resizestart", e.id, r.w, r.h), f.resizeEvent(["resizestart", e.id, r.x, r.y, r.h, r.w]));
    }
    function me() {
      if (!s) return;
      const t = s;
      s = null;
      const r = ie();
      t === "drag" ? f.dragEvent(["dragend", e.id, r.x, r.y, r.h, r.w]) : f.resizeEvent(["resizeend", e.id, r.x, r.y, r.h, r.w]);
    }
    function it(t, r) {
      if (!F.value || e.frozen) return;
      he("drag");
      const l = ie(), c = Ht(
        He(f.state.tiles),
        e.id,
        t,
        r,
        N.value,
        f.props.gravity
      );
      c && (f.dragEvent(["dragmove", e.id, c.x, c.y, l.h, l.w]), m("drag", e.id, c.x, c.y)), Me(() => be());
    }
    function ot(t, r) {
      if (!U.value || e.frozen) return;
      he("resize");
      const l = ie(), c = Math.max(e.minW, Math.min(e.maxW, N.value - l.x, l.w + t)), h = Math.max(e.minH, Math.min(e.maxH, l.h + r));
      (c !== l.w || h !== l.h) && (f.resizeEvent(["resizemove", e.id, l.x, l.y, h, c]), m("resize", e.id, c, h)), Me(() => be());
    }
    function Ye(t = _.value.pickedUp) {
      R = ie(), n.grabbed = !0, be(t);
    }
    function ze() {
      if (!n.grabbed) return;
      const t = s !== null;
      me(), Be(), n.grabbed = !1, R = null, Me(() => be(t ? _.value.dropped : _.value.putDown));
    }
    function at({ mode: t, target: r }) {
      if (!f.props.tapToMove || !ye(I)) return;
      const l = f.placingId();
      if (l !== null && l !== e.id) return;
      const c = r.closest?.(At);
      if (!(c && c !== x.el && x.el.contains(c))) {
        if (n.grabbed) {
          ze();
          return;
        }
        V = t, x.el.focus({ preventScroll: !0 }), Ye(t === "resize" ? _.value.pickedUpToResize : _.value.pickedUpToMove), f.startPlacing(e.id, st, ze);
      }
    }
    function st(t, r) {
      const l = ie();
      if (V === "resize") {
        const c = Math.max(
          e.minW,
          Math.min(e.maxW, N.value - l.x, t - l.x + 1)
        ), h = Math.max(e.minH, Math.min(e.maxH, r - l.y + 1));
        (c !== l.w || h !== l.h) && (he("resize"), f.resizeEvent(["resizemove", e.id, l.x, l.y, h, c]), m("resize", e.id, c, h));
      } else {
        const c = Math.max(0, Math.min(t, N.value - l.w));
        (c !== l.x || r !== l.y) && (he("drag"), f.dragEvent(["dragmove", e.id, c, r, l.h, l.w]), m("drag", e.id, c, r));
      }
      ze();
    }
    function Be() {
      V && (V = null, f.stopPlacing(e.id));
    }
    function lt() {
      if (!n.grabbed) return;
      const t = R;
      if (me(), Be(), t) {
        let r = ie();
        (r.w !== t.w || r.h !== t.h) && (he("resize"), f.resizeEvent(["resizemove", e.id, r.x, r.y, t.h, t.w]), me(), r = ie()), (r.x !== t.x || r.y !== t.y) && (he("drag"), f.dragEvent(["dragmove", e.id, t.x, t.y, t.h, t.w]), me());
      }
      n.grabbed = !1, R = null, Me(() => be(_.value.returned));
    }
    function ut(t) {
      if (!ye(I) || t.target !== x.el || t.altKey || t.ctrlKey || t.metaKey) return;
      if (t.key === "Enter" || t.key === " ") {
        t.preventDefault(), n.grabbed ? ze() : Ye();
        return;
      }
      if (t.key === "Escape") {
        if (!n.grabbed) return;
        t.preventDefault(), lt();
        return;
      }
      const r = re[t.key];
      !r || !n.grabbed || (t.preventDefault(), t.shiftKey ? ot(r[0], r[1]) : it(r[0], r[1]));
    }
    function dt() {
      n.grabbed && ze();
    }
    return (t, r) => (Ne(), Ae("div", {
      ref: J,
      class: Pe(["grid-tile", ve.value]),
      style: Ze([n.style, Z.value]),
      "data-tile": a.id,
      tabindex: I.value ? 0 : void 0,
      role: I.value ? "group" : void 0,
      "aria-roledescription": I.value ? _.value.roleDescription : void 0,
      "aria-label": I.value ? ge.value : void 0,
      "aria-describedby": I.value ? ye(f).instructionsId : void 0,
      "aria-hidden": a.shadow ? "true" : void 0,
      "data-grabbed": n.grabbed ? "true" : void 0,
      onKeydown: ut,
      onBlur: dt
    }, [
      Ie(t.$slots, "default", {}, void 0, !0),
      de.value ? (Ne(), Ae("span", {
        key: 0,
        class: Pe(["grid-handle", { "grid-handle--chevron": !t.$slots.handle }]),
        "aria-hidden": t.$slots.handle ? void 0 : "true"
      }, [
        Ie(t.$slots, "handle", {}, void 0, !0)
      ], 10, Nt)) : gt("", !0)
    ], 46, kt));
  }
}, Yt = /* @__PURE__ */ rt(Xt, [["__scopeId", "data-v-60ad906f"]]), Bt = ["id", "lang"], It = ["lang"], Ue = 220, je = "cubic-bezier(0.2, 0, 0, 1)", Ct = {
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
  setup(a, { expose: o, emit: d }) {
    const e = a, m = d, x = {
      roleDescription: "Draggable tile",
      tileName: (i) => `Tile ${i}`,
      tileLabel: ({ name: i, column: u, row: p, w, h: D }) => `${i}, column ${u}, row ${p}, ${w} wide, ${D} tall`,
      instructions: "Press Enter or Space to pick the tile up. Then use the arrow keys to move it, or hold Shift with the arrow keys to resize it. Press Enter to drop it, or Escape to put it back.",
      tapInstructions: "Without a keyboard, tap the tile and then tap where it should go, or tap its corner grip and then tap where that corner should go.",
      pickedUp: "Picked up. Arrow keys move, Shift plus arrow keys resize, Enter drops, Escape cancels.",
      pickedUpToMove: "Picked up. Tap where it should go, or tap it again to put it down.",
      pickedUpToResize: "Picked up to resize. Tap where its corner should go, or tap it again to put it down.",
      dropped: "Dropped.",
      putDown: "Put down.",
      returned: "Returned to where it started."
    };
    let f = null, E = null, M = null, S = null, H = [], y = null;
    const g = {
      el: void 0,
      dispatch: n
    };
    o(g);
    const s = Ke({
      width: null,
      boardStyle: {},
      busy: !1,
      shadow: { x: 0, y: 0, w: 0, h: 0, id: -1 },
      tiles: [],
      announcement: ""
    }), R = X(() => {
      const i = e.gap;
      if (Array.isArray(i)) return [Number(i[0]) || 0, Number(i[1]) || 0];
      const u = Number(i) || 0;
      return [u, u];
    }), V = pt(), N = X(() => ({ ...x, ...e.a11y })), A = ht();
    let Y = /* @__PURE__ */ new Map();
    const B = X(() => {
      if (s.busy) return Y;
      const i = [...s.tiles].sort((u, p) => u.y - p.y || u.x - p.x);
      return Y = new Map(i.map((u, p) => [String(u.id), p])), Y;
    });
    function F(i, u = []) {
      for (const p of i)
        p.type === zt && Array.isArray(p.children) ? F(p.children, u) : u.push(p);
      return u;
    }
    function U() {
      const i = B.value, u = (p) => {
        const w = i.get(String(p.props?.id));
        return w === void 0 ? Number.MAX_SAFE_INTEGER : w;
      };
      return F(A.default?.() ?? []).map((p, w) => ({ node: p, index: w })).sort((p, w) => u(p.node) - u(w.node) || p.index - w.index).map((p) => p.node);
    }
    mt(nt, {
      props: e,
      state: s,
      gap: R,
      instructionsId: V,
      dragEvent: O,
      resizeEvent: C,
      announce: le,
      settleTiming: I,
      a11y: N,
      startPlacing: se,
      stopPlacing: ve,
      cancelPlacing: _,
      placingId: () => y?.id ?? null
    }), ue(), fe && (K(
      () => e.tiles,
      () => {
        e.tiles !== E && (Fe(e.tiles), xe());
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
        G(), u === null && (await Me(), m("ready", s.tiles));
      }
    ), K(
      () => e.gravity,
      () => {
        const i = He(s.tiles).slice();
        we(i, e.gravity), s.tiles = i, G(), fe && te();
      }
    ), K(R, G), yt(G), wt(() => {
      const i = fe ? document.activeElement : null;
      S = i && g.el?.contains(i) ? i : null, H = S ? de() : [];
    }), vt(() => {
      const i = S, u = H;
      if (S = null, H = [], !i || document.activeElement === i || document.activeElement && document.activeElement !== document.body) return;
      if (i.isConnected) {
        i.focus({ preventScroll: !0 });
        return;
      }
      const p = u.findIndex((D) => D.contains(i));
      if (p === -1) return;
      [...u.slice(p + 1), ...u.slice(0, p).reverse()].find(
        (D) => D.isConnected && D.tabIndex >= 0
      )?.focus({ preventScroll: !0 });
    }), Ve(() => {
      f && g.el && f.disconnect(), fe && document.removeEventListener("selectstart", ae);
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
      return g.el ? [...g.el.querySelectorAll(":scope > .grid-tile:not(.grid-shadow)")] : [];
    }
    function ae(i) {
      i.preventDefault();
    }
    function I() {
      if (M) return M;
      if (!g.el) return { duration: Ue, easing: je };
      const i = getComputedStyle(g.el), u = i.getPropertyValue("--grid-tile-easing").trim();
      return M = {
        duration: Z(i.getPropertyValue("--grid-tile-duration"), Ue),
        easing: u && CSS.supports("transition-timing-function", u) ? u : je
      }, requestAnimationFrame(() => M = null), M;
    }
    function Z(i, u) {
      const p = i.trim().match(/^([\d.]+)(ms|s)?$/);
      if (!p) return u;
      const w = parseFloat(p[1]) * (p[2] === "s" ? 1e3 : 1);
      return Number.isFinite(w) ? w : u;
    }
    function se(i, u, p) {
      y && y.id !== i && y.putDown(), y = { id: i, place: u, putDown: p };
    }
    function ve(i) {
      y?.id === i && (y = null);
    }
    function _() {
      y?.putDown();
    }
    function ee(i) {
      if (!y) return null;
      const u = g.el?.querySelector(
        `.grid-tile[data-tile="${CSS.escape(String(y.id))}"]:not(.grid-shadow)`
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
      const { x: p, y: w } = J(i.clientX, i.clientY);
      y.place(p, w);
    }
    function J(i, u) {
      const p = g.el.getBoundingClientRect(), [w, D] = R.value, q = e.columns, L = (p.width - w * (q + 1)) / q, k = Math.floor((i - p.left - w / 2) / (L + w)), re = Math.floor((u - p.top - D / 2) / (e.rowHeight + D));
      return { x: Math.min(Math.max(k, 0), q - 1), y: Math.max(re, 0) };
    }
    function le(i) {
      i && (s.announcement = i === s.announcement ? `${i}​` : i);
    }
    function ue() {
      Fe(e.tiles);
      const i = We(e.tiles);
      we(i, e.gravity), s.tiles = i, s.boardStyle = T(v());
    }
    function W(i, u) {
      return i?.length !== u?.length ? !0 : i.some((p, w) => {
        const D = u[w];
        return [.../* @__PURE__ */ new Set([...Object.keys(p), ...Object.keys(D)])].some((L) => p[L] !== D[L]);
      });
    }
    function te() {
      if (!W(e.tiles, s.tiles)) return;
      const i = We(s.tiles);
      E = i, m("update:tiles", i);
    }
    function xe() {
      if (!W(e.tiles, s.tiles)) return;
      const i = We(e.tiles);
      we(i, e.gravity), s.tiles = i, G(), fe && te();
    }
    function G() {
      const i = v();
      s.boardStyle.height !== i && (s.boardStyle = T(i, s.boardStyle.height));
    }
    function pe() {
      g.el && (s.width = g.el.offsetWidth);
    }
    function v() {
      if (!e.autoHeight) return;
      const i = R.value[1];
      return `${tt(s.tiles) * (e.rowHeight + i) + i}px`;
    }
    function T(i, u) {
      const p = parseFloat(i) > parseFloat(u);
      return {
        position: "relative",
        height: i,
        ...p ? { transitionDuration: "var(--grid-board-grow-duration, 150ms)" } : {}
      };
    }
    function O([i, u, p, w, D, q] = []) {
      const L = He(s.tiles).slice(), k = De(L, u) ?? { x: 0, y: 0 };
      if (i === "dragmove" && s.busy && k.x === p && k.y === w && s.shadow.w === q && s.shadow.h === D)
        return;
      const re = i === "dragmove" || i === "dragstart";
      Se(L, k, p, w, !0, !1), we(L, e.gravity, u), s.tiles = L, re && (s.shadow = { ...s.shadow, x: k.x, y: k.y, w: q, h: D }), s.busy = re, G(), te();
    }
    function C([i, u, p, w, D, q] = []) {
      if (!i) return;
      const L = He(s.tiles).slice(), k = De(L, u) ?? { x: p, y: w, h: 0, w: 0 };
      if (i === "resizemove" && s.busy && k.w === q && k.h === D && s.shadow.x === p && s.shadow.y === w)
        return;
      k.w = q, k.h = D;
      const re = i === "resizestart" || i === "resizemove";
      we(L, e.gravity, u), s.tiles = L, re && (s.shadow = { ...s.shadow, x: k.x, y: k.y, w: k.w, h: k.h }), s.busy = re, G(), te();
    }
    function ne(i) {
      !i || i === g.el || (g.el = i, typeof window < "u" && (f = new ResizeObserver(pe), f.observe(g.el), s.width = g.el.offsetWidth));
    }
    return (i, u) => (Ne(), Ae("div", {
      ref: ne,
      class: Pe(["grid-board", { "grid-board--busy": s.busy }]),
      style: Ze(s.boardStyle),
      onMousedownCapture: ge,
      onClickCapture: ce
    }, [
      xt(Ce(Yt, {
        id: "shadow",
        class: "grid-shadow",
        x: s.shadow.x,
        y: s.shadow.y,
        w: s.shadow.w,
        h: s.shadow.h,
        shadow: ""
      }, null, 8, ["x", "y", "w", "h"]), [
        [bt, s.busy]
      ]),
      Ce(U),
      Le("p", {
        id: ye(V),
        class: "grid-sr",
        lang: e.a11y ? void 0 : "en"
      }, _e(e.tapToMove ? `${N.value.instructions} ${N.value.tapInstructions}` : N.value.instructions), 9, Bt),
      Le("p", {
        class: "grid-sr",
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        lang: e.a11y ? void 0 : "en"
      }, _e(s.announcement), 9, It)
    ], 38));
  }
}, _t = /* @__PURE__ */ rt(Ct, [["__scopeId", "data-v-3fe610cf"]]);
export {
  nt as GRID_BOARD,
  _t as GridBoard,
  Yt as GridTile,
  fe as IS_BROWSER,
  we as applyGravity,
  We as copyTiles,
  Ge as getFrameDelta,
  tt as getLastRow,
  Wt as getPointerOffset,
  De as getTileById,
  Se as moveTile,
  Tt as usePointerDragResize,
  Fe as validateTiles
};
//# sourceMappingURL=core.js.map
