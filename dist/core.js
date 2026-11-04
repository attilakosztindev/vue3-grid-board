import { inject as ht, computed as H, reactive as et, unref as de, watch as j, onMounted as mt, onBeforeUnmount as tt, openBlock as ke, createElementBlock as Te, normalizeStyle as nt, normalizeClass as Ye, renderSlot as Fe, createCommentVNode as rt, nextTick as we, useId as Ge, useSlots as yt, provide as vt, onBeforeMount as wt, onBeforeUpdate as bt, onUpdated as xt, withDirectives as zt, createVNode as qe, vShow as Et, createElementVNode as Ue, toDisplayString as Xe, Fragment as Mt } from "vue";
const ce = typeof document < "u";
function it(o, s) {
  return !(o === s || o.x + o.w <= s.x || o.x >= s.x + s.w || o.y + o.h <= s.y || o.y >= s.y + s.h);
}
function _e(o, s) {
  return o.find((f) => it(f, s));
}
function St(o, s) {
  return o.filter((f) => it(f, s));
}
function $t(o) {
  return o.filter((s) => s.frozen);
}
function ot(o, s) {
  return [].concat(o).sort((f, e) => {
    if (f.y === e.y) {
      if (s !== void 0) {
        if (f.id === s) return -1;
        if (e.id === s) return 1;
      }
      if (f.x === e.x) return 0;
    }
    return f.y > e.y || f.y === e.y && f.x > e.x ? 1 : -1;
  });
}
function Rt(o, s, f) {
  if (f)
    for (; s.y > 0 && !_e(o, s); )
      s.y--;
  let e;
  for (; e = _e(o, s); )
    s.y = e.y + e.h;
}
function je(o, s, f, e) {
  if (e) {
    const m = {
      x: f.x,
      y: Math.max(s.y - f.h, 0),
      w: f.w,
      h: f.h
    };
    if (!_e(o, m))
      return Ae(o, f, void 0, m.y, !1);
  }
  return Ae(o, f, void 0, f.y + 1, !1);
}
function Dt(o) {
  return typeof o == "number" && !Number.isNaN(o);
}
function at(o) {
  let s = 0;
  for (let f = 0, e = o.length; f < e; f++) {
    const m = o[f].y + o[f].h;
    m > s && (s = m);
  }
  return s;
}
function We(o) {
  return (o || []).map((s) => ({ ...s }));
}
function Ne(o, s) {
  return o.find((f) => f.id === s);
}
function ve(o, s, f) {
  const e = $t(o), m = ot(o, f);
  for (let E = 0, c = m.length; E < c; E++) {
    const T = m[E];
    T.frozen || (Rt(e, T, s), e.push(T)), delete T.moved;
  }
}
function Ae(o, s, f, e, m, E) {
  if (s.frozen) return o;
  const c = s.x, T = s.y, $ = e && s.y > e;
  typeof f == "number" && (s.x = f), typeof e == "number" && (s.y = e), s.moved = !0;
  let S = ot(o);
  $ && (S = S.reverse());
  const P = St(S, s);
  if (E && P.length)
    return s.x = c, s.y = T, s.moved = !1, o;
  for (let M = 0, w = P.length; M < w; M++) {
    const h = P[M];
    h.moved || s.y > h.y && s.y - h.y > h.h / 4 || (h.frozen ? o = je(o, h, s, m) : o = je(o, s, h, m));
  }
  return o;
}
function Ht(o, s, f, e, m, E) {
  const c = Ne(o, s);
  if (!c) return null;
  const T = at(o);
  let $ = c.x, S = c.y;
  for (; ; ) {
    const P = Math.max(0, Math.min(m - c.w, $ + f)), M = Math.max(0, Math.min(T, S + e));
    if (P === $ && M === S) return null;
    $ = P, S = M;
    const w = We(o);
    if (Ae(w, Ne(w, s), $, S, !0, !1), ve(w, E, s), w.some((h, u) => h.x !== o[u].x || h.y !== o[u].y)) return { x: $, y: S };
  }
}
function Ke(o, s = "tiles") {
  if (!Array.isArray(o)) throw new Error(`vue3-grid-board: ${s} must be an array.`);
  const f = /* @__PURE__ */ new Set();
  o.forEach((e, m) => {
    for (const E of ["x", "y", "w", "h"])
      if (typeof e[E] != "number")
        throw new Error(`vue3-grid-board: ${s}[${m}].${E} must be a number.`);
    if (e.id === void 0 || e.id === null)
      throw new Error(`vue3-grid-board: ${s}[${m}].id is required.`);
    if (typeof e.id != "number" && typeof e.id != "string")
      throw new Error(`vue3-grid-board: ${s}[${m}].id must be a string or a number.`);
    if (f.has(e.id))
      throw new Error(
        `vue3-grid-board: ${s}[${m}].id must be unique (saw "${e.id}" twice).`
      );
    if (f.add(e.id), e.frozen !== void 0 && typeof e.frozen != "boolean")
      throw new Error(`vue3-grid-board: ${s}[${m}].frozen must be a boolean.`);
  });
}
function Wt(o) {
  const s = o.target.offsetParent || document.body, f = s.getBoundingClientRect();
  return {
    x: o.clientX + s.scrollLeft - f.left,
    y: o.clientY + s.scrollTop - f.top
  };
}
function Ve(o, s, f, e) {
  return Dt(o) ? { deltaX: f - o, deltaY: e - s, lastX: o, lastY: s, x: f, y: e } : { deltaX: 0, deltaY: 0, lastX: f, lastY: e, x: f, y: e };
}
const st = /* @__PURE__ */ Symbol("gridBoard"), kt = 3, U = 60, Ze = 18;
function Tt(o, s) {
  const {
    handleSelector: f = ".grid-handle",
    draggable: e = () => !1,
    resizable: m = () => !1,
    dragIgnore: E = () => null,
    dragHandle: c = () => null,
    resizeIgnore: T = () => null,
    autoScroll: $ = () => !0,
    onDrag: S = () => {
    },
    onResize: P = () => {
    },
    onTap: M = () => {
    }
  } = s;
  let w = null, h = null, u = !1, G = 0, L = 0, N = 0, W = 0, X = 0, C = 0, q = !1, re = 0, n = 0;
  function fe(y) {
    try {
      return y(), !0;
    } catch {
      return !1;
    }
  }
  function J(y, _) {
    if (!_) return !1;
    const R = y.closest?.(_);
    return !!R && o.contains(R);
  }
  function Y(y, _ = N, R = W) {
    const O = { type: y, target: o, clientX: _, clientY: R };
    h === "resize" ? P(O) : S(O);
  }
  function ie() {
    C = requestAnimationFrame(() => {
      C = 0, !(w === null || !u || !q) && (q = !1, Y(`${h}move`), ie());
    });
  }
  function K() {
    if (C) {
      q = !0;
      return;
    }
    Y(`${h}move`), ie();
  }
  function ge() {
    C && cancelAnimationFrame(C), C = 0, q = !1;
  }
  function ue() {
    ge(), Y(`${h}move`);
  }
  function oe(y) {
    if (w !== null || y.pointerType === "mouse" && y.button !== 0) return;
    const _ = J(y.target, f);
    if (_ && m()) {
      if (J(y.target, T())) return;
      h = "resize";
    } else if (!_ && e()) {
      const R = E(), O = c();
      if (R && J(y.target, R) || O && !J(y.target, O)) return;
      h = "drag";
    } else
      return;
    w = y.pointerId, u = !1, G = N = y.clientX, L = W = y.clientY, se(), fe(() => o.setPointerCapture(y.pointerId)), o.addEventListener("pointermove", pe), o.addEventListener("pointerup", A), o.addEventListener("pointercancel", A), o.addEventListener("lostpointercapture", A), window.addEventListener("resize", se, { passive: !0 });
  }
  function pe(y) {
    if (y.pointerId === w) {
      if (N = y.clientX, W = y.clientY, !u) {
        if (Math.hypot(N - G, W - L) < kt) return;
        u = !0, Y(`${h}start`, G, L);
      }
      y.preventDefault(), K(), h === "drag" && !X && be() && $() && le();
    }
  }
  function A(y) {
    if (y.pointerId !== w) return;
    const _ = !u && y.type === "pointerup" && h;
    u && (q && ue(), Y(`${h}end`)), Q(), _ && M({ mode: _, target: y.target, clientX: y.clientX, clientY: y.clientY });
  }
  function Q() {
    ge(), he(), o.removeEventListener("pointermove", pe), o.removeEventListener("pointerup", A), o.removeEventListener("pointercancel", A), o.removeEventListener("lostpointercapture", A), window.removeEventListener("resize", se), fe(() => {
      w !== null && o.hasPointerCapture?.(w) && o.releasePointerCapture(w);
    }), w = null, h = null, u = !1;
  }
  function ae(y) {
    return Math.min(Ze, y / U * Ze);
  }
  function se() {
    re = window.innerWidth, n = window.innerHeight;
  }
  function be() {
    return N < U || W < U || N > re - U || W > n - U;
  }
  function le() {
    if (X) return;
    const y = () => {
      if (X = 0, w === null || !u) return;
      const _ = re, R = n;
      let O = 0, ee = 0;
      W < U ? ee = -ae(U - W) : W > R - U && (ee = ae(W - (R - U))), N < U ? O = -ae(U - N) : N > _ - U && (O = ae(N - (_ - U))), (O || ee) && (window.scrollBy({ left: O, top: ee, behavior: "instant" }), ue(), X = requestAnimationFrame(y));
    };
    X = requestAnimationFrame(y);
  }
  function he() {
    X && cancelAnimationFrame(X), X = 0;
  }
  o.addEventListener("pointerdown", oe);
  function B() {
    if (o.removeEventListener("pointerdown", oe), w === null) {
      he();
      return;
    }
    u && (q && ue(), Y(`${h}end`)), Q();
  }
  return { destroy: B };
}
const lt = (o, s) => {
  const f = o.__vccOpts || o;
  for (const [e, m] of s)
    f[e] = m;
  return f;
}, Nt = ["data-tile", "tabindex", "role", "aria-roledescription", "aria-label", "aria-describedby", "aria-hidden", "data-grabbed"], At = ["aria-hidden"], Bt = "a, button, input, select, textarea, label, [contenteditable]", It = 2147483647, Pt = {
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
    removable: {
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
  setup(o, { expose: s, emit: f }) {
    const e = o, m = f, E = {
      el: void 0
    };
    s(E);
    const c = ht(st, null);
    if (!c)
      throw new Error(
        "GridTile must be rendered inside a GridBoard. The two are a single component pair and cannot be used apart."
      );
    let T;
    const $ = /* @__PURE__ */ new Set();
    let S = null, P = null, M = null, w = null, h = null, u = null, G = null;
    const L = H(() => c.props.columns), N = H(() => c.props.rowHeight), W = H(() => c.state.width ?? 100), X = H(() => c.gap.value), C = H(
      () => e.draggable === null ? c.props.draggable : e.draggable
    ), q = H(
      () => e.resizable === null ? c.props.resizable : e.resizable
    ), re = H(
      () => e.removable === null ? c.props.removable : e.removable
    ), n = et({
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
    }), fe = H(() => q.value && !e.frozen && !e.shadow), J = H(
      () => C.value && !e.frozen && !e.shadow && !e.dragHandle
    ), Y = H(
      () => (C.value || q.value) && !e.frozen && !e.shadow
    ), ie = H(
      () => re.value && c.listensForRemove() && !e.frozen && !e.shadow
    ), K = H(() => Y.value || ie.value), ge = H(
      () => [Y.value && c.instructionsId, ie.value && c.removeInstructionsId].filter(Boolean).join(" ") || void 0
    ), ue = H(() => de(Y) ? { touchAction: "none" } : {}), oe = H(
      () => ce && !e.shadow && c.props.overflow && (n.isDragging || n.isResizing || n.settling)
    ), pe = H(() => ({
      "grid-tile--draggable": J.value,
      "grid-tile--frozen": e.frozen,
      "grid-tile--dragging": n.isDragging,
      "grid-tile--resizing": n.isResizing,
      "grid-tile--settling": n.settling,
      "grid-tile--grabbed": n.grabbed
    })), A = H(() => c.a11y.value), Q = H(() => e.label || A.value.tileName(e.id)), ae = H(
      () => A.value.tileLabel({
        name: Q.value,
        column: n.innerX + 1,
        row: n.innerY + 1,
        w: n.innerW,
        h: n.innerH
      })
    );
    B(), j([N, L], () => {
      B(), R();
    }), j(W, () => {
      (n.isDragging || n.isResizing) && B(), R();
    }), j([() => e.x, () => e.y, () => e.w, () => e.h], (t, r) => {
      if (n.innerX = e.x, n.innerY = e.y, n.innerW = e.w, n.innerH = e.h, B(), e.shadow || n.isDragging || n.isResizing || n.settling) return;
      const [a, d, p, z] = t, [x, b, I, De] = r;
      if (a === x && d === b) return;
      const Se = v(x, b, I, De), Z = v(a, d, p, z);
      ze(Se.left - Z.left, Se.top - Z.top, !1);
    }), j(oe, B), j(() => e.radius, B), j(X, (t, r) => {
      t[0] === r[0] && t[1] === r[1] || (B(), R());
    }), mt(() => {
      B(), se();
    }), j(Y, se);
    function se() {
      const t = de(Y);
      if (t !== !!T) {
        if (!t) {
          T.destroy(), T = null;
          return;
        }
        E.el && (T = Tt(E.el, {
          handleSelector: ".grid-handle",
          draggable: () => C.value && !e.frozen,
          resizable: () => q.value && !e.frozen,
          dragIgnore: () => e.dragIgnore,
          dragHandle: () => e.dragHandle && `.${CSS.escape(e.dragHandle)}`,
          resizeIgnore: () => e.resizeIgnore,
          autoScroll: () => !0,
          onDrag: ee,
          onResize: O,
          onTap: ct
        }));
      }
    }
    tt(() => {
      c.stopPlacing(e.id), ye(), Re(), l(), T?.destroy();
    });
    function be(t) {
      E.el = t;
    }
    function le() {
      const t = E.el, r = P || t?.offsetParent || t?.parentElement;
      return r ? r.getBoundingClientRect() : null;
    }
    function he() {
      oe.value && B();
    }
    function B() {
      const t = L.value;
      e.x + e.w > t ? (n.innerX = 0, n.innerW = e.w > t ? t : e.w) : (n.innerX = e.x, n.innerW = e.w);
      const { innerX: r, innerY: a, innerW: d, innerH: p } = n, z = N.value, [x, b] = X.value, I = `((100% - ${(t + 1) * x}px) / ${t})`;
      let De = `${z * a + (a + 1) * b}px`, Se = `calc(${I} * ${r} + ${(r + 1) * x}px)`, Z = null;
      if (n.isDragging) {
        const ne = v(r, a, d, p);
        w = ne, De = `${ne.top}px`, Se = `${ne.left}px`, Z = {
          dx: n.dragging.left - ne.left,
          dy: n.dragging.top - ne.top
        };
      } else
        w = null;
      if (oe.value) {
        const ne = le();
        if (ne) {
          const He = n.isDragging ? w : v(r, a, d, p), Pe = {
            position: "fixed",
            top: `${ne.top + He.top}px`,
            left: `${ne.left + He.left}px`,
            width: `${n.isResizing ? n.resizing.width : He.width}px`,
            height: `${n.isResizing ? n.resizing.height : He.height}px`,
            zIndex: String(It),
            transition: "none",
            ...Z ? {
              transform: `translate3d(${Z.dx}px, ${Z.dy}px, 0)`,
              willChange: "transform"
            } : {},
            "--grid-radius": `${e.radius}px`
          };
          if (M && y(M, Pe)) return;
          M = Pe, n.style = Pe;
          return;
        }
      }
      const Ie = {
        position: "absolute",
        top: De,
        left: Se,
        width: n.isResizing ? `${n.resizing.width}px` : d === 1 / 0 ? "auto" : `calc(${I} * ${d} + ${Math.max(0, d - 1) * x}px)`,
        height: n.isResizing ? `${n.resizing.height}px` : p === 1 / 0 ? "auto" : `${z * p + Math.max(0, p - 1) * b}px`,
        ...Z ? {
          transform: `translate3d(${Z.dx}px, ${Z.dy}px, 0)`,
          transition: "none",
          willChange: "transform"
        } : n.isResizing ? { transition: "none" } : {},
        "--grid-radius": `${e.radius}px`
      };
      M && y(M, Ie) || (M = Ie, n.style = Ie);
    }
    function y(t, r) {
      const a = Object.keys(r);
      return Object.keys(t).length !== a.length ? !1 : a.every((d) => t[d] === r[d]);
    }
    function _(t) {
      const r = E.el;
      if (!r || !M || !w) return;
      const a = `translate3d(${t.left - w.left}px, ${t.top - w.top}px, 0)`;
      M.transform !== a && (M.transform = a, r.style.transform = a);
    }
    function R() {
      const { width: t, height: r } = v(n.innerX, n.innerY, n.innerW, n.innerH);
      !Number.isFinite(t) || !Number.isFinite(r) || m("size", e.id, t, r);
    }
    function O(t) {
      if (e.frozen && !(t.type === "resizeend" && n.isResizing)) return;
      t.type === "resizestart" && i(t.target);
      const r = g(t);
      if (r == null) return;
      const { x: a, y: d } = r, p = { width: 0, height: 0 };
      let z = null, x;
      switch (t.type) {
        case "resizestart": {
          c.cancelPlacing(), n.resizeMin = v(0, 0, e.minW, e.minH), n.resizeMax = v(0, 0, e.maxW, e.maxH), n.previousW = n.innerW, n.previousH = n.innerH, x = v(n.innerX, n.innerY, n.innerW, n.innerH), p.width = x.width, p.height = x.height, n.resizing = p, n.isResizing = !0, m("resizestart", e.id, n.innerW, n.innerH);
          break;
        }
        case "resizemove": {
          const I = Ve(n.lastW, n.lastH, a, d);
          p.width = Math.max(
            n.resizeMin.width,
            Math.min(n.resizeMax.width, n.resizing.width + I.deltaX)
          ), p.height = Math.max(
            n.resizeMin.height,
            Math.min(n.resizeMax.height, n.resizing.height + I.deltaY)
          ), n.resizing = p;
          break;
        }
        case "resizeend": {
          z = n.resizing, x = v(n.innerX, n.innerY, n.innerW, n.innerH), p.width = x.width, p.height = x.height, n.resizing = null, n.isResizing = !1;
          break;
        }
      }
      B(), x = V(D(p.height, p.width));
      const b = z ? V(D(z.height, z.width)) : x;
      n.lastW = a, n.lastH = d, (n.innerW !== x.w || n.innerH !== x.h) && m("resize", e.id, x.w, x.h), t.type === "resizeend" && (n.previousW !== b.w || n.previousH !== b.h) && m("resizeend", e.id, b.w, b.h), c.resizeEvent([t.type, e.id, n.innerX, n.innerY, b.h, b.w]), t.type === "resizeend" && l();
    }
    function ee(t) {
      if (n.isResizing || e.frozen && !(t.type === "dragend" && n.isDragging)) return;
      t.type === "dragstart" && i(t.target);
      const r = g(t);
      if (r === null) return;
      const { x: a, y: d } = r, p = { top: 0, left: 0 };
      switch (t.type) {
        case "dragstart":
        case "dragend": {
          if (t.type === "dragend" && !n.isDragging) return;
          t.type === "dragstart" && (c.cancelPlacing(), n.previousX = n.innerX, n.previousY = n.innerY, Re());
          const b = le() ?? { left: 0, top: 0 }, I = t.target.getBoundingClientRect();
          p.left = I.left - b.left, p.top = I.top - b.top, n.dragging = t.type === "dragstart" ? p : null, n.isDragging = t.type === "dragstart", t.type === "dragstart" && m("dragstart", e.id, n.innerX, n.innerY);
          break;
        }
        case "dragmove": {
          const b = Ve(n.lastX, n.lastY, a, d);
          p.left = n.dragging.left + b.deltaX, p.top = n.dragging.top + b.deltaY, n.dragging = p;
          break;
        }
      }
      t.type !== "dragmove" && B();
      const z = k(p.top, p.left), x = n.innerX !== z.x || n.innerY !== z.y;
      if (t.type === "dragmove" && (x ? B() : _(p)), n.lastX = a, n.lastY = d, x && m("drag", e.id, z.x, z.y), t.type === "dragend" && (n.previousX !== n.innerX || n.previousY !== n.innerY) && m("dragend", e.id, z.x, z.y), c.dragEvent([t.type, e.id, z.x, z.y, n.innerH, n.innerW]), t.type === "dragend") {
        if (ce && E.el) {
          const b = c.state.tiles.find((I) => I.id === e.id);
          if (b) {
            const I = v(b.x, b.y, b.w, b.h);
            ze(p.left - I.left, p.top - I.top), B();
          }
        }
        l();
      }
    }
    function xe(t) {
      if (!t || t === "none") return { dx: 0, dy: 0 };
      const r = t.match(/-?[\d.]+(?:e[-+]?\d+)?/g)?.map(Number);
      return r ? t.startsWith("matrix3d") ? { dx: r[12] ?? 0, dy: r[13] ?? 0 } : t.startsWith("matrix") ? { dx: r[4] ?? 0, dy: r[5] ?? 0 } : { dx: r[0] ?? 0, dy: r[1] ?? 0 } : { dx: 0, dy: 0 };
    }
    function $e(t) {
      if ($.size === 0) return { dx: 0, dy: 0 };
      const r = xe(getComputedStyle(t).transform), a = xe(M?.transform);
      for (const d of $)
        d.onfinish = null, d.oncancel = null, d.cancel();
      return $.clear(), n.settling = !1, { dx: r.dx - a.dx, dy: r.dy - a.dy };
    }
    function ze(t, r, a = !0) {
      const d = E.el;
      if (!d || typeof d.animate != "function") return;
      const p = $e(d);
      if (t += p.dx, r += p.dy, Math.abs(t) < 0.5 && Math.abs(r) < 0.5) return;
      const { duration: z, easing: x } = c.settleTiming();
      if (z === 0) return;
      const b = d.animate(
        [{ transform: `translate3d(${t}px, ${r}px, 0)` }, { transform: "translate3d(0px, 0px, 0)" }],
        { duration: z, easing: x, composite: "add" }
      );
      $.add(b), a && (n.settling = !0);
      const I = () => {
        $.delete(b), $.size === 0 && (n.settling = !1);
      };
      b.onfinish = I, b.oncancel = I;
    }
    function Re() {
      for (const t of $)
        t.onfinish = null, t.oncancel = null, t.cancel();
      $.clear(), n.settling = !1;
    }
    function i(t) {
      l(), P = t.offsetParent || null;
      const r = P || document.body, a = { offsetParent: r, left: 0, top: 0, measure: null };
      a.measure = () => {
        const d = r === document.body ? { left: 0, top: 0 } : r.getBoundingClientRect();
        a.left = d.left - r.scrollLeft, a.top = d.top - r.scrollTop, he();
      }, a.measure(), S = a, window.addEventListener("scroll", a.measure, { passive: !0, capture: !0 }), window.addEventListener("resize", a.measure, { passive: !0 });
    }
    function l() {
      P = null, S && (window.removeEventListener("scroll", S.measure, { capture: !0 }), window.removeEventListener("resize", S.measure), S = null);
    }
    function g(t) {
      return S ? { x: t.clientX - S.left, y: t.clientY - S.top } : Wt(t);
    }
    function v(t, r, a, d) {
      const p = F(), z = N.value, [x, b] = X.value;
      return {
        left: Math.round(p * t + (t + 1) * x),
        top: Math.round(z * r + (r + 1) * b),
        width: a === 1 / 0 ? a : Math.round(p * a + Math.max(0, a - 1) * x),
        height: d === 1 / 0 ? d : Math.round(z * d + Math.max(0, d - 1) * b)
      };
    }
    function k(t, r) {
      const a = F(), [d, p] = X.value, z = Math.round((r - d) / (a + d)), x = Math.round((t - p) / (N.value + p));
      return {
        x: Math.max(Math.min(z, L.value - n.innerW), 0),
        y: Math.max(x, 0)
      };
    }
    function F() {
      const t = L.value;
      return (W.value - X.value[0] * (t + 1)) / t;
    }
    function D(t, r) {
      const a = F(), [d, p] = X.value, z = Math.round((r + d) / (a + d)), x = Math.round((t + p) / (N.value + p));
      return {
        w: Math.max(Math.min(z, L.value - n.innerX), 0),
        h: Math.max(x, 0)
      };
    }
    function V(t) {
      return {
        w: Math.max(e.minW, Math.min(e.maxW, t.w), 1),
        h: Math.max(e.minH, Math.min(e.maxH, t.h), 1)
      };
    }
    const Be = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };
    function te() {
      const t = c.state.tiles.find((r) => r.id === e.id);
      return t ? { x: t.x, y: t.y, w: t.w, h: t.h } : { x: n.innerX, y: n.innerY, w: n.innerW, h: n.innerH };
    }
    function Ee(t) {
      const r = te(), a = A.value.tileLabel({
        name: Q.value,
        column: r.x + 1,
        row: r.y + 1,
        w: r.w,
        h: r.h
      });
      c.announce(t ? `${a}. ${t}` : a);
    }
    function me(t) {
      if (h === t) return;
      h && ye();
      const r = te();
      h = t, t === "drag" ? (m("dragstart", e.id, r.x, r.y), c.dragEvent(["dragstart", e.id, r.x, r.y, r.h, r.w])) : (m("resizestart", e.id, r.w, r.h), c.resizeEvent(["resizestart", e.id, r.x, r.y, r.h, r.w]));
    }
    function ye() {
      if (!h) return;
      const t = h;
      h = null;
      const r = te();
      t === "drag" ? c.dragEvent(["dragend", e.id, r.x, r.y, r.h, r.w]) : c.resizeEvent(["resizeend", e.id, r.x, r.y, r.h, r.w]);
    }
    function ut(t, r) {
      if (!C.value || e.frozen) return;
      me("drag");
      const a = te(), d = Ht(
        c.state.tiles,
        e.id,
        t,
        r,
        L.value,
        c.props.gravity
      );
      d && (c.dragEvent(["dragmove", e.id, d.x, d.y, a.h, a.w]), m("drag", e.id, d.x, d.y)), we(() => Ee());
    }
    function dt(t, r) {
      if (!q.value || e.frozen) return;
      me("resize");
      const a = te(), d = Math.max(e.minW, Math.min(e.maxW, L.value - a.x, a.w + t)), p = Math.max(e.minH, Math.min(e.maxH, a.h + r));
      (d !== a.w || p !== a.h) && (c.resizeEvent(["resizemove", e.id, a.x, a.y, p, d]), m("resize", e.id, d, p)), we(() => Ee());
    }
    function Le(t = A.value.pickedUp) {
      u = te(), n.grabbed = !0, Ee(t);
    }
    function Me() {
      if (!n.grabbed) return;
      const t = h !== null;
      ye(), Ce(), n.grabbed = !1, u = null, we(() => Ee(t ? A.value.dropped : A.value.putDown));
    }
    function ct({ mode: t, target: r }) {
      if (!c.props.tapToMove || !de(Y)) return;
      const a = c.placingId();
      if (a !== null && a !== e.id) return;
      const d = r.closest?.(Bt);
      if (!(d && d !== E.el && E.el.contains(d))) {
        if (n.grabbed) {
          Me();
          return;
        }
        G = t, E.el.focus({ preventScroll: !0 }), Le(t === "resize" ? A.value.pickedUpToResize : A.value.pickedUpToMove), c.startPlacing(e.id, ft, Me);
      }
    }
    function ft(t, r) {
      const a = te();
      if (G === "resize") {
        const d = Math.max(
          e.minW,
          Math.min(e.maxW, L.value - a.x, t - a.x + 1)
        ), p = Math.max(e.minH, Math.min(e.maxH, r - a.y + 1));
        (d !== a.w || p !== a.h) && (me("resize"), c.resizeEvent(["resizemove", e.id, a.x, a.y, p, d]), m("resize", e.id, d, p));
      } else {
        const d = Math.max(0, Math.min(t, L.value - a.w));
        (d !== a.x || r !== a.y) && (me("drag"), c.dragEvent(["dragmove", e.id, d, r, a.h, a.w]), m("drag", e.id, d, r));
      }
      Me();
    }
    function Ce() {
      G && (G = null, c.stopPlacing(e.id));
    }
    function Oe(t = !0) {
      if (!n.grabbed) return;
      const r = u;
      if (ye(), Ce(), r) {
        let a = te();
        (a.w !== r.w || a.h !== r.h) && (me("resize"), c.resizeEvent(["resizemove", e.id, a.x, a.y, r.h, r.w]), ye(), a = te()), (a.x !== r.x || a.y !== r.y) && (me("drag"), c.dragEvent(["dragmove", e.id, r.x, r.y, r.h, r.w]), ye());
      }
      n.grabbed = !1, u = null, t && we(() => Ee(A.value.returned));
    }
    function gt(t) {
      if (!de(K) || t.target !== E.el || t.altKey || t.ctrlKey || t.metaKey) return;
      if (t.key === "Delete" || t.key === "Backspace") {
        if (!ie.value) return;
        t.preventDefault(), Oe(!1), c.remove(e.id, Q.value);
        return;
      }
      if (!de(Y)) return;
      if (t.key === "Enter" || t.key === " ") {
        t.preventDefault(), n.grabbed ? Me() : Le();
        return;
      }
      if (t.key === "Escape") {
        if (!n.grabbed) return;
        t.preventDefault(), Oe();
        return;
      }
      const r = Be[t.key];
      !r || !n.grabbed || (t.preventDefault(), t.shiftKey ? dt(r[0], r[1]) : ut(r[0], r[1]));
    }
    function pt() {
      n.grabbed && Me();
    }
    return (t, r) => (ke(), Te("div", {
      ref: be,
      class: Ye(["grid-tile", pe.value]),
      style: nt([n.style, ue.value]),
      "data-tile": o.id,
      tabindex: K.value ? 0 : void 0,
      role: K.value ? "group" : void 0,
      "aria-roledescription": Y.value ? A.value.roleDescription : void 0,
      "aria-label": K.value ? ae.value : void 0,
      "aria-describedby": ge.value,
      "aria-hidden": o.shadow ? "true" : void 0,
      "data-grabbed": n.grabbed ? "true" : void 0,
      onKeydown: gt,
      onBlur: pt
    }, [
      Fe(t.$slots, "default", {}, void 0, !0),
      fe.value ? (ke(), Te("span", {
        key: 0,
        class: Ye(["grid-handle", { "grid-handle--chevron": !t.$slots.handle }]),
        "aria-hidden": t.$slots.handle ? void 0 : "true"
      }, [
        Fe(t.$slots, "handle", {}, void 0, !0)
      ], 10, At)) : rt("", !0)
    ], 46, Nt));
  }
}, Xt = /* @__PURE__ */ lt(Pt, [["__scopeId", "data-v-f605bb7d"]]), Yt = ["id", "lang"], _t = ["id", "lang"], Lt = ["lang"], Je = 220, Qe = "cubic-bezier(0.2, 0, 0, 1)", Ct = {
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
    removable: {
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
    },
    onRemove: {
      type: [Function, Array],
      default: null
    }
  },
  emits: ["update:tiles", "ready", "remove"],
  setup(o, { expose: s, emit: f }) {
    const e = o, m = f, E = {
      roleDescription: "Draggable tile",
      tileName: (i) => `Tile ${i}`,
      tileLabel: ({ name: i, column: l, row: g, w: v, h: k }) => `${i}, column ${l}, row ${g}, ${v} wide, ${k} tall`,
      instructions: "Press Enter or Space to pick the tile up. Then use the arrow keys to move it, or hold Shift with the arrow keys to resize it. Press Enter to drop it, or Escape to put it back.",
      tapInstructions: "Without a keyboard, tap the tile and then tap where it should go, or tap its corner grip and then tap where that corner should go.",
      removeInstructions: "Press Delete to remove the tile.",
      pickedUp: "Picked up. Arrow keys move, Shift plus arrow keys resize, Enter drops, Escape cancels.",
      pickedUpToMove: "Picked up. Tap where it should go, or tap it again to put it down.",
      pickedUpToResize: "Picked up to resize. Tap where its corner should go, or tap it again to put it down.",
      dropped: "Dropped.",
      putDown: "Put down.",
      returned: "Returned to where it started.",
      removed: "Removed."
    };
    let c = null, T = null, $ = null, S = null, P = [], M = null, w = null;
    const h = {
      el: void 0,
      dispatch: fe
    };
    s(h);
    const u = et({
      width: null,
      boardStyle: {},
      busy: !1,
      shadow: { x: 0, y: 0, w: 0, h: 0, id: -1 },
      tiles: [],
      announcement: ""
    }), G = H(() => {
      const i = e.gap;
      if (Array.isArray(i)) return [Number(i[0]) || 0, Number(i[1]) || 0];
      const l = Number(i) || 0;
      return [l, l];
    }), L = Ge(), N = Ge(), W = H(() => ({ ...E, ...e.a11y })), X = yt();
    let C = /* @__PURE__ */ new Map();
    const q = H(() => {
      if (u.busy) return C;
      const i = [...u.tiles].sort((l, g) => l.y - g.y || l.x - g.x);
      return C = new Map(i.map((l, g) => [String(l.id), g])), C;
    });
    function re(i, l = []) {
      for (const g of i)
        g.type === Mt && Array.isArray(g.children) ? re(g.children, l) : l.push(g);
      return l;
    }
    function n() {
      const i = q.value, l = (g) => {
        const v = i.get(String(g.props?.id));
        return v === void 0 ? Number.MAX_SAFE_INTEGER : v;
      };
      return re(X.default?.() ?? []).map((g, v) => ({ node: g, index: v })).sort((g, v) => l(g.node) - l(v.node) || g.index - v.index).map((g) => g.node);
    }
    vt(st, {
      props: e,
      state: u,
      gap: G,
      instructionsId: L,
      removeInstructionsId: N,
      listensForRemove: () => !!e.onRemove,
      remove: Y,
      dragEvent: $e,
      resizeEvent: ze,
      announce: le,
      settleTiming: ge,
      a11y: W,
      startPlacing: oe,
      stopPlacing: pe,
      cancelPlacing: A,
      placingId: () => w?.id ?? null
    }), he(), ce && (j(
      () => e.tiles,
      () => {
        e.tiles !== T && (Ke(e.tiles), _());
      },
      { immediate: !0 }
    ), j(
      () => u.busy,
      (i) => {
        i ? (window.getSelection()?.removeAllRanges(), document.addEventListener("selectstart", K)) : document.removeEventListener("selectstart", K);
      }
    )), j(
      () => u.width,
      async (i, l) => {
        R(), l === null && (await we(), m("ready", u.tiles));
      }
    ), j(
      () => e.gravity,
      () => {
        ve(u.tiles, e.gravity), R(), ce && y();
      }
    ), j(G, R), wt(R), bt(() => {
      const i = ce ? document.activeElement : null;
      S = i && h.el?.contains(i) ? i : null, P = S ? J() : [];
    }), xt(() => {
      const i = S, l = P;
      if (S = null, P = [], ie(), !i || document.activeElement === i || document.activeElement && document.activeElement !== document.body) return;
      if (i.isConnected) {
        i.focus({ preventScroll: !0 });
        return;
      }
      const g = l.findIndex((k) => k.contains(i));
      if (g === -1) return;
      [...l.slice(g + 1), ...l.slice(0, g).reverse()].find(
        (k) => k.isConnected && k.tabIndex >= 0
      )?.focus({ preventScroll: !0 });
    }), tt(() => {
      c && h.el && c.disconnect(), ce && document.removeEventListener("selectstart", K);
    });
    function fe(i, l) {
      switch (i) {
        case "dragEvent":
          return $e(l);
        case "resizeEvent":
          return ze(l);
        case "announce":
          return le(l);
        case "measure":
          return O();
        default:
          throw new Error(`GridBoard: dispatch received an unknown command "${String(i)}".`);
      }
    }
    function J() {
      return h.el ? [...h.el.querySelectorAll(":scope > .grid-tile:not(.grid-shadow)")] : [];
    }
    function Y(i, l) {
      M = { id: i, name: l }, m("remove", i), we(() => {
        M?.id === i && (M = null);
      });
    }
    function ie() {
      if (!M) return;
      const i = String(M.id);
      J().some((l) => l.dataset.tile === i) || (le(`${M.name}. ${W.value.removed}`), M = null);
    }
    function K(i) {
      i.preventDefault();
    }
    function ge() {
      if ($) return $;
      if (!h.el) return { duration: Je, easing: Qe };
      const i = getComputedStyle(h.el), l = i.getPropertyValue("--grid-tile-easing").trim();
      return $ = {
        duration: ue(i.getPropertyValue("--grid-tile-duration"), Je),
        easing: l && CSS.supports("transition-timing-function", l) ? l : Qe
      }, requestAnimationFrame(() => $ = null), $;
    }
    function ue(i, l) {
      const g = i.trim().match(/^([\d.]+)(ms|s)?$/);
      if (!g) return l;
      const v = parseFloat(g[1]) * (g[2] === "s" ? 1e3 : 1);
      return Number.isFinite(v) ? v : l;
    }
    function oe(i, l, g) {
      w && w.id !== i && w.putDown(), w = { id: i, place: l, putDown: g };
    }
    function pe(i) {
      w?.id === i && (w = null);
    }
    function A() {
      w?.putDown();
    }
    function Q(i) {
      if (!w) return null;
      const l = h.el?.querySelector(
        `.grid-tile[data-tile="${CSS.escape(String(w.id))}"]:not(.grid-shadow)`
      );
      return { tile: l, inside: !!l && l.contains(i) };
    }
    function ae(i) {
      const l = Q(i.target);
      l && !l.inside && i.preventDefault();
    }
    function se(i) {
      const l = Q(i.target);
      if (!l || l.inside) return;
      i.preventDefault(), i.stopPropagation();
      const { x: g, y: v } = be(i.clientX, i.clientY);
      w.place(g, v);
    }
    function be(i, l) {
      const g = h.el.getBoundingClientRect(), [v, k] = G.value, F = e.columns, D = (g.width - v * (F + 1)) / F, V = Math.floor((i - g.left - v / 2) / (D + v)), Be = Math.floor((l - g.top - k / 2) / (e.rowHeight + k));
      return { x: Math.min(Math.max(V, 0), F - 1), y: Math.max(Be, 0) };
    }
    function le(i) {
      i && (u.announcement = i === u.announcement ? `${i}​` : i);
    }
    function he() {
      Ke(e.tiles), u.tiles = We(e.tiles), ve(u.tiles, e.gravity), u.boardStyle = xe(ee());
    }
    function B(i, l) {
      return i?.length !== l?.length ? !0 : i.some((g, v) => {
        const k = l[v];
        return [.../* @__PURE__ */ new Set([...Object.keys(g), ...Object.keys(k)])].some((D) => g[D] !== k[D]);
      });
    }
    function y() {
      if (!B(e.tiles, u.tiles)) return;
      const i = We(u.tiles);
      T = i, m("update:tiles", i);
    }
    function _() {
      B(e.tiles, u.tiles) && (u.tiles = We(e.tiles), ve(u.tiles, e.gravity), R(), ce && y());
    }
    function R() {
      const i = ee();
      u.boardStyle.height !== i && (u.boardStyle = xe(i, u.boardStyle.height));
    }
    function O() {
      h.el && (u.width = h.el.offsetWidth);
    }
    function ee() {
      if (!e.autoHeight) return;
      const i = G.value[1];
      return `${at(u.tiles) * (e.rowHeight + i) + i}px`;
    }
    function xe(i, l) {
      const g = parseFloat(i) > parseFloat(l);
      return {
        position: "relative",
        height: i,
        ...g ? { transitionDuration: "var(--grid-board-grow-duration, 150ms)" } : {}
      };
    }
    function $e([i, l, g, v, k, F] = []) {
      const D = Ne(u.tiles, l) ?? { x: 0, y: 0 };
      if (i === "dragmove" && u.busy && D.x === g && D.y === v && u.shadow.w === F && u.shadow.h === k)
        return;
      const V = i === "dragmove" || i === "dragstart";
      u.tiles = Ae(u.tiles, D, g, v, !0, !1), ve(u.tiles, e.gravity, l), V && (u.shadow = { ...u.shadow, x: D.x, y: D.y, w: F, h: k }), u.busy = V, R(), y();
    }
    function ze([i, l, g, v, k, F] = []) {
      if (!i) return;
      const D = Ne(u.tiles, l) ?? { x: g, y: v, h: 0, w: 0 };
      if (i === "resizemove" && u.busy && D.w === F && D.h === k && u.shadow.x === g && u.shadow.y === v)
        return;
      D.w = F, D.h = k;
      const V = i === "resizestart" || i === "resizemove";
      ve(u.tiles, e.gravity, l), V && (u.shadow = { ...u.shadow, x: D.x, y: D.y, w: D.w, h: D.h }), u.busy = V, R(), y();
    }
    function Re(i) {
      !i || i === h.el || (h.el = i, typeof window < "u" && (c = new ResizeObserver(O), c.observe(h.el), u.width = h.el.offsetWidth));
    }
    return (i, l) => (ke(), Te("div", {
      ref: Re,
      class: Ye(["grid-board", { "grid-board--busy": u.busy }]),
      style: nt(u.boardStyle),
      onMousedownCapture: ae,
      onClickCapture: se
    }, [
      zt(qe(Xt, {
        id: "shadow",
        class: "grid-shadow",
        x: u.shadow.x,
        y: u.shadow.y,
        w: u.shadow.w,
        h: u.shadow.h,
        shadow: ""
      }, null, 8, ["x", "y", "w", "h"]), [
        [Et, u.busy]
      ]),
      qe(n),
      Ue("p", {
        id: de(L),
        class: "grid-sr",
        lang: e.a11y ? void 0 : "en"
      }, Xe(e.tapToMove ? `${W.value.instructions} ${W.value.tapInstructions}` : W.value.instructions), 9, Yt),
      e.onRemove ? (ke(), Te("p", {
        key: 0,
        id: de(N),
        class: "grid-sr",
        lang: e.a11y ? void 0 : "en"
      }, Xe(W.value.removeInstructions), 9, _t)) : rt("", !0),
      Ue("p", {
        class: "grid-sr",
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        lang: e.a11y ? void 0 : "en"
      }, Xe(u.announcement), 9, Lt)
    ], 38));
  }
}, Ft = /* @__PURE__ */ lt(Ct, [["__scopeId", "data-v-c02a22d8"]]);
export {
  st as GRID_BOARD,
  Ft as GridBoard,
  Xt as GridTile,
  ce as IS_BROWSER,
  ve as applyGravity,
  We as copyTiles,
  Ve as getFrameDelta,
  at as getLastRow,
  Wt as getPointerOffset,
  Ne as getTileById,
  Ae as moveTile,
  Tt as usePointerDragResize,
  Ke as validateTiles
};
//# sourceMappingURL=core.js.map
