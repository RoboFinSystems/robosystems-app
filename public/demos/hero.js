/*
 * Hero pitch: an AI answering from memory, the turn, then three beats of
 * asking over MCP while RoboSystems changes beside the chat: query the facts,
 * read the documents, keep the work. Margins and quoted passages are from the
 * latest 10-Ks of Coffee Holding (JVA, FY ended 2025-10-31), Farmer Bros
 * (FARM, 2025-06-30) and Westrock Coffee (WEST, 2025-12-31). Search scores,
 * query timings and the Northwind Research workspace are illustrative.
 */
import {
  appChrome,
  blurIn,
  eio,
  eo,
  pageHeader,
  PHONE_APP_CSS,
  rise,
  seg,
  spin,
  swap,
  tile,
  typed,
} from './kit.js'

const BEATS = [
  {
    k: 'console',
    q: 'How have margins moved at the public coffee roasters?',
    tool: 'sec · build-fact-grid',
    res: 'JVA, FARM, WEST · gross margin · last two 10-Ks',
    a: [
      'Two fell and one rose. ',
      'Farmer Bros is up 4.2 points',
      '; Coffee Holding and Westrock are down.',
    ],
  },
  {
    k: 'search',
    q: 'Why did they move apart?',
    tool: 'sec · search-documents',
    res: '3 passages · MD&A · latest 10-Ks',
    a: [
      'Tariffs cut Coffee Holding. ',
      'Farmer Bros raised prices',
      '. Westrock passes its costs through, so sales grew faster than profit.',
    ],
  },
  {
    k: 'memory',
    q: 'Remember this peer set for next quarter.',
    tool: 'northwind · remember',
    res: 'Saved · fact · tags: peers, coffee',
    a: [
      'Saved to ',
      'Northwind Research',
      '. Next quarter, ask how the coffee peers are doing and it starts from here.',
    ],
  },
]

const STEP = [
  '<i>01</i>Query the facts.',
  '<i>02</i>Read the documents.',
  '<i>03</i>Keep the work. <em class="grad">It remembers.</em>',
]

