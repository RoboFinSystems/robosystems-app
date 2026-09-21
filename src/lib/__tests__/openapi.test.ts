import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  API_BASE_PATH,
  API_REVALIDATE_SECONDS,
  EXTENSIONS_BASE_PATH,
  apiNeighbors,
  basePathFor,
  buildCatalog,
  catalogForSurface,
  collapseGraphqlOperations,
  findApiOperation,
  findApiTag,
  findMovedApiOperation,
  operationSlug,
  partitionExtensionTags,
  summarize,
  surfaceOf,
  tagSlug,
  type ApiTag,
  type OpenApiDocument,
} from '../openapi'

const doc: OpenApiDocument = {
  info: {
    title: 'RoboSystems API',
    version: '1.12.6',
    description: '# Overview\n\nThe platform API.',
  },
  tags: [
    { name: 'Graphs', description: '🏗️ Graphs - Create and manage graphs' },
    {
      name: 'Extensions: RoboLedger',
      description: '📒 RoboLedger operations — Named commands for writes',
    },
    { name: 'Unused', description: 'Nothing points at this one' },
  ],
  paths: {
    '/v1/graphs': {
      get: {
        tags: ['Graphs'],
        summary: 'List Graphs',
        operationId: 'listGraphs',
        security: [{ APIKeyHeader: [] }, { BearerAuth: [] }],
        responses: { '200': { description: 'Successful Response' } },
      },
      post: {
        tags: ['Graphs'],
        summary: 'Create Graph',
        operationId: 'createGraph',
        description: 'Creates a graph. Billing applies.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/extensions/roboledger/{graph_id}/operations/close-period': {
      post: {
        tags: ['Extensions: RoboLedger'],
        summary: 'Close Period',
        operationId: 'closePeriod',
        parameters: [
          {
            name: 'graph_id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { '200': { description: 'OK' } },
      },
    },
    // An operation with no operationId cannot be addressed by a page and is skipped.
    '/v1/legacy': { get: { tags: ['Graphs'], summary: 'Legacy' } },
  },
  components: {
    schemas: {},
    securitySchemes: {
      APIKeyHeader: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
      BearerAuth: { type: 'http', scheme: 'bearer' },
    },
  },
}

const catalog = buildCatalog(doc)

describe('slugs', () => {
  it('keeps a tag name readable rather than splitting its camel case', () => {
    expect(tagSlug('Extensions: RoboLedger')).toBe('extensions-roboledger')
    expect(tagSlug('Graph Operations')).toBe('graph-operations')
  })

  it('splits an operationId on word boundaries, acronyms included', () => {
    expect(operationSlug('getCurrentAuthUser')).toBe('get-current-auth-user')
    expect(operationSlug('listSECFilings')).toBe('list-sec-filings')
  })
})

describe('buildCatalog', () => {
  it('addresses every operation under its tag', () => {
    expect(catalog.operations).toHaveLength(3)
    const created = findApiOperation(catalog, 'graphs', 'create-graph')
    expect(created?.path).toBe(`${API_BASE_PATH}/graphs/create-graph`)
    expect(created?.route).toBe('/v1/graphs')
    expect(created?.method).toBe('post')
  })

  // The split between /docs/api and /docs/extensions is derived from each operation's
  // own route, not from a tag list someone maintains. That is the whole reason a newly
  // added extensions tag cannot land on the platform reference, so it is asserted
  // directly rather than only through the pages that consume it.
  it('reads an operation surface off its route, not off its tag', () => {
    expect(surfaceOf('/v1/graphs')).toBe('platform')
    expect(
      surfaceOf('/extensions/roboledger/{graph_id}/operations/close-period')
    ).toBe('extensions')
    expect(surfaceOf('/extensions/{graph_id}/graphql')).toBe('extensions')
    // Anything the API mounts outside /extensions documents with the platform.
    expect(surfaceOf('/status')).toBe('platform')

    expect(basePathFor('platform')).toBe(API_BASE_PATH)
    expect(basePathFor('extensions')).toBe(EXTENSIONS_BASE_PATH)
  })

  it('addresses each operation under the reference its surface belongs to', () => {
    const platform = findApiOperation(catalog, 'graphs', 'create-graph')
    expect(platform?.surface).toBe('platform')
    expect(platform?.path.startsWith(`${API_BASE_PATH}/`)).toBe(true)

    const extensions = catalog.operations.find(
      (o) => o.tagSlug === 'extensions-roboledger'
    )
    expect(extensions?.surface).toBe('extensions')
    expect(extensions?.path.startsWith(`${EXTENSIONS_BASE_PATH}/`)).toBe(true)

    expect(findApiTag(catalog, 'graphs')?.surface).toBe('platform')
    expect(findApiTag(catalog, 'graphs')?.path).toBe(`${API_BASE_PATH}/graphs`)
    expect(findApiTag(catalog, 'extensions-roboledger')?.surface).toBe(
      'extensions'
    )
    expect(findApiTag(catalog, 'extensions-roboledger')?.path).toBe(
      `${EXTENSIONS_BASE_PATH}/extensions-roboledger`
    )
  })

  // GraphQL's two HTTP operations are documented on the GraphQL page itself, so the
  // sidebar must not expand them — those links resolve to the field route, match no
  // field, and 404. Exactly the dead URL the split removed, returning via the nav.
  it('collapses the GraphQL tag so the nav cannot link its operations', () => {
    const withGraphql = buildCatalog({
      info: { title: 'RoboSystems API', version: '1' },
      tags: [{ name: 'GraphQL', description: 'GraphQL endpoint' }],
      paths: {
        '/extensions/{graph_id}/graphql': {
          post: {
            tags: ['GraphQL'],
            summary: 'Run a GraphQL query',
            operationId: 'handleHttpPost',
            responses: {},
          },
        },
      },
      components: { schemas: {}, securitySchemes: {} },
    })
    expect(findApiTag(withGraphql, 'graphql')?.operations).toHaveLength(1)

    const collapsed = collapseGraphqlOperations(withGraphql)
    expect(findApiTag(collapsed, 'graphql')?.operations).toEqual([])
    // The tag itself still appears, as a leaf: it is where the reader should go.
    expect(collapsed.tags.map((t) => t.slug)).toEqual(['graphql'])
    // Only GraphQL is collapsed; every other tag keeps its operations.
    expect(
      collapseGraphqlOperations(catalog).tags.every(
        (t) => t.slug === 'graphql' || t.operations.length > 0
      )
    ).toBe(true)
  })

  it('narrows the catalog to one surface, tags and operations together', () => {
    const platform = catalogForSurface(catalog, 'platform')
    expect(platform.tags.map((t) => t.slug)).toEqual(['graphs'])
    expect(platform.operations.every((o) => o.surface === 'platform')).toBe(
      true
    )

    const extensions = catalogForSurface(catalog, 'extensions')
    expect(extensions.tags.map((t) => t.slug)).toEqual([
      'extensions-roboledger',
    ])
    expect(extensions.operations.every((o) => o.surface === 'extensions')).toBe(
      true
    )

    // Neither reference may silently drop an operation the other does not claim.
    expect(platform.operations.length + extensions.operations.length).toBe(
      catalog.operations.length
    )
  })

  it('skips an operation with no operationId, since no page can address it', () => {
    expect(catalog.operations.map((o) => o.summary)).not.toContain('Legacy')
  })

  it('drops a declared tag that no operation uses', () => {
    expect(findApiTag(catalog, 'unused')).toBeUndefined()
    expect(catalog.tags.map((t) => t.slug)).toEqual([
      'graphs',
      'extensions-roboledger',
    ])
  })

  it('takes the sentence from a tag description and leaves the emoji label', () => {
    expect(findApiTag(catalog, 'graphs')?.description).toBe(
      'Create and manage graphs'
    )
    // An em dash separates the label just as a hyphen does.
    expect(findApiTag(catalog, 'extensions-roboledger')?.description).toBe(
      'Named commands for writes'
    )
  })

  it('reads the auth header out of the security scheme rather than assuming it', () => {
    const listed = findApiOperation(catalog, 'graphs', 'list-graphs')
    // Two requirement objects: alternatives, each holding one scheme.
    expect(listed?.security).toHaveLength(2)
    expect(listed?.security.map((option) => option[0].parameter)).toEqual([
      'X-API-Key',
      'Authorization',
    ])
    expect(listed?.security[0][0].value).toBe('$ROBOSYSTEMS_API_KEY')
    expect(listed?.security[0][0].location).toBe('header')
  })

  it('keeps schemes required together in one option, rather than as a choice', () => {
    const anded = buildCatalog({
      ...doc,
      paths: {
        '/v1/signed': {
          post: {
            tags: ['Graphs'],
            summary: 'Signed',
            operationId: 'postSigned',
            security: [{ APIKeyHeader: [], SignatureHeader: [] }],
            responses: {},
          },
        },
      },
      components: {
        schemas: {},
        securitySchemes: {
          APIKeyHeader: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
          SignatureHeader: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Signature',
          },
        },
      },
    })
    // One option carrying both: the page must not offer them as alternatives.
    expect(anded.operations[0].security).toHaveLength(1)
    expect(anded.operations[0].security[0].map((s) => s.parameter)).toEqual([
      'X-API-Key',
      'X-Signature',
    ])
  })

  it('surfaces a scheme it cannot sample instead of dropping it', () => {
    const exotic = buildCatalog({
      ...doc,
      paths: {
        '/v1/oauth': {
          get: {
            tags: ['Graphs'],
            summary: 'OAuth',
            operationId: 'getOauth',
            security: [{ Flow: [] }, { QueryKey: [] }],
            responses: {},
          },
        },
      },
      components: {
        schemas: {},
        securitySchemes: {
          Flow: { type: 'oauth2', flows: {} },
          QueryKey: { type: 'apiKey', in: 'query', name: 'access_token' },
        },
      },
    })
    const [flow, query] = exotic.operations[0].security
    // An unrecognised scheme would otherwise read as "needs no credential".
    expect(flow[0]).toMatchObject({
      name: 'Flow',
      label: 'oauth2',
      location: 'other',
    })
    expect(query[0]).toMatchObject({
      location: 'query',
      parameter: 'access_token',
    })
  })

  it('leaves an operation with no security requirement unauthenticated', () => {
    expect(
      findApiOperation(catalog, 'graphs', 'create-graph')?.security
    ).toEqual([])
  })

  it('carries path parameters through', () => {
    const closed = findApiOperation(
      catalog,
      'extensions-roboledger',
      'close-period'
    )
    expect(closed?.parameters).toEqual([
      {
        name: 'graph_id',
        location: 'path',
        required: true,
        description: '',
        schema: { type: 'string' },
      },
    ])
  })

  it('walks neighbours within a tag and stops at its ends', () => {
    const tag = findApiTag(catalog, 'graphs')!
    expect(apiNeighbors(tag, 'list-graphs').previous).toBeUndefined()
    expect(apiNeighbors(tag, 'list-graphs').next?.slug).toBe('create-graph')
    expect(apiNeighbors(tag, 'create-graph').next).toBeUndefined()
  })
})

describe('summarize', () => {
  it('takes the first sentence with its markdown removed', () => {
    expect(summarize('Creates a **graph**. Billing applies.')).toBe(
      'Creates a graph.'
    )
  })

  it('drops fenced code, which is never a description', () => {
    expect(summarize('```json\n{"a": 1}\n```\nReturns the graph.')).toBe(
      'Returns the graph.'
    )
  })

  it('truncates on a word boundary when one sentence runs long', () => {
    const long = `${'word '.repeat(60)}end.`
    const out = summarize(long)
    expect(out.length).toBeLessThanOrEqual(155)
    expect(out.endsWith('…')).toBe(true)
    expect(out).not.toContain('wor…')
  })

  it('is empty for prose that has none', () => {
    expect(summarize('')).toBe('')
  })
})

describe('route segment config', () => {
  // Next only reads a literal from a segment config export, so the routes cannot import
  // API_REVALIDATE_SECONDS. This keeps the two from drifting apart silently.
  const routes = [
    'src/app/(docs)/docs/api/page.tsx',
    'src/app/(docs)/docs/api/[tag]/page.tsx',
    'src/app/(docs)/docs/api/[tag]/[operation]/page.tsx',
  ]

  it.each(routes)('%s revalidates on the library’s interval', (route) => {
    const source = readFileSync(join(process.cwd(), route), 'utf8')
    expect(source).toContain(
      `export const revalidate = ${API_REVALIDATE_SECONDS}`
    )
  })
})

describe('which API the reference documents', () => {
  // Both are read at module load, so the module is re-imported per case. Assigning
  // `undefined` into process.env stores the string "undefined", so an unset variable
  // has to be deleted — otherwise the fallback under test never runs.
  const reload = async (vars: Record<string, string | undefined>) => {
    vi.resetModules()
    const previous = { ...process.env }
    for (const [key, value] of Object.entries(vars)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    try {
      return await import('../openapi')
    } finally {
      process.env = previous
    }
  }

  it('follows the same build-time variable the rest of the app uses', async () => {
    const mod = await reload({
      NEXT_PUBLIC_ROBOSYSTEMS_API_URL: 'https://staging.api.robosystems.ai',
      NEXT_PUBLIC_OPENAPI_URL: undefined,
    })
    expect(mod.API_SERVER_URL).toBe('https://staging.api.robosystems.ai')
    expect(mod.OPENAPI_URL).toBe(
      'https://staging.api.robosystems.ai/openapi.json'
    )
  })

  it('falls back to production when nothing is set', async () => {
    const mod = await reload({
      NEXT_PUBLIC_ROBOSYSTEMS_API_URL: undefined,
      NEXT_PUBLIC_OPENAPI_URL: undefined,
    })
    expect(mod.OPENAPI_URL).toBe('https://api.robosystems.ai/openapi.json')
  })

  it('treats a build-time placeholder as unresolvable, not as a URL', async () => {
    // The public Docker image builds with this and substitutes it at container start, so
    // there is no API to read at build time. Pre-rendering against it would bake the
    // literal into .html, which the entrypoint's substitution does not reach.
    const mod = await reload({
      NEXT_PUBLIC_ROBOSYSTEMS_API_URL: '__PLACEHOLDER_ROBOSYSTEMS_API_URL__',
      NEXT_PUBLIC_OPENAPI_URL: undefined,
    })
    expect(mod.specUrlIsResolvable()).toBe(false)
    expect(await mod.getApiCatalog()).toBeNull()
  })

  it('treats a real URL as resolvable', async () => {
    const mod = await reload({
      NEXT_PUBLIC_ROBOSYSTEMS_API_URL: 'https://api.robosystems.ai',
      NEXT_PUBLIC_OPENAPI_URL: undefined,
    })
    expect(mod.specUrlIsResolvable()).toBe(true)
  })

  it('rejects a non-http scheme', async () => {
    const mod = await reload({
      NEXT_PUBLIC_ROBOSYSTEMS_API_URL: 'file:///etc',
      NEXT_PUBLIC_OPENAPI_URL: undefined,
    })
    expect(mod.specUrlIsResolvable()).toBe(false)
  })

  it('lets the spec URL be overridden on its own, for a local stack', async () => {
    const mod = await reload({
      NEXT_PUBLIC_ROBOSYSTEMS_API_URL: 'http://localhost:8000',
      NEXT_PUBLIC_OPENAPI_URL: 'http://localhost:8000/openapi.json',
    })
    expect(mod.OPENAPI_URL).toBe('http://localhost:8000/openapi.json')
    expect(mod.API_SERVER_URL).toBe('http://localhost:8000')
  })
})

describe('findMovedApiOperation', () => {
  // Retagging moves an operation's page. The reference was published on 2026-09-17 against
  // `Extensions: RoboLedger`; two days later that tag became eight `RoboLedger: *` tags on
  // the extensions surface, and the Auth tag shed its passkey, MFA and SSO operations. Both
  // left live URLs behind. The slug is derived from the operationId and does not move, so
  // resolving it against the whole catalog answers "where is this page now?" for any retag
  // without a rule per move.

  it('finds an operation the URL filed under the wrong tag', () => {
    const moved = findMovedApiOperation(catalog, 'close-period')
    expect(moved?.slug).toBe('close-period')
    expect(moved?.path).toBe(
      `${EXTENSIONS_BASE_PATH}/extensions-roboledger/close-period`
    )
  })

  it('looks across surfaces, which is what a retag out of /docs/api needs', () => {
    // The caller narrowed to platform and missed; the whole catalog still holds the page.
    expect(
      findApiOperation(
        catalogForSurface(catalog, 'platform'),
        'graphs',
        'close-period'
      )
    ).toBeUndefined()
    expect(findMovedApiOperation(catalog, 'close-period')?.surface).toBe(
      'extensions'
    )
  })

  it('has nothing for a slug the spec never had', () => {
    expect(findMovedApiOperation(catalog, 'no-such-operation')).toBeUndefined()
  })

  it('declines to guess when two tags share a slug', () => {
    const ambiguous = buildCatalog({
      ...doc,
      paths: {
        '/v1/a/close-period': {
          post: {
            tags: ['Graphs'],
            summary: 'Close Period',
            operationId: 'closePeriod',
            responses: { '200': { description: 'OK' } },
          },
        },
        '/extensions/b/close-period': {
          post: {
            tags: ['Extensions: RoboLedger'],
            summary: 'Close Period',
            operationId: 'closePeriod',
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    })
    expect(ambiguous.operations).toHaveLength(2)
    expect(findMovedApiOperation(ambiguous, 'close-period')).toBeUndefined()
  })
})

describe('partitionExtensionTags', () => {
  // The extensions hub renders three sections and each carries its own promise. Writes are
  // described as taking a typed request, returning an operation envelope and accepting an
  // Idempotency-Key; analytics are described as read-only queries against the materialized
  // graph. A tag in the wrong section is therefore not a layout slip, it is wrong copy
  // about what a call does.
  const tag = (name: string, slug: string): ApiTag => ({
    name,
    slug,
    path: `/docs/extensions/${slug}`,
    surface: 'extensions',
    title: name,
    description: '',
    operations: [],
  })

  const catalog = (...tags: ApiTag[]) =>
    ({ tags, operations: [], serverUrl: 'https://api.example.com' }) as never

  it('splits the surface into GraphQL, writes and analytics', () => {
    const out = partitionExtensionTags(
      catalog(
        tag('GraphQL', 'graphql'),
        tag('RoboLedger: Fiscal Close', 'roboledger-fiscal-close'),
        tag('RoboLedger: Analytical Views', 'roboledger-analytical-views')
      )
    )
    expect(out.graphql?.slug).toBe('graphql')
    expect(out.writes.map((t) => t.slug)).toEqual(['roboledger-fiscal-close'])
    expect(out.analytics.map((t) => t.slug)).toEqual([
      'roboledger-analytical-views',
    ])
  })

  it('never files an analytical tag under writes', () => {
    // The failure this guards is silent: an analytics tag that stops matching does not
    // disappear, it lands in Writes beside a promise of an operation envelope.
    const out = partitionExtensionTags(
      catalog(
        tag('RoboLedger: Analytical Views', 'roboledger-analytical-views'),
        tag('RoboInvestor: Analytical Views', 'roboinvestor-analytical-views')
      )
    )
    expect(out.writes).toEqual([])
    expect(out.analytics).toHaveLength(2)
  })

  it('recognises analytics for any domain, not just RoboLedger', () => {
    const out = partitionExtensionTags(
      catalog(
        tag('RoboInvestor: Analytical Views', 'roboinvestor-analytical-views')
      )
    )
    expect(out.analytics.map((t) => t.slug)).toEqual([
      'roboinvestor-analytical-views',
    ])
  })

  it('puts an unrecognised tag in writes rather than dropping it', () => {
    // Every tag has to land somewhere; a new domain must still be documented.
    const out = partitionExtensionTags(
      catalog(tag('RoboBizi: Setup', 'robobizi-setup'))
    )
    expect(out.writes.map((t) => t.slug)).toEqual(['robobizi-setup'])
    expect(out.analytics).toEqual([])
    expect(out.graphql).toBeUndefined()
  })
})
