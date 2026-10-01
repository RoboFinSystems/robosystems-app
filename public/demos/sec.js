/*
 * SEC repository: three questions of one filer in the console drawer, open
 * over the repository's Dashboard, answered from the numbers and from the
 * narrative. Westrock Coffee (WEST), 10-K for FY2025
 * filed 2026-03-10: the income statement, the MD&A passage behind the margin,
 * and net sales by segment. All figures in $ thousands as filed; query timings
 * and search scores are illustrative.
 */
import {
  appChrome,
  eo,
  pageHeader,
  PHONE_APP_CSS,
  push,
  rise,
  seg,
  spin,
  typed,
} from './kit.js'

const STMT = [
  ['Net sales', '1,188,952', '850,726'],
  ['Costs of sales', '1,038,188', '696,952'],
  ['Gross profit', '150,764', '153,774', 'gp'],
  ['Selling, general and administrative', '185,469', '185,137'],
  ['Net loss', '(90,445)', '(80,298)'],
]

const SEGS = [
  ['Beverage Solutions', '908,449', '659,383'],
  ['Sustainable Sourcing & Traceability', '280,503', '191,343'],
]

const SEG_CYPHER = `MATCH (e:Entity {ticker: 'WEST'})-[:ENTITY_HAS_REPORT]->(:Report)
      -[:REPORT_HAS_FACT]->(f:Fact {has_dimensions: true}),
      (f)-[:FACT_HAS_ELEMENT]->(:Element {canonical_concept: 'revenue'}),
      (f)-[:FACT_HAS_DIMENSION]->(d:Dimension)
RETURN d.axis, d.member, f.value`

const table = (head, rows, id) =>
  `<div class="dt"><div class="dth"><span>${rows.length} rows</span><span>Copy JSON</span><span>Download CSV</span></div>
  <table><tr>${head.map((h, i) => `<th${i ? ' class="n"' : ''}>${h}</th>`).join('')}</tr>
  ${rows.map((r, i) => `<tr id="${id}${i}"${r[3] ? ` class="${r[3]}"` : ''}><td>${r[0]}</td><td class="n">${r[1]}</td><td class="n">${r[2]}</td></tr>`).join('')}
  </table></div>`

// Each exchange: the command typed at the prompt, then what the console returns.
const Q = [
  "Show Westrock Coffee's income statement from its latest 10-K",
  '/search tariffs passed through to customers',
  'Break net sales out by segment',
]

// the page under the drawer; only its header shows above the open console
const main = `<div class="dh">${pageHeader('SEC EDGAR Filings', 'View metrics and manage your graph')}<span class="badge b-info">Shared Repository</span></div>`

// the drawer's panel: no page header, the terminal fills it and the prompt sits
// below. data-loop dissolves it at the wrap, as the page under it does.
const panel = `<div class="pnl" data-loop>
  <div class="term" id="term"><div class="feed" id="feed">
    <div class="ex" id="x0">
      <div class="meta">10:02 - USER</div><div class="m m-user" id="u0"></div>
      <div class="rs" id="r0"><div class="meta">10:02 - RESULT</div>
        <div class="m m-res">Westrock Coffee Co · 10-K FY2025 · income statement, <b>$ thousands</b></div>
        ${table(['concept', '2025', '2024'], STMT, 's')}
        <div class="foot">Query completed in 388ms · Rows returned: 5</div></div>
    </div>
    <div class="ex" id="x1">
      <div class="meta">10:03 - USER</div><div class="m m-user" id="u1"></div>
      <div class="rs" id="r1"><div class="meta">10:03 - RESULT</div>
        <div class="hitline"><span class="badge b-info">0.86</span><span class="badge b-purple">WEST</span><span class="badge b-warn">10-K</span><span class="badge b-mute">MD&amp;A</span></div>
        <div class="m m-res quote">“…the year over year growth in coffee commodity prices and tariffs, <b>both of which are passed through to our customers</b>.”</div>
        <div class="m m-res">Sales rose 39.8% while gross profit fell 2.0%: passed-through costs add to sales, not to profit, so <b>gross margin fell from 18.1% to 12.7%</b>.</div></div>
    </div>
    <div class="ex" id="x2">
      <div class="meta">10:03 - USER</div><div class="m m-user" id="u2"></div>
      <div class="rs" id="r2"><div class="meta">10:03 - RESULT</div>
        <div class="cy"><div class="cyh"><span>GENERATED CYPHER</span><span>Run</span></div><pre>${SEG_CYPHER}</pre></div>
        ${table(['member', '2025', '2024'], SEGS, 'g')}
        <div class="foot">Query completed in 214ms · Rows returned: 2</div></div>
    </div>
  </div></div>
  <div class="prompt"><span>$</span><span id="pr"></span><span class="caret" id="caret"></span></div>
  <div class="hl" id="hl"></div></div>`

