import { inject as mt, computed as D, reactive as tt, unref as ce, watch as K, onMounted as yt, onBeforeUnmount as nt, openBlock as Ne, createElementBlock as Ae, normalizeStyle as rt, normalizeClass as _e, renderSlot as Ge, createCommentVNode as it, nextTick as be, toRaw as ke, useId as qe, useSlots as vt, provide as wt, onBeforeMount as bt, onBeforeUpdate as xt, onUpdated as zt, withDirectives as Et, createVNode as Ue, vShow as Mt, createElementVNode as je, toDisplayString as Ye, Fragment as St } from "vue";
const fe = typeof document < "u";
function ot(o, a) {
  return !(o === a || o.x + o.w <= a.x || o.x >= a.x + a.w || o.y + o.h <= a.y || o.y >= a.y + a.h);
}
function Ce(o, a) {
  return o.find((f) => ot(f, a));
}
function $t(o, a) {
  return o.filter((f) => ot(f, a));
}
function Rt(o) {
  return o.filter((a) => a.frozen);
}
function at(o, a) {
  return [].concat(o).sort((f, e) => {
    if (f.y === e.y) {
      if (a !== void 0) {
        if (f.id === a) return -1;
        if (e.id === a) return 1;
      }
      if (f.x === e.x) return 0;
    }
    return f.y > e.y || f.y === e.y && f.x > e.x ? 1 : -1;
  });
}
function Dt(o, a) {
  return !(o.x + o.w <= a.x) && !(o.x >= a.x + a.w);
}
function Ht(o, a, f) {
  const e = o.filter((z) => Dt(z, a));
  if (f)
    for (; a.y > 0 && !Ce(e, a); )
      a.y--;
  let m;
  for (; m = Ce(e, a); )
    a.y = m.y + m.h;
}
function Ke(o, a, f, e) {
  if (e) {
    const m = {
      x: f.x,
      y: Math.max(a.y - f.h, 0),
      w: f.w,
      h: f.h
    };
    if (!Ce(o, m))
      return Ie(o, f, void 0, m.y, !1);
  }
  return Ie(o, f, void 0, f.y + 1, !1);
}
function Wt(o) {
  return typeof o == "number" && !Number.isNaN(o);
}
function st(o) {
  let a = 0;
  for (let f = 0, e = o.length; f < e; f++) {
    const m = o[f].y + o[f].h;
    m > a && (a = m);
  }
  return a;
}
function Te(o) {
  return (o || []).map((a) => ({ ...a }));
}
function Be(o, a) {
  return o.find((f) => f.id === a);
}
function we(o, a, f) {
  const e = Rt(o), m = at(o, f);
  for (let z = 0, c = m.length; z < c; z++) {
    const k = m[z];
    k.frozen || (Ht(e, k, a), e.push(k)), delete k.moved;
  }
}
function Ie(o, a, f, e, m, z) {
  if (a.frozen) return o;
  const c = a.x, k = a.y, $ = e && a.y > e;
  typeof f == "number" && (a.x = f), typeof e == "number" && (a.y = e), a.moved = !0;
  let S = at(o);
  $ && (S = S.reverse());
  const P = $t(S, a);
  if (z && P.length)
    return a.x = c, a.y = k, a.moved = !1, o;
  for (let M = 0, w = P.length; M < w; M++) {
    const h = P[M];
    h.moved || a.y > h.y && a.y - h.y > h.h / 4 || (h.frozen ? o = Ke(o, h, a, m) : o = Ke(o, a, h, m));
  }
  return o;
}
function kt(o, a, f, e, m, z) {
  const c = Be(o, a);
  if (!c) return null;
  const k = st(o);
  let $ = c.x, S = c.y;
  for (; ; ) {
    const P = Math.max(0, Math.min(m - c.w, $ + f)), M = Math.max(0, Math.min(k, S + e));
    if (P === $ && M === S) return null;
    $ = P, S = M;
    const w = Te(o);
    if (Ie(w, Be(w, a), $, S, !0, !1), we(w, z, a), w.some((h, u) => h.x !== o[u].x || h.y !== o[u].y)) return { x: $, y: S };
  }
}
function Ve(o, a = "tiles") {
  if (!Array.isArray(o)) throw new Error(`vue3-grid-board: ${a} must be an array.`);
  const f = /* @__PURE__ */ new Set();
  o.forEach((e, m) => {
    for (const z of ["x", "y", "w", "h"])
      if (typeof e[z] != "number")
        throw new Error(`vue3-grid-board: ${a}[${m}].${z} must be a number.`);
    if (e.id === void 0 || e.id === null)
      throw new Error(`vue3-grid-board: ${a}[${m}].id is required.`);
    if (typeof e.id != "number" && typeof e.id != "string")
      throw new Error(`vue3-grid-board: ${a}[${m}].id must be a string or a number.`);
    if (f.has(e.id))
      throw new Error(
        `vue3-grid-board: ${a}[${m}].id must be unique (saw "${e.id}" twice).`
      );
    if (f.add(e.id), e.frozen !== void 0 && typeof e.frozen != "boolean")
      throw new Error(`vue3-grid-board: ${a}[${m}].frozen must be a boolean.`);
  });
}
function Tt(o) {
  const a = o.target.offsetParent || document.body, f = a.getBoundingClientRect();
  return {
    x: o.clientX + a.scrollLeft - f.left,
    y: o.clientY + a.scrollTop - f.top
  };
}
function Ze(o, a, f, e) {
  return Wt(o) ? { deltaX: f - o, deltaY: e - a, lastX: o, lastY: a, x: f, y: e } : { deltaX: 0, deltaY: 0, lastX: f, lastY: e, x: f, y: e };
}
const lt = /* @__PURE__ */ Symbol("gridBoard"), Nt = 3, j = 60, Je = 18;
function At(o, a) {
  const {
    handleSelector: f = ".grid-handle",
    draggable: e = () => !1,
    resizable: m = () => !1,
    dragIgnore: z = () => null,
    dragHandle: c = () => null,
    resizeIgnore: k = () => null,
    autoScroll: $ = () => !0,
    onDrag: S = () => {
    },
    onResize: P = () => {
    },
    onTap: M = () => {
    }
  } = a;
  let w = null, h = null, u = !1, q = 0, C = 0, T = 0, H = 0, X = 0, O = 0, U = !1, ie = 0, n = 0;
  function ge(y) {
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
  function Y(y, _ = T, R = H) {
    const F = { type: y, target: o, clientX: _, clientY: R };
    h === "resize" ? P(F) : S(F);
  }
  function oe() {
    O = requestAnimationFrame(() => {
      O = 0, !(w === null || !u || !U) && (U = !1, Y(`${h}move`), oe());
    });
  }
  function V() {
    if (O) {
      U = !0;
      return;
    }
    Y(`${h}move`), oe();
  }
  function pe() {
    O && cancelAnimationFrame(O), O = 0, U = !1;
  }
  function de() {
    pe(), Y(`${h}move`);
  }
  function ae(y) {
    if (w !== null || y.pointerType === "mouse" && y.button !== 0) return;
    const _ = J(y.target, f);
    if (_ && m()) {
      if (J(y.target, k())) return;
      h = "resize";
    } else if (!_ && e()) {
      const R = z(), F = c();
      if (R && J(y.target, R) || F && !J(y.target, F)) return;
      h = "drag";
    } else
      return;
    w = y.pointerId, u = !1, q = T = y.clientX, C = H = y.clientY, le(), ge(() => o.setPointerCapture(y.pointerId)), o.addEventListener("pointermove", he), o.addEventListener("pointerup", N), o.addEventListener("pointercancel", N), o.addEventListener("lostpointercapture", N), window.addEventListener("resize", le, { passive: !0 });
  }
  function he(y) {
    if (y.pointerId === w) {
      if (T = y.clientX, H = y.clientY, !u) {
        if (Math.hypot(T - q, H - C) < Nt) return;
        u = !0, Y(`${h}start`, q, C);
      }
      y.preventDefault(), V(), h === "drag" && !X && xe() && $() && ue();
    }
  }
  function N(y) {
    if (y.pointerId !== w) return;
    const _ = !u && y.type === "pointerup" && h;
    u && (U && de(), Y(`${h}end`)), Q(), _ && M({ mode: _, target: y.target, clientX: y.clientX, clientY: y.clientY });
  }
  function Q() {
    pe(), me(), o.removeEventListener("pointermove", he), o.removeEventListener("pointerup", N), o.removeEventListener("pointercancel", N), o.removeEventListener("lostpointercapture", N), window.removeEventListener("resize", le), ge(() => {
      w !== null && o.hasPointerCapture?.(w) && o.releasePointerCapture(w);
    }), w = null, h = null, u = !1;
  }
  function se(y) {
    return Math.min(Je, y / j * Je);
  }
  function le() {
    ie = window.innerWidth, n = window.innerHeight;
  }
  function xe() {
    return T < j || H < j || T > ie - j || H > n - j;
  }
  function ue() {
    if (X) return;
    const y = () => {
      if (X = 0, w === null || !u) return;
      const _ = ie, R = n;
      let F = 0, ee = 0;
      H < j ? ee = -se(j - H) : H > R - j && (ee = se(H - (R - j))), T < j ? F = -se(j - T) : T > _ - j && (F = se(T - (_ - j))), (F || ee) && (window.scrollBy({ left: F, top: ee, behavior: "instant" }), de(), X = requestAnimationFrame(y));
    };
    X = requestAnimationFrame(y);
  }
  function me() {
    X && cancelAnimationFrame(X), X = 0;
  }
  o.addEventListener("pointerdown", ae);
  function B() {
    if (o.removeEventListener("pointerdown", ae), w === null) {
      me();
      return;
    }
    u && (U && de(), Y(`${h}end`)), Q();
  }
  return { destroy: B };
}
const ut = (o, a) => {
  const f = o.__vccOpts || o;
  for (const [e, m] of a)
    f[e] = m;
  return f;
}, Bt = ["data-tile", "tabindex", "role", "aria-roledescription", "aria-label", "aria-describedby", "aria-hidden", "data-grabbed"], It = ["aria-hidden"], Pt = "a, button, input, select, textarea, label, [contenteditable]", Xt = 2147483647, Yt = {
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
  setup(o, { expose: a, emit: f }) {
    const e = o, m = f, z = {
      el: void 0
    };
    a(z);
    const c = mt(lt, null);
    if (!c)
      throw new Error(
        "GridTile must be rendered inside a GridBoard. The two are a single component pair and cannot be used apart."
      );
    let k;
    const $ = /* @__PURE__ */ new Set();
    let S = null, P = null, M = null, w = null, h = null, u = null, q = null;
    const C = D(() => c.props.columns), T = D(() => c.props.rowHeight), H = D(() => c.state.width ?? 100), X = D(() => c.gap.value), O = D(
      () => e.draggable === null ? c.props.draggable : e.draggable
    ), U = D(
      () => e.resizable === null ? c.props.resizable : e.resizable
    ), ie = D(
      () => e.removable === null ? c.props.removable : e.removable
    ), n = tt({
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
    }), ge = D(() => U.value && !e.frozen && !e.shadow), J = D(
      () => O.value && !e.frozen && !e.shadow && !e.dragHandle
    ), Y = D(
      () => (O.value || U.value) && !e.frozen && !e.shadow
    ), oe = D(
      () => ie.value && c.listensForRemove() && !e.frozen && !e.shadow
    ), V = D(() => Y.value || oe.value), pe = D(
      () => [Y.value && c.instructionsId, oe.value && c.removeInstructionsId].filter(Boolean).join(" ") || void 0
    ), de = D(() => ce(Y) ? { touchAction: "none" } : {}), ae = D(
      () => fe && !e.shadow && c.props.overflow && (n.isDragging || n.isResizing || n.settling)
    ), he = D(() => ({
      "grid-tile--draggable": J.value,
      "grid-tile--frozen": e.frozen,
      "grid-tile--dragging": n.isDragging,
      "grid-tile--resizing": n.isResizing,
      "grid-tile--settling": n.settling,
      "grid-tile--grabbed": n.grabbed
    })), N = D(() => c.a11y.value), Q = D(() => e.label || N.value.tileName(e.id)), se = D(
      () => N.value.tileLabel({
        name: Q.value,
        column: n.innerX + 1,
        row: n.innerY + 1,
        w: n.innerW,
        h: n.innerH
      })
    );
    B(), K([T, C], () => {
      B(), R();
    }), K(H, () => {
      (n.isDragging || n.isResizing) && B(), R();
    }), K([() => e.x, () => e.y, () => e.w, () => e.h], (t, r) => {
      if (n.innerX = e.x, n.innerY = e.y, n.innerW = e.w, n.innerH = e.h, B(), e.shadow || n.isDragging || n.isResizing || n.settling) return;
      const [s, d, p, E] = t, [x, b, I, He] = r;
      if (s === x && d === b) return;
      const $e = v(x, b, I, He), Z = v(s, d, p, E);
      Ee($e.left - Z.left, $e.top - Z.top, !1);
    }), K(ae, B), K(() => e.radius, B), K(X, (t, r) => {
      t[0] === r[0] && t[1] === r[1] || (B(), R());
    }), yt(() => {
      B(), le();
    }), K(Y, le);
    function le() {
      const t = ce(Y);
      if (t !== !!k) {
        if (!t) {
          k.destroy(), k = null;
          return;
        }
        z.el && (k = At(z.el, {
          handleSelector: ".grid-handle",
          draggable: () => O.value && !e.frozen,
          resizable: () => U.value && !e.frozen,
          dragIgnore: () => e.dragIgnore,
          dragHandle: () => e.dragHandle && `.${CSS.escape(e.dragHandle)}`,
          resizeIgnore: () => e.resizeIgnore,
          autoScroll: () => !0,
          onDrag: ee,
          onResize: F,
          onTap: ft
        }));
      }
    }
    nt(() => {
      c.stopPlacing(e.id), ve(), De(), l(), k?.destroy();
    });
    function xe(t) {
      z.el = t;
    }
    function ue() {
      const t = z.el, r = P || t?.offsetParent || t?.parentElement;
      return r ? r.getBoundingClientRect() : null;
    }
    function me() {
      ae.value && B();
    }
    function B() {
      const t = C.value;
      e.x + e.w > t ? (n.innerX = 0, n.innerW = e.w > t ? t : e.w) : (n.innerX = e.x, n.innerW = e.w);
      const { innerX: r, innerY: s, innerW: d, innerH: p } = n, E = T.value, [x, b] = X.value, I = `((100% - ${(t + 1) * x}px) / ${t})`;
      let He = `${E * s + (s + 1) * b}px`, $e = `calc(${I} * ${r} + ${(r + 1) * x}px)`, Z = null;
      if (n.isDragging) {
        const re = v(r, s, d, p);
        w = re, He = `${re.top}px`, $e = `${re.left}px`, Z = {
          dx: n.dragging.left - re.left,
          dy: n.dragging.top - re.top
        };
      } else
        w = null;
      if (ae.value) {
        const re = ue();
        if (re) {
          const We = n.isDragging ? w : v(r, s, d, p), Xe = {
            position: "fixed",
            top: `${re.top + We.top}px`,
            left: `${re.left + We.left}px`,
            width: `${n.isResizing ? n.resizing.width : We.width}px`,
            height: `${n.isResizing ? n.resizing.height : We.height}px`,
            zIndex: String(Xt),
            transition: "none",
            ...Z ? {
              transform: `translate3d(${Z.dx}px, ${Z.dy}px, 0)`,
              willChange: "transform"
            } : {},
            "--grid-radius": `${e.radius}px`
          };
          if (M && y(M, Xe)) return;
          M = Xe, n.style = Xe;
          return;
        }
      }
      const Pe = {
        position: "absolute",
        top: He,
        left: $e,
        width: n.isResizing ? `${n.resizing.width}px` : d === 1 / 0 ? "auto" : `calc(${I} * ${d} + ${Math.max(0, d - 1) * x}px)`,
        height: n.isResizing ? `${n.resizing.height}px` : p === 1 / 0 ? "auto" : `${E * p + Math.max(0, p - 1) * b}px`,
        ...Z ? {
          transform: `translate3d(${Z.dx}px, ${Z.dy}px, 0)`,
          transition: "none",
          willChange: "transform"
        } : n.isResizing ? { transition: "none" } : {},
        "--grid-radius": `${e.radius}px`
      };
      M && y(M, Pe) || (M = Pe, n.style = Pe);
    }
    function y(t, r) {
      const s = Object.keys(r);
      return Object.keys(t).length !== s.length ? !1 : s.every((d) => t[d] === r[d]);
    }
    function _(t) {
      const r = z.el;
      if (!r || !M || !w) return;
      const s = `translate3d(${t.left - w.left}px, ${t.top - w.top}px, 0)`;
      M.transform !== s && (M.transform = s, r.style.transform = s);
    }
    function R() {
      const { width: t, height: r } = v(n.innerX, n.innerY, n.innerW, n.innerH);
      !Number.isFinite(t) || !Number.isFinite(r) || m("size", e.id, t, r);
    }
    function F(t) {
      if (e.frozen && !(t.type === "resizeend" && n.isResizing)) return;
      t.type === "resizestart" && i(t.target);
      const r = g(t);
      if (r == null) return;
      const { x: s, y: d } = r, p = { width: 0, height: 0 };
      let E = null, x;
      switch (t.type) {
        case "resizestart": {
          c.cancelPlacing(), n.resizeMin = v(0, 0, e.minW, e.minH), n.resizeMax = v(0, 0, e.maxW, e.maxH), n.previousW = n.innerW, n.previousH = n.innerH, x = v(n.innerX, n.innerY, n.innerW, n.innerH), p.width = x.width, p.height = x.height, n.resizing = p, n.isResizing = !0, m("resizestart", e.id, n.innerW, n.innerH);
          break;
        }
        case "resizemove": {
          const I = Ze(n.lastW, n.lastH, s, d);
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
          E = n.resizing, x = v(n.innerX, n.innerY, n.innerW, n.innerH), p.width = x.width, p.height = x.height, n.resizing = null, n.isResizing = !1;
          break;
        }
      }
      B(), x = A(L(p.height, p.width));
      const b = E ? A(L(E.height, E.width)) : x;
      n.lastW = s, n.lastH = d, (n.innerW !== x.w || n.innerH !== x.h) && m("resize", e.id, x.w, x.h), t.type === "resizeend" && (n.previousW !== b.w || n.previousH !== b.h) && m("resizeend", e.id, b.w, b.h), c.resizeEvent([t.type, e.id, n.innerX, n.innerY, b.h, b.w]), t.type === "resizeend" && l();
    }
    function ee(t) {
      if (n.isResizing || e.frozen && !(t.type === "dragend" && n.isDragging)) return;
      t.type === "dragstart" && i(t.target);
      const r = g(t);
      if (r === null) return;
      const { x: s, y: d } = r, p = { top: 0, left: 0 };
      switch (t.type) {
        case "dragstart":
        case "dragend": {
          if (t.type === "dragend" && !n.isDragging) return;
          t.type === "dragstart" && (c.cancelPlacing(), n.previousX = n.innerX, n.previousY = n.innerY, De());
          const b = ue() ?? { left: 0, top: 0 }, I = t.target.getBoundingClientRect();
          p.left = I.left - b.left, p.top = I.top - b.top, n.dragging = t.type === "dragstart" ? p : null, n.isDragging = t.type === "dragstart", t.type === "dragstart" && m("dragstart", e.id, n.innerX, n.innerY);
          break;
        }
        case "dragmove": {
          const b = Ze(n.lastX, n.lastY, s, d);
          p.left = n.dragging.left + b.deltaX, p.top = n.dragging.top + b.deltaY, n.dragging = p;
          break;
        }
      }
      t.type !== "dragmove" && B();
      const E = W(p.top, p.left), x = n.innerX !== E.x || n.innerY !== E.y;
      if (t.type === "dragmove" && (x ? B() : _(p)), n.lastX = s, n.lastY = d, x && m("drag", e.id, E.x, E.y), t.type === "dragend" && (n.previousX !== n.innerX || n.previousY !== n.innerY) && m("dragend", e.id, E.x, E.y), c.dragEvent([t.type, e.id, E.x, E.y, n.innerH, n.innerW]), t.type === "dragend") {
        if (fe && z.el) {
          const b = c.state.tiles.find((I) => I.id === e.id);
          if (b) {
            const I = v(b.x, b.y, b.w, b.h);
            Ee(p.left - I.left, p.top - I.top), B();
          }
        }
        l();
      }
    }
    function ze(t) {
      if (!t || t === "none") return { dx: 0, dy: 0 };
      const r = t.match(/-?[\d.]+(?:e[-+]?\d+)?/g)?.map(Number);
      return r ? t.startsWith("matrix3d") ? { dx: r[12] ?? 0, dy: r[13] ?? 0 } : t.startsWith("matrix") ? { dx: r[4] ?? 0, dy: r[5] ?? 0 } : { dx: r[0] ?? 0, dy: r[1] ?? 0 } : { dx: 0, dy: 0 };
    }
    function Re(t) {
      if ($.size === 0) return { dx: 0, dy: 0 };
      const r = ze(getComputedStyle(t).transform), s = ze(M?.transform);
      for (const d of $)
        d.onfinish = null, d.oncancel = null, d.cancel();
      return $.clear(), n.settling = !1, { dx: r.dx - s.dx, dy: r.dy - s.dy };
    }
    function Ee(t, r, s = !0) {
      const d = z.el;
      if (!d || typeof d.animate != "function") return;
      const p = Re(d);
      if (t += p.dx, r += p.dy, Math.abs(t) < 0.5 && Math.abs(r) < 0.5) return;
      const { duration: E, easing: x } = c.settleTiming();
      if (E === 0) return;
      const b = d.animate(
        [{ transform: `translate3d(${t}px, ${r}px, 0)` }, { transform: "translate3d(0px, 0px, 0)" }],
        { duration: E, easing: x, composite: "add" }
      );
      $.add(b), s && (n.settling = !0);
      const I = () => {
        $.delete(b), $.size === 0 && (n.settling = !1);
      };
      b.onfinish = I, b.oncancel = I;
    }
    function De() {
      for (const t of $)
        t.onfinish = null, t.oncancel = null, t.cancel();
      $.clear(), n.settling = !1;
    }
    function i(t) {
      l(), P = t.offsetParent || null;
      const r = P || document.body, s = { offsetParent: r, left: 0, top: 0, measure: null };
      s.measure = () => {
        const d = r === document.body ? { left: 0, top: 0 } : r.getBoundingClientRect();
        s.left = d.left - r.scrollLeft, s.top = d.top - r.scrollTop, me();
      }, s.measure(), S = s, window.addEventListener("scroll", s.measure, { passive: !0, capture: !0 }), window.addEventListener("resize", s.measure, { passive: !0 });
    }
    function l() {
      P = null, S && (window.removeEventListener("scroll", S.measure, { capture: !0 }), window.removeEventListener("resize", S.measure), S = null);
    }
    function g(t) {
      return S ? { x: t.clientX - S.left, y: t.clientY - S.top } : Tt(t);
    }
    function v(t, r, s, d) {
      const p = G(), E = T.value, [x, b] = X.value;
      return {
        left: Math.round(p * t + (t + 1) * x),
        top: Math.round(E * r + (r + 1) * b),
        width: s === 1 / 0 ? s : Math.round(p * s + Math.max(0, s - 1) * x),
        height: d === 1 / 0 ? d : Math.round(E * d + Math.max(0, d - 1) * b)
      };
    }
    function W(t, r) {
      const s = G(), [d, p] = X.value, E = Math.round((r - d) / (s + d)), x = Math.round((t - p) / (T.value + p));
      return {
        x: Math.max(Math.min(E, C.value - n.innerW), 0),
        y: Math.max(x, 0)
      };
    }
    function G() {
      const t = C.value;
      return (H.value - X.value[0] * (t + 1)) / t;
    }
    function L(t, r) {
      const s = G(), [d, p] = X.value, E = Math.round((r + d) / (s + d)), x = Math.round((t + p) / (T.value + p));
      return {
        w: Math.max(Math.min(E, C.value - n.innerX), 0),
        h: Math.max(x, 0)
      };
    }
    function A(t) {
      return {
        w: Math.max(e.minW, Math.min(e.maxW, t.w), 1),
        h: Math.max(e.minH, Math.min(e.maxH, t.h), 1)
      };
    }
    const te = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };
    function ne() {
      const t = c.state.tiles.find((r) => r.id === e.id);
      return t ? { x: t.x, y: t.y, w: t.w, h: t.h } : { x: n.innerX, y: n.innerY, w: n.innerW, h: n.innerH };
    }
    function Me(t) {
      const r = ne(), s = N.value.tileLabel({
        name: Q.value,
        column: r.x + 1,
        row: r.y + 1,
        w: r.w,
        h: r.h
      });
      c.announce(t ? `${s}. ${t}` : s);
    }
    function ye(t) {
      if (h === t) return;
      h && ve();
      const r = ne();
      h = t, t === "drag" ? (m("dragstart", e.id, r.x, r.y), c.dragEvent(["dragstart", e.id, r.x, r.y, r.h, r.w])) : (m("resizestart", e.id, r.w, r.h), c.resizeEvent(["resizestart", e.id, r.x, r.y, r.h, r.w]));
    }
    function ve() {
      if (!h) return;
      const t = h;
      h = null;
      const r = ne();
      t === "drag" ? c.dragEvent(["dragend", e.id, r.x, r.y, r.h, r.w]) : c.resizeEvent(["resizeend", e.id, r.x, r.y, r.h, r.w]);
    }
    function dt(t, r) {
      if (!O.value || e.frozen) return;
      ye("drag");
      const s = ne(), d = kt(
        ke(c.state.tiles),
        e.id,
        t,
        r,
        C.value,
        c.props.gravity
      );
      d && (c.dragEvent(["dragmove", e.id, d.x, d.y, s.h, s.w]), m("drag", e.id, d.x, d.y)), be(() => Me());
    }
    function ct(t, r) {
      if (!U.value || e.frozen) return;
      ye("resize");
      const s = ne(), d = Math.max(e.minW, Math.min(e.maxW, C.value - s.x, s.w + t)), p = Math.max(e.minH, Math.min(e.maxH, s.h + r));
      (d !== s.w || p !== s.h) && (c.resizeEvent(["resizemove", e.id, s.x, s.y, p, d]), m("resize", e.id, d, p)), be(() => Me());
    }
    function Le(t = N.value.pickedUp) {
      u = ne(), n.grabbed = !0, Me(t);
    }
    function Se() {
      if (!n.grabbed) return;
      const t = h !== null;
      ve(), Oe(), n.grabbed = !1, u = null, be(() => Me(t ? N.value.dropped : N.value.putDown));
    }
    function ft({ mode: t, target: r }) {
      if (!c.props.tapToMove || !ce(Y)) return;
      const s = c.placingId();
      if (s !== null && s !== e.id) return;
      const d = r.closest?.(Pt);
      if (!(d && d !== z.el && z.el.contains(d))) {
        if (n.grabbed) {
          Se();
          return;
        }
        q = t, z.el.focus({ preventScroll: !0 }), Le(t === "resize" ? N.value.pickedUpToResize : N.value.pickedUpToMove), c.startPlacing(e.id, gt, Se);
      }
    }
    function gt(t, r) {
      const s = ne();
      if (q === "resize") {
        const d = Math.max(
          e.minW,
          Math.min(e.maxW, C.value - s.x, t - s.x + 1)
        ), p = Math.max(e.minH, Math.min(e.maxH, r - s.y + 1));
        (d !== s.w || p !== s.h) && (ye("resize"), c.resizeEvent(["resizemove", e.id, s.x, s.y, p, d]), m("resize", e.id, d, p));
      } else {
        const d = Math.max(0, Math.min(t, C.value - s.w));
        (d !== s.x || r !== s.y) && (ye("drag"), c.dragEvent(["dragmove", e.id, d, r, s.h, s.w]), m("drag", e.id, d, r));
      }
      Se();
    }
    function Oe() {
      q && (q = null, c.stopPlacing(e.id));
    }
    function Fe(t = !0) {
      if (!n.grabbed) return;
      const r = u;
      if (ve(), Oe(), r) {
        let s = ne();
        (s.w !== r.w || s.h !== r.h) && (ye("resize"), c.resizeEvent(["resizemove", e.id, s.x, s.y, r.h, r.w]), ve(), s = ne()), (s.x !== r.x || s.y !== r.y) && (ye("drag"), c.dragEvent(["dragmove", e.id, r.x, r.y, r.h, r.w]), ve());
      }
      n.grabbed = !1, u = null, t && be(() => Me(N.value.returned));
    }
    function pt(t) {
      if (!ce(V) || t.target !== z.el || t.altKey || t.ctrlKey || t.metaKey) return;
      if (t.key === "Delete" || t.key === "Backspace") {
        if (!oe.value) return;
        t.preventDefault(), Fe(!1), c.remove(e.id, Q.value);
        return;
      }
      if (!ce(Y)) return;
      if (t.key === "Enter" || t.key === " ") {
        t.preventDefault(), n.grabbed ? Se() : Le();
        return;
      }
      if (t.key === "Escape") {
        if (!n.grabbed) return;
        t.preventDefault(), Fe();
        return;
      }
      const r = te[t.key];
      !r || !n.grabbed || (t.preventDefault(), t.shiftKey ? ct(r[0], r[1]) : dt(r[0], r[1]));
    }
    function ht() {
      n.grabbed && Se();
    }
    return (t, r) => (Ne(), Ae("div", {
      ref: xe,
      class: _e(["grid-tile", he.value]),
      style: rt([n.style, de.value]),
      "data-tile": o.id,
      tabindex: V.value ? 0 : void 0,
      role: V.value ? "group" : void 0,
      "aria-roledescription": Y.value ? N.value.roleDescription : void 0,
      "aria-label": V.value ? se.value : void 0,
      "aria-describedby": pe.value,
      "aria-hidden": o.shadow ? "true" : void 0,
      "data-grabbed": n.grabbed ? "true" : void 0,
      onKeydown: pt,
      onBlur: ht
    }, [
      Ge(t.$slots, "default", {}, void 0, !0),
      ge.value ? (Ne(), Ae("span", {
        key: 0,
        class: _e(["grid-handle", { "grid-handle--chevron": !t.$slots.handle }]),
        "aria-hidden": t.$slots.handle ? void 0 : "true"
      }, [
        Ge(t.$slots, "handle", {}, void 0, !0)
      ], 10, It)) : it("", !0)
    ], 46, Bt));
  }
}, _t = /* @__PURE__ */ ut(Yt, [["__scopeId", "data-v-9e785bb3"]]), Ct = ["id", "lang"], Lt = ["id", "lang"], Ot = ["lang"], Qe = 220, et = "cubic-bezier(0.2, 0, 0, 1)", Ft = {
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
  setup(o, { expose: a, emit: f }) {
    const e = o, m = f, z = {
      roleDescription: "Draggable tile",
      tileName: (i) => `Tile ${i}`,
      tileLabel: ({ name: i, column: l, row: g, w: v, h: W }) => `${i}, column ${l}, row ${g}, ${v} wide, ${W} tall`,
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
    let c = null, k = null, $ = null, S = null, P = [], M = null, w = null;
    const h = {
      el: void 0,
      dispatch: ge
    };
    a(h);
    const u = tt({
      width: null,
      boardStyle: {},
      busy: !1,
      shadow: { x: 0, y: 0, w: 0, h: 0, id: -1 },
      tiles: [],
      announcement: ""
    }), q = D(() => {
      const i = e.gap;
      if (Array.isArray(i)) return [Number(i[0]) || 0, Number(i[1]) || 0];
      const l = Number(i) || 0;
      return [l, l];
    }), C = qe(), T = qe(), H = D(() => ({ ...z, ...e.a11y })), X = vt();
    let O = /* @__PURE__ */ new Map();
    const U = D(() => {
      if (u.busy) return O;
      const i = [...u.tiles].sort((l, g) => l.y - g.y || l.x - g.x);
      return O = new Map(i.map((l, g) => [String(l.id), g])), O;
    });
    function ie(i, l = []) {
      for (const g of i)
        g.type === St && Array.isArray(g.children) ? ie(g.children, l) : l.push(g);
      return l;
    }
    function n() {
      const i = U.value, l = (g) => {
        const v = i.get(String(g.props?.id));
        return v === void 0 ? Number.MAX_SAFE_INTEGER : v;
      };
      return ie(X.default?.() ?? []).map((g, v) => ({ node: g, index: v })).sort((g, v) => l(g.node) - l(v.node) || g.index - v.index).map((g) => g.node);
    }
    wt(lt, {
      props: e,
      state: u,
      gap: q,
      instructionsId: C,
      removeInstructionsId: T,
      listensForRemove: () => !!e.onRemove,
      remove: Y,
      dragEvent: Re,
      resizeEvent: Ee,
      announce: ue,
      settleTiming: pe,
      a11y: H,
      startPlacing: ae,
      stopPlacing: he,
      cancelPlacing: N,
      placingId: () => w?.id ?? null
    }), me(), fe && (K(
      () => e.tiles,
      () => {
        e.tiles !== k && (Ve(e.tiles), _());
      },
      { immediate: !0 }
    ), K(
      () => u.busy,
      (i) => {
        i ? (window.getSelection()?.removeAllRanges(), document.addEventListener("selectstart", V)) : document.removeEventListener("selectstart", V);
      }
    )), K(
      () => u.width,
      async (i, l) => {
        R(), l === null && (await be(), m("ready", u.tiles));
      }
    ), K(
      () => e.gravity,
      () => {
        const i = ke(u.tiles).slice();
        we(i, e.gravity), u.tiles = i, R(), fe && y();
      }
    ), K(q, R), bt(R), xt(() => {
      const i = fe ? document.activeElement : null;
      S = i && h.el?.contains(i) ? i : null, P = S ? J() : [];
    }), zt(() => {
      const i = S, l = P;
      if (S = null, P = [], oe(), !i || document.activeElement === i || document.activeElement && document.activeElement !== document.body) return;
      if (i.isConnected) {
        i.focus({ preventScroll: !0 });
        return;
      }
      const g = l.findIndex((W) => W.contains(i));
      if (g === -1) return;
      [...l.slice(g + 1), ...l.slice(0, g).reverse()].find(
        (W) => W.isConnected && W.tabIndex >= 0
      )?.focus({ preventScroll: !0 });
    }), nt(() => {
      c && h.el && c.disconnect(), fe && document.removeEventListener("selectstart", V);
    });
    function ge(i, l) {
      switch (i) {
        case "dragEvent":
          return Re(l);
        case "resizeEvent":
          return Ee(l);
        case "announce":
          return ue(l);
        case "measure":
          return F();
        default:
          throw new Error(`GridBoard: dispatch received an unknown command "${String(i)}".`);
      }
    }
    function J() {
      return h.el ? [...h.el.querySelectorAll(":scope > .grid-tile:not(.grid-shadow)")] : [];
    }
    function Y(i, l) {
      M = { id: i, name: l }, m("remove", i), be(() => {
        M?.id === i && (M = null);
      });
    }
    function oe() {
      if (!M) return;
      const i = String(M.id);
      J().some((l) => l.dataset.tile === i) || (ue(`${M.name}. ${H.value.removed}`), M = null);
    }
    function V(i) {
      i.preventDefault();
    }
    function pe() {
      if ($) return $;
      if (!h.el) return { duration: Qe, easing: et };
      const i = getComputedStyle(h.el), l = i.getPropertyValue("--grid-tile-easing").trim();
      return $ = {
        duration: de(i.getPropertyValue("--grid-tile-duration"), Qe),
        easing: l && CSS.supports("transition-timing-function", l) ? l : et
      }, requestAnimationFrame(() => $ = null), $;
    }
    function de(i, l) {
      const g = i.trim().match(/^([\d.]+)(ms|s)?$/);
      if (!g) return l;
      const v = parseFloat(g[1]) * (g[2] === "s" ? 1e3 : 1);
      return Number.isFinite(v) ? v : l;
    }
    function ae(i, l, g) {
      w && w.id !== i && w.putDown(), w = { id: i, place: l, putDown: g };
    }
    function he(i) {
      w?.id === i && (w = null);
    }
    function N() {
      w?.putDown();
    }
    function Q(i) {
      if (!w) return null;
      const l = h.el?.querySelector(
        `.grid-tile[data-tile="${CSS.escape(String(w.id))}"]:not(.grid-shadow)`
      );
      return { tile: l, inside: !!l && l.contains(i) };
    }
    function se(i) {
      const l = Q(i.target);
      l && !l.inside && i.preventDefault();
    }
    function le(i) {
      const l = Q(i.target);
      if (!l || l.inside) return;
      i.preventDefault(), i.stopPropagation();
      const { x: g, y: v } = xe(i.clientX, i.clientY);
      w.place(g, v);
    }
    function xe(i, l) {
      const g = h.el.getBoundingClientRect(), [v, W] = q.value, G = e.columns, L = (g.width - v * (G + 1)) / G, A = Math.floor((i - g.left - v / 2) / (L + v)), te = Math.floor((l - g.top - W / 2) / (e.rowHeight + W));
      return { x: Math.min(Math.max(A, 0), G - 1), y: Math.max(te, 0) };
    }
    function ue(i) {
      i && (u.announcement = i === u.announcement ? `${i}​` : i);
    }
    function me() {
      Ve(e.tiles);
      const i = Te(e.tiles);
      we(i, e.gravity), u.tiles = i, u.boardStyle = ze(ee());
    }
    function B(i, l) {
      return i?.length !== l?.length ? !0 : i.some((g, v) => {
        const W = l[v];
        return [.../* @__PURE__ */ new Set([...Object.keys(g), ...Object.keys(W)])].some((L) => g[L] !== W[L]);
      });
    }
    function y() {
      if (!B(e.tiles, u.tiles)) return;
      const i = Te(u.tiles);
      k = i, m("update:tiles", i);
    }
    function _() {
      if (!B(e.tiles, u.tiles)) return;
      const i = Te(e.tiles);
      we(i, e.gravity), u.tiles = i, R(), fe && y();
    }
    function R() {
      const i = ee();
      u.boardStyle.height !== i && (u.boardStyle = ze(i, u.boardStyle.height));
    }
    function F() {
      h.el && (u.width = h.el.offsetWidth);
    }
    function ee() {
      if (!e.autoHeight) return;
      const i = q.value[1];
      return `${st(u.tiles) * (e.rowHeight + i) + i}px`;
    }
    function ze(i, l) {
      const g = parseFloat(i) > parseFloat(l);
      return {
        position: "relative",
        height: i,
        ...g ? { transitionDuration: "var(--grid-board-grow-duration, 150ms)" } : {}
      };
    }
    function Re([i, l, g, v, W, G] = []) {
      const L = ke(u.tiles).slice(), A = Be(L, l) ?? { x: 0, y: 0 };
      if (i === "dragmove" && u.busy && A.x === g && A.y === v && u.shadow.w === G && u.shadow.h === W)
        return;
      const te = i === "dragmove" || i === "dragstart";
      Ie(L, A, g, v, !0, !1), we(L, e.gravity, l), u.tiles = L, te && (u.shadow = { ...u.shadow, x: A.x, y: A.y, w: G, h: W }), u.busy = te, R(), y();
    }
    function Ee([i, l, g, v, W, G] = []) {
      if (!i) return;
      const L = ke(u.tiles).slice(), A = Be(L, l) ?? { x: g, y: v, h: 0, w: 0 };
      if (i === "resizemove" && u.busy && A.w === G && A.h === W && u.shadow.x === g && u.shadow.y === v)
        return;
      A.w = G, A.h = W;
      const te = i === "resizestart" || i === "resizemove";
      we(L, e.gravity, l), u.tiles = L, te && (u.shadow = { ...u.shadow, x: A.x, y: A.y, w: A.w, h: A.h }), u.busy = te, R(), y();
    }
    function De(i) {
      !i || i === h.el || (h.el = i, typeof window < "u" && (c = new ResizeObserver(F), c.observe(h.el), u.width = h.el.offsetWidth));
    }
    return (i, l) => (Ne(), Ae("div", {
      ref: De,
      class: _e(["grid-board", { "grid-board--busy": u.busy }]),
      style: rt(u.boardStyle),
      onMousedownCapture: se,
      onClickCapture: le
    }, [
      Et(Ue(_t, {
        id: "shadow",
        class: "grid-shadow",
        x: u.shadow.x,
        y: u.shadow.y,
        w: u.shadow.w,
        h: u.shadow.h,
        shadow: ""
      }, null, 8, ["x", "y", "w", "h"]), [
        [Mt, u.busy]
      ]),
      Ue(n),
      je("p", {
        id: ce(C),
        class: "grid-sr",
        lang: e.a11y ? void 0 : "en"
      }, Ye(e.tapToMove ? `${H.value.instructions} ${H.value.tapInstructions}` : H.value.instructions), 9, Ct),
      e.onRemove ? (Ne(), Ae("p", {
        key: 0,
        id: ce(T),
        class: "grid-sr",
        lang: e.a11y ? void 0 : "en"
      }, Ye(H.value.removeInstructions), 9, Lt)) : it("", !0),
      je("p", {
        class: "grid-sr",
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        lang: e.a11y ? void 0 : "en"
      }, Ye(u.announcement), 9, Ot)
    ], 38));
  }
}, qt = /* @__PURE__ */ ut(Ft, [["__scopeId", "data-v-fc9097aa"]]);
export {
  lt as GRID_BOARD,
  qt as GridBoard,
  _t as GridTile,
  fe as IS_BROWSER,
  we as applyGravity,
  Te as copyTiles,
  Ze as getFrameDelta,
  st as getLastRow,
  Tt as getPointerOffset,
  Be as getTileById,
  Ie as moveTile,
  At as usePointerDragResize,
  Ve as validateTiles
};
//# sourceMappingURL=core.js.map
