/*
 * Three layers around one number: Westrock Coffee's FY2025 gross profit as it
 * sits in the SEC graph (the real node and relationship names), the MD&A
 * passage from the same 10-K that explains it, and a memory from the viewer's
 * own graph. A diagram of the data model, not an app screen: the app has no
 * graph drawing. The figure and the quote are from WEST's 10-K filed
 * 2026-03-10; the memory and its workspace are illustrative.
 */
import { eo, rise, seg } from './kit.js'

const NODES = [
  ['ent', 'l1', 'Entity', 'Westrock Coffee Co', 'WEST · CIK 1806347'],
  ['rep', 'l1', 'Report', '10-K · FY2025', 'filed 2026-03-10'],
  ['fact', 'l1', 'Fact', '$150,764,000', 'gross profit · consolidated · USD'],
  ['el', 'l1', 'Element', 'us-gaap:GrossProfit', 'canonical: gross_profit'],
  ['per', 'l1', 'Period', '2025-01-01 → 2025-12-31', 'annual'],
]

// [from, to, label, draw start]; the last two cross into the other layers and
// go unlabelled: the card they reach names its layer
const EDGES = [
  ['ent', 'rep', 'ENTITY_HAS_REPORT', 0.9],
  ['rep', 'fact', 'REPORT_HAS_FACT', 1.4],
  ['fact', 'el', 'FACT_HAS_ELEMENT', 1.9],
  ['fact', 'per', 'FACT_HAS_PERIOD', 2.3],
  ['rep', 'doc', 'same filing', 4.0],
  ['fact', 'mem', 'recalled beside it', 6.4],
]

const LAYERS = [
  ['Structured', 'Knowledge graph', 0.2],
  ['Documents', 'Document search', 4.0],
  ['Memory', 'Semantic memory', 6.4],
]

const html = `
<div class="bg"></div>
<div class="chips">${LAYERS.map((l, i) => `<div class="lc lc${i}" id="lc${i}"><b>${l[0]}</b><span>${l[1]}</span></div>`).join('')}</div>
<div class="field" id="field" data-loop>
  <svg class="edges" id="svg"></svg>
  ${NODES.map((n) => `<div class="nd ${n[1]}" id="${n[0]}"><i>${n[2]}</i><b>${n[3]}</b><span>${n[4]}</span></div>`).join('')}
  <div class="nd l2 wide" id="doc"><i>10-K / MD&amp;A · search hit</i>
    <p>“…the year over year growth in coffee commodity prices and tariffs, both of which are passed through to our customers.”</p></div>
  <div class="nd l3 wide" id="mem"><i>Memory · your graph</i>
    <p>Coffee peer set: JVA, FARM, WEST. Compare gross margin from each filer’s latest 10-K.</p></div>
  ${EDGES.map((e, i) => `<div class="el" id="elb${i}">${e[2]}</div>`).join('')}
</div>
<div class="cap" id="cap">One number from a 10-K, <em>with everything an answer needs around it.</em></div>
`

const css = `
.stage { background: #04070c; }
.bg { position: absolute; inset: 0; opacity: .06;
  background-image: radial-gradient(#fff 1.2px, transparent 1.2px); background-size: 28px 28px; }
.chips { position: absolute; left: 40px; right: 40px; top: 30px; display: flex; gap: 16px; }
.lc { flex: 1; border: 1px solid var(--line); border-radius: 14px; padding: 12px 18px; background: var(--card); }
.lc b { display: block; font: 700 14px var(--display); letter-spacing: .14em; text-transform: uppercase; }
.lc span { font-size: 18px; color: var(--muted); }
.lc0 b { color: var(--c400); } .lc1 b { color: var(--b400); } .lc2 b { color: var(--i400); }
.field { position: absolute; left: 0; right: 0; top: 120px; bottom: 60px; }
.edges { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.nd { position: absolute; width: 270px; min-height: 98px; padding: 12px 16px; border-radius: 14px;
  background: var(--card); border: 1px solid var(--line); opacity: 0; }
.nd i { display: block; font: 600 12px var(--mono); letter-spacing: .12em; text-transform: uppercase; }
.nd b { display: block; font-size: 20px; font-weight: 700; margin-top: 6px; white-space: nowrap; }
.nd span { display: block; font-size: 15px; color: var(--muted); margin-top: 4px; }
.nd p { font-size: 18px; line-height: 1.45; color: #d1d5db; margin-top: 8px; }
.l1 { border-color: rgba(34,211,238,.35); } .l1 i { color: var(--c400); }
.l2 { border-color: rgba(96,152,250,.4); } .l2 i { color: var(--b400); }
.l3 { border-color: rgba(129,140,248,.45); border-style: dashed; } .l3 i { color: var(--i400); }
#fact { border-color: var(--c400); background: #07181d; }
#fact b { font: 700 24px var(--mono); color: var(--c300); }
.wide { width: 400px; }
#ent { left: 30px; top: 20px; } #rep { left: 450px; top: 20px; }
#fact { left: 450px; top: 215px; } #el { left: 30px; top: 215px; }
#per { left: 450px; top: 410px; }
.wide { width: 390px; }
#doc { left: 790px; top: 20px; } #mem { left: 790px; top: 330px; }
.el { position: absolute; font: 600 11px var(--mono); letter-spacing: .06em; color: var(--muted);
  background: #04070c; padding: 2px 6px; border-radius: 5px; opacity: 0; white-space: nowrap; transform: translate(-50%, -50%); }
.el.x { display: none; }
.cap { position: absolute; left: 0; right: 0; bottom: 26px; text-align: center; font-size: 24px; font-weight: 600; opacity: 0; }
.cap em { font-style: normal; color: var(--c300); }
`

