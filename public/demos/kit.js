/*
 * Landing-page demo kit: the runtime and the shared RoboSystems chrome for the
 * animated product demos in /demos/*.js.
 *
 * A demo module default-exports { width, height, total, poster, css, html,
 * setup(ctx) } where setup returns seek(t), a pure function of time. The same
 * module runs live on the landing page (mount, in a shadow root, looping while
 * visible) and frame by frame under the content machine's renderer
 * (render.html), so the page and the social cut share one source. The runtime
 * is the one roboledger-app's kit carries; the chrome is this app's.
 */

export const clamp01 = (x) => Math.max(0, Math.min(1, x))
export const seg = (t, a, b) => clamp01((t - a) / (b - a))
export const eo = (x) => 1 - Math.pow(1 - clamp01(x), 3)
export const eio = (x) => {
  x = clamp01(x)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
export const typed = (s, t, t0, cps = 34) =>
  s.slice(0, Math.max(0, Math.floor((t - t0) * cps)))
export const spin = (t) => '◐◓◑◒'[Math.floor(t * 8) % 4]
export const money = (v, dp = 2) =>
  '$' +
  v.toLocaleString('en-US', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })

export function rise(el, p, dy = 40) {
  el.style.opacity = p
  el.style.transform = `translateY(${(1 - p) * dy}px)`
}

/* Opacity for an element whose content changes at `at`: dips through 0.15 over `d` seconds. */
export const dip = (t, at, d = 0.3) =>
  Math.min(1, 0.15 + 0.85 * (Math.abs(t - at) / (d / 2)))

/*
 * Change a label or badge without a one-frame pop: before `at` it shows `a`,
 * after it `b` (text, and optional class names), with an opacity dip across
 * the change.
 */
export function swap(el, t, at, a, b, cls) {
  const after = t >= at
  if (a != null) el.textContent = after ? b : a
  if (cls) el.className = after ? cls[1] : cls[0]
  el.style.opacity = dip(t, at)
  return after
}

/* A badge that moves through states at `times`: texts[k] and classes[k], dipping at each change. */
export function steps(el, t, times, texts, classes) {
  let k = 0
  times.forEach((x) => (k += t >= x ? 1 : 0))
  if (texts) el.textContent = texts[k]
  if (classes) el.className = classes[k]
  el.style.opacity = Math.min(1, ...times.map((x) => dip(t, x)))
  return k
}

/* Headline entrance: blur to sharp, rising, as p goes 0 to 1. */
export function blurIn(el, p, dy = 24) {
  const e = eo(p)
  el.style.opacity = clamp01(p * 1.4)
  el.style.filter = e < 1 ? `blur(${(1 - e) * 14}px)` : ''
  el.style.transform = `translateY(${(1 - e) * dy}px)`
}

/*
 * A slow camera push over the loop toward (ox, oy), in stage px, easing back
 * before the loop wraps, so no screen sits still like a slide.
 */
export function push(el, t, total, ox, oy, amount = 0.04) {
  const k =
    amount *
    eio(seg(t, 0.4, total - 1.2)) *
    (1 - eio(seg(t, total - 1.2, total)))
  el.style.transformOrigin = `${ox}px ${oy}px`
  el.style.transform = `scale(${1 + k})`
}

/* A drawn pointer that travels from `from` to the centre of `el`, presses, and fades out. */
export function pointer(
  ctx,
  cur,
  el,
  t,
  t0,
  t1,
  { from = [260, 160], out = 0.6 } = {}
) {
  if (t < t0 - 0.15 || t > t1 + out) {
    cur.style.opacity = 0
    return t > t1
  }
  const r = ctx.rel(el)
  const tx = r.x + r.w * 0.55
  const ty = r.y + r.h * 0.55
  const m = eio(seg(t, t0, t1))
  cur.style.left = tx + (1 - m) * from[0] + 'px'
  cur.style.top = ty + (1 - m) * from[1] + 'px'
  cur.style.opacity =
    seg(t, t0 - 0.15, t0) * (1 - seg(t, t1 + out - 0.2, t1 + out))
  const pressed = t > t1 && t < t1 + 0.18
  cur.style.transform = `scale(${pressed ? 0.85 : 1})`
  return t > t1
}

