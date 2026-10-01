/*
 * Build: an integration from robosystems-integration-template runs in its
 * own repo (collect, transform, then the graph lane's upload_file and
 * materialize calls) while the graph it writes to fills: staging tables land
 * in the Data Lake, then Ingest to Graph and the Schema shows the new types.
 * The procurement feed, its tables and every count are illustrative.
 */
import {
  appChrome,
  eio,
  eo,
  pageHeader,
  PHONE_APP_CSS,
  rise,
  seg,
  spin,
  swap,
} from './kit.js'

// staging tables, one per node or relationship table in the graph's schema
const TABLES = [
  ['Supplier', 42],
  ['Contract', 318],
  ['Shipment', 1204],
  ['SUPPLIER_HAS_CONTRACT', 318],
  ['CONTRACT_HAS_SHIPMENT', 1204],
]
const UP = [2.6, 3.3, 4.0, 4.7, 5.4] // each upload lands
const MAT = [6.3, 7.9] // materialize starts, finishes

const n = (v) => v.toLocaleString('en-US')

const LOG = [
  [0.9, '<i>collect</i> procurement export · 3 sources'],
  [1.6, '<i>transform</i> 5 parquet files · 3,086 rows'],
  ...TABLES.map((tb, i) => [
    UP[i] - 0.45,
    `<i>emit</i> upload_file(…, table_name="${tb[0]}") <span id="ok${i}"></span>`,
  ]),
  [MAT[0], '<i>emit</i> materialize(client) <span id="okm"></span>'],
  [MAT[1] + 0.3, '<b>done</b> · 5 tables staged and ingested in 41s'],
]

const lake = `<div class="view" id="v1">
    <div class="mh">${pageHeader('Data Lake', 'Manage staging tables and files.')}<span class="btn ok" id="ing">Ingest to Graph</span></div>
    <div class="stats">
      <div class="card"><label>Total Tables</label><b id="st0"></b></div>
      <div class="card"><label>Total Rows</label><b id="st1"></b></div>
      <div class="card"><label>Total Files</label><b id="st2"></b></div>
    </div>
    <div class="card list"><div class="lh">Active (<span id="act">0</span>)</div>
      ${TABLES.map((tb, i) => `<div class="tr" id="t${i}"><span>${tb[0]}</span><span class="rows">${n(tb[1])} rows</span><span class="badge b-good">uploaded</span></div>`).join('')}
    </div>
  </div>
  <div class="view" id="v2">${pageHeader('Schema Viewer', 'View and manage your graph schema.')}
    <div class="stats">
      <div class="card"><label>Node Labels</label><b>3</b></div>
      <div class="card"><label>Relationships</label><b>2</b></div>
      <div class="card"><label>Total Properties</label><b>21</b></div>
    </div>
    <div class="cols">
      <div class="card sc"><div class="lh">Node Labels</div>${TABLES.slice(0, 3)
        .map((tb, i) => `<div class="nl" id="nl${i}">${tb[0]}</div>`)
        .join('')}</div>
      <div class="card sc"><div class="lh">Relationship Types</div>${TABLES.slice(
        3
      )
        .map((tb, i) => `<div class="nl rl" id="rl${i}">${tb[0]}</div>`)
        .join('')}</div>
    </div>
  </div>`

const html = `
<div class="pane" id="term">
  <div class="ph"><b>your-integration</b><span>your repo · your runtime · your credentials</span></div>
  <div class="log"><div class="cmd">$ <span id="cmd"></span></div>
    ${LOG.map((l, i) => `<div class="ln" id="l${i}">${l[1]}</div>`).join('')}
  </div>
</div>
<div class="wire" id="wire"><span>public API<br>API key</span></div>
<div class="win" id="win">${appChrome({ active: 'tables', nav: 'graph', graph: 'Northwind Research', main: lake, drawer: '' })}</div>
`

const css = `
.stage { background: #04070c; }
.pane { position: absolute; left: 24px; top: 24px; width: 450px; bottom: 24px; border: 1px dashed #374151;
  border-radius: 18px; background: #030712; overflow: hidden; }
.ph { padding: 16px 20px; border-bottom: 1px solid var(--line); }
.ph b { display: block; font: 600 18px var(--mono); }
.ph span { font-size: 14px; color: var(--muted); }
.log { padding: 16px 18px; font: 12px/1.65 var(--mono); color: #cbd5e1; }
.cmd { color: #4ade80; font-size: 16px; margin-bottom: 10px; min-height: 24px; }
.ln { opacity: 0; margin-bottom: 6px; white-space: nowrap; }
.ln i { font-style: normal; color: var(--c400); }
.ln b { color: var(--good); }
.wire { position: absolute; left: 474px; width: 84px; top: 50%; height: 2px;
  background: linear-gradient(90deg, #374151, var(--c500)); transform-origin: left; }
.wire span { position: absolute; left: 50%; top: -30px; transform: translateX(-50%); font: 600 11px var(--mono);
  letter-spacing: .08em; color: var(--muted); white-space: nowrap; text-transform: uppercase; text-align: center; top: -40px; line-height: 1.5; }
.win { position: absolute; left: 558px; right: 24px; top: 24px; bottom: 24px; border: 1px solid var(--line);
  border-radius: 18px; overflow: hidden; }
.rs-side { width: 170px; } .rs-main { left: 170px; padding: 22px 22px; }
.rs-side .nv { font-size: 15px; padding: 7px 10px; } .rs-side .pill { height: 35px; }
.rs-top .gs i { display: none; } .rs-top .gs { margin-left: auto; font-size: 15px; }
.view { position: absolute; inset: 22px; opacity: 0; }
.vh h2 { font-size: 26px; } .vh .tile { width: 46px !important; height: 46px !important; }
.mh { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.mh .btn { white-space: nowrap; font-size: 14px; padding: 8px 12px; }
.vh p { font-size: 14px; }
.stats { display: flex; gap: 10px; margin-bottom: 14px; }
.stats .card { flex: 1; padding: 10px 14px; }
.stats label { display: block; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
.stats b { font: 700 22px var(--mono); }
.list { padding: 8px 0; }
.lh { font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; padding: 6px 16px 8px; }
.tr { display: flex; align-items: center; gap: 10px; padding: 9px 14px; border-top: 1px solid var(--line); font: 14px var(--mono); opacity: 0; }
.tr .badge { font-size: 12px; padding: 3px 8px; }
.tr span:first-child { flex: 1; } .rows { color: var(--muted); white-space: nowrap; }
.cols { display: flex; gap: 12px; }
.sc { flex: 1; padding: 8px 12px 12px; }
.nl { border: 1px solid rgba(34,211,238,.35); border-radius: 9px; padding: 9px 12px; margin-top: 8px; font: 600 15px var(--mono); color: var(--c300); opacity: 0; }
.rl { border-color: rgba(129,140,248,.4); color: var(--i300); font-size: 12px; }
`