const CYPHER = `MATCH (e:Entity)-[:ENTITY_HAS_REPORT]->(:Report)
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

const HITS = [
  [
    'Coffee Holding Co · 10-K / MD&A',
    '0.91',
    'JVA',
    'FY2025',
    '…decreased to 16% for the fiscal year ended October 31, 2025, from 20%… The decrease in gross profit percentage was attributable to tariff costs in the current year.',
  ],
  [
    'Farmer Bros Co · 10-K / MD&A',
    '0.88',
    'FARM',
    'FY2025',
    'Overall, gross margins increased by 4.2% to 43.5% in fiscal 2025 from 39.3% in fiscal 2024. The improvement in gross margins was a result of price increases implemented across our network.',
  ],
  [
    'Westrock Coffee Co · 10-K / MD&A',
    '0.84',
    'WEST',
    'FY2025',
    '…and the year over year growth in coffee commodity prices and tariffs, both of which are passed through to our customers.',
  ],
]

const MEMS = [
  [
    'b-good',
    'fact',
    'b-ind',
    'mcp',
    ['peers', 'coffee'],
    'Coffee peer set: JVA, FARM, WEST. Compare gross margin from each filer’s latest 10-K. FY2025: JVA 16.0%, FARM 43.5%, WEST 12.7%.',
  ],
  [
    'b-info',
    'note',
    'b-mute',
    'api',
    ['periods'],
    'Fiscal years differ: JVA ends in October, FARM in June, WEST in December. Label every period by its end date.',
  ],
  [
    'b-purple',
    'preference',
    'b-warn',
    'agent',
    ['style'],
    'The investment committee reads margins in points, not percent change.',
  ],
]

const chatGroups = BEATS.map(
  (b, i) => `
  <div class="grp" id="g${i}">
    <div class="step">${STEP[i]}</div>
    <div class="ub" id="q${i}"></div>
    <div class="tool" id="tl${i}"><div class="tn"><span>${b.tool}</span><span class="st" id="ts${i}"></span></div><div class="tr" id="tr${i}"></div></div>
    <div class="ans" id="an${i}"></div>
  </div>`
).join('')

const consoleView = `<div class="view" id="v1">${pageHeader('Console', 'AI financial analyst for 10,000+ public companies')}
    <div class="term">
      <div class="meta">09:41 - USER</div>
      <div class="m m-user">Compare gross margin for JVA, FARM and WEST over the last two years</div>
      <div class="meta">09:41 - RESULT</div>
      <div class="cy" id="cy"><div class="cyh"><span>GENERATED CYPHER</span><span>Run</span></div><pre>${CYPHER}</pre></div>
      <div class="dt" id="dt"><div class="dth"><span>3 rows</span><span>Copy JSON</span><span>Download CSV</span></div>
        <table><tr><th>ticker</th><th>fiscal_year_end</th><th class="n">gross_margin_prior</th><th class="n">gross_margin</th></tr>
        ${MARGINS.map((r, i) => `<tr id="mr${i}"><td>${r[0]}</td><td>${r[1]}</td><td class="n">${r[2]}</td><td class="n">${r[3]}</td></tr>`).join('')}
        </table></div>
      <div class="foot" id="cf">Query completed in 412ms · Rows returned: 3</div>
    </div><div class="hl" id="hl1"></div>
  </div>
  <div class="view" id="v2">${pageHeader('Document Search', 'Search indexed documents and knowledge base content')}
    <div class="sbar"><span id="sq"></span><span class="btn go">Search</span></div>
    <div class="rmeta" id="rm">Showing 1–3 of 3 results for “gross margin” · 10-K · JVA, FARM, WEST</div>
    ${HITS.map(
      (h, i) => `<div class="hit card" id="h${i}"><b>${h[0]}</b>
      <div class="bgs"><span class="badge b-info">${h[1]}</span><span class="badge b-mute">narrative</span><span class="badge b-purple">${h[2]}</span><span class="badge b-warn">10-K</span><span class="badge b-mute">${h[3]}</span></div>
      <p>${h[4]}</p></div>`
    ).join('')}
    <div class="hl" id="hl2"></div>
  </div>`

const memoryView = `<div class="view" id="v3">
    <div class="mh">${pageHeader('Memory', '<span id="mc"></span>')}<span class="btn go">New Memory</span></div>
    <div class="sbar"><span style="color:var(--dim)">Search your memories...</span><span class="btn ghost">Recall</span></div>
    ${MEMS.map(
      (m, i) => `<div class="mem card" id="m${i}">
      <div class="bgs"><span class="badge ${m[0]}">${m[1]}</span><span class="badge ${m[2]}">${m[3]}</span>${m[4].map((t) => `<span class="badge b-purple">${t}</span>`).join('')}</div>
      <p>${m[5]}</p></div>`
    ).join('')}
  </div>`

const html = `
<div class="bg"></div><div class="gridbg"></div>

<div class="scene" id="s1"><div class="center">
  <div class="eyebrow" id="eb">Numbers · Narratives · Memory</div>
  <div class="big" style="margin-top:34px"><span class="wd" id="w1">Ask</span> <span class="wd" id="w2">your</span> <span class="wd" id="w3">AI</span> <span class="wd" id="w4">about</span><br><span class="wd grad" id="w5">a company.</span></div>
</div></div>

<div class="scene" id="s2">
  <div class="gchat" id="gc">
    <div class="ub" style="max-width:720px;margin-left:auto" id="gq"></div>
    <div class="ans" id="ga" style="color:#d1d5db;margin-top:30px"></div>
  </div>
  <div class="caption" id="c2">A number with no source. <em>It is a year out of date.</em></div>
</div>

