/*
 * Platform: one account, many graphs. The graph selector moves between a
 * shared repository and three tenant graphs of different kinds, and each
 * lands on its Dashboard as the app draws it: a repository shows no metrics
 * (its size is platform-managed) and a shorter sidebar. SEC EDGAR Filings and
 * Driftline Coffee Roasters carry their production figures (Driftline: 5,238
 * nodes, 12,338 relationships, created 2026-09-01); Meridian Ventures Fund I
 * and Coffee Sector Research, their counts, dates and every graph id are
 * illustrative.
 */
import {
  appChrome,
  CURSOR,
  eio,
  eo,
  pageHeader,
  PHONE_APP_CSS,
  pointer,
  seg,
  swap,
} from './kit.js'

const GRAPHS = [
  {
    name: 'SEC EDGAR Filings',
    kind: 'Repository',
    repo: true,
    id: 'sec',
    type: 'repository',
    role: ['read', 'b-info'],
  },
  {
    name: 'Driftline Coffee Roasters',
    kind: 'Graph',
    id: 'kg1f0c7a2e9b4d3',
    type: 'entity',
    role: ['admin', 'b-good'],
    ext: ['roboledger'],
    m: ['5.2K', '12.3K', '9/1/2026'],
    created: 'September 1, 2026',
  },
  {
    name: 'Meridian Ventures Fund I',
    kind: 'Graph',
    id: 'kg1f0d31b84c7a2',
    type: 'entity',
    role: ['admin', 'b-good'],
    ext: ['roboinvestor', 'roboledger'],
    m: ['1.9K', '4.4K', '9/12/2026'],
    created: 'September 12, 2026',
  },
  {
    name: 'Coffee Sector Research',
    kind: 'Graph',
    id: 'kg1f0e9a5d17e60',
    type: 'generic',
    role: ['admin', 'b-good'],
    ext: ['knowledge'],
    m: ['642', '1.5K', '9/20/2026'],
    created: 'September 20, 2026',
  },
]

// the order the selector visits them; the last switch returns to the first,
// so the loop wraps on the same screen it opened with
const ORDER = [0, 1, 2, 3, 0]
const SWITCH = [3.6, 7.4, 11.2, 15.0] // when each selection lands
const TOTAL = 18.2
// the sections a shared repository does not have
const GRAPH_ONLY = ['documents', 'memory', 'tables', 'schema', 'subgraphs']

const row = (label, value) =>
  `<div class="ir"><span>${label}</span><span>${value}</span></div>`

const dash = (g, i) => `<div class="view" id="v${i}">
    <div class="dh">${pageHeader(g.name, 'View metrics and manage your graph')}
      ${g.repo ? '<span class="badge b-info">Shared Repository</span>' : '<span class="btn ghost sm">Members</span>'}</div>
    ${
      g.m
        ? `<h3>Graph Metrics</h3><div class="stats">
      <div class="card"><label>Total Nodes</label><b>${g.m[0]}</b></div>
      <div class="card"><label>Relationships</label><b>${g.m[1]}</b></div>
      <div class="card"><label>Created</label><b>${g.m[2]}</b></div></div>`
        : ''
    }
    <div class="card info"><h3>${g.repo ? 'Repository' : 'Graph'} Information</h3>
      ${row('Graph ID', `<code>${g.id}</code>`)}
      ${row('Name', g.name)}
      ${row('Graph Type', g.type)}
      ${row('Your Role', `<span class="badge ${g.role[1]}">${g.role[0]}</span>`)}
      ${g.ext ? row('Schema Extensions', g.ext.map((e) => `<span class="badge b-purple">${e}</span>`).join(' ')) : ''}
      ${g.created ? row('Created', g.created) : ''}
    </div>
    <div class="qa">${[
      ['Console', 'Query and explore'],
      ['Backups', g.repo ? 'Download snapshots' : 'Manage backups'],
      ['Usage', 'Monitor consumption'],
      ['Settings', 'API keys & config'],
    ]
      .map((q) => `<div class="card"><b>${q[0]}</b><span>${q[1]}</span></div>`)
      .join('')}</div>
  </div>`

const menu = `<div class="dd" id="dd"><div class="ddh">Graph / Repository</div>
  ${GRAPHS.map((g, i) => `<div class="ddr" id="dr${i}"><span>${g.name}</span><em>${g.repo ? 'Repository' : g.ext.includes('roboinvestor') ? 'RoboInvestor' : g.ext.includes('roboledger') ? 'RoboLedger' : 'Custom'}</em></div>`).join('')}
  <div class="ddf"><span>+ Create Graph</span><span>Manage Graphs</span></div></div>`

const css = `
.view { position: absolute; inset: 26px 30px; opacity: 0; }
.dh { display: flex; align-items: flex-start; justify-content: space-between; }
.dh .vh h2 { font-size: 26px; white-space: nowrap; }
.btn.sm { font-size: 14px; padding: 7px 14px; }
h3 { font: 700 17px var(--display); margin-bottom: 10px; }
.stats { display: flex; gap: 12px; margin-bottom: 16px; }
.stats .card { flex: 1; padding: 12px 16px; }
.stats label { display: block; font-size: 13px; color: var(--muted); }
.stats b { font: 700 24px var(--mono); }
.info { padding: 14px 18px; margin-bottom: 16px; }
.ir { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid var(--line); font-size: 15px; }
.ir:first-of-type { border-top: 0; }
.ir span:first-child { color: var(--muted); }
.ir code { font: 14px var(--mono); }
.ir .badge { font-size: 13px; padding: 3px 9px; }
.qa { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.qa .card { padding: 12px 14px; }
.qa b { display: block; font-size: 16px; } .qa span { font-size: 13px; color: var(--muted); }
.rs-top .gs { position: relative; }
.dd { position: absolute; left: 0; top: 50px; width: 360px; z-index: 30; background: #0b0f16; border: 1px solid #374151;
  border-radius: 12px; padding: 8px; opacity: 0; pointer-events: none; }
.ddh { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); padding: 6px 10px 8px; }
.ddr { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-radius: 8px; font-size: 16px; font-weight: 600; }
.ddr em { font-style: normal; font-size: 12px; color: var(--muted); font-weight: 500; }
.ddf { display: flex; justify-content: space-between; border-top: 1px solid var(--line); margin-top: 6px; padding: 10px 10px 4px; font-size: 14px; color: var(--c300); }
.rs-side .nv { overflow: hidden; }
`

