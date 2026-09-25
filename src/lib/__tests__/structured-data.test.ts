import { describe, expect, it } from 'vitest'
import {
  FOUNDER_ID,
  ORGANIZATION_ID,
  organizationJsonLd,
  softwareJsonLd,
} from '../structured-data'

describe('structured data', () => {
  // roboledger.ai and roboinvestor.ai reference these by value; changing one orphans them.
  it('declares the identity the other Robo* sites point at', () => {
    expect(ORGANIZATION_ID).toBe('https://robosystems.ai/#organization')
    expect(organizationJsonLd['@id']).toBe(ORGANIZATION_ID)
    expect(organizationJsonLd.founder['@id']).toBe(FOUNDER_ID)
    expect(organizationJsonLd.founder.url).toBe('https://robosystems.ai/about')
    expect(softwareJsonLd.publisher['@id']).toBe(ORGANIZATION_ID)
  })
})