/*
 * The sidebar as the app draws it: a repository (sec) shows the short list,
 * a user graph the full one (src/app/(app)/sidebar-config.tsx).
 */
const NAV = {
  repo: [
    ['home', 'Home'],
    ['dashboard', 'Dashboard'],
    ['console', 'Console'],
    ['search', 'Search'],
    ['backups', 'Backups'],
    ['usage', 'Usage'],
    ['mcp', 'MCP'],
    ['repositories', 'Repositories'],
  ],
  graph: [
    ['home', 'Home'],
    ['dashboard', 'Dashboard'],
    ['console', 'Console'],
    ['search', 'Search'],
    ['documents', 'Knowledge Base'],
    ['memory', 'Memory'],
    ['tables', 'Data Lake'],
    ['schema', 'Schema'],
    ['subgraphs', 'Subgraphs'],
    ['backups', 'Backups'],
    ['usage', 'Usage'],
    ['mcp', 'MCP'],
    ['repositories', 'Repositories'],
  ],
}

export const ICON = '/images/logos/robosystems-icon.png'
export const tile = (size, radius) =>
  `<span class="tile" style="width:${size}px;height:${size}px;border-radius:${radius}px"><img src="${ICON}" alt=""></span>`

/* The RoboSystems app window: top bar with the graph selector, sidebar, and `main`. */
export function appChrome({
  active,
  main,
  nav = 'repo',
  graph = 'SEC Repository',
  org = 'Northwind Research',
  id = '',
}) {
  const items = NAV[nav]
    .map(
      ([k, label]) =>
        `<div class="nv${k === active ? ' on' : ''}" data-k="${k}">${label}</div>`
    )
    .join('')
  return `<div class="rs-app"${id ? ` id="${id}"` : ''}>
    <div class="rs-top">${tile(36, 10)}<span class="wm">RoboSystems</span><span class="gs"><i>${nav === 'repo' ? 'Repository' : 'Graph'}</i>${graph}<b>▾</b></span></div>
    <div class="rs-side"><div class="org">${org}</div><div class="nvs"><div class="pill"></div>${items}</div></div>
    <div class="rs-main" data-loop>${main}</div>
  </div>`
}

export const pageHeader = (title, sub) =>
  `<div class="vh">${tile(54, 13)}<div><h2>${title}</h2><p>${sub}</p></div></div>`

export const CURSOR = `<svg class="cursor" viewBox="0 0 24 24"><path d="M3 2l7 19 2.6-7.4L20 11z" fill="#fff" stroke="#000" stroke-width="1.2"/></svg>`