function setup(ctx) {
  const { $, root } = ctx
  // the selector in the top bar names the current graph; the menu hangs off it
  const gs = root.querySelector('.gs')
  gs.innerHTML = `<i id="gk"></i><span id="gn"></span><b>▾</b>${menu}`
  const items = GRAPH_ONLY.map((k) => root.querySelector(`.nv[data-k="${k}"]`))

  return (t) => {
    // k: how many selections have landed; the pointer works toward the next one
    let k = 0
    SWITCH.forEach((s) => (k += t >= s ? 1 : 0))
    const cur = ORDER[k]
    const prev = ORDER[Math.max(0, k - 1)]
    const since = k ? t - SWITCH[k - 1] : 99
    const f = k ? eio(seg(since, 0, 0.45)) : 1

    // dashboards crossfade on each selection
    GRAPHS.forEach((_, i) => {
      const v = $('v' + i)
      const p = i === cur ? f : i === prev && cur !== prev ? 1 - f : 0
      v.style.opacity = p * eo(seg(t, 0, 0.4))
      v.style.transform = `translateY(${(1 - p) * 10}px)`
    })
    // a repository hides five sections; they fold away and back
    const repoAt = (i) => (GRAPHS[i].repo ? 0 : 1)
    const h = repoAt(prev) + (repoAt(cur) - repoAt(prev)) * f
    items.forEach((el) => {
      el.style.height = 40 * h + 'px'
      el.style.paddingTop = el.style.paddingBottom = 9 * h + 'px'
      el.style.marginBottom = 2 * h + 'px'
      el.style.opacity = h
    })
    ctx.nav('dashboard')
    // the selector's label changes through a dip, not in one frame
    const at = k ? SWITCH[k - 1] + 0.2 : 0
    swap($('gn'), t, at, GRAPHS[prev].name, GRAPHS[cur].name)
    swap($('gk'), t, at, GRAPHS[prev].kind, GRAPHS[cur].kind)

    // the switch in play: the one just made while its menu and pointer fade
    // out, else the next one (pointer to the selector, open the menu, pick)
    const j = k && t < SWITCH[k - 1] + 0.6 ? k - 1 : k
    const next = SWITCH[j]
    const dd = $('dd')
    if (next !== undefined) {
      const target = $('dr' + ORDER[j + 1])
      const open =
        eo(seg(t, next - 1.05, next - 0.8)) *
        (1 - eio(seg(t, next, next + 0.4)))
      dd.style.opacity = open
      dd.style.transform = `translateY(${(1 - open) * -6}px)`
      GRAPHS.forEach((_, i) => {
        const r = $('dr' + i)
        const on = i === ORDER[j + 1] ? seg(t, next - 0.4, next - 0.2) : 0
        r.style.background = `rgba(59,122,245,${0.25 * on})`
      })
      if (t < next - 0.85)
        pointer(ctx, $('cur'), gs, t, next - 1.6, next - 1.1, { out: 0.3 })
      else {
        const a = ctx.rel(gs)
        const b = ctx.rel(target)
        pointer(ctx, $('cur'), target, t, next - 0.75, next - 0.3, {
          from: [
            a.x + a.w * 0.55 - (b.x + b.w * 0.55),
            a.y + a.h * 0.55 - (b.y + b.h * 0.55),
          ],
          out: 0.5,
        })
      }
    } else {
      dd.style.opacity = 0
      $('cur').style.opacity = 0
    }
  }
}

const phoneCss = `
.view { inset: 18px 20px; }
.dh .vh h2 { font-size: 26px; white-space: normal; } .dh .vh p { font-size: 17px; }
h3 { font-size: 21px; }
.stats label { font-size: 16px; } .stats b { font-size: 28px; }
.ir { font-size: 20px; padding: 11px 0; } .ir code { font-size: 18px; }
.ir .badge { font-size: 16px; padding: 4px 10px; }
.qa { grid-template-columns: repeat(2, 1fr); }
.qa b { font-size: 20px; } .qa span { font-size: 16px; }
.dd { width: 460px; left: auto; right: 0; }
.ddh { font-size: 14px; } .ddr { font-size: 20px; } .ddr em { font-size: 14px; } .ddf { font-size: 17px; }
`

export default {
  width: 1200,
  height: 820,
  total: TOTAL,
  poster: 5.5,
  css,
  html:
    appChrome({
      active: 'dashboard',
      nav: 'graph',
      graph: '',
      main: GRAPHS.map(dash).join(''),
    }) + CURSOR.replace('class="cursor"', 'class="cursor" id="cur"'),
  setup,
  mobile: { width: 720, height: 880, css: PHONE_APP_CSS + phoneCss },
}