<div class="scene" id="s3"><div class="center">
  <div class="big" style="font-size:96px"><span id="t1" style="display:inline-block">Your company.</span><br><span class="grad" id="t2" style="display:inline-block">And every company around it.</span></div>
  <div class="flow">
    <div class="node" id="n1">Your books · your holdings · public filings</div><div class="wire" id="wr1"></div>
    <div class="node" id="n2" style="border-color:var(--c500)">${tile(48, 12)}RoboSystems</div><div class="wire" id="wr2"></div>
    <div class="node" id="n3">Claude · ChatGPT · any MCP client</div>
  </div>
</div></div>

<div class="scene" id="s4">
  <div id="chat">
    <div class="hd"><div class="t">Your AI chat · connected over MCP</div>
      <span class="chip"><span class="dot"></span>SEC filings</span><span class="chip"><span class="dot"></span>Northwind Research</span></div>
    <div id="chatbody">${chatGroups}</div>
  </div>
  <div id="app">
    <div class="ch" id="appA">${appChrome({ active: 'console', nav: 'repo', graph: 'SEC Repository', main: consoleView })}</div>
    <div class="ch" id="appB">${appChrome({ active: 'memory', nav: 'graph', graph: 'Northwind Research', main: memoryView })}</div>
  </div>
</div>

<div class="scene" id="s5"><div class="center">
  <span id="cl">${tile(110, 26)}</span>
  <div class="big grad" id="cu" style="font-size:108px;margin-top:34px">robosystems.ai</div>
  <div id="cn" style="font-size:40px;font-weight:600;margin-top:30px">Every number traces back to its source.</div>
  <div id="cw" style="font-size:28px;color:var(--muted);margin-top:26px">Works with Claude, ChatGPT, or any MCP client · Open source</div>
  <div id="cd" style="position:absolute;bottom:40px;font-size:18px;color:var(--dim)">Figures from the latest 10-Ks of JVA, FARM and WEST. Northwind Research is a demo workspace.</div>
</div></div>
`

const css = `
.stage { background: var(--bg); }
.bg { position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(8,51,68,.34), rgba(23,46,71,.28) 50%, rgba(30,27,75,.3)); }
.gridbg { position: absolute; inset: 0; opacity: .07;
  background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px);
  background-size: 64px 64px; }