const CSS = `
:host { display: block; }
.stage { position: absolute; left: 0; top: 0; transform-origin: 0 0; overflow: hidden;
  --bg: #04070c; --ink: #f3f6fb; --muted: #9aa3b2; --dim: #636b7a;
  --c300: #67E8F9; --c400: #22D3EE; --c500: #06B6D4; --c600: #0891B2;
  --b300: #93BBFD; --b400: #6098FA; --b500: #3B7AF5; --b600: #2563EB;
  --i300: #A5B4FC; --i400: #818CF8; --i500: #6366F1;
  --card: #0f1116; --card2: #161a21; --line: #1f2937; --row: #12151b;
  --good: #34d399; --bad: #f87171; --warn: #fbbf24; --purple: #c084fc;
  --display: 'Orbitron', 'Space Grotesk', sans-serif;
  --body: 'Space Grotesk', system-ui, sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: #000; color: var(--ink); font-family: var(--body);
  -webkit-font-smoothing: antialiased; line-height: 1.3;
  text-align: left; font-size: 16px; font-weight: 400; font-style: normal; letter-spacing: normal; text-transform: none; }
:where(.stage *) { box-sizing: border-box; margin: 0; padding: 0; }
.grad { background: linear-gradient(90deg, var(--c400), var(--b400) 50%, var(--i400));
  -webkit-background-clip: text; background-clip: text; color: transparent; }
.tile { display: inline-grid; place-items: center; flex-shrink: 0; overflow: hidden;
  background: linear-gradient(135deg, var(--c500), var(--b500) 55%, var(--i500)); }
.tile img { mix-blend-mode: screen; width: 100%; height: 100%; }
.cursor { position: absolute; width: 34px; height: 34px; z-index: 40; opacity: 0; pointer-events: none;
  transform-origin: 20% 10%; }

.rs-app { position: absolute; inset: 0; background: #000; overflow: hidden; }
.rs-top { position: absolute; left: 0; right: 0; top: 0; height: 62px; border-bottom: 1px solid var(--line);
  display: flex; align-items: center; gap: 14px; padding: 0 22px; }
.rs-top .wm { font: 700 23px var(--display); }
.rs-top .gs { margin-left: 26px; padding: 7px 14px; border-radius: 10px; background: #111827;
  border: 1px solid #374151; font-size: 17px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.rs-top .gs i { font-style: normal; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.rs-top .gs b { color: var(--muted); font-size: 13px; }
.rs-side { position: absolute; top: 62px; bottom: 0; left: 0; width: 200px; background: #09090b;
  border-right: 1px solid var(--line); padding: 12px 12px; }
.rs-side .org { font-size: 15px; font-weight: 600; color: #d1d5db; padding: 8px 10px 14px; margin-bottom: 10px;
  border-bottom: 1px solid var(--line); }
.rs-side .nvs { position: relative; }
.rs-side .nv { position: relative; font-size: 17px; padding: 9px 12px; border-radius: 9px; margin-bottom: 2px; color: #e5e7eb; }
.rs-side .nv.on { color: #1B3A57; }
.rs-side .pill { position: absolute; left: 0; right: 0; height: 40px; border-radius: 9px; background: #BFDBFE; }
.rs-main { position: absolute; top: 62px; left: 200px; right: 0; bottom: 0; padding: 26px 30px; }

.vh { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.vh h2 { font: 700 30px var(--display); }
.vh p { font-size: 16px; color: var(--muted); margin-top: 4px; }
table { width: 100%; border-collapse: collapse; }
th { background: #1f2937; color: #cbd5e1; font-size: 14px; letter-spacing: .06em; text-transform: uppercase;
  text-align: left; padding: 12px 16px; font-weight: 600; }
th:first-child { border-top-left-radius: 10px; } th:last-child { border-top-right-radius: 10px; }
th.n, td.n { text-align: right; }
td { background: var(--row); padding: 13px 16px; font-size: 18px; border-top: 1px solid #0b0d12; }
td.n { font-family: var(--mono); font-size: 17px; }
tr.tot td { font-weight: 700; }
.btn { display: inline-block; padding: 10px 20px; border-radius: 10px; font-size: 17px; font-weight: 600; }
.btn.go { background: linear-gradient(90deg, var(--c500), var(--b500)); color: #fff; }
.btn.ok { background: #059669; color: #fff; }
.btn.ghost { border: 1px solid var(--line); color: var(--muted); }
.badge { display: inline-block; padding: 5px 11px; border-radius: 7px; font-size: 14px; font-weight: 700; }
.b-info { background: rgba(96,152,250,.16); color: var(--b300); }
.b-good { background: rgba(52,211,153,.15); color: var(--good); }
.b-warn { background: rgba(251,191,36,.15); color: var(--warn); }
.b-purple { background: rgba(192,132,252,.16); color: var(--purple); }
.b-ind { background: rgba(129,140,248,.18); color: var(--i300); }
.b-mute { background: #1f2937; color: #cbd5e1; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; }
.hl { position: absolute; border: 2px solid var(--c400); border-radius: 10px;
  pointer-events: none; opacity: 0; z-index: 5; }

/* the Console's terminal card */
.term { background: #030712; border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; font-family: var(--mono); }
.term .meta { font-size: 12px; color: #374151; letter-spacing: .06em; margin-bottom: 4px; }
.term .m { font-size: 17px; line-height: 1.45; margin-bottom: 14px; }
.term .m-user { color: #4ade80; } .term .m-user:before { content: '$ '; }
.term .m-sys { color: var(--c400); }
.term .m-res { color: #d1d5db; font-family: var(--body); font-size: 18px; }
.term .m-res b { color: var(--c300); font-weight: 600; }
.cy { border: 1px solid #1e293b; border-radius: 10px; margin: 6px 0 14px; overflow: hidden; }
.cy .cyh { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #0b1220;
  font-size: 12px; letter-spacing: .12em; color: var(--muted); }
.cy .cyh span:last-child { color: var(--c400); border: 1px solid rgba(34,211,238,.4); border-radius: 6px; padding: 2px 10px; letter-spacing: 0; font-size: 13px; }
.cy pre { padding: 10px 14px; color: var(--c300); font: 15px/1.5 var(--mono); white-space: pre; }
.dt { border: 1px solid #1e293b; border-radius: 10px; overflow: hidden; }
.dt .dth { display: flex; gap: 18px; padding: 8px 12px; background: #0b1220; font-size: 13px; color: var(--muted); }
.dt .dth span:first-child { margin-right: auto; }
.dt table th { background: #0b1220; color: var(--c400); text-transform: none; letter-spacing: 0; font: 600 14px var(--mono); border-radius: 0; }
.dt table td { background: #030712; font: 16px var(--mono); padding: 9px 16px; }
.foot { font-size: 13px; color: #4b5563; margin-top: 8px; }

/* a chat in the viewer's own MCP client */
.ub { align-self: flex-end; max-width: 540px; background: #13233f; border: 1px solid #1f3b66;
  border-radius: 22px 22px 6px 22px; padding: 16px 22px; font-size: 26px; line-height: 1.35; min-height: 66px; }
.tool { border: 1px solid var(--line); background: var(--card); border-radius: 16px; padding: 14px 18px; }
.tool .tn { font: 600 19px var(--mono); color: var(--c300); display: flex; justify-content: space-between; }
.tool .tr { font-size: 20px; color: var(--muted); margin-top: 8px; min-height: 1px; }
.tool .st { font: 500 17px var(--mono); }
.ans { font-size: 26px; line-height: 1.45; min-height: 40px; }
.ans b { color: var(--c300); font-weight: 600; }
`

