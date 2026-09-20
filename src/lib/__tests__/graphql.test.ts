import { describe, expect, it } from 'vitest'
import {
  DOMAIN_ORDER,
  buildGraphqlCatalog,
  domainFor,
  fieldSlug,
  namedType,
  typeLabel,
} from '../graphql'

// The Query root as the committed SDK snapshot has it. The reference groups fields for
// display, and GraphQL has no tag to group them by, so the mapping lives in `graphql.ts`
// and this locks it: a field here that no domain claims fails the suite.
//
// It cannot see a field added to the API after this list was captured. That case is
// handled at render time instead — `buildGraphqlCatalog` puts an unclaimed field in an
// "Other" group rather than dropping it, so a new field is visibly ungrouped, never
// silently missing. Refresh this list whenever the SDK snapshot is regenerated.
const QUERY_FIELDS = [
  'accountRollups',
  'accountTree',
  'accounts',
  'agent',
  'agents',
  'blockedSourceGraphs',
  'chartTemplates',
  'closingBookStructures',
  'elements',
  'entities',
  'entity',
  'eventBlock',
  'eventBlocks',
  'fiscalCalendar',
  'hello',
  'holdings',
  'informationBlock',
  'informationBlocks',
  'journalEntries',
  'libraryElement',
  'libraryElementArcs',
  'libraryElementClassifications',
  'libraryElementEquivalents',
  'libraryElementTree',
  'libraryElements',
  'libraryStructure',
  'libraryStructures',
  'libraryTaxonomies',
  'libraryTaxonomy',
  'libraryTaxonomyArcCount',
  'libraryTaxonomyArcs',
  'mappedTrialBalance',
  'mapping',
  'mappingCandidates',
  'mappingCoverage',
  'mappings',
  'openPayables',
  'openPayablesByAgent',
  'openReceivables',
  'openReceivablesByAgent',
  'periodCloseStatus',
  'periodDrafts',
  'portfolioBlock',
  'portfolios',
  'position',
  'positions',
  'publishList',
  'publishLists',
  'report',
  'reportDownloadUrl',
  'reportPackage',
  'reportingTaxonomy',
  'reports',
  'searchLibraryElements',
  'securities',
  'security',
  'statement',
  'structures',
  'summary',
  'taxonomies',
  'taxonomyBlock',
  'taxonomyBlocks',
  'transaction',
  'transactions',
  'trialBalance',
  'unmappedElements',
]

describe('the GraphQL reference', () => {
  it('claims every query field the schema serves', () => {
    const unclaimed = QUERY_FIELDS.filter((f) => !domainFor(f, ''))
    expect(unclaimed).toEqual([])
  })

  it('puts each field in exactly one domain', () => {
    for (const field of QUERY_FIELDS) {
      const claiming = DOMAIN_ORDER.filter(
        (slug) => domainFor(field, '') === slug
      )
      expect(claiming).toHaveLength(1)
    }
  })

  // The write surface lists every RoboLedger group before RoboInvestor. Investor sat
  // above the block and library domains here, so a reader crossing between the two
  // references had to re-learn where a product lives.
  it('orders domains the way the write surface does', () => {
    expect(DOMAIN_ORDER).toEqual([
      'ledger',
      'blocks',
      'library',
      'investor',
      'probe',
    ])
    expect(DOMAIN_ORDER.indexOf('investor')).toBeGreaterThan(
      DOMAIN_ORDER.indexOf('blocks')
    )
  })

  it('derives a unique URL slug per field, from the schema alone', () => {
    const slugs = QUERY_FIELDS.map(fieldSlug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(fieldSlug('fiscalCalendar')).toBe('fiscal-calendar')
    expect(fieldSlug('openReceivablesByAgent')).toBe(
      'open-receivables-by-agent'
    )
  })

  it('renders GraphQL type spelling for wrapped types', () => {
    const ref = {
      kind: 'NON_NULL',
      name: null,
      ofType: {
        kind: 'LIST',
        name: null,
        ofType: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'OBJECT', name: 'Agent' },
        },
      },
    }
    expect(typeLabel(ref)).toBe('[Agent!]!')
    expect(namedType(ref)).toBe('Agent')
  })

  it('surfaces an unclaimed field instead of dropping it', () => {
    const catalog = buildGraphqlCatalog({
      data: {
        __schema: {
          queryType: {
            fields: [
              {
                name: 'somethingBrandNew',
                description: 'A field no domain claims yet.',
                args: [],
                type: { kind: 'OBJECT', name: 'Thing' },
              },
            ],
          },
          types: [],
        },
      },
    })
    expect(catalog.fields.map((f) => f.name)).toContain('somethingBrandNew')
    expect(catalog.domains.at(-1)?.slug).toBe('other')
  })
})