const TOTAL = 11.5
const COLOR = { l1: '#22D3EE', l2: '#6098FA', l3: '#818CF8' }

function setup(ctx) {
  const { $ } = ctx
  const svg = $('svg')
  let lines = null

  // Edges run centre to centre, measured once the layout exists.
  const measure = () => {
    const c = (id) => {
      const n = $(id)
      return [
        n.offsetLeft + n.offsetWidth / 2,
        n.offsetTop + n.offsetHeight / 2,
      ]
    }
    svg.innerHTML = EDGES.map(([a, b]) => {
      const cls = $(b).classList.contains('l3')
        ? 'l3'
        : $(b).classList.contains('l2')
          ? 'l2'
          : 'l1'
      const [x1, y1] = c(a)
      const [x2, y2] = c(b)
      const x =
        EDGES.findIndex((e) => e[0] === a && e[1] === b) > 3 ? ' class="x"' : ''
      return `<line${x} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${COLOR[cls]}" stroke-width="2.5" stroke-opacity=".7"${cls === 'l3' ? ' stroke-dasharray="8 8"' : ''}/>`
    }).join('')
    lines = [...svg.querySelectorAll('line')].map((l, i) => {
      const [x1, y1] = c(EDGES[i][0])
      const [x2, y2] = c(EDGES[i][1])
      const len = Math.hypot(x2 - x1, y2 - y1)
      const lb = $('elb' + i)
      lb.style.left = (x1 + x2) / 2 + 'px'
      // a label on a level edge sits above its line, clear of the nodes
      lb.style.top = (y1 + y2) / 2 - (Math.abs(y2 - y1) < 8 ? 14 : 0) + 'px'
      if (i > 3) lb.classList.add('x')
      return { l, len, lb }
    })
  }

  return (t) => {
    if (!lines) {
      if (!$('fact').offsetWidth) return
      measure()
    }
    // nodes light up as the edge reaching them draws
    rise($('fact'), eo(seg(t, 0.2, 0.7)), 14)
    rise($('ent'), eo(seg(t, 0.6, 1.0)), 14)
    rise($('rep'), eo(seg(t, 1.1, 1.5)), 14)
    rise($('el'), eo(seg(t, 2.1, 2.5)), 14)
    rise($('per'), eo(seg(t, 2.5, 2.9)), 14)
    rise($('doc'), eo(seg(t, 4.4, 4.9)), 14)
    rise($('mem'), eo(seg(t, 6.8, 7.3)), 14)
    EDGES.forEach((e, i) => {
      const p = eo(seg(t, e[3], e[3] + 0.5))
      const { l, len, lb } = lines[i]
      if (l.getAttribute('stroke-dasharray') === '8 8') l.style.opacity = p
      else {
        l.setAttribute('stroke-dasharray', `${len} ${len}`)
        l.setAttribute('stroke-dashoffset', String(len * (1 - p)))
      }
      lb.style.opacity = seg(t, e[3] + 0.35, e[3] + 0.65)
    })
    // each layer's chip brightens as its layer arrives, and stays lit
    LAYERS.forEach((ly, i) => {
      const c = $('lc' + i)
      const p = seg(t, ly[2], ly[2] + 0.5)
      c.style.opacity = 0.35 + 0.65 * p
      c.style.borderColor = `rgba(${['34,211,238', '96,152,250', '129,140,248'][i]},${0.15 + 0.55 * p})`
    })
    rise($('cap'), eo(seg(t, 8.0, 8.5)), 12)
  }
}

// Phone layout: the two columns stack, the context nodes pair up in a grid.
const phoneCss = `
.chips { left: 20px; right: 20px; top: 20px; gap: 8px; }
.lc { padding: 10px 10px; } .lc b { font-size: 11px; letter-spacing: .08em; } .lc span { font-size: 13px; }
.field { top: 100px; bottom: 100px; }
.edges .x { display: none; }
.el { font-size: 10px; letter-spacing: 0; }
.nd { width: 300px; min-height: 92px; } .nd b { font-size: 18px; } .nd span { font-size: 14px; }
.wide { width: 680px; } .nd p { font-size: 18px; }
#ent { left: 20px; top: 10px; } #rep { left: 400px; top: 10px; }
#el { left: 20px; top: 180px; } #fact { left: 400px; top: 180px; }
#per { left: 400px; top: 350px; width: 300px; } #per b { font-size: 16px; }
#doc { left: 20px; top: 530px; } #mem { left: 20px; top: 720px; }
.cap { font-size: 22px; bottom: 34px; padding: 0 30px; line-height: 1.3; }
`

export default {
  width: 1200,
  height: 750,
  total: TOTAL,
  poster: 9.5,
  css,
  html,
  setup,
  mobile: { width: 720, height: 1040, css: phoneCss },
}