function makeCtx(root, stage, getScale) {
  const $ = (id) => root.getElementById(id)
  const rel = (el) => {
    const s = stage.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const k = getScale()
    return {
      x: (r.left - s.left) / k,
      y: (r.top - s.top) / k,
      w: r.width / k,
      h: r.height / k,
    }
  }
  /* ring `hl` (absolutely positioned in its offsetParent) around `target` */
  const ring = (hl, target, p, pad = 6) => {
    // a hidden scene has no layout to measure; skip rather than throw
    if (!hl.offsetParent) {
      hl.style.opacity = 0
      return
    }
    const a = rel(target)
    const b = rel(hl.offsetParent)
    // a camera push scales the parent; undo it so the ring sits in its local px
    const k = b.w / hl.offsetParent.offsetWidth || 1
    hl.style.left = (a.x - b.x) / k - pad + 'px'
    hl.style.top = (a.y - b.y) / k - pad * 0.7 + 'px'
    hl.style.width = a.w / k + pad * 2 + 'px'
    hl.style.height = a.h / k + pad * 1.4 + 'px'
    hl.style.opacity = p
  }
  /* slide the sidebar pill inside `scope` to `k`, blending from `from` by m */
  const nav = (k, from = k, m = 1, scope = root) => {
    const side = scope.querySelector('.rs-side')
    if (!side) return
    const y = (key) => side.querySelector(`[data-k="${key}"]`).offsetTop
    side.querySelector('.pill').style.top =
      y(from) + (y(k) - y(from)) * eio(m) + 'px'
    // the active item's colour blends across the move instead of switching
    const w = eio(m)
    side.querySelectorAll('.nv').forEach((d) => {
      const key = d.dataset.k
      const on = (key === k ? w : 0) + (key === from && from !== k ? 1 - w : 0)
      const c = [229, 231, 235].map((v, i) =>
        Math.round(v + ([27, 58, 87][i] - v) * on)
      )
      d.classList.remove('on')
      d.style.color = `rgb(${c.join(',')})`
    })
  }
  return { $, root, stage, rel, ring, nav }
}

/* The phone layout of a demo: its `mobile` block overrides the stage size and adds CSS. */
export function variant(def, phone) {
  if (!phone || !def.mobile) return def
  return {
    ...def,
    ...def.mobile,
    css: (def.css || '') + (def.mobile.css || ''),
  }
}

