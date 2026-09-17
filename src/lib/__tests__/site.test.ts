import { describe, expect, it } from 'vitest'
import { metadata as enterpriseMetadata } from '../../app/(landing)/enterprise/page'
import { landingMetadata } from '../../app/(landing)/metadata'
import { metadata as openSourceMetadata } from '../../app/(landing)/open-source/page'
import { metadata as platformMetadata } from '../../app/(landing)/platform/page'
import { metadata as pricingMetadata } from '../../app/(landing)/pricing/page'
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_TITLE,
  publicPageMetadata,
} from '../site'

describe('public page metadata', () => {
  it('gives a page its own canonical, og:url and image', () => {
    const m = publicPageMetadata({
      path: '/pricing',
      title: 'Pricing | RoboSystems',
      description: 'Plans.',
    })

    expect(m.alternates?.canonical).toBe('https://robosystems.ai/pricing')
    expect(m.openGraph).toMatchObject({
      url: 'https://robosystems.ai/pricing',
      title: 'Pricing | RoboSystems',
      images: [OG_IMAGE],
    })
  })

  // These three had no canonical and inherited the homepage's og:url (2026-09-16).
  it.each([
    ['/platform', platformMetadata],
    ['/pricing', pricingMetadata],
    ['/open-source', openSourceMetadata],
  ])('%s declares its own canonical and og:url', (path, m) => {
    const url = `https://robosystems.ai${path}`
    expect(m.alternates?.canonical).toBe(url)
    expect((m.openGraph as { url?: string })?.url).toBe(url)
  })

  it('/enterprise keeps a social image when it overrides openGraph', () => {
    expect(
      (enterpriseMetadata.openGraph as { images?: unknown })?.images
    ).toEqual([OG_IMAGE])
  })

  it('the homepage says one thing in every card, short enough to show whole', () => {
    expect(landingMetadata.description).toBe(SITE_DESCRIPTION)
    expect(landingMetadata.openGraph?.description).toBe(SITE_DESCRIPTION)
    expect(landingMetadata.twitter?.description).toBe(SITE_DESCRIPTION)
    expect(landingMetadata.openGraph?.title).toBe(SITE_TITLE)
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160)
    expect(SITE_DESCRIPTION.toLowerCase()).not.toContain('quickbooks')
  })
})
