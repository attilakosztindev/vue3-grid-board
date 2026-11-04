import { inject as rt, computed as A, reactive as Pe, unref as se, watch as G, onMounted as it, onBeforeUnmount as Oe, openBlock as $e, createElementBlock as Se, normalizeStyle as Ce, normalizeClass as Me, renderSlot as Xe, createCommentVNode as ot, nextTick as ge, useId as st, useSlots as at, provide as lt, onBeforeMount as ut, withDirectives as dt, createVNode as Ae, vShow as ft, createElementVNode as Ye, toDisplayString as ct, Fragment as gt } from "vue";
const de = typeof document < "u";
function Fe(i, o) {
  return !(i === o || i.x + i.w <= o.x || i.x >= o.x + o.w || i.y + i.h <= o.y || i.y >= o.y + o.h);
}
function Re(i, o) {
  return i.find((d) => Fe(d, o));
}
function ht(i, o) {
  return i.filter((d) => Fe(d, o));
}
function pt(i) {
  return i.filter((o) => o.frozen);
}
function Ge(i, o) {
  return [].concat(i).sort((d, e) => {
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
function yt(i, o, d) {
  if (d)
    for (; o.y > 0 && !Re(i, o); )
      o.y--;
  let e;
  for (; e = Re(i, o); )
    o.y = e.y + e.h;
}
function ke(i, o, d, e) {
  if (e) {
    const p = {
      x: d.x,
      y: Math.max(o.y - d.h, 0),
      w: d.w,
      h: d.h
    };
    if (!Re(i, p))
      return be(i, d, void 0, p.y, !1);
  }
  return be(i, d, void 0, d.y + 1, !1);
}
function mt(i) {
  return typeof i == "number" && !Number.isNaN(i);
}
function qe(i) {
  let o = 0;
  for (let d = 0, e = i.length; d < e; d++) {
    const p = i[d].y + i[d].h;
    p > o && (o = p);
  }
  return o;
}
function we(i) {
  return (i || []).map((o) => ({ ...o }));
}
function ve(i, o) {
  return i.find((d) => d.id === o);
}
function ue(i, o, d) {
  const e = pt(i), p = Ge(i, d);
  for (let E = 0, h = p.length; E < h; E++) {
    const S = p[E];
    S.frozen || (yt(e, S, o), e.push(S)), delete S.moved;
  }
}
function be(i, o, d, e, p, E) {
  if (o.frozen) return i;
  const h = o.x, S = o.y, x = e && o.y > e;
  typeof d == "number" && (o.x = d), typeof e == "number" && (o.y = e), o.moved = !0;
  let s = Ge(i);
  x && (s = s.reverse());
  const X = ht(s, o);
  if (E && X.length)
    return o.x = h, o.y = S, o.moved = !1, i;
  for (let m = 0, $ = X.length; m < $; m++) {
    const v = X[m];
    v.moved || o.y > v.y && o.y - v.y > v.h / 4 || (v.frozen ? i = ke(i, v, o, p) : i = ke(i, o, v, p));
  }
  return i;
}
function wt(i, o, d, e, p, E) {
  const h = ve(i, o);
  if (!h) return null;
  const S = qe(i);
  let x = h.x, s = h.y;
  for (; ; ) {
    const X = Math.max(0, Math.min(p - h.w, x + d)), m = Math.max(0, Math.min(S, s + e));
    if (X === x && m === s) return null;
    x = X, s = m;
    const $ = we(i);
    if (be($, ve($, o), x, s, !0, !1), ue($, E, o), $.some((v, T) => v.x !== i[T].x || v.y !== i[T].y)) return { x, y: s };
  }
}
function Be(i, o = "tiles") {
  if (!Array.isArray(i)) throw new Error(`vue3-grid-board: ${o} must be an array.`);
  const d = /* @__PURE__ */ new Set();
  i.forEach((e, p) => {
    for (const E of ["x", "y", "w", "h"])
      if (typeof e[E] != "number")
        throw new Error(`vue3-grid-board: ${o}[${p}].${E} must be a number.`);
    if (e.id === void 0 || e.id === null)
      throw new Error(`vue3-grid-board: ${o}[${p}].id is required.`);
    if (typeof e.id != "number" && typeof e.id != "string")
      throw new Error(`vue3-grid-board: ${o}[${p}].id must be a string or a number.`);
    if (d.has(e.id))
      throw new Error(
        `vue3-grid-board: ${o}[${p}].id must be unique (saw "${e.id}" twice).`
      );
    if (d.add(e.id), e.frozen !== void 0 && typeof e.frozen != "boolean")
      throw new Error(`vue3-grid-board: ${o}[${p}].frozen must be a boolean.`);
  });
}
function vt(i) {
  const o = i.target.offsetParent || document.body, d = o.getBoundingClientRect();
  return {
    x: i.clientX + o.scrollLeft - d.left,
    y: i.clientY + o.scrollTop - d.top
  };
}
function _e(i, o, d, e) {
  return mt(i) ? { deltaX: d - i, deltaY: e - o, lastX: i, lastY: o, x: d, y: e } : { deltaX: 0, deltaY: 0, lastX: d, lastY: e, x: d, y: e };
}
const Ke = /* @__PURE__ */ Symbol("gridBoard"), bt = 3, C = 60, Te = 18;
function xt(i, o) {
  const {
    handleSelector: d = ".grid-handle",
    draggable: e = () => !1,
    resizable: p = () => !1,
    dragIgnore: E = () => null,
    dragHandle: h = () => null,
    resizeIgnore: S = () => null,
    autoScroll: x = () => !0,
    onDrag: s = () => {
    },
    onResize: X = () => {
    }
  } = o;
  let m = null, $ = null, v = !1, T = 0, k = 0, N = 0, Y = 0, H = 0, I = 0, L = !1, n = 0, ne = 0;
  function re(y) {
    try {
      return y(), !0;
    } catch {
      return !1;
    }
  }
  function W(y, F) {
    if (!F) return !1;
    const P = y.closest?.(F);
    return !!P && i.contains(P);
  }
  function j(y, F = N, P = Y) {
    const O = { type: y, target: i, clientX: F, clientY: P };
    $ === "resize" ? X(O) : s(O);
  }
  function B() {
    I = requestAnimationFrame(() => {
      I = 0, !(m === null || !v || !L) && (L = !1, j(`${$}move`), B());
    });
  }
  function ae() {
    if (I) {
      L = !0;
      return;
    }
    j(`${$}move`), B();
  }
  function J() {
    I && cancelAnimationFrame(I), I = 0, L = !1;
  }
  function Q() {
    J(), j(`${$}move`);
  }
  function ee(y) {
    if (m !== null || y.pointerType === "mouse" && y.button !== 0) return;
    const F = W(y.target, d);
    if (F && p()) {
      if (W(y.target, S())) return;
      $ = "resize";
    } else if (!F && e()) {
      const P = E(), O = h();
      if (P && W(y.target, P) || O && !W(y.target, O)) return;
      $ = "drag";
    } else
      return;
    m = y.pointerId, v = !1, T = N = y.clientX, k = Y = y.clientY, g(), re(() => i.setPointerCapture(y.pointerId)), i.addEventListener("pointermove", ie), i.addEventListener("pointerup", q), i.addEventListener("pointercancel", q), i.addEventListener("lostpointercapture", q), window.addEventListener("resize", g, { passive: !0 });
  }
  function ie(y) {
    if (y.pointerId === m) {
      if (N = y.clientX, Y = y.clientY, !v) {
        if (Math.hypot(N - T, Y - k) < bt) return;
        v = !0, j(`${$}start`, T, k);
      }
      y.preventDefault(), ae(), $ === "drag" && !H && M() && x() && _();
    }
  }
  function q(y) {
    y.pointerId === m && (v && (L && Q(), j(`${$}end`)), a());
  }
  function a() {
    J(), K(), i.removeEventListener("pointermove", ie), i.removeEventListener("pointerup", q), i.removeEventListener("pointercancel", q), i.removeEventListener("lostpointercapture", q), window.removeEventListener("resize", g), re(() => {
      m !== null && i.hasPointerCapture?.(m) && i.releasePointerCapture(m);
    }), m = null, $ = null, v = !1;
  }
  function l(y) {
    return Math.min(Te, y / C * Te);
  }
  function g() {
    n = window.innerWidth, ne = window.innerHeight;
  }
  function M() {
    return N < C || Y < C || N > n - C || Y > ne - C;
  }
  function _() {
    if (H) return;
    const y = () => {
      if (H = 0, m === null || !v) return;
      const F = n, P = ne;
      let O = 0, oe = 0;
      Y < C ? oe = -l(C - Y) : Y > P - C && (oe = l(Y - (P - C))), N < C ? O = -l(C - N) : N > F - C && (O = l(N - (F - C))), (O || oe) && (window.scrollBy({ left: O, top: oe, behavior: "instant" }), Q(), H = requestAnimationFrame(y));
    };
    H = requestAnimationFrame(y);
  }
  function K() {
    H && cancelAnimationFrame(H), H = 0;
  }
  i.addEventListener("pointerdown", ee);
  function R() {
    if (i.removeEventListener("pointerdown", ee), m === null) {
      K();
      return;
    }
    v && (L && Q(), j(`${$}end`)), a();
  }
  return { destroy: R };
}
const je = (i, o) => {
  const d = i.__vccOpts || i;
  for (const [e, p] of o)
    d[e] = p;
  return d;
}, zt = ["data-tile", "tabindex", "role", "aria-roledescription", "aria-label", "aria-describedby", "aria-hidden", "data-grabbed"], Et = ["aria-hidden"], $t = 2147483647, St = {
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
  setup(i, { expose: o, emit: d }) {
    const e = i, p = d, E = {
      el: void 0
    };
    o(E);
    const h = rt(Ke, null);
    if (!h)
      throw new Error(
        "GridTile must be rendered inside a GridBoard. The two are a single component pair and cannot be used apart."
      );
    let S;
    const x = /* @__PURE__ */ new Set();
    let s = null, X = null, m = null, $ = null, v = null, T = null;
    const k = A(() => h.props.columns), N = A(() => h.props.rowHeight), Y = A(() => h.state.width ?? 100), H = A(() => h.gap.value), I = A(
      () => e.draggable === null ? h.props.draggable : e.draggable
    ), L = A(
      () => e.resizable === null ? h.props.resizable : e.resizable
    ), n = Pe({
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
    }), ne = A(() => L.value && !e.frozen && !e.shadow), re = A(
      () => I.value && !e.frozen && !e.shadow && !e.dragHandle
    ), W = A(
      () => (I.value || L.value) && !e.frozen && !e.shadow
    ), j = A(() => se(W) ? { touchAction: "none" } : {}), B = A(
      () => de && !e.shadow && h.props.overflow && (n.isDragging || n.isResizing || n.settling)
    ), ae = A(() => ({
      "grid-tile--draggable": re.value,
      "grid-tile--frozen": e.frozen,
      "grid-tile--dragging": n.isDragging,
      "grid-tile--resizing": n.isResizing,
      "grid-tile--settling": n.settling,
      "grid-tile--grabbed": n.grabbed
    })), J = A(() => e.label || `Tile ${e.id}`), Q = A(
      () => `${se(J)}, column ${n.innerX + 1}, row ${n.innerY + 1}, ${n.innerW} wide, ${n.innerH} tall`
    );
    l(), G([N, k], () => {
      l(), _();
    }), G(Y, () => {
      (n.isDragging || n.isResizing) && l(), _();
    }), G([() => e.x, () => e.y, () => e.w, () => e.h], (t, r) => {
      if (n.innerX = e.x, n.innerY = e.y, n.innerW = e.w, n.innerH = e.h, l(), e.shadow || n.isDragging || n.isResizing || n.settling) return;
      const [u, f, c, z] = t, [b, w, D, ye] = r;
      if (u === b && f === w) return;
      const ce = V(b, w, D, ye), U = V(u, f, c, z);
      P(ce.left - U.left, ce.top - U.top, !1);
    }), G(B, l), G(() => e.radius, l), G(H, (t, r) => {
      t[0] === r[0] && t[1] === r[1] || (l(), _());
    }), it(() => {
      l(), ee();
    }), G(W, ee);
    function ee() {
      const t = se(W);
      if (t !== !!S) {
        if (!t) {
          S.destroy(), S = null;
          return;
        }
        E.el && (S = xt(E.el, {
          handleSelector: ".grid-handle",
          draggable: () => I.value && !e.frozen,
          resizable: () => L.value && !e.frozen,
          dragIgnore: () => e.dragIgnore,
          dragHandle: () => e.dragHandle && `.${CSS.escape(e.dragHandle)}`,
          resizeIgnore: () => e.resizeIgnore,
          autoScroll: () => !0,
          onDrag: R,
          onResize: K
        }));
      }
    }
    Oe(() => {
      le(), O(), he(), S?.destroy();
    });
    function ie(t) {
      E.el = t;
    }
    function q() {
      const t = E.el, r = X || t?.offsetParent || t?.parentElement;
      return r ? r.getBoundingClientRect() : null;
    }
    function a() {
      B.value && l();
    }
    function l() {
      const t = k.value;
      e.x + e.w > t ? (n.innerX = 0, n.innerW = e.w > t ? t : e.w) : (n.innerX = e.x, n.innerW = e.w);
      const { innerX: r, innerY: u, innerW: f, innerH: c } = n, z = N.value, [b, w] = H.value, D = `((100% - ${(t + 1) * b}px) / ${t})`;
      let ye = `${z * u + (u + 1) * w}px`, ce = `calc(${D} * ${r} + ${(r + 1) * b}px)`, U = null;
      if (n.isDragging) {
        const Z = V(r, u, f, c);
        $ = Z, ye = `${Z.top}px`, ce = `${Z.left}px`, U = {
          dx: n.dragging.left - Z.left,
          dy: n.dragging.top - Z.top
        };
      } else
        $ = null;
      if (B.value) {
        const Z = q();
        if (Z) {
          const me = n.isDragging ? $ : V(r, u, f, c), Ee = {
            position: "fixed",
            top: `${Z.top + me.top}px`,
            left: `${Z.left + me.left}px`,
            width: `${n.isResizing ? n.resizing.width : me.width}px`,
            height: `${n.isResizing ? n.resizing.height : me.height}px`,
            zIndex: String($t),
            transition: "none",
            ...U ? {
              transform: `translate3d(${U.dx}px, ${U.dy}px, 0)`,
              willChange: "transform"
            } : {},
            "--grid-radius": `${e.radius}px`
          };
          if (m && g(m, Ee)) return;
          m = Ee, n.style = Ee;
          return;
        }
      }
      const ze = {
        position: "absolute",
        top: ye,
        left: ce,
        width: n.isResizing ? `${n.resizing.width}px` : f === 1 / 0 ? "auto" : `calc(${D} * ${f} + ${Math.max(0, f - 1) * b}px)`,
        height: n.isResizing ? `${n.resizing.height}px` : c === 1 / 0 ? "auto" : `${z * c + Math.max(0, c - 1) * w}px`,
        ...U ? {
          transform: `translate3d(${U.dx}px, ${U.dy}px, 0)`,
          transition: "none",
          willChange: "transform"
        } : n.isResizing ? { transition: "none" } : {},
        "--grid-radius": `${e.radius}px`
      };
      m && g(m, ze) || (m = ze, n.style = ze);
    }
    function g(t, r) {
      const u = Object.keys(r);
      return Object.keys(t).length !== u.length ? !1 : u.every((f) => t[f] === r[f]);
    }
    function M(t) {
      const r = E.el;
      if (!r || !m || !$) return;
      const u = `translate3d(${t.left - $.left}px, ${t.top - $.top}px, 0)`;
      m.transform !== u && (m.transform = u, r.style.transform = u);
    }
    function _() {
      const { width: t, height: r } = V(n.innerX, n.innerY, n.innerW, n.innerH);
      !Number.isFinite(t) || !Number.isFinite(r) || p("size", e.id, t, r);
    }
    function K(t) {
      if (e.frozen && !(t.type === "resizeend" && n.isResizing)) return;
      t.type === "resizestart" && oe(t.target);
      const r = He(t);
      if (r == null) return;
      const { x: u, y: f } = r, c = { width: 0, height: 0 };
      let z = null, b;
      switch (t.type) {
        case "resizestart": {
          n.resizeMin = V(0, 0, e.minW, e.minH), n.resizeMax = V(0, 0, e.maxW, e.maxH), n.previousW = n.innerW, n.previousH = n.innerH, b = V(n.innerX, n.innerY, n.innerW, n.innerH), c.width = b.width, c.height = b.height, n.resizing = c, n.isResizing = !0, p("resizestart", e.id, n.innerW, n.innerH);
          break;
        }
        case "resizemove": {
          const D = _e(n.lastW, n.lastH, u, f);
          c.width = Math.max(
            n.resizeMin.width,
            Math.min(n.resizeMax.width, n.resizing.width + D.deltaX)
          ), c.height = Math.max(
            n.resizeMin.height,
            Math.min(n.resizeMax.height, n.resizing.height + D.deltaY)
          ), n.resizing = c;
          break;
        }
        case "resizeend": {
          z = n.resizing, b = V(n.innerX, n.innerY, n.innerW, n.innerH), c.width = b.width, c.height = b.height, n.resizing = null, n.isResizing = !1;
          break;
        }
      }
      l(), b = Ne(We(c.height, c.width));
      const w = z ? Ne(We(z.height, z.width)) : b;
      n.lastW = u, n.lastH = f, (n.innerW !== b.w || n.innerH !== b.h) && p("resize", e.id, b.w, b.h), t.type === "resizeend" && (n.previousW !== w.w || n.previousH !== w.h) && p("resizeend", e.id, w.w, w.h), h.resizeEvent([t.type, e.id, n.innerX, n.innerY, w.h, w.w]), t.type === "resizeend" && he();
    }
    function R(t) {
      if (n.isResizing || e.frozen && !(t.type === "dragend" && n.isDragging)) return;
      t.type === "dragstart" && oe(t.target);
      const r = He(t);
      if (r === null) return;
      const { x: u, y: f } = r, c = { top: 0, left: 0 };
      switch (t.type) {
        case "dragstart":
        case "dragend": {
          if (t.type === "dragend" && !n.isDragging) return;
          t.type === "dragstart" && (n.previousX = n.innerX, n.previousY = n.innerY, O());
          const w = q() ?? { left: 0, top: 0 }, D = t.target.getBoundingClientRect();
          c.left = D.left - w.left, c.top = D.top - w.top, n.dragging = t.type === "dragstart" ? c : null, n.isDragging = t.type === "dragstart", t.type === "dragstart" && p("dragstart", e.id, n.innerX, n.innerY);
          break;
        }
        case "dragmove": {
          const w = _e(n.lastX, n.lastY, u, f);
          c.left = n.dragging.left + w.deltaX, c.top = n.dragging.top + w.deltaY, n.dragging = c;
          break;
        }
      }
      t.type !== "dragmove" && l();
      const z = Ve(c.top, c.left), b = n.innerX !== z.x || n.innerY !== z.y;
      if (t.type === "dragmove" && (b ? l() : M(c)), n.lastX = u, n.lastY = f, b && p("drag", e.id, z.x, z.y), t.type === "dragend" && (n.previousX !== n.innerX || n.previousY !== n.innerY) && p("dragend", e.id, z.x, z.y), h.dragEvent([t.type, e.id, z.x, z.y, n.innerH, n.innerW]), t.type === "dragend") {
        if (de && E.el) {
          const w = h.state.tiles.find((D) => D.id === e.id);
          if (w) {
            const D = V(w.x, w.y, w.w, w.h);
            P(c.left - D.left, c.top - D.top), l();
          }
        }
        he();
      }
    }
    function y(t) {
      if (!t || t === "none") return { dx: 0, dy: 0 };
      const r = t.match(/-?[\d.]+(?:e[-+]?\d+)?/g)?.map(Number);
      return r ? t.startsWith("matrix3d") ? { dx: r[12] ?? 0, dy: r[13] ?? 0 } : t.startsWith("matrix") ? { dx: r[4] ?? 0, dy: r[5] ?? 0 } : { dx: r[0] ?? 0, dy: r[1] ?? 0 } : { dx: 0, dy: 0 };
    }
    function F(t) {
      if (x.size === 0) return { dx: 0, dy: 0 };
      const r = y(getComputedStyle(t).transform), u = y(m?.transform);
      for (const f of x)
        f.onfinish = null, f.oncancel = null, f.cancel();
      return x.clear(), n.settling = !1, { dx: r.dx - u.dx, dy: r.dy - u.dy };
    }
    function P(t, r, u = !0) {
      const f = E.el;
      if (!f || typeof f.animate != "function") return;
      const c = F(f);
      if (t += c.dx, r += c.dy, Math.abs(t) < 0.5 && Math.abs(r) < 0.5) return;
      const { duration: z, easing: b } = h.settleTiming();
      if (z === 0) return;
      const w = f.animate(
        [{ transform: `translate3d(${t}px, ${r}px, 0)` }, { transform: "translate3d(0px, 0px, 0)" }],
        { duration: z, easing: b, composite: "add" }
      );
      x.add(w), u && (n.settling = !0);
      const D = () => {
        x.delete(w), x.size === 0 && (n.settling = !1);
      };
      w.onfinish = D, w.oncancel = D;
    }
    function O() {
      for (const t of x)
        t.onfinish = null, t.oncancel = null, t.cancel();
      x.clear(), n.settling = !1;
    }
    function oe(t) {
      he(), X = t.offsetParent || null;
      const r = X || document.body, u = { offsetParent: r, left: 0, top: 0, measure: null };
      u.measure = () => {
        const f = r === document.body ? { left: 0, top: 0 } : r.getBoundingClientRect();
        u.left = f.left - r.scrollLeft, u.top = f.top - r.scrollTop, a();
      }, u.measure(), s = u, window.addEventListener("scroll", u.measure, { passive: !0, capture: !0 }), window.addEventListener("resize", u.measure, { passive: !0 });
    }
    function he() {
      X = null, s && (window.removeEventListener("scroll", s.measure, { capture: !0 }), window.removeEventListener("resize", s.measure), s = null);
    }
    function He(t) {
      return s ? { x: t.clientX - s.left, y: t.clientY - s.top } : vt(t);
    }
    function V(t, r, u, f) {
      const c = xe(), z = N.value, [b, w] = H.value;
      return {
        left: Math.round(c * t + (t + 1) * b),
        top: Math.round(z * r + (r + 1) * w),
        width: u === 1 / 0 ? u : Math.round(c * u + Math.max(0, u - 1) * b),
        height: f === 1 / 0 ? f : Math.round(z * f + Math.max(0, f - 1) * w)
      };
    }
    function Ve(t, r) {
      const u = xe(), [f, c] = H.value, z = Math.round((r - f) / (u + f)), b = Math.round((t - c) / (N.value + c));
      return {
        x: Math.max(Math.min(z, k.value - n.innerW), 0),
        y: Math.max(b, 0)
      };
    }
    function xe() {
      const t = k.value;
      return (Y.value - H.value[0] * (t + 1)) / t;
    }
    function We(t, r) {
      const u = xe(), [f, c] = H.value, z = Math.round((r + f) / (u + f)), b = Math.round((t + c) / (N.value + c));
      return {
        w: Math.max(Math.min(z, k.value - n.innerX), 0),
        h: Math.max(b, 0)
      };
    }
    function Ne(t) {
      return {
        w: Math.max(e.minW, Math.min(e.maxW, t.w), 1),
        h: Math.max(e.minH, Math.min(e.maxH, t.h), 1)
      };
    }
    const Ue = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };
    function te() {
      const t = h.state.tiles.find((r) => r.id === e.id);
      return t ? { x: t.x, y: t.y, w: t.w, h: t.h } : { x: n.innerX, y: n.innerY, w: n.innerW, h: n.innerH };
    }
    function fe(t) {
      const r = te(), u = `${se(J)}, column ${r.x + 1}, row ${r.y + 1}, ${r.w} wide, ${r.h} tall`;
      h.announce(t ? `${u}. ${t}` : u);
    }
    function pe(t) {
      if (v === t) return;
      v && le();
      const r = te();
      v = t, t === "drag" ? (p("dragstart", e.id, r.x, r.y), h.dragEvent(["dragstart", e.id, r.x, r.y, r.h, r.w])) : (p("resizestart", e.id, r.w, r.h), h.resizeEvent(["resizestart", e.id, r.x, r.y, r.h, r.w]));
    }
    function le() {
      if (!v) return;
      const t = v;
      v = null;
      const r = te();
      t === "drag" ? h.dragEvent(["dragend", e.id, r.x, r.y, r.h, r.w]) : h.resizeEvent(["resizeend", e.id, r.x, r.y, r.h, r.w]);
    }
    function Ze(t, r) {
      if (!I.value || e.frozen) return;
      pe("drag");
      const u = te(), f = wt(
        h.state.tiles,
        e.id,
        t,
        r,
        k.value,
        h.props.gravity
      );
      f && (h.dragEvent(["dragmove", e.id, f.x, f.y, u.h, u.w]), p("drag", e.id, f.x, f.y)), ge(() => fe());
    }
    function Je(t, r) {
      if (!L.value || e.frozen) return;
      pe("resize");
      const u = te(), f = Math.max(e.minW, Math.min(e.maxW, k.value - u.x, u.w + t)), c = Math.max(e.minH, Math.min(e.maxH, u.h + r));
      (f !== u.w || c !== u.h) && (h.resizeEvent(["resizemove", e.id, u.x, u.y, c, f]), p("resize", e.id, f, c)), ge(() => fe());
    }
    function Qe() {
      T = te(), n.grabbed = !0, fe(
        "Picked up. Arrow keys move, Shift plus arrow keys resize, Enter drops, Escape cancels."
      );
    }
    function De() {
      if (!n.grabbed) return;
      const t = v !== null;
      le(), n.grabbed = !1, T = null, ge(() => fe(t ? "Dropped." : "Put down."));
    }
    function et() {
      if (!n.grabbed) return;
      const t = T;
      if (le(), t) {
        let r = te();
        (r.w !== t.w || r.h !== t.h) && (pe("resize"), h.resizeEvent(["resizemove", e.id, r.x, r.y, t.h, t.w]), le(), r = te()), (r.x !== t.x || r.y !== t.y) && (pe("drag"), h.dragEvent(["dragmove", e.id, t.x, t.y, t.h, t.w]), le());
      }
      n.grabbed = !1, T = null, ge(() => fe("Returned to where it started."));
    }
    function tt(t) {
      if (!se(W) || t.target !== E.el || t.altKey || t.ctrlKey || t.metaKey) return;
      if (t.key === "Enter" || t.key === " ") {
        t.preventDefault(), n.grabbed ? De() : Qe();
        return;
      }
      if (t.key === "Escape") {
        if (!n.grabbed) return;
        t.preventDefault(), et();
        return;
      }
      const r = Ue[t.key];
      !r || !n.grabbed || (t.preventDefault(), t.shiftKey ? Je(r[0], r[1]) : Ze(r[0], r[1]));
    }
    function nt() {
      n.grabbed && De();
    }
    return (t, r) => ($e(), Se("div", {
      ref: ie,
      class: Me(["grid-tile", ae.value]),
      style: Ce([n.style, j.value]),
      "data-tile": i.id,
      tabindex: W.value ? 0 : void 0,
      role: W.value ? "group" : void 0,
      "aria-roledescription": W.value ? "Draggable tile" : void 0,
      "aria-label": W.value ? Q.value : void 0,
      "aria-describedby": W.value ? se(h).instructionsId : void 0,
      "aria-hidden": i.shadow ? "true" : void 0,
      "data-grabbed": n.grabbed ? "true" : void 0,
      onKeydown: tt,
      onBlur: nt
    }, [
      Xe(t.$slots, "default", {}, void 0, !0),
      ne.value ? ($e(), Se("span", {
        key: 0,
        class: Me(["grid-handle", { "grid-handle--chevron": !t.$slots.handle }]),
        "aria-hidden": t.$slots.handle ? void 0 : "true"
      }, [
        Xe(t.$slots, "handle", {}, void 0, !0)
      ], 10, Et)) : ot("", !0)
    ], 46, zt));
  }
}, Mt = /* @__PURE__ */ je(St, [["__scopeId", "data-v-9859b4de"]]), Rt = ["id"], Ht = {
  class: "grid-sr",
  role: "status",
  "aria-live": "polite",
  "aria-atomic": "true"
}, Ie = 220, Le = "cubic-bezier(0.2, 0, 0, 1)", Wt = {
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
    }
  },
  emits: ["update:tiles", "ready"],
  setup(i, { expose: o, emit: d }) {
    const e = i, p = d;
    let E = null, h = null, S = null;
    const x = {
      el: void 0,
      dispatch: Y
    };
    o(x);
    const s = Pe({
      width: null,
      boardStyle: {},
      busy: !1,
      shadow: { x: 0, y: 0, w: 0, h: 0, id: -1 },
      tiles: [],
      announcement: ""
    }), X = A(() => {
      const a = e.gap;
      if (Array.isArray(a)) return [Number(a[0]) || 0, Number(a[1]) || 0];
      const l = Number(a) || 0;
      return [l, l];
    }), m = st(), $ = at();
    let v = /* @__PURE__ */ new Map();
    const T = A(() => {
      if (s.busy) return v;
      const a = [...s.tiles].sort((l, g) => l.y - g.y || l.x - g.x);
      return v = new Map(a.map((l, g) => [String(l.id), g])), v;
    });
    function k(a, l = []) {
      for (const g of a)
        g.type === gt && Array.isArray(g.children) ? k(g.children, l) : l.push(g);
      return l;
    }
    function N() {
      const a = T.value, l = (g) => {
        const M = a.get(String(g.props?.id));
        return M === void 0 ? Number.MAX_SAFE_INTEGER : M;
      };
      return k($.default?.() ?? []).map((g, M) => ({ node: g, index: M })).sort((g, M) => l(g.node) - l(M.node) || g.index - M.index).map((g) => g.node);
    }
    lt(Ke, {
      props: e,
      state: s,
      gap: X,
      instructionsId: m,
      dragEvent: ee,
      resizeEvent: ie,
      announce: n,
      settleTiming: I
    }), ne(), de && (G(
      () => e.tiles,
      () => {
        e.tiles !== h && (Be(e.tiles), j());
      },
      { immediate: !0 }
    ), G(
      () => s.busy,
      (a) => {
        a ? (window.getSelection()?.removeAllRanges(), document.addEventListener("selectstart", H)) : document.removeEventListener("selectstart", H);
      }
    )), G(
      () => s.width,
      async (a, l) => {
        B(), l === null && (await ge(), p("ready", s.tiles));
      }
    ), G(
      () => e.gravity,
      () => {
        ue(s.tiles, e.gravity), B(), de && W();
      }
    ), G(X, B), ut(B), Oe(() => {
      E && x.el && E.disconnect(), de && document.removeEventListener("selectstart", H);
    });
    function Y(a, l) {
      switch (a) {
        case "dragEvent":
          return ee(l);
        case "resizeEvent":
          return ie(l);
        case "announce":
          return n(l);
        case "measure":
          return ae();
        default:
          throw new Error(`GridBoard: dispatch received an unknown command "${String(a)}".`);
      }
    }
    function H(a) {
      a.preventDefault();
    }
    function I() {
      if (S) return S;
      if (!x.el) return { duration: Ie, easing: Le };
      const a = getComputedStyle(x.el), l = a.getPropertyValue("--grid-tile-easing").trim();
      return S = {
        duration: L(a.getPropertyValue("--grid-tile-duration"), Ie),
        easing: l && CSS.supports("transition-timing-function", l) ? l : Le
      }, requestAnimationFrame(() => S = null), S;
    }
    function L(a, l) {
      const g = a.trim().match(/^([\d.]+)(ms|s)?$/);
      if (!g) return l;
      const M = parseFloat(g[1]) * (g[2] === "s" ? 1e3 : 1);
      return Number.isFinite(M) ? M : l;
    }
    function n(a) {
      a && (s.announcement = a === s.announcement ? `${a}​` : a);
    }
    function ne() {
      Be(e.tiles), s.tiles = we(e.tiles), ue(s.tiles, e.gravity), s.boardStyle = Q(J());
    }
    function re(a, l) {
      return a?.length !== l?.length ? !0 : a.some((g, M) => {
        const _ = l[M];
        return [.../* @__PURE__ */ new Set([...Object.keys(g), ...Object.keys(_)])].some((R) => g[R] !== _[R]);
      });
    }
    function W() {
      if (!re(e.tiles, s.tiles)) return;
      const a = we(s.tiles);
      h = a, p("update:tiles", a);
    }
    function j() {
      re(e.tiles, s.tiles) && (s.tiles = we(e.tiles), ue(s.tiles, e.gravity), B(), de && W());
    }
    function B() {
      const a = J();
      s.boardStyle.height !== a && (s.boardStyle = Q(a, s.boardStyle.height));
    }
    function ae() {
      x.el && (s.width = x.el.offsetWidth);
    }
    function J() {
      if (!e.autoHeight) return;
      const a = X.value[1];
      return `${qe(s.tiles) * (e.rowHeight + a) + a}px`;
    }
    function Q(a, l) {
      const g = parseFloat(a) > parseFloat(l);
      return {
        position: "relative",
        height: a,
        ...g ? { transitionDuration: "var(--grid-board-grow-duration, 150ms)" } : {}
      };
    }
    function ee([a, l, g, M, _, K] = []) {
      const R = ve(s.tiles, l) ?? { x: 0, y: 0 };
      if (a === "dragmove" && s.busy && R.x === g && R.y === M && s.shadow.w === K && s.shadow.h === _)
        return;
      const y = a === "dragmove" || a === "dragstart";
      s.tiles = be(s.tiles, R, g, M, !0, !1), ue(s.tiles, e.gravity, l), y && (s.shadow = { ...s.shadow, x: R.x, y: R.y, w: K, h: _ }), s.busy = y, B(), W();
    }
    function ie([a, l, g, M, _, K] = []) {
      if (!a) return;
      const R = ve(s.tiles, l) ?? { x: g, y: M, h: 0, w: 0 };
      if (a === "resizemove" && s.busy && R.w === K && R.h === _ && s.shadow.x === g && s.shadow.y === M)
        return;
      R.w = K, R.h = _;
      const y = a === "resizestart" || a === "resizemove";
      ue(s.tiles, e.gravity, l), y && (s.shadow = { ...s.shadow, x: R.x, y: R.y, w: R.w, h: R.h }), s.busy = y, B(), W();
    }
    function q(a) {
      !a || a === x.el || (x.el = a, typeof window < "u" && (E = new ResizeObserver(ae), E.observe(x.el), s.width = x.el.offsetWidth));
    }
    return (a, l) => ($e(), Se("div", {
      ref: q,
      class: Me(["grid-board", { "grid-board--busy": s.busy }]),
      style: Ce(s.boardStyle)
    }, [
      dt(Ae(Mt, {
        id: "shadow",
        class: "grid-shadow",
        x: s.shadow.x,
        y: s.shadow.y,
        w: s.shadow.w,
        h: s.shadow.h,
        shadow: ""
      }, null, 8, ["x", "y", "w", "h"]), [
        [ft, s.busy]
      ]),
      Ae(N),
      Ye("p", {
        id: se(m),
        class: "grid-sr"
      }, " Press Enter or Space to pick the tile up. Then use the arrow keys to move it, or hold Shift with the arrow keys to resize it. Press Enter to drop it, or Escape to put it back. ", 8, Rt),
      Ye("p", Ht, ct(s.announcement), 1)
    ], 6));
  }
}, Dt = /* @__PURE__ */ je(Wt, [["__scopeId", "data-v-b89d1135"]]);
export {
  Ke as GRID_BOARD,
  Dt as GridBoard,
  Mt as GridTile,
  de as IS_BROWSER,
  ue as applyGravity,
  we as copyTiles,
  _e as getFrameDelta,
  qe as getLastRow,
  vt as getPointerOffset,
  ve as getTileById,
  be as moveTile,
  xt as usePointerDragResize,
  Be as validateTiles
};
//# sourceMappingURL=core.js.map