/* Shared phone CSS for the app-screen demos: no sidebar, larger type. */
export const PHONE_APP_CSS = `
.rs-side { display: none; }
.rs-main { left: 0; padding: 20px 22px; }
.rs-top { height: 58px; } .rs-main { top: 58px; }
.rs-top .wm { font-size: 20px; } .rs-top .gs { margin-left: auto; font-size: 15px; padding: 6px 12px; }
.rs-top .gs i { display: none; }
.vh { margin-bottom: 16px; } .vh h2 { font-size: 26px; } .vh p { font-size: 14px; }
th { padding: 10px 12px; font-size: 13px; }
td { padding: 11px 12px; font-size: 17px; } td.n { font-size: 16px; white-space: nowrap; }
`

/* Phones: screens narrower than Tailwind's sm breakpoint get a demo's phone layout. */
const PHONE = '(max-width: 639px)'

/*
 * Mount a demo into `host` (a shadow root keeps its CSS off the page). With
 * autoplay it scales to the host's width, uses the phone layout on narrow
 * screens, loops while on screen, and holds the poster frame for reduced
 * motion; without, it sits at native size for the renderer (`phone` picks the
 * phone layout there).
 */
export function mount(host, def, { autoplay = true, phone = false } = {}) {
  const root = host.shadowRoot || host.attachShadow({ mode: 'open' })
  let scale = 1
  let v
  let stage
  let seek
  const build = (isPhone) => {
    v = variant(def, isPhone)
    root.innerHTML = `<style>${CSS}${v.css || ''}</style>
    <div class="stage" style="width:${v.width}px;height:${v.height}px">${v.html}</div>`
    stage = root.querySelector('.stage')
    const ctx = makeCtx(root, stage, () => scale)
    // every window starts with its pill under the item appChrome marked active
    root.querySelectorAll('.rs-app').forEach((app) => {
      const on = app.querySelector('.nv.on')
      if (on) ctx.nav(on.dataset.k, on.dataset.k, 1, app)
    })
    const pose = v.setup(ctx)
    // [data-loop] content fades in at the start of the loop and out at its end,
    // so the wrap back to the first frame is a dissolve, not a jump.
    const looped = [...root.querySelectorAll('[data-loop]')]
    const total = v.total
    seek = (t) => {
      pose(t)
      const f = Math.min(seg(t, 0, 0.35), 1 - seg(t, total - 0.35, total))
      looped.forEach((el) => (el.style.opacity = f))
    }
  }
  const poster = def.poster ?? 0

  if (!autoplay) {
    build(phone)
    seek(poster)
    return { seek: (t) => seek(t), destroy() {} }
  }

  const phoneQuery = matchMedia(PHONE)
  const fit = () => {
    scale = host.clientWidth / v.width || 1
    stage.style.transform = `scale(${scale})`
  }
  build(phoneQuery.matches)
  fit()
  const ro = new ResizeObserver(fit)
  ro.observe(host)

  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  let t = poster
  let started = false
  let last = null
  let raf = 0
  let visible = false
  seek(t)

  const loop = (now) => {
    if (last != null) t = (t + Math.min(0.1, (now - last) / 1000)) % def.total
    last = now
    seek(t)
    raf = requestAnimationFrame(loop)
  }
  const update = () => {
    cancelAnimationFrame(raf)
    last = null
    if (reduce.matches) {
      t = poster
      seek(t)
      return
    }
    if (visible && !document.hidden) {
      if (!started) {
        started = true
        t = 0
      }
      raf = requestAnimationFrame(loop)
    } else seek(t)
  }
  const relayout = () => {
    build(phoneQuery.matches)
    fit()
    update()
  }
  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting
      update()
    },
    { threshold: 0.2 }
  )
  io.observe(host)
  document.addEventListener('visibilitychange', update)
  reduce.addEventListener('change', update)
  phoneQuery.addEventListener('change', relayout)

  return {
    seek: (x) => seek(x),
    destroy() {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', update)
      reduce.removeEventListener('change', update)
      phoneQuery.removeEventListener('change', relayout)
    },
  }
}
