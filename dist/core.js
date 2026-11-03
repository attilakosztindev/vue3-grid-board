import { inject as et, computed as k, reactive as Le, unref as ie, watch as F, onMounted as tt, onBeforeUnmount as Te, openBlock as ze, createElementBlock as Ee, normalizeStyle as Ge, normalizeClass as $e, renderSlot as De, createCommentVNode as nt, nextTick as fe, useId as rt, useSlots as it, provide as ot, onBeforeMount as st, withDirectives as at, createVNode as Xe, vShow as lt, createElementVNode as ke, toDisplayString as ut, Fragment as dt } from "vue";
const ae = typeof document < "u";
function Oe(i, o) {
  return !(i === o || i.x + i.w <= o.x || i.x >= o.x + o.w || i.y + i.h <= o.y || i.y >= o.y + o.h);
}
function Se(i, o) {
  return i.find((u) => Oe(u, o));
}
function ft(i, o) {
  return i.filter((u) => Oe(u, o));
}
function ct(i) {
  return i.filter((o) => o.frozen);
}
function Pe(i, o) {
  return [].concat(i).sort((u, e) => {
    if (u.y === e.y) {
      if (o !== void 0) {
        if (u.id === o) return -1;
        if (e.id === o) return 1;
      }
      if (u.x === e.x) return 0;
    }
    return u.y > e.y || u.y === e.y && u.x > e.x ? 1 : -1;
  });
}
function gt(i, o, u) {
  if (u)
    for (; o.y > 0 && !Se(i, o); )
      o.y--;
  let e;
  for (; e = Se(i, o); )
    o.y = e.y + e.h;
}
function Ae(i, o, u, e) {
  if (e) {
    const g = {
      x: u.x,
      y: Math.max(o.y - u.h, 0),
      w: u.w,
      h: u.h
    };
    if (!Se(i, g))
      return Me(i, u, void 0, g.y, !1);
  }
  return Me(i, u, void 0, u.y + 1, !1);
}
function ht(i) {
  return typeof i == "number" && !Number.isNaN(i);
}
function pt(i) {
  let o = 0;
  for (let u = 0, e = i.length; u < e; u++) {
    const g = i[u].y + i[u].h;
    g > o && (o = g);
  }
  return o;
}
function xe(i) {
  return (i || []).map((o) => ({ ...o }));
}
function Be(i, o) {
  return i.find((u) => u.id === o);
}
function de(i, o, u) {
  const e = ct(i), g = Pe(i, u);
  for (let E = 0, y = g.length; E < y; E++) {
    const S = g[E];
    S.frozen || (gt(e, S, o), e.push(S)), delete S.moved;
  }
}
function Me(i, o, u, e, g, E) {
  if (o.frozen) return i;
  const y = o.x, S = o.y, s = e && o.y > e;
  typeof u == "number" && (o.x = u), typeof e == "number" && (o.y = e), o.moved = !0;
  let H = Pe(i);
  s && (H = H.reverse());
  const Y = ft(H, o);
  if (E && Y.length)
    return o.x = y, o.y = S, o.moved = !1, i;
  for (let v = 0, $ = Y.length; v < $; v++) {
    const z = Y[v];
    z.moved || o.y > z.y && o.y - z.y > z.h / 4 || (z.frozen ? i = Ae(i, z, o, g) : i = Ae(i, o, z, g));
  }
  return i;
}
function Ye(i, o = "tiles") {
  if (!Array.isArray(i)) throw new Error(`Vue Grid: ${o} must be an array.`);
  const u = /* @__PURE__ */ new Set();
  i.forEach((e, g) => {
    for (const E of ["x", "y", "w", "h"])
      if (typeof e[E] != "number")
        throw new Error(`Vue Grid: ${o}[${g}].${E} must be a number.`);
    if (e.id === void 0 || e.id === null)
      throw new Error(`Vue Grid: ${o}[${g}].id is required.`);
    if (typeof e.id != "number" && typeof e.id != "string")
      throw new Error(`Vue Grid: ${o}[${g}].id must be a string or a number.`);
    if (u.has(e.id))
      throw new Error(`Vue Grid: ${o}[${g}].id must be unique (saw "${e.id}" twice).`);
    if (u.add(e.id), e.frozen !== void 0 && typeof e.frozen != "boolean")
      throw new Error(`Vue Grid: ${o}[${g}].frozen must be a boolean.`);
  });
}
function yt(i) {
  const o = i.target.offsetParent || document.body, u = o.getBoundingClientRect();
  return {
    x: i.clientX + o.scrollLeft - u.left,
    y: i.clientY + o.scrollTop - u.top
  };
}
function _e(i, o, u, e) {
  return ht(i) ? { deltaX: u - i, deltaY: e - o, lastX: i, lastY: o, x: u, y: e } : { deltaX: 0, deltaY: 0, lastX: u, lastY: e, x: u, y: e };
}
const Ce = /* @__PURE__ */ Symbol("gridBoard"), mt = 3, O = 60, Ie = 18;
function wt(i, o) {
  const {
    handleSelector: u = ".grid-handle",
    draggable: e = () => !1,
    resizable: g = () => !1,
    dragIgnore: E = () => null,
    dragHandle: y = () => null,
    resizeIgnore: S = () => null,
    autoScroll: s = () => !0,
    onDrag: H = () => {
    },
    onResize: Y = () => {
    }
  } = o;
  let v = null, $ = null, z = !1, q = 0, _ = 0, W = 0, D = 0, N = 0, I = 0, B = !1, t = 0, te = 0;
  function P(m) {
    try {
      return m(), !0;
    } catch {
      return !1;
    }
  }
  function X(m, C) {
    if (!C) return !1;
    const T = m.closest?.(C);
    return !!T && i.contains(T);
  }
  function V(m, C = W, T = D) {
    const G = { type: m, target: i, clientX: C, clientY: T };
    $ === "resize" ? Y(G) : H(G);
  }
  function Z() {
    I = requestAnimationFrame(() => {
      I = 0, !(v === null || !z || !B) && (B = !1, V(`${$}move`), Z());
    });
  }
  function oe() {
    if (I) {
      B = !0;
      return;
    }
    V(`${$}move`), Z();
  }
  function Q() {
    I && cancelAnimationFrame(I), I = 0, B = !1;
  }
  function ne() {
    Q(), V(`${$}move`);
  }
  function l(m) {
    if (v !== null || m.pointerType === "mouse" && m.button !== 0) return;
    const C = X(m.target, u);
    if (C && g()) {
      if (X(m.target, S())) return;
      $ = "resize";
    } else if (!C && e()) {
      const T = E(), G = y();
      if (T && X(m.target, T) || G && !X(m.target, G)) return;
      $ = "drag";
    } else
      return;
    v = m.pointerId, z = !1, q = W = m.clientX, _ = D = m.clientY, L(), P(() => i.setPointerCapture(m.pointerId)), i.addEventListener("pointermove", h), i.addEventListener("pointerup", c), i.addEventListener("pointercancel", c), i.addEventListener("lostpointercapture", c), window.addEventListener("resize", L, { passive: !0 });
  }
  function h(m) {
    if (m.pointerId === v) {
      if (W = m.clientX, D = m.clientY, !z) {
        if (Math.hypot(W - q, D - _) < mt) return;
        z = !0, V(`${$}start`, q, _);
      }
      m.preventDefault(), oe(), $ === "drag" && !N && M() && s() && j();
    }
  }
  function c(m) {
    m.pointerId === v && (z && (B && ne(), V(`${$}end`)), R());
  }
  function R() {
    Q(), ce(), i.removeEventListener("pointermove", h), i.removeEventListener("pointerup", c), i.removeEventListener("pointercancel", c), i.removeEventListener("lostpointercapture", c), window.removeEventListener("resize", L), P(() => {
      v !== null && i.hasPointerCapture?.(v) && i.releasePointerCapture(v);
    }), v = null, $ = null, z = !1;
  }
  function b(m) {
    return Math.min(Ie, m / O * Ie);
  }
  function L() {
    t = window.innerWidth, te = window.innerHeight;
  }
  function M() {
    return W < O || D < O || W > t - O || D > te - O;
  }
  function j() {
    if (N) return;
    const m = () => {
      if (N = 0, v === null || !z) return;
      const C = t, T = te;
      let G = 0, re = 0;
      D < O ? re = -b(O - D) : D > T - O && (re = b(D - (T - O))), W < O ? G = -b(O - W) : W > C - O && (G = b(W - (C - O))), (G || re) && (window.scrollBy({ left: G, top: re, behavior: "instant" }), ne(), N = requestAnimationFrame(m));
    };
    N = requestAnimationFrame(m);
  }
  function ce() {
    N && cancelAnimationFrame(N), N = 0;
  }
  i.addEventListener("pointerdown", l);
  function me() {
    if (i.removeEventListener("pointerdown", l), v === null) {
      ce();
      return;
    }
    z && (B && ne(), V(`${$}end`)), R();
  }
  return { destroy: me };
}
const Fe = (i, o) => {
  const u = i.__vccOpts || i;
  for (const [e, g] of o)
    u[e] = g;
  return u;
}, vt = ["data-tile", "tabindex", "role", "aria-roledescription", "aria-label", "aria-describedby", "aria-hidden", "data-grabbed"], bt = ["aria-hidden"], xt = 220, zt = "cubic-bezier(0.2, 0, 0, 1)", Et = 2147483647, $t = {
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
  setup(i, { expose: o, emit: u }) {
    const e = i, g = u, E = {
      el: void 0
    };
    o(E);
    const y = et(Ce, null);
    if (!y)
      throw new Error(
        "GridTile must be rendered inside a GridBoard. The two are a single component pair and cannot be used apart."
      );
    let S;
    const s = /* @__PURE__ */ new Set();
    let H = null, Y = null, v = null, $ = null, z = null, q = null;
    const _ = k(() => y.props.columns), W = k(() => y.props.rowHeight), D = k(() => y.state.width ?? 100), N = k(() => y.gap.value), I = k(
      () => e.draggable === null ? y.props.draggable : e.draggable
    ), B = k(
      () => e.resizable === null ? y.props.resizable : e.resizable
    ), t = Le({
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
    }), te = k(() => B.value && !e.frozen && !e.shadow), P = k(
      () => I.value && !e.frozen && !e.shadow && !e.dragHandle
    ), X = k(
      () => (I.value || B.value) && !e.frozen && !e.shadow
    ), V = k(() => ie(X) ? { touchAction: "none" } : {}), Z = k(
      () => ae && !e.shadow && y.props.overflow && (t.isDragging || t.isResizing || t.settling)
    ), oe = k(() => ({
      "grid-tile--draggable": P.value,
      "grid-tile--frozen": e.frozen,
      "grid-tile--dragging": t.isDragging,
      "grid-tile--resizing": t.isResizing,
      "grid-tile--settling": t.settling,
      "grid-tile--grabbed": t.grabbed
    })), Q = k(() => e.label || `Tile ${e.id}`), ne = k(
      () => `${ie(Q)}, column ${t.innerX + 1}, row ${t.innerY + 1}, ${t.innerW} wide, ${t.innerH} tall`
    );
    b(), F([W, _], () => {
      b(), j();
    }), F(D, () => {
      (t.isDragging || t.isResizing) && b(), j();
    }), F([() => e.x, () => e.y, () => e.w, () => e.h], (n, r) => {
      if (t.innerX = e.x, t.innerY = e.y, t.innerW = e.w, t.innerH = e.h, b(), e.shadow || t.isDragging || t.isResizing || t.settling) return;
      const [a, f, d, w] = n, [p, x, A, pe] = r;
      if (a === p && f === x) return;
      const ue = K(p, x, A, pe), U = K(a, f, d, w);
      T(ue.left - U.left, ue.top - U.top, !1);
    }), F(Z, b), F(() => e.radius, b), F(N, (n, r) => {
      n[0] === r[0] && n[1] === r[1] || (b(), j());
    }), tt(() => {
      b(), l();
    }), F(X, l);
    function l() {
      const n = ie(X);
      if (n !== !!S) {
        if (!n) {
          S.destroy(), S = null;
          return;
        }
        E.el && (S = wt(E.el, {
          handleSelector: ".grid-handle",
          draggable: () => I.value && !e.frozen,
          resizable: () => B.value && !e.frozen,
          dragIgnore: () => e.dragIgnore,
          dragHandle: () => e.dragHandle,
          resizeIgnore: () => e.resizeIgnore,
          autoScroll: () => !0,
          onDrag: me,
          onResize: ce
        }));
      }
    }
    Te(() => {
      se(), G(), ge(), S?.destroy();
    });
    function h(n) {
      E.el = n;
    }
    function c() {
      const n = E.el, r = Y || n?.offsetParent || n?.parentElement;
      return r ? r.getBoundingClientRect() : null;
    }
    function R() {
      Z.value && b();
    }
    function b() {
      const n = _.value;
      e.x + e.w > n ? (t.innerX = 0, t.innerW = e.w > n ? n : e.w) : (t.innerX = e.x, t.innerW = e.w);
      const { innerX: r, innerY: a, innerW: f, innerH: d } = t, w = W.value, [p, x] = N.value, A = `((100% - ${(n + 1) * p}px) / ${n})`;
      let pe = `${w * a + (a + 1) * x}px`, ue = `calc(${A} * ${r} + ${(r + 1) * p}px)`, U = null;
      if (t.isDragging) {
        const J = K(r, a, f, d);
        $ = J, pe = `${J.top}px`, ue = `${J.left}px`, U = {
          dx: t.dragging.left - J.left,
          dy: t.dragging.top - J.top
        };
      } else
        $ = null;
      if (Z.value) {
        const J = c();
        if (J) {
          const ye = t.isDragging ? $ : K(r, a, f, d), be = {
            position: "fixed",
            top: `${J.top + ye.top}px`,
            left: `${J.left + ye.left}px`,
            width: `${t.isResizing ? t.resizing.width : ye.width}px`,
            height: `${t.isResizing ? t.resizing.height : ye.height}px`,
            zIndex: String(Et),
            transition: "none",
            ...U ? {
              transform: `translate3d(${U.dx}px, ${U.dy}px, 0)`,
              willChange: "transform"
            } : {},
            "--grid-radius": `${e.radius}px`
          };
          if (v && L(v, be)) return;
          v = be, t.style = be;
          return;
        }
      }
      const ve = {
        position: "absolute",
        top: pe,
        left: ue,
        width: t.isResizing ? `${t.resizing.width}px` : f === 1 / 0 ? "auto" : `calc(${A} * ${f} + ${Math.max(0, f - 1) * p}px)`,
        height: t.isResizing ? `${t.resizing.height}px` : d === 1 / 0 ? "auto" : `${w * d + Math.max(0, d - 1) * x}px`,
        ...U ? {
          transform: `translate3d(${U.dx}px, ${U.dy}px, 0)`,
          transition: "none",
          willChange: "transform"
        } : t.isResizing ? { transition: "none" } : {},
        "--grid-radius": `${e.radius}px`
      };
      v && L(v, ve) || (v = ve, t.style = ve);
    }
    function L(n, r) {
      const a = Object.keys(r);
      return Object.keys(n).length !== a.length ? !1 : a.every((f) => n[f] === r[f]);
    }
    function M(n) {
      const r = E.el;
      if (!r || !v || !$) return;
      const a = `translate3d(${n.left - $.left}px, ${n.top - $.top}px, 0)`;
      v.transform !== a && (v.transform = a, r.style.transform = a);
    }
    function j() {
      const { width: n, height: r } = K(t.innerX, t.innerY, t.innerW, t.innerH);
      !Number.isFinite(n) || !Number.isFinite(r) || g("size", e.id, n, r);
    }
    function ce(n) {
      if (e.frozen && !(n.type === "resizeend" && t.isResizing)) return;
      n.type === "resizestart" && re(n.target);
      const r = Re(n);
      if (r == null) return;
      const { x: a, y: f } = r, d = { width: 0, height: 0 };
      let w = null, p;
      switch (n.type) {
        case "resizestart": {
          t.resizeMin = K(0, 0, e.minW, e.minH), t.resizeMax = K(0, 0, e.maxW, e.maxH), t.previousW = t.innerW, t.previousH = t.innerH, p = K(t.innerX, t.innerY, t.innerW, t.innerH), d.width = p.width, d.height = p.height, t.resizing = d, t.isResizing = !0, g("resizestart", e.id, t.innerW, t.innerH);
          break;
        }
        case "resizemove": {
          const A = _e(t.lastW, t.lastH, a, f);
          d.width = Math.max(
            t.resizeMin.width,
            Math.min(t.resizeMax.width, t.resizing.width + A.deltaX)
          ), d.height = Math.max(
            t.resizeMin.height,
            Math.min(t.resizeMax.height, t.resizing.height + A.deltaY)
          ), t.resizing = d;
          break;
        }
        case "resizeend": {
          w = t.resizing, p = K(t.innerX, t.innerY, t.innerW, t.innerH), d.width = p.width, d.height = p.height, t.resizing = null, t.isResizing = !1;
          break;
        }
      }
      b(), p = We(He(d.height, d.width));
      const x = w ? We(He(w.height, w.width)) : p;
      t.lastW = a, t.lastH = f, (t.innerW !== p.w || t.innerH !== p.h) && g("resize", e.id, p.w, p.h), n.type === "resizeend" && (t.previousW !== x.w || t.previousH !== x.h) && g("resizeend", e.id, x.w, x.h), y.resizeEvent([n.type, e.id, t.innerX, t.innerY, x.h, x.w]), n.type === "resizeend" && ge();
    }
    function me(n) {
      if (t.isResizing || e.frozen && !(n.type === "dragend" && t.isDragging)) return;
      n.type === "dragstart" && re(n.target);
      const r = Re(n);
      if (r === null) return;
      const { x: a, y: f } = r, d = { top: 0, left: 0 };
      switch (n.type) {
        case "dragstart":
        case "dragend": {
          if (n.type === "dragend" && !t.isDragging) return;
          n.type === "dragstart" && (t.previousX = t.innerX, t.previousY = t.innerY, G());
          const x = c() ?? { left: 0, top: 0 }, A = n.target.getBoundingClientRect();
          d.left = A.left - x.left, d.top = A.top - x.top, t.dragging = n.type === "dragstart" ? d : null, t.isDragging = n.type === "dragstart", n.type === "dragstart" && g("dragstart", e.id, t.innerX, t.innerY);
          break;
        }
        case "dragmove": {
          const x = _e(t.lastX, t.lastY, a, f);
          d.left = t.dragging.left + x.deltaX, d.top = t.dragging.top + x.deltaY, t.dragging = d;
          break;
        }
      }
      n.type !== "dragmove" && b();
      const w = qe(d.top, d.left), p = t.innerX !== w.x || t.innerY !== w.y;
      if (n.type === "dragmove" && (p ? b() : M(d)), t.lastX = a, t.lastY = f, p && g("drag", e.id, w.x, w.y), n.type === "dragend" && (t.previousX !== t.innerX || t.previousY !== t.innerY) && g("dragend", e.id, w.x, w.y), y.dragEvent([n.type, e.id, w.x, w.y, t.innerH, t.innerW]), n.type === "dragend") {
        if (ae && E.el) {
          const x = y.state.tiles.find((A) => A.id === e.id);
          if (x) {
            const A = K(x.x, x.y, x.w, x.h);
            T(d.left - A.left, d.top - A.top), b();
          }
        }
        ge();
      }
    }
    function m(n) {
      if (!n || n === "none") return { dx: 0, dy: 0 };
      const r = n.match(/-?[\d.]+(?:e[-+]?\d+)?/g)?.map(Number);
      return r ? n.startsWith("matrix3d") ? { dx: r[12] ?? 0, dy: r[13] ?? 0 } : n.startsWith("matrix") ? { dx: r[4] ?? 0, dy: r[5] ?? 0 } : { dx: r[0] ?? 0, dy: r[1] ?? 0 } : { dx: 0, dy: 0 };
    }
    function C(n) {
      if (s.size === 0) return { dx: 0, dy: 0 };
      const r = m(getComputedStyle(n).transform), a = m(v?.transform);
      for (const f of s)
        f.onfinish = null, f.oncancel = null, f.cancel();
      return s.clear(), t.settling = !1, { dx: r.dx - a.dx, dy: r.dy - a.dy };
    }
    function T(n, r, a = !0) {
      const f = E.el;
      if (!f || typeof f.animate != "function") return;
      const d = C(f);
      if (n += d.dx, r += d.dy, Math.abs(n) < 0.5 && Math.abs(r) < 0.5) return;
      const w = f.animate(
        [{ transform: `translate3d(${n}px, ${r}px, 0)` }, { transform: "translate3d(0px, 0px, 0)" }],
        { duration: xt, easing: zt, composite: "add" }
      );
      s.add(w), a && (t.settling = !0);
      const p = () => {
        s.delete(w), s.size === 0 && (t.settling = !1);
      };
      w.onfinish = p, w.oncancel = p;
    }
    function G() {
      for (const n of s)
        n.onfinish = null, n.oncancel = null, n.cancel();
      s.clear(), t.settling = !1;
    }
    function re(n) {
      ge(), Y = n.offsetParent || null;
      const r = Y || document.body, a = { offsetParent: r, left: 0, top: 0, measure: null };
      a.measure = () => {
        const f = r === document.body ? { left: 0, top: 0 } : r.getBoundingClientRect();
        a.left = f.left - r.scrollLeft, a.top = f.top - r.scrollTop, R();
      }, a.measure(), H = a, window.addEventListener("scroll", a.measure, { passive: !0, capture: !0 }), window.addEventListener("resize", a.measure, { passive: !0 });
    }
    function ge() {
      Y = null, H && (window.removeEventListener("scroll", H.measure, { capture: !0 }), window.removeEventListener("resize", H.measure), H = null);
    }
    function Re(n) {
      return H ? { x: n.clientX - H.left, y: n.clientY - H.top } : yt(n);
    }
    function K(n, r, a, f) {
      const d = we(), w = W.value, [p, x] = N.value;
      return {
        left: Math.round(d * n + (n + 1) * p),
        top: Math.round(w * r + (r + 1) * x),
        width: a === 1 / 0 ? a : Math.round(d * a + Math.max(0, a - 1) * p),
        height: f === 1 / 0 ? f : Math.round(w * f + Math.max(0, f - 1) * x)
      };
    }
    function qe(n, r) {
      const a = we(), [f, d] = N.value, w = Math.round((r - f) / (a + f)), p = Math.round((n - d) / (W.value + d));
      return {
        x: Math.max(Math.min(w, _.value - t.innerW), 0),
        y: Math.max(p, 0)
      };
    }
    function we() {
      const n = _.value;
      return (D.value - N.value[0] * (n + 1)) / n;
    }
    function He(n, r) {
      const a = we(), [f, d] = N.value, w = Math.round((r + f) / (a + f)), p = Math.round((n + d) / (W.value + d));
      return {
        w: Math.max(Math.min(w, _.value - t.innerX), 0),
        h: Math.max(p, 0)
      };
    }
    function We(n) {
      return {
        w: Math.max(e.minW, Math.min(e.maxW, n.w), 1),
        h: Math.max(e.minH, Math.min(e.maxH, n.h), 1)
      };
    }
    const Ve = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };
    function ee() {
      const n = y.state.tiles.find((r) => r.id === e.id);
      return n ? { x: n.x, y: n.y, w: n.w, h: n.h } : { x: t.innerX, y: t.innerY, w: t.innerW, h: t.innerH };
    }
    function le(n) {
      const r = ee(), a = `${ie(Q)}, column ${r.x + 1}, row ${r.y + 1}, ${r.w} wide, ${r.h} tall`;
      y.announce(n ? `${a}. ${n}` : a);
    }
    function he(n) {
      if (z === n) return;
      z && se();
      const r = ee();
      z = n, n === "drag" ? (g("dragstart", e.id, r.x, r.y), y.dragEvent(["dragstart", e.id, r.x, r.y, r.h, r.w])) : (g("resizestart", e.id, r.w, r.h), y.resizeEvent(["resizestart", e.id, r.x, r.y, r.h, r.w]));
    }
    function se() {
      if (!z) return;
      const n = z;
      z = null;
      const r = ee();
      n === "drag" ? y.dragEvent(["dragend", e.id, r.x, r.y, r.h, r.w]) : y.resizeEvent(["resizeend", e.id, r.x, r.y, r.h, r.w]);
    }
    function je(n, r) {
      if (!I.value || e.frozen) return;
      he("drag");
      const a = ee(), f = Math.max(0, Math.min(_.value - a.w, a.x + n)), d = Math.max(0, a.y + r);
      (f !== a.x || d !== a.y) && (y.dragEvent(["dragmove", e.id, f, d, a.h, a.w]), g("drag", e.id, f, d)), fe(() => le());
    }
    function Ke(n, r) {
      if (!B.value || e.frozen) return;
      he("resize");
      const a = ee(), f = Math.max(e.minW, Math.min(e.maxW, _.value - a.x, a.w + n)), d = Math.max(e.minH, Math.min(e.maxH, a.h + r));
      (f !== a.w || d !== a.h) && (y.resizeEvent(["resizemove", e.id, a.x, a.y, d, f]), g("resize", e.id, f, d)), fe(() => le());
    }
    function Ue() {
      q = ee(), t.grabbed = !0, le(
        "Picked up. Arrow keys move, Shift plus arrow keys resize, Enter drops, Escape cancels."
      );
    }
    function Ne() {
      if (!t.grabbed) return;
      const n = z !== null;
      se(), t.grabbed = !1, q = null, fe(() => le(n ? "Dropped." : "Put down."));
    }
    function Ze() {
      if (!t.grabbed) return;
      const n = q;
      if (se(), n) {
        let r = ee();
        (r.w !== n.w || r.h !== n.h) && (he("resize"), y.resizeEvent(["resizemove", e.id, r.x, r.y, n.h, n.w]), se(), r = ee()), (r.x !== n.x || r.y !== n.y) && (he("drag"), y.dragEvent(["dragmove", e.id, n.x, n.y, n.h, n.w]), se());
      }
      t.grabbed = !1, q = null, fe(() => le("Returned to where it started."));
    }
    function Je(n) {
      if (!ie(X) || n.target !== E.el || n.altKey || n.ctrlKey || n.metaKey) return;
      if (n.key === "Enter" || n.key === " ") {
        n.preventDefault(), t.grabbed ? Ne() : Ue();
        return;
      }
      if (n.key === "Escape") {
        if (!t.grabbed) return;
        n.preventDefault(), Ze();
        return;
      }
      const r = Ve[n.key];
      !r || !t.grabbed || (n.preventDefault(), n.shiftKey ? Ke(r[0], r[1]) : je(r[0], r[1]));
    }
    function Qe() {
      t.grabbed && Ne();
    }
    return (n, r) => (ze(), Ee("div", {
      ref: h,
      class: $e(["grid-tile", oe.value]),
      style: Ge([t.style, V.value]),
      "data-tile": i.id,
      tabindex: X.value ? 0 : void 0,
      role: X.value ? "group" : void 0,
      "aria-roledescription": X.value ? "Draggable tile" : void 0,
      "aria-label": X.value ? ne.value : void 0,
      "aria-describedby": X.value ? ie(y).instructionsId : void 0,
      "aria-hidden": i.shadow ? "true" : void 0,
      "data-grabbed": t.grabbed ? "true" : void 0,
      onKeydown: Je,
      onBlur: Qe
    }, [
      De(n.$slots, "default", {}, void 0, !0),
      te.value ? (ze(), Ee("span", {
        key: 0,
        class: $e(["grid-handle", { "grid-handle--chevron": !n.$slots.handle }]),
        "aria-hidden": n.$slots.handle ? void 0 : "true"
      }, [
        De(n.$slots, "handle", {}, void 0, !0)
      ], 10, bt)) : nt("", !0)
    ], 46, vt));
  }
}, St = /* @__PURE__ */ Fe($t, [["__scopeId", "data-v-2339e98b"]]), Mt = ["id"], Rt = {
  class: "grid-sr",
  role: "status",
  "aria-live": "polite",
  "aria-atomic": "true"
}, Ht = {
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
  setup(i, { expose: o, emit: u }) {
    const e = i, g = u;
    let E = null, y = null;
    const S = {
      el: void 0,
      dispatch: W
    };
    o(S);
    const s = Le({
      width: null,
      boardStyle: {},
      busy: !1,
      shadow: { x: 0, y: 0, w: 0, h: 0, id: -1 },
      tiles: [],
      announcement: ""
    }), H = k(() => {
      const l = e.gap;
      if (Array.isArray(l)) return [Number(l[0]) || 0, Number(l[1]) || 0];
      const h = Number(l) || 0;
      return [h, h];
    }), Y = rt(), v = it();
    let $ = /* @__PURE__ */ new Map();
    const z = k(() => {
      if (s.busy) return $;
      const l = [...s.tiles].sort((h, c) => h.y - c.y || h.x - c.x);
      return $ = new Map(l.map((h, c) => [String(h.id), c])), $;
    });
    function q(l, h = []) {
      for (const c of l)
        c.type === dt && Array.isArray(c.children) ? q(c.children, h) : h.push(c);
      return h;
    }
    function _() {
      const l = z.value, h = (c) => {
        const R = l.get(String(c.props?.id));
        return R === void 0 ? Number.MAX_SAFE_INTEGER : R;
      };
      return q(v.default?.() ?? []).map((c, R) => ({ node: c, index: R })).sort((c, R) => h(c.node) - h(R.node) || c.index - R.index).map((c) => c.node);
    }
    ot(Ce, {
      props: e,
      state: s,
      gap: H,
      instructionsId: Y,
      dragEvent: oe,
      resizeEvent: Q,
      announce: N
    }), I(), ae && (F(
      () => e.tiles,
      () => {
        e.tiles !== y && (Ye(e.tiles), te());
      },
      { immediate: !0 }
    ), F(
      () => s.busy,
      (l) => {
        l ? (window.getSelection()?.removeAllRanges(), document.addEventListener("selectstart", D)) : document.removeEventListener("selectstart", D);
      }
    )), F(
      () => s.width,
      async (l, h) => {
        P(), h === null && (await fe(), g("ready", s.tiles));
      }
    ), F(
      () => e.gravity,
      () => {
        de(s.tiles, e.gravity), P(), ae && t();
      }
    ), F(H, P), st(P), Te(() => {
      E && S.el && E.disconnect(), ae && document.removeEventListener("selectstart", D);
    });
    function W(l, h) {
      switch (l) {
        case "dragEvent":
          return oe(h);
        case "resizeEvent":
          return Q(h);
        case "announce":
          return N(h);
        case "measure":
          return X();
        default:
          throw new Error(`GridBoard: dispatch received an unknown command "${String(l)}".`);
      }
    }
    function D(l) {
      l.preventDefault();
    }
    function N(l) {
      l && (s.announcement = l === s.announcement ? `${l}​` : l);
    }
    function I() {
      Ye(e.tiles), s.tiles = xe(e.tiles), de(s.tiles, e.gravity), s.boardStyle = Z(V());
    }
    function B(l, h) {
      return l?.length !== h?.length ? !0 : l.some((c, R) => {
        const b = h[R];
        return [.../* @__PURE__ */ new Set([...Object.keys(c), ...Object.keys(b)])].some((M) => c[M] !== b[M]);
      });
    }
    function t() {
      if (!B(e.tiles, s.tiles)) return;
      const l = xe(s.tiles);
      y = l, g("update:tiles", l);
    }
    function te() {
      B(e.tiles, s.tiles) && (s.tiles = xe(e.tiles), de(s.tiles, e.gravity), P(), ae && t());
    }
    function P() {
      const l = V();
      s.boardStyle.height !== l && (s.boardStyle = Z(l));
    }
    function X() {
      S.el && (s.width = S.el.offsetWidth);
    }
    function V() {
      if (!e.autoHeight) return;
      const l = H.value[1];
      return `${pt(s.tiles) * (e.rowHeight + l) + l}px`;
    }
    function Z(l) {
      return { position: "relative", height: l };
    }
    function oe([l, h, c, R, b, L] = []) {
      const M = Be(s.tiles, h) ?? { x: 0, y: 0 };
      if (l === "dragmove" && s.busy && M.x === c && M.y === R && s.shadow.w === L && s.shadow.h === b)
        return;
      const j = l === "dragmove" || l === "dragstart";
      s.tiles = Me(s.tiles, M, c, R, !0, !1), de(s.tiles, e.gravity, h), j && (s.shadow = { ...s.shadow, x: M.x, y: M.y, w: L, h: b }), s.busy = j, P(), t();
    }
    function Q([l, h, c, R, b, L] = []) {
      if (!l) return;
      const M = Be(s.tiles, h) ?? { x: c, y: R, h: 0, w: 0 };
      if (l === "resizemove" && s.busy && M.w === L && M.h === b && s.shadow.x === c && s.shadow.y === R)
        return;
      M.w = L, M.h = b;
      const j = l === "resizestart" || l === "resizemove";
      de(s.tiles, e.gravity, h), j && (s.shadow = { ...s.shadow, x: M.x, y: M.y, w: M.w, h: M.h }), s.busy = j, P(), t();
    }
    function ne(l) {
      !l || l === S.el || (S.el = l, typeof window < "u" && (E = new ResizeObserver(X), E.observe(S.el), s.width = S.el.offsetWidth));
    }
    return (l, h) => (ze(), Ee("div", {
      ref: ne,
      class: $e(["grid-board", { "grid-board--busy": s.busy }]),
      style: Ge(s.boardStyle)
    }, [
      at(Xe(St, {
        id: "shadow",
        class: "grid-shadow",
        x: s.shadow.x,
        y: s.shadow.y,
        w: s.shadow.w,
        h: s.shadow.h,
        shadow: ""
      }, null, 8, ["x", "y", "w", "h"]), [
        [lt, s.busy]
      ]),
      Xe(_),
      ke("p", {
        id: ie(Y),
        class: "grid-sr"
      }, " Press Enter or Space to pick the tile up. Then use the arrow keys to move it, or hold Shift with the arrow keys to resize it. Press Enter to drop it, or Escape to put it back. ", 8, Mt),
      ke("p", Rt, ut(s.announcement), 1)
    ], 6));
  }
}, Nt = /* @__PURE__ */ Fe(Ht, [["__scopeId", "data-v-77cb557d"]]);
export {
  Ce as GRID_BOARD,
  Nt as GridBoard,
  St as GridTile,
  ae as IS_BROWSER,
  de as applyGravity,
  xe as copyTiles,
  _e as getFrameDelta,
  pt as getLastRow,
  yt as getPointerOffset,
  Be as getTileById,
  Me as moveTile,
  wt as usePointerDragResize,
  Ye as validateTiles
};
//# sourceMappingURL=core.js.map