const TOTAL = 13

function setup(ctx) {
  const { $ } = ctx

  return (t) => {
    $('cmd').textContent = 'just run'.slice(
      0,
      Math.max(0, Math.floor((t - 0.3) * 14))
    )
    LOG.forEach((l, i) => rise($('l' + i), eo(seg(t, l[0], l[0] + 0.3)), 6))
    TABLES.forEach((_, i) => {
      const ok = $('ok' + i)
      ok.innerHTML =
        t < UP[i]
          ? `<span style="color:var(--muted)">${spin(t)}</span>`
          : '<span style="color:var(--good)">✓</span>'
      rise($('t' + i), eo(seg(t, UP[i], UP[i] + 0.35)), 8)
    })
    $('okm').innerHTML =
      t < MAT[1]
        ? `<span style="color:var(--muted)">${spin(t)}</span>`
        : '<span style="color:var(--good)">✓</span>'
    const w = $('wire')
    const axis = w.offsetHeight > w.offsetWidth ? 'Y' : 'X' // vertical on phones
    w.style.transform = `scale${axis}(${eo(seg(t, 2.0, 2.5))})`

    // Data Lake counts follow the uploads, each change through a dip
    const k = UP.filter((x) => t >= x).length
    const rows = TABLES.slice(0, k).reduce((a, b) => a + b[1], 0)
    const at = k ? UP[k - 1] : 0
    swap($('st0'), t, at, null, null)
    $('st0').textContent = $('st2').textContent = String(k)
    $('st1').textContent = n(rows)
    $('st1').style.opacity = $('st2').style.opacity = $('st0').style.opacity
    $('act').textContent = String(k)

    // the integration's materialize call runs the same ingest as the button
    swap($('ing'), t, MAT[0], 'Ingest to Graph', `Ingesting…`)
    if (t >= MAT[0]) $('ing').textContent = `${spin(t)} Ingesting…`

    // Data Lake gives way to the Schema once the ingest finishes
    const f = eio(seg(t, MAT[1] + 0.2, MAT[1] + 0.7))
    $('v1').style.opacity = eo(seg(t, 0, 0.4)) * (1 - f)
    $('v2').style.opacity = f
    $('v2').style.transform = `translateX(${(1 - f) * 24}px)`
    ctx.nav('schema', 'tables', seg(t, MAT[1] + 0.2, MAT[1] + 0.8))
    ;[0, 1, 2].forEach((i) =>
      rise(
        $('nl' + i),
        eo(seg(t, MAT[1] + 0.6 + i * 0.15, MAT[1] + 0.9 + i * 0.15)),
        8
      )
    )
    ;[0, 1].forEach((i) =>
      rise(
        $('rl' + i),
        eo(seg(t, MAT[1] + 1.1 + i * 0.15, MAT[1] + 1.4 + i * 0.15)),
        8
      )
    )
  }
}

// Phone layout: the integration's log over the app window.
const phoneCss = `
.pane { left: 20px; right: 20px; width: auto; top: 20px; bottom: auto; height: 470px; }
.log { font-size: 18px; } .ph b { font-size: 22px; } .ph span { font-size: 17px; } .cmd { font-size: 20px; }
.ln { white-space: normal; }
.wire span { font-size: 13px; text-align: left; }
.stats b { font-size: 26px; } .stats label { font-size: 13px; }
.nl { font-size: 19px; } .rl { font-size: 16px; } .tr { font-size: 18px; }
.vh h2 { font-size: 28px; } .vh p { font-size: 16px; } .mh .btn { font-size: 17px; }
.wire { left: 50%; top: 490px; width: 2px; height: 50px; background: linear-gradient(#374151, var(--c500)); transform-origin: top; }
.wire span { left: 16px; top: 16px; transform: none; }
.win { left: 20px; right: 20px; top: 540px; bottom: 20px; }
.rs-main { left: 0; }
`

export default {
  width: 1200,
  height: 640,
  total: TOTAL,
  poster: 10.5,
  css,
  html,
  setup,
  mobile: { width: 720, height: 1140, css: PHONE_APP_CSS + phoneCss },
}
