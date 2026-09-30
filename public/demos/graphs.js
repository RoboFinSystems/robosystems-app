/*
 * Platform: one account, many graphs, and one console that follows the graph
 * you pick. The selector goes from Driftline Coffee Roasters to a RoboInvestor
 * fund graph and on to the shared SEC repository, each landing on its
 * Dashboard as the app draws it: a repository shows no metrics (its size is
 * platform-managed) and a shorter sidebar. On SEC the Console quick action
 * opens the drawer from the bar along the bottom and compares the public
 * coffee roasters' gross margins. With the drawer still open the selector goes
 * back to Driftline; the console resets for the new graph, as the app's does,
 * and answers from the company's own books: who owes the most, then a /recall
 * of what the team saved about that account. Closing the drawer returns to
 * the opening frame.
 *
 * SEC EDGAR Filings and Driftline carry their production figures (Driftline:
 * 5,238 nodes, 12,338 relationships, created 2026-09-01); Meridian Ventures
 * Fund I and Coffee Sector Research (listed in the menu, not visited), their
 * counts, dates and every graph id are illustrative. Peer margins are from the
 * latest two 10-Ks of Coffee Holding (JVA, FY ended 2025-10-31), Farmer Bros
 * (FARM, 2025-06-30) and Westrock Coffee (WEST, 2025-12-31), as in the hero.
 * Driftline's receivables are $153,333.33 at 2026-08-31 with $128,000 from
 * Summit Markets (the split across the three café accounts is illustrative,
 * as on roboledger.ai); the memory is quoted from the ones its demo seeds.
 * Timings, credits and scores are illustrative.
 */