const css = `
.dh { display: flex; align-items: flex-start; justify-content: space-between; }
/* the drawer held open at the app's limit, 80% of the window */
.rs-dw { height: 80%; }
.rs-dw .grip, .rs-dw .max, .rs-dw .chev .down { opacity: 1; }
.rs-dw .chev .up { opacity: 0; }
.pnl { position: absolute; inset: 0; display: flex; flex-direction: column; }
.pnl .term { position: relative; flex: 1; min-height: 0; overflow: hidden; padding: 0; }
.feed { position: absolute; left: 20px; right: 20px; top: 16px; }
.ex { margin-bottom: 18px; }
.rs { opacity: 0; }
.hitline { display: flex; gap: 8px; margin: 4px 0 10px; }
.quote { border-left: 3px solid var(--b400); padding-left: 14px; }
.dt { margin-top: 8px; }
.dt table td { font-size: 16px; }
.dt table td:first-child { font-family: var(--body); }
tr.gp td { color: var(--c300); }
.prompt { flex-shrink: 0; margin: 0 20px 16px; display: flex; align-items: center; gap: 10px; padding: 12px 18px;
  border: 1px solid var(--line); border-radius: 12px; background: #030712; font: 17px var(--mono); color: #d1d5db; min-height: 50px; }
.prompt span:first-child { color: #4ade80; }
.caret { width: 9px; height: 20px; background: #4ade80; }
`

const TOTAL = 15
// [type at, send at, result at] per exchange
const T = [
  [0.4, 1.9, 2.5],
  [5.0, 6.3, 6.9],
  [9.5, 10.6, 11.2],
]

function setup(ctx) {
  const { $ } = ctx
  const ex = [0, 1, 2].map((i) => $('x' + i))

  return (t) => {
    push($('term'), t, TOTAL, 500, 300, 0.025)
    // the prompt types each command, then clears as it lands in the feed
    let k = -1
    T.forEach((x, i) => (k = t >= x[0] ? i : k))
    const typing = k >= 0 && t < T[k][1]
    $('pr').textContent = typing ? typed(Q[k], t, T[k][0], 40) : ''
    $('caret').style.opacity = Math.floor(t * 2.4) % 2 ? 0.2 : 1

    T.forEach((x, i) => {
      const sent = t >= x[1]
      ex[i].style.display = sent ? 'block' : 'none'
      rise(ex[i], eo(seg(t, x[1], x[1] + 0.3)), 10)
      const r = $('r' + i)
      r.style.opacity = eo(seg(t, x[2], x[2] + 0.4))
      // before the answer lands, the user line carries a spinner
      $('u' + i).textContent = Q[i] + (sent && t < x[2] ? `  ${spin(t)}` : '')
    })
    // the feed scrolls so the newest exchange sits at the top of the term
    const top = (i) => ex[i].offsetTop
    let y = 0
    if (t >= T[1][1]) y = top(1) * eo(seg(t, T[1][1], T[1][1] + 0.5))
    if (t >= T[2][1])
      y = top(1) + (top(2) - top(1)) * eo(seg(t, T[2][1], T[2][1] + 0.5))
    $('feed').style.transform = `translateY(${-y}px)`

    ctx.ring($('hl'), $('s2'), t < T[1][1] ? eo(seg(t, 3.4, 3.8)) : 0)
  }
}

const phoneCss = `
.cy pre { font-size: 11px; }
.dt table td { font-size: 14px; padding: 8px 10px; } .dt table th { font-size: 12px; padding: 8px 10px; }
.term .m { font-size: 15px; } .term .m-res { font-size: 17px; }
.prompt { font-size: 14px; padding: 12px 14px; }
`

export default {
  width: 1200,
  height: 860,
  total: TOTAL,
  poster: 4.6,
  css,
  html: appChrome({
    active: 'dashboard',
    nav: 'repo',
    graph: 'SEC EDGAR Filings',
    main,
    drawer: panel,
  }),
  setup,
  mobile: { width: 720, height: 1000, css: PHONE_APP_CSS + phoneCss },
}
