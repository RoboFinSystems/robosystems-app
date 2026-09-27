import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// The homepage leads with the knowledge graph and shows it working: the hero,
// the three layers, the SEC repository and the build lane each carry a live demo
// (public/demos). These phrases belonged to the page before it: the old H1, the
// canned console answers labelled "Simulated results" in place of real filings,
// and the static three-layer headline. A later copy edit must not bring them back.
const RETIRED = [
  'finally connected',
  'simulated results',
  'three layers of financial intelligence',
]

const landingDir = path.resolve(__dirname, '..')
const demosDir = path.resolve(__dirname, '../../../../public/demos')
const files = [
  ...readdirSync(landingDir)
    .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
    .map((f) => path.join(landingDir, f)),
  path.resolve(__dirname, '../../../app/(landing)/metadata.ts'),
  // The animated demos carry landing copy of their own.
  ...readdirSync(demosDir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => path.join(demosDir, f)),
  // Everything else that describes the homepage to a crawler or a shared link.
  ...[
    'app/layout.tsx',
    'app/manifest.ts',
    'lib/site.ts',
    'lib/structured-data.ts',
  ].map((f) => path.resolve(__dirname, '../../..', f)),
]

describe('landing copy', () => {
  it('scans the landing components, the demos and the page metadata', () => {
    expect(files.length).toBeGreaterThan(10)
    expect(files.some((f) => f.endsWith('metadata.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('site.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('hero.js'))).toBe(true)
  })

  it.each(RETIRED)('no longer says "%s"', (phrase) => {
    const offenders = files.filter((f) =>
      readFileSync(f, 'utf8').toLowerCase().includes(phrase)
    )
    expect(offenders.map((f) => path.relative(landingDir, f))).toEqual([])
  })
})

// What a product mock or demo shows on screen is a demo company, never a real
// customer's or our own graph: the platform page's graph switcher once listed
// the RFS LLC and Harbinger FinLab graphs by name. The company names are fine in
// prose (about, privacy, enterprise); this scans only the screens.
const REAL_GRAPHS = ['rfs llc', 'harbinger']
const platformDir = path.resolve(__dirname, '../../platform')
const screens = [
  ...readdirSync(demosDir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => path.join(demosDir, f)),
  ...readdirSync(platformDir)
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => path.join(platformDir, f)),
]

describe('product screens', () => {
  it('scans the demos and the platform page mocks', () => {
    expect(screens.some((f) => f.endsWith('graphs.js'))).toBe(true)
    expect(screens.some((f) => f.endsWith('SchemaArchitecture.tsx'))).toBe(true)
  })

  it.each(REAL_GRAPHS)('never show "%s" as a graph', (name) => {
    const offenders = screens.filter((f) =>
      readFileSync(f, 'utf8').toLowerCase().includes(name)
    )
    expect(offenders.map((f) => path.relative(landingDir, f))).toEqual([])
  })
})
