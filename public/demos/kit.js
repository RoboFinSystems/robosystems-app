/*
 * Landing-page demo kit: the RoboSystems chrome for the animated product demos in
 * /demos/*.js, on the runtime from @robosystems/core.
 *
 * A demo module default-exports { width, height, total, poster, css, html,
 * setup(ctx) } where setup returns seek(t), a pure function of time. The same
 * module runs live on the landing page (mount, in a shadow root, looping while
 * visible) and frame by frame under the content machine's renderer
 * (render.html), so the page and the social cut share one source.
 *
 * runtime.js is core's demos/runtime.js, committed so the page and the
 * renderer need no build step: `npm run sync:demos` refreshes it after a core
 * bump, and a test fails while it differs from the installed package.
 */
import { mount as mountDemo } from './runtime.js'

export * from './runtime.js'

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

/* How nav() finds this app's sidebar and blends its item colours. */
const THEME = {
  side: '.rs-side',
  rest: [229, 231, 235],
  active: [27, 58, 87],
}

/* mount() with this app's chrome CSS and sidebar theme. */
export const mount = (host, def, opts = {}) =>
  mountDemo(host, def, { css: CSS, theme: THEME, ...opts })