.scene { position: absolute; inset: 0; opacity: 0; display: none; }
.center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.eyebrow { font: 600 24px var(--display); letter-spacing: .32em; color: var(--c300); text-transform: uppercase; }
.big { font: 800 118px/1.04 var(--display); letter-spacing: -.01em; }
.wd { display: inline-block; }
.caption { position: absolute; left: 0; right: 0; bottom: 110px; text-align: center; font-size: 46px; font-weight: 600; }
.caption em { font-style: normal; color: var(--c300); }
.gchat { position: absolute; left: 410px; top: 200px; width: 1100px; height: 480px; background: #0b0e14; border: 1px solid var(--line); border-radius: 24px; padding: 44px; display: flex; flex-direction: column; }
.gchat .ub, .gchat .ans { font-size: 32px; }
.flow { display: flex; align-items: center; margin-top: 70px; }
.node { padding: 22px 34px; border-radius: 18px; border: 1px solid var(--line); background: var(--card); font-size: 30px; font-weight: 600; display: flex; align-items: center; gap: 16px; }
.wire { width: 130px; height: 3px; background: linear-gradient(90deg, var(--c500), var(--i500)); transform-origin: left; }

.step { font: 700 34px var(--display); margin-bottom: 4px; }
.step i { font-style: normal; font-size: 18px; color: var(--muted); letter-spacing: .3em; margin-right: 16px; vertical-align: middle; }
.step em { font-style: normal; }
#chat { position: absolute; left: 70px; top: 80px; width: 700px; height: 920px; background: #0a0d13; border: 1px solid var(--line); border-radius: 26px; overflow: hidden; }
#chat .hd { height: 120px; border-bottom: 1px solid var(--line); padding: 22px 30px; }
#chat .hd .t { font-size: 22px; color: var(--muted); margin-bottom: 14px; }
.chip { display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: 999px; border: 1px solid var(--line); background: var(--card2); font-size: 19px; margin-right: 10px; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--good); }
#chatbody { position: absolute; left: 0; right: 0; top: 120px; bottom: 0; }
.grp { position: absolute; left: 30px; right: 30px; top: 34px; display: none; flex-direction: column; gap: 22px; }
#app { position: absolute; left: 810px; top: 80px; width: 1040px; height: 920px; border: 1px solid var(--line); border-radius: 26px; overflow: hidden; background: #000; }
.ch { position: absolute; inset: 0; }
.view { position: absolute; inset: 0; padding: 26px 30px; opacity: 0; }
.cy pre { font-size: 13px; }
.dt table td { font-size: 17px; }
.sbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 8px 8px 8px 18px; border: 1px solid #374151; border-radius: 12px; background: #111827; font-size: 19px; margin-bottom: 14px; min-height: 58px; }
.rmeta { font-size: 15px; color: var(--muted); margin-bottom: 14px; }
.hit { padding: 16px 20px; margin-bottom: 12px; }
.hit b { font-size: 19px; }
.bgs { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0; }
.hit p, .mem p { font-size: 17px; color: #cbd5e1; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mh { display: flex; align-items: center; justify-content: space-between; }
.mem { padding: 14px 20px; margin-bottom: 12px; }
.mem .bgs { margin-top: 0; }
`

const S1 = [0, 3.4],
  S2 = [3.4, 8.2],
  S3 = [8.2, 11.8]
const B = [11.8, 16.4, 21.0]
const S4 = [11.8, 25.8],
  S5 = [25.8, 30.4]
const TOTAL = 30.4

function win(el, t, [a, b], fi = 0.45, fo = 0.4) {
  const v =
    t >= a && t < b ? eo(seg(t, a, a + fi)) * (1 - eio(seg(t, b - fo, b))) : 0
  el.style.opacity = v
  el.style.display = v > 0 ? 'block' : 'none'
  return t - a
}

function answer(parts, n) {
  let out = '',
    left = n
  parts.forEach((p, i) => {
    const s = p.slice(0, Math.max(0, left))
    left -= p.length
    out += i === 1 ? `<b>${s}</b>` : s
  })
  return out
}

function setup(ctx) {
  const { $ } = ctx

  return (t) => {
    t = Math.max(0, Math.min(TOTAL, t))

    let lt = win($('s1'), t, S1)
    blurIn($('eb'), seg(lt, 0.05, 0.6), 12)
    ;['w1', 'w2', 'w3', 'w4', 'w5'].forEach((w, i) =>
      blurIn($(w), seg(lt, 0.25 + i * 0.08, 0.85 + i * 0.08))
    )

    lt = win($('s2'), t, S2)
    rise($('gc'), eo(seg(lt, 0, 0.5)), 30)
    $('gq').textContent = typed(
      "What was Coffee Holding's gross margin last year?",
      lt,
      0.5,
      40
    )
    $('ga').textContent = typed(
      'About 20%, based on its recent results. Margins in coffee have been fairly stable.',
      lt,
      1.9,
      70
    )
    rise($('c2'), eo(seg(lt, 3.1, 3.6)), 20)

    lt = win($('s3'), t, S3)
    blurIn($('t1'), seg(lt, 0.1, 0.7))
    blurIn($('t2'), seg(lt, 0.6, 1.2))
    rise($('n1'), eo(seg(lt, 1.2, 1.6)), 20)
    $('wr1').style.transform = `scaleX(${eo(seg(lt, 1.5, 1.9))})`
    rise($('n2'), eo(seg(lt, 1.8, 2.2)), 20)
    $('wr2').style.transform = `scaleX(${eo(seg(lt, 2.1, 2.5))})`
    rise($('n3'), eo(seg(lt, 2.4, 2.8)), 20)

    lt = win($('s4'), t, S4, 0.5, 0.45)
    if (t >= S4[0] && t < S4[1]) {
      rise($('chat'), eo(seg(lt, 0, 0.7)), 60)
      rise($('app'), eo(seg(lt, 0.15, 0.85)), 60)

      let bi = 0
      for (let i = 0; i < B.length; i++) if (t >= B[i]) bi = i
      const bt = t - B[bi]

      BEATS.forEach((b, i) => {
        const g = $('g' + i)
        if (i === bi) {
          g.style.display = 'flex'
          rise(g, eo(seg(bt, 0.15, 0.5)), 30)
          $('q' + i).textContent = typed(b.q, bt, 0.2, 48)
          rise($('tl' + i), eo(seg(bt, 1.2, 1.45)), 12)
          $('ts' + i).innerHTML =
            bt > 1.95
              ? '<span style="color:var(--good)">✓ done</span>'
              : `<span style="color:var(--muted)">${spin(bt)} running</span>`
          swap($('ts' + i), bt, 1.95)
          $('tr' + i).textContent = b.res
          $('tr' + i).style.opacity = seg(bt, 1.95, 2.25)
          $('an' + i).innerHTML = answer(b.a, Math.floor((bt - 2.05) * 70))
        } else if (i === bi - 1 && bt < 0.35) {
          g.style.display = 'flex'
          const q = seg(bt, 0, 0.3)
          g.style.opacity = 1 - q
          g.style.transform = `translateY(${-50 * q}px)`
        } else g.style.display = 'none'
      })

      // the app view switches when the tool fires
      const vi = bt >= 1.2 || bi === 0 ? bi : bi - 1
      const vt =
        bt >= 1.2 ? bt - 1.2 : bi === 0 ? 0 : bt + (B[bi] - B[bi - 1]) - 1.2
      const f = bi === 0 ? 1 : eio(seg(vt, 0, 0.45))
      // Console and Search live on the SEC repository; Memory on the workspace
      // graph, so the whole window changes graph for the last beat.
      ;[1, 2].forEach((n) => {
        const i = n - 1
        const p = i === vi ? f : i === vi - 1 ? (vi === 2 ? 1 : 1 - f) : 0
        const v = $('v' + n)
        v.style.opacity = p
        v.style.transform = `translateX(${(1 - p) * (i === vi ? 30 : -30)}px)`
      })
      $('v3').style.opacity = 1
      $('appA').style.opacity = vi < 2 ? 1 : 1 - f
      $('appB').style.opacity = vi === 2 ? f : 0
      $('appB').style.transform = `translateX(${(vi === 2 ? 1 - f : 1) * 30}px)`
      if (vi < 2)
        ctx.nav(
          BEATS[vi].k,
          vi > 0 ? BEATS[vi - 1].k : BEATS[vi].k,
          seg(vt, 0, 0.7),
          $('appA')
        )
      else ctx.nav('memory', 'memory', 1, $('appB'))

      if (vi === 0) {
        rise($('cy'), eo(seg(vt, 0.05, 0.4)), 12)
        rise($('dt'), eo(seg(vt, 0.35, 0.7)), 12)
        ;[0, 1, 2].forEach((i) =>
          rise($('mr' + i), eo(seg(vt, 0.5 + i * 0.1, 0.8 + i * 0.1)), 8)
        )
        $('cf').style.opacity = seg(vt, 0.8, 1.1)
        ctx.ring($('hl1'), $('mr1'), eo(seg(vt, 1.3, 1.6)))
      } else $('hl1').style.opacity = 0
      if (vi === 1) {
        $('sq').textContent = typed('gross margin', vt, 0.05, 30)
        $('rm').style.opacity = seg(vt, 0.5, 0.8)
        ;[0, 1, 2].forEach((i) =>
          rise($('h' + i), eo(seg(vt, 0.55 + i * 0.14, 0.9 + i * 0.14)), 16)
        )
        ctx.ring($('hl2'), $('h1'), eo(seg(vt, 1.6, 1.9)))
      } else $('hl2').style.opacity = 0
      if (vi === 2) {
        swap($('mc'), vt, 0.9, '12 memories stored.', '13 memories stored.')
        // the new memory slides in above the two already there
        const p = eo(seg(vt, 0.6, 1.0))
        rise($('m0'), p, 16)
        $('m0').style.borderColor =
          `rgba(34,211,238,${0.6 * seg(vt, 0.9, 1.2)})`
        const shift = (1 - p) * -118
        $('m1').style.transform = `translateY(${shift}px)`
        $('m2').style.transform = `translateY(${shift}px)`
      }
    }

    // the end card fades into the background and the loop opens on the first
    // scene: no black dip
    lt = win($('s5'), t, S5, 0.5, 0.6)
    rise($('cl'), eo(seg(lt, 0.1, 0.5)), 20)
    blurIn($('cu'), seg(lt, 0.3, 0.9), 30)
    rise($('cn'), eo(seg(lt, 0.9, 1.3)), 20)
    rise($('cw'), eo(seg(lt, 1.3, 1.7)), 20)
    $('cd').style.opacity = seg(lt, 1.6, 2.0)
    $('cl').style.display = 'inline-block'
  }
}

// Phone layout: a 720-wide portrait stage, the chat stacked over the app,
// larger type, and the connector flow turned vertical.
const phoneCss = `
.big { font-size: 70px; }
.eyebrow { font-size: 16px; letter-spacing: .16em; padding: 0 30px; }
.caption { font-size: 34px; bottom: 90px; padding: 0 36px; line-height: 1.25; }
.gchat { left: 24px; top: 190px; width: 672px; height: 560px; padding: 30px; }
.gchat .ub, .gchat .ans { font-size: 28px; }
#s3 .big { font-size: 52px !important; }
.flow { flex-direction: column; margin-top: 50px; }
.wire { width: 3px; height: 34px; }
.node { font-size: 25px; padding: 16px 26px; }
.step { font-size: 24px; margin-bottom: 0; } .step i { font-size: 13px; margin-right: 10px; }
#chat { left: 20px; top: 20px; width: 680px; height: 560px; }
#chat .hd { height: 96px; padding: 14px 20px; }
#chat .hd .t { font-size: 17px; margin-bottom: 10px; }
.chip { font-size: 16px; padding: 6px 12px; }
#chatbody { top: 96px; }
.grp { left: 20px; right: 20px; top: 14px; gap: 10px; }
.ub { font-size: 24px; padding: 14px 18px; min-height: 56px; }
.tool { padding: 11px 14px; } .tool .tn { font-size: 17px; } .tool .tr { font-size: 18px; margin-top: 6px; }
.ans { font-size: 24px; }
#app { left: 20px; top: 594px; width: 680px; height: 470px; }
.view { padding: 16px 18px; }
.vh .tile { display: none; }
.cy { display: none; }
.term { padding: 12px 14px; } .term .m { font-size: 15px; margin-bottom: 10px; }
.dt table td { font-size: 15px; padding: 8px 10px; } .dt table th { font-size: 12px; padding: 8px 10px; }
.sbar { min-height: 50px; font-size: 17px; margin-bottom: 10px; } .rmeta { display: none; }
.hit, .mem { padding: 11px 14px; margin-bottom: 9px; } .hit b { font-size: 16px; }
.bgs { margin: 6px 0; } .badge { font-size: 12px; padding: 3px 8px; }
.hit p, .mem p { font-size: 15px; }
.mh .btn { display: none; }
#cu { font-size: 76px !important; }
#cn { font-size: 30px !important; padding: 0 30px; }
#cw { font-size: 21px !important; padding: 0 30px; }
#cd { padding: 0 30px; font-size: 16px !important; }
`

export default {
  width: 1920,
  height: 1080,
  total: TOTAL,
  poster: 15.6,
  css,
  html,
  setup,
  mobile: { width: 720, height: 1080, css: PHONE_APP_CSS + phoneCss },
}
