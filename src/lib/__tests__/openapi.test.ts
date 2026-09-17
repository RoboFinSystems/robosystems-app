import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  API_BASE_PATH,
  API_REVALIDATE_SECONDS,
  apiNeighbors,
  buildCatalog,
  findApiOperation,
  findApiTag,
  operationSlug,
  summarize,
  tagSlug,
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