import {
  appChrome,
  CURSOR,
  eio,
  eo,
  pageHeader,
  PHONE_APP_CSS,
  pointer,
  rise,
  seg,
  spin,
  swap,
  typed,
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

// the order the selector visits them: out from Driftline and back to it, so
// the loop wraps on the screen it opened with
const ORDER = [1, 2, 0, 1]
const SWITCH = [3.6, 7.4, 15.8] // when each selection lands
// the sections a shared repository does not have
const GRAPH_ONLY = [
  'documents',
  'memory',
  'tables',
  'schema',
  'subgraphs',
  'activity',
]

// the console: SEC's Console card opens the drawer, one exchange there, the
// switch back to Driftline resets it, two exchanges there, then the bar's
// chevron closes it. Each exchange is [type at, send at, result at].
const PRESS = 8.7
const OPENED = PRESS + 0.5
const RESET = SWITCH[2] + 0.1
const T = [
  [9.5, 11.2, 11.7],
  [17.0, 18.1, 18.6],
  [22.0, 22.7, 23.1],
]
const CLOSE = 25.9
const TOTAL = 27.4

const Q = [
  'Compare gross margins for coffee roasters JVA, FARM and WEST',
  'Which customers owe us the most?',
  '/recall Summit Markets',
]

const PEER_CYPHER = `MATCH (e:Entity)-[:ENTITY_HAS_REPORT]->(:Report)
      -[:REPORT_HAS_FACT]->(f:Fact {has_dimensions: false}),
      (f)-[:FACT_HAS_ELEMENT]->(el:Element),
      (f)-[:FACT_HAS_PERIOD]->(p:Period {duration_type: 'annual'})
WHERE e.ticker IN ['JVA', 'FARM', 'WEST']
  AND el.canonical_concept IN ['revenue', 'gross_profit']
RETURN e.ticker, p.end_date, el.canonical_concept, f.value`

const MARGINS = [
  ['JVA', '2025-10-31', '20.4%', '16.0%'],
  ['FARM', '2025-06-30', '39.3%', '43.5%'],
  ['WEST', '2025-12-31', '18.1%', '12.7%'],
]

const OWED_CYPHER = `MATCH (e:Event)-[:EVENT_INVOLVES_AGENT]->(a:Agent)
WHERE a.agent_type = 'customer' AND e.event_type = 'invoice'
RETURN a.name AS customer, sum(e.open_amount) AS owed
ORDER BY owed DESC`

const OWED = [
  ['Summit Markets', '128,000.00'],
  ['Pioneer Square Cafés', '9,120.00'],
  ['Emerald City Grocers', '8,440.00'],
  ['Cascadia Coffee Bars', '7,773.33'],
]

const RULE = '═'.repeat(48)

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
      .map(
        (q, k) =>
          `<div class="card"${k ? '' : ` id="qc${i}"`}><b>${q[0]}</b><span>${q[1]}</span></div>`
      )
      .join('')}</div>
  </div>`

const menu = `<div class="dd" id="dd"><div class="ddh">Graph / Repository</div>
  ${GRAPHS.map((g, i) => `<div class="ddr" id="dr${i}"><span>${g.name}</span><em>${g.repo ? 'Repository' : g.ext.includes('roboinvestor') ? 'RoboInvestor' : g.ext.includes('roboledger') ? 'RoboLedger' : 'Custom'}</em></div>`).join('')}
  <div class="ddf"><span>+ Create Graph</span><span>Manage Graphs</span></div></div>`

const user = (i, time) =>
  `<div class="meta">${time} - USER</div><div class="m m-user" id="u${i}"></div>`

// the console panel: no page header in the drawer, the terminal fills it. One
// feed per graph, since switching graphs clears the console.
const panel = `<div class="term" id="term">
  <div class="feed" id="fs">
    <div class="ex" id="x0">${user(0, '09:11')}
      <div class="rs" id="r0"><div class="meta">09:11 - RESULT</div>
        <div class="m m-res">Farmer Bros is highest at <b>43.5%</b>, up from 39.3%. Coffee Holding and Westrock are in the teens, and both fell.</div>
        <div class="cy"><div class="cyh"><span>GENERATED CYPHER</span><span>Run</span></div><pre>${PEER_CYPHER}</pre></div>
        <div class="dt"><div class="dth"><span>3 rows</span><span>Copy JSON</span><span>Download CSV</span></div>
          <table><tr><th>ticker</th><th>fiscal_year_end</th><th class="n">gross_margin_prior</th><th class="n">gross_margin</th></tr>
          ${MARGINS.map((r, i) => `<tr id="m${i}"><td>${r[0]}</td><td>${r[1]}</td><td class="n">${r[2]}</td><td class="n">${r[3]}</td></tr>`).join('')}
          </table></div>
        <div class="foot">Query completed in 412ms · Rows returned: 3 · Credits used: 0.6</div></div>
    </div>
  </div>
  <div class="feed" id="fd">
    <div class="ex" id="bn"><div class="meta">09:12 - SYSTEM</div>
      <div class="m m-sys">${RULE}
Graph context changed: sec → ${GRAPHS[1].id}
${RULE}

Console has been reset for the new graph context.
All queries will now execute against: ${GRAPHS[1].id}</div></div>
    <div class="ex" id="x1">${user(1, '09:12')}
      <div class="rs" id="r1"><div class="meta">09:12 - RESULT</div>
        <div class="m m-res">Summit Markets holds <b>$128,000 of the $153,333</b> in receivables, 83.5% of the total.</div>
        <div class="cy"><div class="cyh"><span>GENERATED CYPHER</span><span>Run</span></div><pre>${OWED_CYPHER}</pre></div>
        <div class="dt"><div class="dth"><span>4 rows</span><span>Copy JSON</span><span>Download CSV</span></div>
          <table><tr><th>customer</th><th class="n">owed</th></tr>
          ${OWED.map((r, i) => `<tr id="o${i}"><td>${r[0]}</td><td class="n">${r[1]}</td></tr>`).join('')}
          </table></div>
        <div class="foot">Query completed in 296ms · Rows returned: 4 · Credits used: 0.4</div></div>
    </div>
    <div class="ex" id="x2">${user(2, '09:13')}
      <div class="rs" id="r2"><div class="meta">09:13 - RESULT</div>
        <div class="hitline"><span class="badge b-info">0.93</span><span class="badge b-good">fact</span><span class="badge b-ind">mcp</span><span class="badge b-purple">summit-markets</span><span class="badge b-purple">credit-risk</span></div>
        <div class="m m-res quote mem">“Summit Markets is the largest wholesale account and pays slowly — net-30 terms but <b>balances routinely age past 60 days</b>, and Summit is a concentrated share of total AR.”</div></div>
    </div>
  </div><div class="hl" id="hl"></div></div>
  <div class="prompt"><span>$</span><span id="pr"></span><span class="caret" id="caret"></span></div>`

const css = `
.view { position: absolute; inset: 26px 30px 66px; opacity: 0; }
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

