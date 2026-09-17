import { describe, expect, it } from 'vitest'
import { graphServesProduct, productLabel } from '../oauth-consent'

describe('graphServesProduct', () => {
  it('admits a tenant graph provisioned for the product', () => {
    expect(
      graphServesProduct({ schemaExtensions: ['roboledger'] }, 'roboledger')
    ).toBe(true)
  })

  it('refuses shared repositories, subgraphs and other products', () => {
    // The SEC repository declares roboledger; subgraphs inherit it.
    expect(
      graphServesProduct(
        { isRepository: true, schemaExtensions: ['roboledger'] },
        'roboledger'
      )
    ).toBe(false)
    expect(
      graphServesProduct(
        { graphType: 'repository', schemaExtensions: ['roboledger'] },
        'roboledger'
      )
    ).toBe(false)
    expect(
      graphServesProduct(
        { isSubgraph: true, schemaExtensions: ['roboledger'] },
        'roboledger'
      )
    ).toBe(false)
    expect(
      graphServesProduct({ schemaExtensions: ['roboinvestor'] }, 'roboledger')
    ).toBe(false)
    expect(graphServesProduct({}, 'roboledger')).toBe(false)
  })
})

describe('productLabel', () => {
  it('names known products and is null on the general routes', () => {
    expect(productLabel('roboledger')).toBe('RoboLedger')
    expect(productLabel(null)).toBeNull()
    expect(productLabel(undefined)).toBeNull()
  })
})
