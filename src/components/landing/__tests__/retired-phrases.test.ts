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