.dwb { display: flex; flex-direction: column; }
.dwb .term { position: relative; flex: 1; min-height: 0; overflow: hidden; padding: 0; }
.feed { position: absolute; left: 20px; right: 20px; top: 16px; }
.ex { margin-bottom: 18px; }
.rs { opacity: 0; }
.term .m-sys { white-space: pre; font-size: 15px; }
.hitline { display: flex; align-items: center; gap: 8px; margin: 4px 0 10px; flex-wrap: wrap; }
.quote { border-left: 3px solid var(--b400); padding-left: 14px; }
.quote.mem { border-left-color: var(--i400); }
.cy pre { font-size: 14px; }
.dt { margin-top: 8px; }
.dt table td { font-size: 16px; }
.dt table td:first-child { font-family: var(--body); }
.prompt { flex-shrink: 0; margin: 0 20px 16px; display: flex; align-items: center; gap: 10px; padding: 12px 18px;
  border: 1px solid var(--line); border-radius: 12px; background: #030712; font: 17px var(--mono); color: #d1d5db; min-height: 50px; }
.prompt span:first-child { color: #4ade80; }
.caret { width: 9px; height: 20px; background: #4ade80; }
`

function setup(ctx) {
  const { $, root, stage } = ctx
  // the selector in the top bar names the current graph; the menu hangs off it
  const gs = root.querySelector('.gs')
  gs.innerHTML = `<i id="gk"></i><span id="gn"></span><b>▾</b>${menu}`
  const items = GRAPH_ONLY.map((k) => root.querySelector(`.nv[data-k="${k}"]`))
  const ex = [0, 1, 2].map((i) => $('x' + i))

  const switches = (t, cur, drive) => {
    let k = 0
    SWITCH.forEach((s) => (k += t >= s ? 1 : 0))
    const now = ORDER[k]
    const prev = ORDER[Math.max(0, k - 1)]
    const since = k ? t - SWITCH[k - 1] : 99
    const f = k ? eio(seg(since, 0, 0.45)) : 1

    // dashboards crossfade on each selection
    GRAPHS.forEach((_, i) => {
      const v = $('v' + i)
      const p = i === now ? f : i === prev && now !== prev ? 1 - f : 0
      v.style.opacity = p * eo(seg(t, 0, 0.4))
      v.style.transform = `translateY(${(1 - p) * 10}px)`
    })
    // a repository hides six sections; they fold away and back
    const repoAt = (i) => (GRAPHS[i].repo ? 0 : 1)
    const h = repoAt(prev) + (repoAt(now) - repoAt(prev)) * f
    items.forEach((el) => {
      el.style.height = 40 * h + 'px'
      el.style.paddingTop = el.style.paddingBottom = 9 * h + 'px'
      el.style.marginBottom = 2 * h + 'px'
      el.style.opacity = h
    })
    ctx.nav('dashboard')
    // the selector's label changes through a dip, not in one frame
    const at = k ? SWITCH[k - 1] + 0.2 : 0
    swap($('gn'), t, at, GRAPHS[prev].name, GRAPHS[now].name)
    swap($('gk'), t, at, GRAPHS[prev].kind, GRAPHS[now].kind)

    // the switch in play: the one just made while its menu and pointer fade
    // out, else the next one (pointer to the selector, open the menu, pick)
    const j = k && t < SWITCH[k - 1] + 0.6 ? k - 1 : k
    const next = SWITCH[j]
    const dd = $('dd')
    if (next === undefined) {
      dd.style.opacity = 0
      return
    }
    const target = $('dr' + ORDER[j + 1])
    const open =
      eo(seg(t, next - 1.05, next - 0.8)) * (1 - eio(seg(t, next, next + 0.4)))
    dd.style.opacity = open
    dd.style.transform = `translateY(${(1 - open) * -6}px)`
    GRAPHS.forEach((_, i) => {
      const r = $('dr' + i)
      const on = i === ORDER[j + 1] ? seg(t, next - 0.4, next - 0.2) : 0
      r.style.background = `rgba(59,122,245,${0.25 * on})`
    })
    if (!drive) return
    if (t < next - 0.85)
      pointer(ctx, cur, gs, t, next - 1.6, next - 1.1, { out: 0.3 })
    else {
      const a = ctx.rel(gs)
      const b = ctx.rel(target)
      pointer(ctx, cur, target, t, next - 0.75, next - 0.3, {
        from: [
          a.x + a.w * 0.55 - (b.x + b.w * 0.55),
          a.y + a.h * 0.55 - (b.y + b.h * 0.55),
        ],
        out: 0.5,
      })
    }
  }

  // how far the feed has scrolled: it follows the output as the app's does,
  // to the new command when it is sent and to the end of its answer once the
  // result is in, never past the top
  const follow = (t, feed, frames) => {
    const vh = $('term').offsetHeight
    let y = 0
    frames.forEach(([at, el]) => {
      if (t < at) return
      const bottom = el.offsetTop + el.offsetHeight
      const want = Math.max(0, 16 + bottom + 12 - vh)
      y += (want - y) * eo(seg(t, at, at + 0.5))
    })
    feed.style.transform = `translateY(${-y}px)`
  }

  const console_ = (t, cur, drive) => {
    // the drawer: the bar alone, then stretched to the app's limit, 80% of the
    // window (which keeps the page's header in view), then closed again
    const full = Math.round(stage.offsetHeight * 0.8)
    const o =
      eio(seg(t, PRESS + 0.05, OPENED)) *
      (1 - eio(seg(t, CLOSE + 0.05, CLOSE + 0.55)))
    $('dw').style.height = 40 + (full - 40) * o + 'px'
    $('dwg').style.opacity = o
    $('dwm').style.opacity = o
    root.querySelector('#dwc .up').style.opacity = 1 - o
    root.querySelector('#dwc .down').style.opacity = o

    // the pointer presses SEC's Console card, later the chevron that closes it
    if (drive) {
      if (t < CLOSE - 2)
        pointer(ctx, cur, $('qc0'), t, PRESS - 0.6, PRESS, {
          from: [320, -200],
          out: 0.5,
        })
      else
        pointer(ctx, cur, $('dwc'), t, CLOSE - 0.6, CLOSE, {
          from: [-260, -180],
          out: 0.5,
        })
    }

    // the prompt types each command, then clears as it lands in the feed
    let k = -1
    T.forEach((x, i) => (k = t >= x[0] ? i : k))
    const typing = k >= 0 && t < T[k][1]
    $('pr').textContent = typing ? typed(Q[k], t, T[k][0], 36) : ''
    $('caret').style.opacity = Math.floor(t * 2.4) % 2 ? 0.2 : 1

    T.forEach((x, i) => {
      const sent = t >= x[1]
      ex[i].style.display = sent ? 'block' : 'none'
      rise(ex[i], eo(seg(t, x[1], x[1] + 0.3)), 10)
      $('r' + i).style.opacity = eo(seg(t, x[2], x[2] + 0.4))
      // before the answer lands, the user line carries a spinner
      $('u' + i).textContent = Q[i] + (sent && t < x[2] ? `  ${spin(t)}` : '')
    })
    MARGINS.forEach((_, i) =>
      rise(
        $('m' + i),
        eo(seg(t, T[0][2] + 0.3 + i * 0.12, T[0][2] + 0.6 + i * 0.12)),
        8
      )
    )
    OWED.forEach((_, i) =>
      rise(
        $('o' + i),
        eo(seg(t, T[1][2] + 0.3 + i * 0.12, T[1][2] + 0.6 + i * 0.12)),
        8
      )
    )

    // the switch back to Driftline clears the console and prints its banner
    const reset = t >= RESET
    $('fs').style.display = reset ? 'none' : 'block'
    $('fd').style.display = reset ? 'block' : 'none'
    $('bn').style.display = reset ? 'block' : 'none'
    rise($('bn'), eo(seg(t, RESET, RESET + 0.3)), 10)
    if (!reset) follow(t, $('fs'), [[T[0][2] + 0.9, ex[0]]])
    else
      follow(t, $('fd'), [
        [T[1][1], ex[1].querySelector('.m-user')],
        [T[1][2] + 0.9, ex[1]],
        [T[2][1], ex[2]],
      ])

    // the ring marks the row each answer turns on, and lets go before the
    // selector moves or the next command lands
    const peer =
      eo(seg(t, T[0][2] + 1.2, T[0][2] + 1.6)) *
      (1 - seg(t, SWITCH[2] - 1.8, SWITCH[2] - 1.5))
    const owed = t < T[2][1] ? eo(seg(t, T[1][2] + 1.2, T[1][2] + 1.6)) : 0
    if (t < RESET) ctx.ring($('hl'), $('m1'), peer)
    else ctx.ring($('hl'), $('o0'), owed)
  }

  return (t) => {
    const cur = $('cur')
    // the console owns the pointer around its two presses; the selector the rest
    const consoleTurn = (t > PRESS - 0.9 && t < PRESS + 0.7) || t > CLOSE - 0.9
    switches(t, cur, !consoleTurn)
    console_(t, cur, consoleTurn)
  }
}

const phoneCss = `
.view { inset: 18px 20px 60px; }
.dh .vh h2 { font-size: 26px; white-space: normal; } .dh .vh p { font-size: 17px; }
h3 { font-size: 21px; }
.stats label { font-size: 16px; } .stats b { font-size: 28px; }
.ir { font-size: 20px; padding: 11px 0; } .ir code { font-size: 18px; }
.ir .badge { font-size: 16px; padding: 4px 10px; }
.qa { grid-template-columns: repeat(2, 1fr); }
.qa b { font-size: 20px; } .qa span { font-size: 16px; }
.dd { width: 460px; left: auto; right: 0; }
.ddh { font-size: 14px; } .ddr { font-size: 20px; } .ddr em { font-size: 14px; } .ddf { font-size: 17px; }
.term .meta { font-size: 14px; }
.term .m { font-size: 20px; } .term .m-res { font-size: 22px; } .term .m-sys { font-size: 14px; }
.cy .cyh { font-size: 14px; } .cy pre { font-size: 13px; white-space: pre-wrap; }
.dt .dth { font-size: 15px; }
.dt table th { font-size: 13px; padding: 9px 10px; } .dt table td { font-size: 18px; padding: 10px 10px; }
.foot { font-size: 14px; }
.hitline .badge { font-size: 16px; }
.prompt { font-size: 19px; padding: 12px 16px; }
`

export default {
  width: 1200,
  height: 820,
  total: TOTAL,
  poster: 13.4,
  css,
  html:
    appChrome({
      active: 'dashboard',
      nav: 'graph',
      graph: '',
      org: 'Northwind Capital',
      main: GRAPHS.map(dash).join(''),
      drawer: panel,
    }) + CURSOR.replace('class="cursor"', 'class="cursor" id="cur"'),
  setup,
  mobile: { width: 720, height: 1000, css: PHONE_APP_CSS + phoneCss },
}
