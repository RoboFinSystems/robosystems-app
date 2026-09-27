/*
 * Platform console: the three things the Console does on one graph. A plain
 * question answered with the generated Cypher and the rows, a /search over the
 * graph's documents, and a /recall of what the team saved to memory. The
 * Driftline Coffee Roasters demo company: receivables of $153,333.33 at
 * 2026-08-31 with $128,000 from Summit Markets (the split across the three
 * café accounts is illustrative, as on roboledger.ai); the policy passage and
 * the memory are quoted from the documents and memories its demo seeds.
 * Timings, credits and scores are illustrative.
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

const OWED = [
  ['Summit Markets', '128,000.00'],
  ['Pioneer Square Cafés', '9,120.00'],
  ['Emerald City Grocers', '8,440.00'],
  ['Cascadia Coffee Bars', '7,773.33'],
]

const CYPHER = `MATCH (e:Event)-[:EVENT_INVOLVES_AGENT]->(a:Agent)
WHERE a.agent_type = 'customer' AND e.event_type = 'invoice'
RETURN a.name AS customer, sum(e.open_amount) AS owed
ORDER BY owed DESC`

const Q = [
  'Which customers owe us the most?',
  '/search receivables past 60 days',
  '/recall Summit Markets',
]

const main = `${pageHeader('Console', 'AI analyst for your accounting ledger')}
  <div class="term" id="term"><div class="feed" id="feed">
    <div class="ex" id="x0">
      <div class="meta">09:12 - USER</div><div class="m m-user" id="u0"></div>
      <div class="rs" id="r0"><div class="meta">09:12 - RESULT</div>
        <div class="m m-res">Summit Markets holds <b>$128,000 of the $153,333</b> in receivables, 83.5% of the total.</div>
        <div class="cy"><div class="cyh"><span>GENERATED CYPHER</span><span>Run</span></div><pre>${CYPHER}</pre></div>
        <div class="dt"><div class="dth"><span>4 rows</span><span>Copy JSON</span><span>Download CSV</span></div>
          <table><tr><th>customer</th><th class="n">owed</th></tr>
          ${OWED.map((r, i) => `<tr id="o${i}"><td>${r[0]}</td><td class="n">${r[1]}</td></tr>`).join('')}
          </table></div>
        <div class="foot">Query completed in 296ms · Rows returned: 4 · Credits used: 0.4</div></div>
    </div>
    <div class="ex" id="x1">
      <div class="meta">09:13 - USER</div><div class="m m-user" id="u1"></div>
      <div class="rs" id="r1"><div class="meta">09:13 - RESULT</div>
        <div class="hitline"><span class="badge b-info">0.89</span><span class="badge b-mute">Uploaded</span><span class="src">Revenue Recognition Policy / Wholesale Accounts Receivable</span></div>
        <div class="m m-res quote">“Receivables that age past 60 days, or that concentrate in a single large account, are a working-capital and credit risk — <b>review the AR aging by customer every close</b>.”</div></div>
    </div>
    <div class="ex" id="x2">
      <div class="meta">09:13 - USER</div><div class="m m-user" id="u2"></div>
      <div class="rs" id="r2"><div class="meta">09:13 - RESULT</div>
        <div class="hitline"><span class="badge b-info">0.93</span><span class="badge b-good">fact</span><span class="badge b-ind">mcp</span><span class="badge b-purple">summit-markets</span><span class="badge b-purple">credit-risk</span></div>
        <div class="m m-res quote mem">“Summit Markets is the largest wholesale account and pays slowly — net-30 terms but <b>balances routinely age past 60 days</b>, and Summit is a concentrated share of total AR.”</div></div>
    </div>
  </div></div>
  <div class="prompt"><span>$</span><span id="pr"></span><span class="caret" id="caret"></span></div>
  <div class="hl" id="hl"></div>`

const css = `
.rs-main { display: flex; flex-direction: column; }
.term { position: relative; flex: 1; overflow: hidden; padding: 0 20px; }
.feed { position: absolute; left: 20px; right: 20px; top: 18px; }
.ex { margin-bottom: 18px; }
.rs { opacity: 0; }
.hitline { display: flex; align-items: center; gap: 8px; margin: 4px 0 10px; flex-wrap: wrap; }
.src { font-size: 15px; color: #cbd5e1; margin-left: 4px; }
.quote { border-left: 3px solid var(--b400); padding-left: 14px; }
.quote.mem { border-left-color: var(--i400); }
.cy pre { font-size: 14px; }
.dt { margin-top: 8px; }
.dt table td { font-size: 16px; }
.dt table td:first-child { font-family: var(--body); }
.prompt { margin-top: 14px; display: flex; align-items: center; gap: 10px; padding: 14px 18px; border: 1px solid var(--line);
  border-radius: 12px; background: #030712; font: 17px var(--mono); color: #d1d5db; min-height: 54px; }
.prompt span:first-child { color: #4ade80; }
.caret { width: 9px; height: 20px; background: #4ade80; }
`

const TOTAL = 14.5
// [type at, send at, result at] per exchange
const T = [
  [0.4, 1.6, 2.2],
  [5.6, 6.8, 7.3],
  [9.6, 10.5, 11.0],
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
    OWED.forEach((_, i) =>
      rise($('o' + i), eo(seg(t, 2.5 + i * 0.12, 2.8 + i * 0.12)), 8)
    )
    // the feed scrolls so the newest exchange sits at the top of the term
    const top = (i) => ex[i].offsetTop
    let y = 0
    if (t >= T[1][1]) y = top(1) * eo(seg(t, T[1][1], T[1][1] + 0.5))
    if (t >= T[2][1])
      y = top(1) + (top(2) - top(1)) * eo(seg(t, T[2][1], T[2][1] + 0.5))
    $('feed').style.transform = `translateY(${-y}px)`

    ctx.ring($('hl'), $('o0'), t < T[1][1] ? eo(seg(t, 3.6, 4.0)) : 0)
  }
}

const phoneCss = `
.vh p { font-size: 17px; }
.term .meta { font-size: 14px; }
.term .m { font-size: 20px; } .term .m-res { font-size: 22px; }
.cy .cyh { font-size: 14px; } .cy pre { font-size: 14px; white-space: pre-wrap; }
.dt .dth { font-size: 15px; }
.dt table th { font-size: 15px; padding: 9px 12px; } .dt table td { font-size: 19px; padding: 10px 12px; }
.foot { font-size: 14px; }
.hitline .badge { font-size: 16px; } .src { font-size: 18px; }
.prompt { font-size: 19px; padding: 14px 16px; }
`

export default {
  width: 1200,
  height: 820,
  total: TOTAL,
  poster: 4.4,
  css,
  html: appChrome({
    active: 'console',
    nav: 'graph',
    graph: 'Driftline Coffee Roasters',
    main,
  }),
  setup,
  mobile: { width: 720, height: 1120, css: PHONE_APP_CSS + phoneCss },
}
