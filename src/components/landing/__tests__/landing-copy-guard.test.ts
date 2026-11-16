import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// The public copy follows the 2026-11-16 positioning: no em dashes (voice), no "most
// popular" badge or "most customers" (there is no crowd to point at yet), no "free
// account" (the SEC repository is a card-required trial), and none of the words that
// lead nowhere: "AI-native" and "financial intelligence". Comments in these files count
// too, so the next edit copies from clean text.
const BANNED: Array<[string, RegExp]> = [
  ['an em dash', /—|&mdash;/],
  ['MOST POPULAR', /most popular/i],
  ['free account', /free account/i],
  ['most customers', /most customers/i],
  ['AI-native', /ai-native/i],
  ['financial intelligence', /financial intelligence/i],
  // The offer was renamed the Finance AI Deployment on 2026-11-16: "pilot" read as
  // both a proof of concept and a co-pilot.
  ['Finance AI Pilot', /finance ai pilot/i],
]

const src = path.resolve(__dirname, '../../..')
const landingDir = path.resolve(__dirname, '..')
const page = (...p: string[]) => path.join(src, 'app', '(landing)', ...p)

const files = [
  ...readdirSync(landingDir)
    .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
    .map((f) => path.join(landingDir, f)),
  page('content.tsx'),
  page('metadata.ts'),
  page('about', 'page.tsx'),
  page('about', 'content.tsx'),
  page('platform', 'page.tsx'),
  page('platform', 'content.tsx'),
  page('enterprise', 'page.tsx'),
  page('enterprise', 'content.tsx'),
  ...readdirSync(page('pricing'))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => page('pricing', f)),
  path.join(src, 'app', 'layout.tsx'),
  path.join(src, 'app', 'manifest.ts'),
  path.join(src, 'app', 'llms.txt', 'route.ts'),
  path.join(src, 'lib', 'site.ts'),
  path.join(src, 'lib', 'structured-data.ts'),
]

describe('landing copy guard', () => {
  it('scans the homepage sections and the public marketing pages', () => {
    for (const name of [
      'DeploymentSection.tsx',
      'HeroSection.tsx',
      'GraphPricing.tsx',
      'site.ts',
    ]) {
      expect(files.some((f) => f.endsWith(name))).toBe(true)
    }
  })

  it.each(BANNED)('carries no %s', (_label, pattern) => {
    const offenders = files.filter((f) => pattern.test(readFileSync(f, 'utf8')))
    expect(offenders.map((f) => path.relative(src, f))).toEqual([])
  })
})
