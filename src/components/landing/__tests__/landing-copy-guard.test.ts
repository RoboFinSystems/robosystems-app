import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { SCHEDULING_URL } from '../../../lib/site'

// The public copy follows the 2026-11-16 positioning (the vault's gtm/content locks) and
// its alignment review. Each phrase below is retired: an em dash (voice), a badge or a
// crowd we can't point at, a claim the lock forbids, or a term that leads nowhere.
// "pilot" alone is out because the offer is the Finance AI Deployment ("pilot" read as
// both a proof of concept and a co-pilot); copilot and autopilot are other words.
// Comments in these files count too, so the next edit copies from clean text.
const BANNED: Array<[string, RegExp]> = [
  ['an em dash', /—|&mdash;/],
  ['financial intelligence', /financial intelligence/i],
  ['AI-native', /ai-native/i],
  ['Finance AI Pilot', /finance ai pilot/i],
  ['pilot', /(?<![\w-])pilot\b/i],
  ['early, and we say so', /early, and we say so/i],
  ['in beta', /in beta\b/i],
  ['XBRL-shaped', /xbrl-shaped/i],
  ['in one model', /in one model/i],
  ['serialized as RDF', /serialized as rdf/i],
  ['reference app', /reference app/i],
  ['all Apache', /all apache/i],
  ['customers run', /customers run/i],
  ['most customers', /most customers/i],
  ['MOST POPULAR', /most popular/i],
  ['free account', /free account/i],
  ['not raising', /not raising/i],
  ['autonomous', /autonomous/i],
  ['hassle-free', /hassle-free/i],
  ['co-sourced', /co-sourced/i],
  ['controllership', /controllership/i],
]

const root = path.resolve(__dirname, '../../../..')
const src = path.join(root, 'src')
const landingDir = path.resolve(__dirname, '..')
const page = (...p: string[]) => path.join(src, 'app', '(landing)', ...p)

const isSource = (f: string) =>
  (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.includes('.test.')

/** Every .ts/.tsx file under `dir`, test directories left out. */
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      return name === '__tests__' ? [] : walk(full)
    }
    return isSource(full) ? [full] : []
  })
}

const files = [
  ...walk(landingDir),
  page('content.tsx'),
  page('metadata.ts'),
  ...walk(page('about')),
  ...walk(page('platform')),
  ...walk(page('enterprise')),
  ...walk(page('pricing')),
  ...walk(page('register')),
  ...walk(path.join(src, 'components', 'platform')),
  ...walk(path.join(src, 'components', 'blog')),
  ...walk(path.join(src, 'app', '(blog)')),
  ...walk(path.join(src, 'app', '(pages)')),
  ...walk(path.join(src, 'components', 'pages')),
  path.join(src, 'lib', 'product-pages.ts'),
  path.join(src, 'app', '(docs)', 'docs', 'page.tsx'),
  path.join(src, 'app', 'layout.tsx'),
  path.join(src, 'app', 'manifest.ts'),
  path.join(src, 'app', 'llms.txt', 'route.ts'),
  path.join(src, 'lib', 'site.ts'),
  path.join(src, 'lib', 'structured-data.ts'),
  path.join(root, 'README.md'),
]

describe('landing copy guard', () => {
  it('scans the homepage, the marketing pages, the blog, the docs index and the README', () => {
    for (const name of [
      'DeploymentSection.tsx',
      'HeroSection.tsx',
      'GraphPricing.tsx',
      'FinancialServices.tsx',
      'BlogJsonLd.tsx',
      'opengraph-image.tsx',
      'site.ts',
      'README.md',
    ]) {
      expect(files.some((f) => f.endsWith(name))).toBe(true)
    }
  })

  // JSX wraps prose across lines, so a phrase is matched with its whitespace collapsed.
  const text = (f: string) => readFileSync(f, 'utf8').replace(/\s+/g, ' ')

  it.each(BANNED)('carries no %s', (_label, pattern) => {
    const offenders = files.filter((f) => pattern.test(text(f)))
    expect(offenders.map((f) => path.relative(root, f))).toEqual([])
  })

  // The public booking page is the only scheduler link the site may carry. Matching every
  // scheduler URL against it keeps a private booking link out without naming one here.
  it('links no scheduler but the public booking page', () => {
    const scheduler = /https:\/\/scheduler\.zoom\.us\/[^\s'"`)]+/g
    const others = [...files, path.join(root, 'next.config.js')].flatMap((f) =>
      (readFileSync(f, 'utf8').match(scheduler) ?? [])
        .filter((url) => url !== SCHEDULING_URL)
        .map((url) => `${path.relative(root, f)}: ${url}`)
    )
    expect(others).toEqual([])
  })
})
