import { inject as tt, computed as A, reactive as Le, unref as ie, watch as q, onMounted as nt, onBeforeUnmount as Te, openBlock as $e, createElementBlock as Se, normalizeStyle as Oe, normalizeClass as Me, renderSlot as De, createCommentVNode as rt, nextTick as fe, useId as it, useSlots as ot, provide as st, onBeforeMount as at, withDirectives as lt, createVNode as ke, vShow as ut, createElementVNode as Ae, toDisplayString as dt, Fragment as ft } from "vue";
const le = typeof document < "u";
function Pe(i, o) {
  return !(i === o || i.x + i.w <= o.x || i.x >= o.x + o.w || i.y + i.h <= o.y || i.y >= o.y + o.h);
}
function Re(i, o) {
  return i.find((u) => Pe(u, o));
}
function ct(i, o) {
  return i.filter((u) => Pe(u, o));
}
function gt(i) {
  return i.filter((o) => o.frozen);
}
function Ce(i, o) {
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
function ht(i, o, u) {
  if (u)
    for (; o.y > 0 && !Re(i, o); )
      o.y--;
  let e;
  for (; e = Re(i, o); )
    o.y = e.y + e.h;
}
function Ye(i, o, u, e) {
  if (e) {
    const c = {
      x: u.x,
      y: Math.max(o.y - u.h, 0),
      w: u.w,
      h: u.h
    };
    if (!Re(i, c))
      return ve(i, u, void 0, c.y, !1);
  }
  return ve(i, u, void 0, u.y + 1, !1);
}
function pt(i) {
  return typeof i == "number" && !Number.isNaN(i);
}
function Ge(i) {
  let o = 0;
  for (let u = 0, e = i.length; u < e; u++) {
    const c = i[u].y + i[u].h;
    c > o && (o = c);
  }
  return o;
}
function me(i) {
  return (i || []).map((o) => ({ ...o }));
}
function we(i, o) {
  return i.find((u) => u.id === o);
}
function ae(i, o, u) {
  const e = gt(i), c = Ce(i, u);
  for (let z = 0, g = c.length; z < g; z++) {
    const S = c[z];
    S.frozen || (ht(e, S, o), e.push(S)), delete S.moved;
  }
}
function ve(i, o, u, e, c, z) {
  if (o.frozen) return i;
  const g = o.x, S = o.y, s = e && o.y > e;
  typeof u == "number" && (o.x = u), typeof e == "number" && (o.y = e), o.moved = !0;
  let M = Ce(i);
  s && (M = M.reverse());
  const k = ct(M, o);
  if (z && k.length)
    return o.x = g, o.y = S, o.moved = !1, i;
  for (let m = 0, b = k.length; m < b; m++) {
    const x = k[m];
    x.moved || o.y > x.y && o.y - x.y > x.h / 4 || (x.frozen ? i = Ye(i, x, o, c) : i = Ye(i, o, x, c));
  }
  return i;
}
function yt(i, o, u, e, c, z) {
  const g = we(i, o);
  if (!g) return null;
  const S = Ge(i);
  let s = g.x, M = g.y;
  for (; ; ) {
    const k = Math.max(0, Math.min(c - g.w, s + u)), m = Math.max(0, Math.min(S, M + e));
    if (k === s && m === M) return null;
    s = k, M = m;
    const b = me(i);
    if (ve(b, we(b, o), s, M, !0, !1), ae(b, z, o), b.some((x, B) => x.x !== i[B].x || x.y !== i[B].y)) return { x: s, y: M };
  }
}
function Be(i, o = "tiles") {
  if (!Array.isArray(i)) throw new Error(`vue3-grid-board: ${o} must be an array.`);
  const u = /* @__PURE__ */ new Set();
  i.forEach((e, c) => {
    for (const z of ["x", "y", "w", "h"])
      if (typeof e[z] != "number")
        throw new Error(`vue3-grid-board: ${o}[${c}].${z} must be a number.`);
    if (e.id === void 0 || e.id === null)
      throw new Error(`vue3-grid-board: ${o}[${c}].id is required.`);
    if (typeof e.id != "number" && typeof e.id != "string")
      throw new Error(`vue3-grid-board: ${o}[${c}].id must be a string or a number.`);
    if (u.has(e.id))
      throw new Error(
        `vue3-grid-board: ${o}[${c}].id must be unique (saw "${e.id}" twice).`
      );
    if (u.add(e.id), e.frozen !== void 0 && typeof e.frozen != "boolean")
      throw new Error(`vue3-grid-board: ${o}[${c}].frozen must be a boolean.`);
  });
}
function mt(i) {
  const o = i.target.offsetParent || document.body, u = o.getBoundingClientRect();
  return {
    x: i.clientX + o.scrollLeft - u.left,
    y: i.clientY + o.scrollTop - u.top
  };
}
function _e(i, o, u, e) {
  return pt(i) ? { deltaX: u - i, deltaY: e - o, lastX: i, lastY: o, x: u, y: e } : { deltaX: 0, deltaY: 0, lastX: u, lastY: e, x: u, y: e };
}
const Fe = /* @__PURE__ */ Symbol("gridBoard"), wt = 3, C = 60, Ie = 18;
function vt(i, o) {
  const {
    handleSelector: u = ".grid-handle",
    draggable: e = () => !1,
    resizable: c = () => !1,
    dragIgnore: z = () => null,
    dragHandle: g = () => null,
    resizeIgnore: S = () => null,
    autoScroll: s = () => !0,
    onDrag: M = () => {
    },
    onResize: k = () => {
    }
  } = o;
  let m = null, b = null, x = !1, B = 0, I = 0, W = 0, X = 0, N = 0, L = 0, _ = !1, t = 0, te = 0;
  function G(w) {
    try {
      return w(), !0;
    } catch {
      return !1;
    }
  }
  function D(w, F) {
    if (!F) return !1;
    const O = w.closest?.(F);
    return !!O && i.contains(O);
  }
  function K(w, F = W, O = X) {
    const P = { type: w, target: i, clientX: F, clientY: O };
    b === "resize" ? k(P) : M(P);
  }
  function Z() {
    L = requestAnimationFrame(() => {
      L = 0, !(m === null || !x || !_) && (_ = !1, K(`${b}move`), Z());
    });
  }
  function oe() {
    if (L) {
      _ = !0;
      return;
    }
    K(`${b}move`), Z();
  }
  function Q() {
    L && cancelAnimationFrame(L), L = 0, _ = !1;
  }
  function ne() {
    Q(), K(`${b}move`);
  }
  function a(w) {
    if (m !== null || w.pointerType === "mouse" && w.button !== 0) return;
    const F = D(w.target, u);
    if (F && c()) {
      if (D(w.target, S())) return;
      b = "resize";
    } else if (!F && e()) {
      const O = z(), P = g();
      if (O && D(w.target, O) || P && !D(w.target, P)) return;
      b = "drag";
    } else
      return;
    m = w.pointerId, x = !1, B = W = w.clientX, I = X = w.clientY, T(), G(() => i.setPointerCapture(w.pointerId)), i.addEventListener("pointermove", p), i.addEventListener("pointerup", h), i.addEventListener("pointercancel", h), i.addEventListener("lostpointercapture", h), window.addEventListener("resize", T, { passive: !0 });
  }
  function p(w) {
    if (w.pointerId === m) {
      if (W = w.clientX, X = w.clientY, !x) {
        if (Math.hypot(W - B, X - I) < wt) return;
        x = !0, K(`${b}start`, B, I);
      }
      w.preventDefault(), oe(), b === "drag" && !N && R() && s() && j();
    }
  }
  function h(w) {
    w.pointerId === m && (x && (_ && ne(), K(`${b}end`)), H());
  }
  function H() {
    Q(), ce(), i.removeEventListener("pointermove", p), i.removeEventListener("pointerup", h), i.removeEventListener("pointercancel", h), i.removeEventListener("lostpointercapture", h), window.removeEventListener("resize", T), G(() => {
      m !== null && i.hasPointerCapture?.(m) && i.releasePointerCapture(m);
    }), m = null, b = null, x = !1;
  }
  function E(w) {
    return Math.min(Ie, w / C * Ie);
  }
  function T() {
    t = window.innerWidth, te = window.innerHeight;
  }
  function R() {
    return W < C || X < C || W > t - C || X > te - C;
  }
  function j() {
    if (N) return;
    const w = () => {
      if (N = 0, m === null || !x) return;
      const F = t, O = te;
      let P = 0, re = 0;
      X < C ? re = -E(C - X) : X > O - C && (re = E(X - (O - C))), W < C ? P = -E(C - W) : W > F - C && (P = E(W - (F - C))), (P || re) && (window.scrollBy({ left: P, top: re, behavior: "instant" }), ne(), N = requestAnimationFrame(w));
    };
    N = requestAnimationFrame(w);
  }
  function ce() {
    N && cancelAnimationFrame(N), N = 0;
  }
  i.addEventListener("pointerdown", a);
  function be() {
    if (i.removeEventListener("pointerdown", a), m === null) {
      ce();
      return;
    }
    x && (_ && ne(), K(`${b}end`)), H();
  }
  return { destroy: be };
}
const qe = (i, o) => {
  const u = i.__vccOpts || i;
  for (const [e, c] of o)
    u[e] = c;
  return u;
}, bt = ["data-tile", "tabindex", "role", "aria-roledescription", "aria-label", "aria-describedby", "aria-hidden", "data-grabbed"], xt = ["aria-hidden"], zt = 220, Et = "cubic-bezier(0.2, 0, 0, 1)", $t = 2147483647, St = {
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
    const e = i, c = u, z = {
      el: void 0
    };
    o(z);
    const g = tt(Fe, null);
    if (!g)
      throw new Error(
        "GridTile must be rendered inside a GridBoard. The two are a single component pair and cannot be used apart."
      );
    let S;
    const s = /* @__PURE__ */ new Set();
    let M = null, k = null, m = null, b = null, x = null, B = null;
    const I = A(() => g.props.columns), W = A(() => g.props.rowHeight), X = A(() => g.state.width ?? 100), N = A(() => g.gap.value), L = A(
      () => e.draggable === null ? g.props.draggable : e.draggable
    ), _ = A(
      () => e.resizable === null ? g.props.resizable : e.resizable
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
    }), te = A(() => _.value && !e.frozen && !e.shadow), G = A(
      () => L.value && !e.frozen && !e.shadow && !e.dragHandle
    ), D = A(
      () => (L.value || _.value) && !e.frozen && !e.shadow
    ), K = A(() => ie(D) ? { touchAction: "none" } : {}), Z = A(
      () => le && !e.shadow && g.props.overflow && (t.isDragging || t.isResizing || t.settling)
    ), oe = A(() => ({
      "grid-tile--draggable": G.value,
      "grid-tile--frozen": e.frozen,
      "grid-tile--dragging": t.isDragging,
      "grid-tile--resizing": t.isResizing,
      "grid-tile--settling": t.settling,
      "grid-tile--grabbed": t.grabbed
    })), Q = A(() => e.label || `Tile ${e.id}`), ne = A(
      () => `${ie(Q)}, column ${t.innerX + 1}, row ${t.innerY + 1}, ${t.innerW} wide, ${t.innerH} tall`
    );
    E(), q([W, I], () => {
      E(), j();
    }), q(X, () => {
      (t.isDragging || t.isResizing) && E(), j();
    }), q([() => e.x, () => e.y, () => e.w, () => e.h], (n, r) => {
      if (t.innerX = e.x, t.innerY = e.y, t.innerW = e.w, t.innerH = e.h, E(), e.shadow || t.isDragging || t.isResizing || t.settling) return;
      const [l, d, f, v] = n, [y, $, Y, pe] = r;
      if (l === y && d === $) return;
      const de = V(y, $, Y, pe), U = V(l, d, f, v);
      O(de.left - U.left, de.top - U.top, !1);
    }), q(Z, E), q(() => e.radius, E), q(N, (n, r) => {
      n[0] === r[0] && n[1] === r[1] || (E(), j());
    }), nt(() => {
      E(), a();
    }), q(D, a);
    function a() {
      const n = ie(D);
      if (n !== !!S) {
        if (!n) {
          S.destroy(), S = null;
          return;
        }
        z.el && (S = vt(z.el, {
          handleSelector: ".grid-handle",
          draggable: () => L.value && !e.frozen,
          resizable: () => _.value && !e.frozen,
          dragIgnore: () => e.dragIgnore,
          dragHandle: () => e.dragHandle && `.${CSS.escape(e.dragHandle)}`,
          resizeIgnore: () => e.resizeIgnore,
          autoScroll: () => !0,
          onDrag: be,
          onResize: ce
        }));
      }
    }
    Te(() => {
      se(), P(), ge(), S?.destroy();
    });
    function p(n) {
      z.el = n;
    }
    function h() {
      const n = z.el, r = k || n?.offsetParent || n?.parentElement;
      return r ? r.getBoundingClientRect() : null;
    }
    function H() {
      Z.value && E();
    }
    function E() {
      const n = I.value;
      e.x + e.w > n ? (t.innerX = 0, t.innerW = e.w > n ? n : e.w) : (t.innerX = e.x, t.innerW = e.w);
      const { innerX: r, innerY: l, innerW: d, innerH: f } = t, v = W.value, [y, $] = N.value, Y = `((100% - ${(n + 1) * y}px) / ${n})`;
      let pe = `${v * l + (l + 1) * $}px`, de = `calc(${Y} * ${r} + ${(r + 1) * y}px)`, U = null;
      if (t.isDragging) {
        const J = V(r, l, d, f);
        b = J, pe = `${J.top}px`, de = `${J.left}px`, U = {
          dx: t.dragging.left - J.left,
          dy: t.dragging.top - J.top
        };
      } else
        b = null;
      if (Z.value) {
        const J = h();
        if (J) {
          const ye = t.isDragging ? b : V(r, l, d, f), Ee = {
            position: "fixed",
            top: `${J.top + ye.top}px`,
            left: `${J.left + ye.left}px`,
            width: `${t.isResizing ? t.resizing.width : ye.width}px`,
            height: `${t.isResizing ? t.resizing.height : ye.height}px`,
            zIndex: String($t),
            transition: "none",
            ...U ? {
              transform: `translate3d(${U.dx}px, ${U.dy}px, 0)`,
              willChange: "transform"
            } : {},
            "--grid-radius": `${e.radius}px`
          };
          if (m && T(m, Ee)) return;
          m = Ee, t.style = Ee;
          return;
        }
      }
      const ze = {
        position: "absolute",
        top: pe,
        left: de,
        width: t.isResizing ? `${t.resizing.width}px` : d === 1 / 0 ? "auto" : `calc(${Y} * ${d} + ${Math.max(0, d - 1) * y}px)`,
        height: t.isResizing ? `${t.resizing.height}px` : f === 1 / 0 ? "auto" : `${v * f + Math.max(0, f - 1) * $}px`,
        ...U ? {
          transform: `translate3d(${U.dx}px, ${U.dy}px, 0)`,
          transition: "none",
          willChange: "transform"
        } : t.isResizing ? { transition: "none" } : {},
        "--grid-radius": `${e.radius}px`
      };
      m && T(m, ze) || (m = ze, t.style = ze);
    }
    function T(n, r) {
      const l = Object.keys(r);
      return Object.keys(n).length !== l.length ? !1 : l.every((d) => n[d] === r[d]);
    }
    function R(n) {
      const r = z.el;
      if (!r || !m || !b) return;
      const l = `translate3d(${n.left - b.left}px, ${n.top - b.top}px, 0)`;
      m.transform !== l && (m.transform = l, r.style.transform = l);
    }
    function j() {
      const { width: n, height: r } = V(t.innerX, t.innerY, t.innerW, t.innerH);
      !Number.isFinite(n) || !Number.isFinite(r) || c("size", e.id, n, r);
    }
    function ce(n) {
      if (e.frozen && !(n.type === "resizeend" && t.isResizing)) return;
      n.type === "resizestart" && re(n.target);
      const r = He(n);
      if (r == null) return;
      const { x: l, y: d } = r, f = { width: 0, height: 0 };
      let v = null, y;
      switch (n.type) {
        case "resizestart": {
          t.resizeMin = V(0, 0, e.minW, e.minH), t.resizeMax = V(0, 0, e.maxW, e.maxH), t.previousW = t.innerW, t.previousH = t.innerH, y = V(t.innerX, t.innerY, t.innerW, t.innerH), f.width = y.width, f.height = y.height, t.resizing = f, t.isResizing = !0, c("resizestart", e.id, t.innerW, t.innerH);
          break;
        }
        case "resizemove": {
          const Y = _e(t.lastW, t.lastH, l, d);
          f.width = Math.max(
            t.resizeMin.width,
            Math.min(t.resizeMax.width, t.resizing.width + Y.deltaX)
          ), f.height = Math.max(
            t.resizeMin.height,
            Math.min(t.resizeMax.height, t.resizing.height + Y.deltaY)
          ), t.resizing = f;
          break;
        }
        case "resizeend": {
          v = t.resizing, y = V(t.innerX, t.innerY, t.innerW, t.innerH), f.width = y.width, f.height = y.height, t.resizing = null, t.isResizing = !1;
          break;
        }
      }
      E(), y = Ne(We(f.height, f.width));
      const $ = v ? Ne(We(v.height, v.width)) : y;
      t.lastW = l, t.lastH = d, (t.innerW !== y.w || t.innerH !== y.h) && c("resize", e.id, y.w, y.h), n.type === "resizeend" && (t.previousW !== $.w || t.previousH !== $.h) && c("resizeend", e.id, $.w, $.h), g.resizeEvent([n.type, e.id, t.innerX, t.innerY, $.h, $.w]), n.type === "resizeend" && ge();
    }
    function be(n) {
      if (t.isResizing || e.frozen && !(n.type === "dragend" && t.isDragging)) return;
      n.type === "dragstart" && re(n.target);
      const r = He(n);
      if (r === null) return;
      const { x: l, y: d } = r, f = { top: 0, left: 0 };
      switch (n.type) {
        case "dragstart":
        case "dragend": {
          if (n.type === "dragend" && !t.isDragging) return;
          n.type === "dragstart" && (t.previousX = t.innerX, t.previousY = t.innerY, P());
          const $ = h() ?? { left: 0, top: 0 }, Y = n.target.getBoundingClientRect();
          f.left = Y.left - $.left, f.top = Y.top - $.top, t.dragging = n.type === "dragstart" ? f : null, t.isDragging = n.type === "dragstart", n.type === "dragstart" && c("dragstart", e.id, t.innerX, t.innerY);
          break;
        }
        case "dragmove": {
          const $ = _e(t.lastX, t.lastY, l, d);
          f.left = t.dragging.left + $.deltaX, f.top = t.dragging.top + $.deltaY, t.dragging = f;
          break;
        }
      }
      n.type !== "dragmove" && E();
      const v = Ke(f.top, f.left), y = t.innerX !== v.x || t.innerY !== v.y;
      if (n.type === "dragmove" && (y ? E() : R(f)), t.lastX = l, t.lastY = d, y && c("drag", e.id, v.x, v.y), n.type === "dragend" && (t.previousX !== t.innerX || t.previousY !== t.innerY) && c("dragend", e.id, v.x, v.y), g.dragEvent([n.type, e.id, v.x, v.y, t.innerH, t.innerW]), n.type === "dragend") {
        if (le && z.el) {
          const $ = g.state.tiles.find((Y) => Y.id === e.id);
          if ($) {
            const Y = V($.x, $.y, $.w, $.h);
            O(f.left - Y.left, f.top - Y.top), E();
          }
        }
        ge();
      }
    }
    function w(n) {
      if (!n || n === "none") return { dx: 0, dy: 0 };
      const r = n.match(/-?[\d.]+(?:e[-+]?\d+)?/g)?.map(Number);
      return r ? n.startsWith("matrix3d") ? { dx: r[12] ?? 0, dy: r[13] ?? 0 } : n.startsWith("matrix") ? { dx: r[4] ?? 0, dy: r[5] ?? 0 } : { dx: r[0] ?? 0, dy: r[1] ?? 0 } : { dx: 0, dy: 0 };
    }
    function F(n) {
      if (s.size === 0) return { dx: 0, dy: 0 };
      const r = w(getComputedStyle(n).transform), l = w(m?.transform);
      for (const d of s)
        d.onfinish = null, d.oncancel = null, d.cancel();
      return s.clear(), t.settling = !1, { dx: r.dx - l.dx, dy: r.dy - l.dy };
    }
    function O(n, r, l = !0) {
      const d = z.el;
      if (!d || typeof d.animate != "function") return;
      const f = F(d);
      if (n += f.dx, r += f.dy, Math.abs(n) < 0.5 && Math.abs(r) < 0.5) return;
      const v = d.animate(
        [{ transform: `translate3d(${n}px, ${r}px, 0)` }, { transform: "translate3d(0px, 0px, 0)" }],
        { duration: zt, easing: Et, composite: "add" }
      );
      s.add(v), l && (t.settling = !0);
      const y = () => {
        s.delete(v), s.size === 0 && (t.settling = !1);
      };
      v.onfinish = y, v.oncancel = y;
    }
    function P() {
      for (const n of s)
        n.onfinish = null, n.oncancel = null, n.cancel();
      s.clear(), t.settling = !1;
    }
    function re(n) {
      ge(), k = n.offsetParent || null;
      const r = k || document.body, l = { offsetParent: r, left: 0, top: 0, measure: null };
      l.measure = () => {
        const d = r === document.body ? { left: 0, top: 0 } : r.getBoundingClientRect();
        l.left = d.left - r.scrollLeft, l.top = d.top - r.scrollTop, H();
      }, l.measure(), M = l, window.addEventListener("scroll", l.measure, { passive: !0, capture: !0 }), window.addEventListener("resize", l.measure, { passive: !0 });
    }
    function ge() {
      k = null, M && (window.removeEventListener("scroll", M.measure, { capture: !0 }), window.removeEventListener("resize", M.measure), M = null);
    }
    function He(n) {
      return M ? { x: n.clientX - M.left, y: n.clientY - M.top } : mt(n);
    }
    function V(n, r, l, d) {
      const f = xe(), v = W.value, [y, $] = N.value;
      return {
        left: Math.round(f * n + (n + 1) * y),
        top: Math.round(v * r + (r + 1) * $),
        width: l === 1 / 0 ? l : Math.round(f * l + Math.max(0, l - 1) * y),
        height: d === 1 / 0 ? d : Math.round(v * d + Math.max(0, d - 1) * $)
      };
    }
    function Ke(n, r) {
      const l = xe(), [d, f] = N.value, v = Math.round((r - d) / (l + d)), y = Math.round((n - f) / (W.value + f));
      return {
        x: Math.max(Math.min(v, I.value - t.innerW), 0),
        y: Math.max(y, 0)
      };
    }
    function xe() {
      const n = I.value;
      return (X.value - N.value[0] * (n + 1)) / n;
    }
    function We(n, r) {
      const l = xe(), [d, f] = N.value, v = Math.round((r + d) / (l + d)), y = Math.round((n + f) / (W.value + f));
      return {
        w: Math.max(Math.min(v, I.value - t.innerX), 0),
        h: Math.max(y, 0)
      };
    }
    function Ne(n) {
      return {
        w: Math.max(e.minW, Math.min(e.maxW, n.w), 1),
        h: Math.max(e.minH, Math.min(e.maxH, n.h), 1)
      };
    }
    const je = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };
    function ee() {
      const n = g.state.tiles.find((r) => r.id === e.id);
      return n ? { x: n.x, y: n.y, w: n.w, h: n.h } : { x: t.innerX, y: t.innerY, w: t.innerW, h: t.innerH };
    }
    function ue(n) {
      const r = ee(), l = `${ie(Q)}, column ${r.x + 1}, row ${r.y + 1}, ${r.w} wide, ${r.h} tall`;
      g.announce(n ? `${l}. ${n}` : l);
    }
    function he(n) {
      if (x === n) return;
      x && se();
      const r = ee();
      x = n, n === "drag" ? (c("dragstart", e.id, r.x, r.y), g.dragEvent(["dragstart", e.id, r.x, r.y, r.h, r.w])) : (c("resizestart", e.id, r.w, r.h), g.resizeEvent(["resizestart", e.id, r.x, r.y, r.h, r.w]));
    }
    function se() {
      if (!x) return;
      const n = x;
      x = null;
      const r = ee();
      n === "drag" ? g.dragEvent(["dragend", e.id, r.x, r.y, r.h, r.w]) : g.resizeEvent(["resizeend", e.id, r.x, r.y, r.h, r.w]);
    }
    function Ve(n, r) {
      if (!L.value || e.frozen) return;
      he("drag");
      const l = ee(), d = yt(
        g.state.tiles,
        e.id,
        n,
        r,
        I.value,
        g.props.gravity
      );
      d && (g.dragEvent(["dragmove", e.id, d.x, d.y, l.h, l.w]), c("drag", e.id, d.x, d.y)), fe(() => ue());
    }
    function Ue(n, r) {
      if (!_.value || e.frozen) return;
      he("resize");
      const l = ee(), d = Math.max(e.minW, Math.min(e.maxW, I.value - l.x, l.w + n)), f = Math.max(e.minH, Math.min(e.maxH, l.h + r));
      (d !== l.w || f !== l.h) && (g.resizeEvent(["resizemove", e.id, l.x, l.y, f, d]), c("resize", e.id, d, f)), fe(() => ue());
    }
    function Ze() {
      B = ee(), t.grabbed = !0, ue(
        "Picked up. Arrow keys move, Shift plus arrow keys resize, Enter drops, Escape cancels."
      );
    }
    function Xe() {
      if (!t.grabbed) return;
      const n = x !== null;
      se(), t.grabbed = !1, B = null, fe(() => ue(n ? "Dropped." : "Put down."));
    }
    function Je() {
      if (!t.grabbed) return;
      const n = B;
      if (se(), n) {
        let r = ee();
        (r.w !== n.w || r.h !== n.h) && (he("resize"), g.resizeEvent(["resizemove", e.id, r.x, r.y, n.h, n.w]), se(), r = ee()), (r.x !== n.x || r.y !== n.y) && (he("drag"), g.dragEvent(["dragmove", e.id, n.x, n.y, n.h, n.w]), se());
      }
      t.grabbed = !1, B = null, fe(() => ue("Returned to where it started."));
    }
    function Qe(n) {
      if (!ie(D) || n.target !== z.el || n.altKey || n.ctrlKey || n.metaKey) return;
      if (n.key === "Enter" || n.key === " ") {
        n.preventDefault(), t.grabbed ? Xe() : Ze();
        return;
      }
      if (n.key === "Escape") {
        if (!t.grabbed) return;
        n.preventDefault(), Je();
        return;
      }
      const r = je[n.key];
      !r || !t.grabbed || (n.preventDefault(), n.shiftKey ? Ue(r[0], r[1]) : Ve(r[0], r[1]));
    }
    function et() {
      t.grabbed && Xe();
    }
    return (n, r) => ($e(), Se("div", {
      ref: p,
      class: Me(["grid-tile", oe.value]),
      style: Oe([t.style, K.value]),
      "data-tile": i.id,
      tabindex: D.value ? 0 : void 0,
      role: D.value ? "group" : void 0,
      "aria-roledescription": D.value ? "Draggable tile" : void 0,
      "aria-label": D.value ? ne.value : void 0,
      "aria-describedby": D.value ? ie(g).instructionsId : void 0,
      "aria-hidden": i.shadow ? "true" : void 0,
      "data-grabbed": t.grabbed ? "true" : void 0,
      onKeydown: Qe,
      onBlur: et
    }, [
      De(n.$slots, "default", {}, void 0, !0),
      te.value ? ($e(), Se("span", {
        key: 0,
        class: Me(["grid-handle", { "grid-handle--chevron": !n.$slots.handle }]),
        "aria-hidden": n.$slots.handle ? void 0 : "true"
      }, [
        De(n.$slots, "handle", {}, void 0, !0)
      ], 10, xt)) : rt("", !0)
    ], 46, bt));
  }
}, Mt = /* @__PURE__ */ qe(St, [["__scopeId", "data-v-96c402c2"]]), Rt = ["id"], Ht = {
  class: "grid-sr",
  role: "status",
  "aria-live": "polite",
  "aria-atomic": "true"
}, Wt = {
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
    const e = i, c = u;
    let z = null, g = null;
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
    }), M = A(() => {
      const a = e.gap;
      if (Array.isArray(a)) return [Number(a[0]) || 0, Number(a[1]) || 0];
      const p = Number(a) || 0;
      return [p, p];
    }), k = it(), m = ot();
    let b = /* @__PURE__ */ new Map();
    const x = A(() => {
      if (s.busy) return b;
      const a = [...s.tiles].sort((p, h) => p.y - h.y || p.x - h.x);
      return b = new Map(a.map((p, h) => [String(p.id), h])), b;
    });
    function B(a, p = []) {
      for (const h of a)
        h.type === ft && Array.isArray(h.children) ? B(h.children, p) : p.push(h);
      return p;
    }
    function I() {
      const a = x.value, p = (h) => {
        const H = a.get(String(h.props?.id));
        return H === void 0 ? Number.MAX_SAFE_INTEGER : H;
      };
      return B(m.default?.() ?? []).map((h, H) => ({ node: h, index: H })).sort((h, H) => p(h.node) - p(H.node) || h.index - H.index).map((h) => h.node);
    }
    st(Fe, {
      props: e,
      state: s,
      gap: M,
      instructionsId: k,
      dragEvent: oe,
      resizeEvent: Q,
      announce: N
    }), L(), le && (q(
      () => e.tiles,
      () => {
        e.tiles !== g && (Be(e.tiles), te());
      },
      { immediate: !0 }
    ), q(
      () => s.busy,
      (a) => {
        a ? (window.getSelection()?.removeAllRanges(), document.addEventListener("selectstart", X)) : document.removeEventListener("selectstart", X);
      }
    )), q(
      () => s.width,
      async (a, p) => {
        G(), p === null && (await fe(), c("ready", s.tiles));
      }
    ), q(
      () => e.gravity,
      () => {
        ae(s.tiles, e.gravity), G(), le && t();
      }
    ), q(M, G), at(G), Te(() => {
      z && S.el && z.disconnect(), le && document.removeEventListener("selectstart", X);
    });
    function W(a, p) {
      switch (a) {
        case "dragEvent":
          return oe(p);
        case "resizeEvent":
          return Q(p);
        case "announce":
          return N(p);
        case "measure":
          return D();
        default:
          throw new Error(`GridBoard: dispatch received an unknown command "${String(a)}".`);
      }
    }
    function X(a) {
      a.preventDefault();
    }
    function N(a) {
      a && (s.announcement = a === s.announcement ? `${a}​` : a);
    }
    function L() {
      Be(e.tiles), s.tiles = me(e.tiles), ae(s.tiles, e.gravity), s.boardStyle = Z(K());
    }
    function _(a, p) {
      return a?.length !== p?.length ? !0 : a.some((h, H) => {
        const E = p[H];
        return [.../* @__PURE__ */ new Set([...Object.keys(h), ...Object.keys(E)])].some((R) => h[R] !== E[R]);
      });
    }
    function t() {
      if (!_(e.tiles, s.tiles)) return;
      const a = me(s.tiles);
      g = a, c("update:tiles", a);
    }
    function te() {
      _(e.tiles, s.tiles) && (s.tiles = me(e.tiles), ae(s.tiles, e.gravity), G(), le && t());
    }
    function G() {
      const a = K();
      s.boardStyle.height !== a && (s.boardStyle = Z(a));
    }
    function D() {
      S.el && (s.width = S.el.offsetWidth);
    }
    function K() {
      if (!e.autoHeight) return;
      const a = M.value[1];
      return `${Ge(s.tiles) * (e.rowHeight + a) + a}px`;
    }
    function Z(a) {
      return { position: "relative", height: a };
    }
    function oe([a, p, h, H, E, T] = []) {
      const R = we(s.tiles, p) ?? { x: 0, y: 0 };
      if (a === "dragmove" && s.busy && R.x === h && R.y === H && s.shadow.w === T && s.shadow.h === E)
        return;
      const j = a === "dragmove" || a === "dragstart";
      s.tiles = ve(s.tiles, R, h, H, !0, !1), ae(s.tiles, e.gravity, p), j && (s.shadow = { ...s.shadow, x: R.x, y: R.y, w: T, h: E }), s.busy = j, G(), t();
    }
    function Q([a, p, h, H, E, T] = []) {
      if (!a) return;
      const R = we(s.tiles, p) ?? { x: h, y: H, h: 0, w: 0 };
      if (a === "resizemove" && s.busy && R.w === T && R.h === E && s.shadow.x === h && s.shadow.y === H)
        return;
      R.w = T, R.h = E;
      const j = a === "resizestart" || a === "resizemove";
      ae(s.tiles, e.gravity, p), j && (s.shadow = { ...s.shadow, x: R.x, y: R.y, w: R.w, h: R.h }), s.busy = j, G(), t();
    }
    function ne(a) {
      !a || a === S.el || (S.el = a, typeof window < "u" && (z = new ResizeObserver(D), z.observe(S.el), s.width = S.el.offsetWidth));
    }
    return (a, p) => ($e(), Se("div", {
      ref: ne,
      class: Me(["grid-board", { "grid-board--busy": s.busy }]),
      style: Oe(s.boardStyle)
    }, [
      lt(ke(Mt, {
        id: "shadow",
        class: "grid-shadow",
        x: s.shadow.x,
        y: s.shadow.y,
        w: s.shadow.w,
        h: s.shadow.h,
        shadow: ""
      }, null, 8, ["x", "y", "w", "h"]), [
        [ut, s.busy]
      ]),
      ke(I),
      Ae("p", {
        id: ie(k),
        class: "grid-sr"
      }, " Press Enter or Space to pick the tile up. Then use the arrow keys to move it, or hold Shift with the arrow keys to resize it. Press Enter to drop it, or Escape to put it back. ", 8, Rt),
      Ae("p", Ht, dt(s.announcement), 1)
    ], 6));
  }
}, Xt = /* @__PURE__ */ qe(Wt, [["__scopeId", "data-v-77cb557d"]]);
export {
  Fe as GRID_BOARD,
  Xt as GridBoard,
  Mt as GridTile,
  le as IS_BROWSER,
  ae as applyGravity,
  me as copyTiles,
  _e as getFrameDelta,
  Ge as getLastRow,
  mt as getPointerOffset,
  we as getTileById,
  ve as moveTile,
  vt as usePointerDragResize,
  Be as validateTiles
};
//# sourceMappingURL=core.js.map
