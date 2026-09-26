import { describe, expect, it } from 'vitest'
import { buildCatalog, type ApiCatalog, type OpenApiDocument } from '../openapi'
import {
  curlExample,
  curlExamples,
  enumValuesOf,
  exampleValue,
  hasExampleBody,
  schemaFields,
  schemaUnion,
  typeLabel,
} from '../openapi-schema'

const schemas = {
  Node: {
    type: 'object',
    title: 'Node',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'The identifier.' },
      // A model that contains itself: the table must name the type and stop.
      parent: {
        anyOf: [{ $ref: '#/components/schemas/Node' }, { type: 'null' }],
      },
      children: {
        type: 'array',
        items: { $ref: '#/components/schemas/Node' },
      },
    },
  },
  Money: {
    type: 'object',
    title: 'Money',
    required: ['amount'],
    properties: {
      amount: { type: 'integer', description: 'Minor units.' },
      currency: { type: 'string', default: 'USD' },
    },
  },
  Invoice: {
    type: 'object',
    title: 'Invoice',
    required: ['total', 'status'],
    properties: {
      total: { $ref: '#/components/schemas/Money' },
      status: { type: 'string', enum: ['draft', 'sent'] },
      note: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      due: { anyOf: [{ type: 'string', format: 'date' }, { type: 'null' }] },
      tags: { type: 'array', items: { type: 'string' } },
      payload: { additionalProperties: true, type: 'object' },
    },
  },
  // A tagged union body, the shape of the information-block operations.
  _ScheduleArm: {
    type: 'object',
    title: '_ScheduleArm',
    description: 'Body for a schedule.\n\nCarries a typed payload.',
    required: ['block_type', 'payload'],
    properties: {
      block_type: { type: 'string', const: 'schedule' },
      payload: { $ref: '#/components/schemas/Money' },
    },
  },
  _LegacyArm: {
    type: 'object',
    title: '_LegacyArm',
    required: ['block_type'],
    properties: {
      block_type: { type: 'string', enum: ['balance_sheet', 'metric'] },
    },
  },
  _RollforwardArm: {
    type: 'object',
    title: '_RollforwardArm',
    required: ['block_type'],
    properties: { block_type: { type: 'string', const: 'rollforward' } },
    examples: [{ block_type: 'rollforward' }],
  },
  _ForecastArm: {
    type: 'object',
    title: '_ForecastArm',
    required: ['block_type'],
    properties: { block_type: { type: 'string', const: 'forecast' } },
    examples: [{ block_type: 'forecast' }],
  },
  UpdateBlock: {
    title: 'UpdateBlock',
    oneOf: [
      { $ref: '#/components/schemas/_RollforwardArm' },
      { $ref: '#/components/schemas/_ForecastArm' },
      { $ref: '#/components/schemas/_LegacyArm' },
    ],
    discriminator: {
      propertyName: 'block_type',
      mapping: {
        rollforward: '#/components/schemas/_RollforwardArm',
        forecast: '#/components/schemas/_ForecastArm',
        balance_sheet: '#/components/schemas/_LegacyArm',
        metric: '#/components/schemas/_LegacyArm',
      },
    },
  },
  CreateBlock: {
    title: 'CreateBlock',
    oneOf: [
      { $ref: '#/components/schemas/_ScheduleArm' },
      { $ref: '#/components/schemas/_LegacyArm' },
    ],
    discriminator: {
      propertyName: 'block_type',
      mapping: {
        schedule: '#/components/schemas/_ScheduleArm',
        balance_sheet: '#/components/schemas/_LegacyArm',
        metric: '#/components/schemas/_LegacyArm',
      },
    },
  },
}

const doc: OpenApiDocument = {
  info: { title: 'T', version: '1' },
  tags: [{ name: 'Billing', description: '🛒 Billing - Invoices' }],
  paths: {
    '/v1/graphs/{graph_id}/invoices': {
      post: {
        tags: ['Billing'],
        summary: 'Create Invoice',
        operationId: 'createInvoice',
        security: [{ APIKeyHeader: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: 'graph_id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'period',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'preview',
            in: 'query',
            required: false,
            schema: { type: 'boolean' },
          },
          {
            name: 'Idempotency-Key',
            in: 'header',
            required: false,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Invoice' },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/v1/graphs/{graph_id}/blocks': {
      post: {
        tags: ['Billing'],
        summary: 'Update Block',
        operationId: 'updateBlock',
        security: [{ APIKeyHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateBlock' },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/v1/status': {
      get: {
        tags: ['Billing'],
        summary: 'Status',
        operationId: 'getStatus',
        responses: { '200': { description: 'OK' } },
      },
    },
  },
  components: {
    schemas,
    securitySchemes: {
      APIKeyHeader: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
      BearerAuth: { type: 'http', scheme: 'bearer' },
    },
  },
}

const catalog: ApiCatalog = buildCatalog(doc)
const invoice = { $ref: '#/components/schemas/Invoice' }
const operation = catalog.operations.find((o) => o.slug === 'create-invoice')!

describe('typeLabel', () => {
  it('names the model behind a $ref', () => {
    expect(typeLabel(catalog, { $ref: '#/components/schemas/Money' })).toBe(
      'Money'
    )
  })

  it('drops the null arm of an optional field, which the required column already says', () => {
    expect(
      typeLabel(catalog, { anyOf: [{ type: 'string' }, { type: 'null' }] })
    ).toBe('string')
  })

  it('keeps a real union', () => {
    expect(
      typeLabel(catalog, { anyOf: [{ type: 'string' }, { type: 'integer' }] })
    ).toBe('string | integer')
  })

  it('shows the item type of an array and the format of a scalar', () => {
    expect(
      typeLabel(catalog, { type: 'array', items: { type: 'string' } })
    ).toBe('string[]')
    expect(typeLabel(catalog, { type: 'string', format: 'date' })).toBe(
      'string (date)'
    )
  })
})

describe('schemaFields', () => {
  const fields = schemaFields(catalog, invoice)
  const by = (name: string) => fields.find((f) => f.name === name)!

  it('marks required against the model’s own list', () => {
    expect(by('total').required).toBe(true)
    expect(by('note').required).toBe(false)
  })

  it('surfaces enum values and defaults', () => {
    expect(by('status').enumValues).toEqual(['draft', 'sent'])
    const money = schemaFields(catalog, { $ref: '#/components/schemas/Money' })
    expect(money.find((f) => f.name === 'currency')?.defaultValue).toBe('USD')
  })

  it('opens a nested model and stops at the depth limit', () => {
    expect(by('total').nested?.name).toBe('Money')
    const nested = schemaFields(catalog, by('total').nested!.schema, 2, [
      'Money',
    ])
    expect(nested).toHaveLength(2)
    // At the cap, a field that would nest again only names its type.
    expect(schemaFields(catalog, invoice, 2)[0].nested).toBeUndefined()
  })

  it('never re-opens a model already above it, so a self-referential one terminates', () => {
    const node = schemaFields(
      catalog,
      { $ref: '#/components/schemas/Node' },
      0,
      ['Node']
    )
    expect(node.find((f) => f.name === 'parent')?.nested).toBeUndefined()
    expect(node.find((f) => f.name === 'children')?.nested).toBeUndefined()
    expect(node.find((f) => f.name === 'children')?.type).toBe('Node[]')
  })

  it('has no rows for a schema with no properties', () => {
    expect(schemaFields(catalog, { type: 'object' })).toEqual([])
    expect(schemaFields(catalog, undefined)).toEqual([])
  })
})

describe('schemaUnion', () => {
  const body = { $ref: '#/components/schemas/CreateBlock' }

  it('reads a tagged-union body as its arms, labelled by the values that pick them', () => {
    const union = schemaUnion(catalog, body)!
    expect(union.discriminator).toBe('block_type')
    expect(union.variants.map((v) => v.values)).toEqual([
      ['schedule'],
      ['balance_sheet', 'metric'],
    ])
    expect(
      schemaFields(catalog, union.variants[0].schema).map((f) => f.name)
    ).toEqual(['block_type', 'payload'])
  })

  it('leaves an ordinary model to the field table', () => {
    expect(schemaUnion(catalog, invoice)).toBeNull()
  })

  it('types a oneOf field by its members', () => {
    expect(
      typeLabel(catalog, { oneOf: [{ type: 'string' }, { type: 'object' }] })
    ).toBe('string | object')
  })

  it('examples the first arm rather than a placeholder string', () => {
    expect(exampleValue(catalog, body)).toEqual({
      block_type: 'schedule',
      payload: { amount: 0 },
    })
  })
})

describe('exampleValue', () => {
  it('builds required fields only, resolving refs and enums', () => {
    expect(exampleValue(catalog, invoice)).toEqual({
      total: { amount: 0 },
      status: 'draft',
    })
  })

  it('uses a format-appropriate placeholder', () => {
    expect(exampleValue(catalog, { type: 'string', format: 'date' })).toBe(
      '2026-01-31'
    )
  })

  it('prefers the spec’s own example over anything generated', () => {
    expect(
      exampleValue(catalog, { type: 'string', examples: ['kg1a2b3c'] })
    ).toBe('kg1a2b3c')
  })

  it('knows when there is nothing worth printing', () => {
    expect(hasExampleBody({})).toBe(false)
    expect(hasExampleBody(exampleValue(catalog, invoice))).toBe(true)
  })
})

describe('curlExample', () => {
  const curl = curlExample(catalog, operation)

  it('keeps the path template so the reader sees what to substitute', () => {
    expect(curl).toContain(
      '"https://api.robosystems.ai/v1/graphs/{graph_id}/invoices?period=<period>"'
    )
  })

  it('leaves optional query parameters out of the sample', () => {
    expect(curl).not.toContain('preview')
  })

  it('sends one auth header, because the schemes are alternatives', () => {
    expect(curl).toContain('-H "X-API-Key: $ROBOSYSTEMS_API_KEY"')
    expect(curl).not.toContain('Authorization')
  })

  it('sends every scheme of an option that requires them together', () => {
    const anded = buildCatalog({
      ...doc,
      paths: {
        '/v1/signed': {
          post: {
            tags: ['Billing'],
            summary: 'Signed',
            operationId: 'postSigned',
            security: [{ APIKeyHeader: [], CookieAuth: [] }],
            responses: {},
          },
        },
      },
      components: {
        schemas: {},
        securitySchemes: {
          APIKeyHeader: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
          CookieAuth: { type: 'apiKey', in: 'cookie', name: 'session' },
        },
      },
    })
    const sample = curlExample(anded, anded.operations[0])
    expect(sample).toContain('-H "X-API-Key: $ROBOSYSTEMS_API_KEY"')
    expect(sample).toContain('-H "Cookie: session=$ROBOSYSTEMS_API_KEY"')
  })

  it('puts a query-parameter credential in the URL, not a header', () => {
    const inQuery = buildCatalog({
      ...doc,
      paths: {
        '/v1/open': {
          get: {
            tags: ['Billing'],
            summary: 'Open',
            operationId: 'getOpen',
            security: [{ QueryKey: [] }],
            responses: {},
          },
        },
      },
      components: {
        schemas: {},
        securitySchemes: {
          QueryKey: { type: 'apiKey', in: 'query', name: 'access_token' },
        },
      },
    })
    const sample = curlExample(inQuery, inQuery.operations[0])
    expect(sample).toContain('/v1/open?access_token=$ROBOSYSTEMS_API_KEY"')
    expect(sample).not.toContain('-H "access_token')
  })

  it('names header parameters', () => {
    expect(curl).toContain('-H "Idempotency-Key: <Idempotency-Key>"')
  })

  it('carries a body only where the operation takes one', () => {
    expect(curl).toContain(`-d '{`)
    expect(curl).toContain('"status": "draft"')
    const status = catalog.operations.find((o) => o.slug === 'get-status')!
    expect(curlExample(catalog, status)).not.toContain('-d ')
  })

  it('re-opens the shell literal around a quote in the payload', () => {
    const quoted = buildCatalog({
      ...doc,
      components: {
        ...doc.components,
        schemas: {
          Note: {
            type: 'object',
            required: ['text'],
            properties: { text: { type: 'string', examples: ["it's here"] } },
          },
        },
      },
      paths: {
        '/v1/notes': {
          post: {
            tags: ['Billing'],
            summary: 'Note',
            operationId: 'createNote',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Note' },
                },
              },
            },
            responses: {},
          },
        },
      },
    })
    const sample = curlExample(quoted, quoted.operations[0])
    expect(sample).toContain(`it'\\''s here`)
  })
})

describe('curlExamples', () => {
  it('gives one sample per union arm with its own example, and none to an arm without', () => {
    const update = catalog.operations.find((o) => o.slug === 'update-block')!
    const samples = curlExamples(catalog, update)
    expect(samples.map((s) => s.label)).toEqual([
      'curl · block_type = rollforward',
      'curl · block_type = forecast',
    ])
    expect(samples[1].command).toContain('"block_type": "forecast"')
  })

  it('keeps a single sample for an ordinary body', () => {
    const samples = curlExamples(catalog, operation)
    expect(samples).toEqual([
      { label: 'curl', command: curlExample(catalog, operation) },
    ])
  })
})

describe('enumValuesOf', () => {
  it('follows a $ref so a named enum parameter still lists its values', () => {
    const withEnum = buildCatalog({
      ...doc,
      components: {
        ...doc.components,
        schemas: {
          ResponseMode: { type: 'string', enum: ['auto', 'sync', 'stream'] },
        },
      },
      paths: {
        '/v1/query': {
          get: {
            tags: ['Billing'],
            summary: 'Query',
            operationId: 'runQuery',
            parameters: [
              {
                name: 'mode',
                in: 'query',
                required: false,
                schema: { $ref: '#/components/schemas/ResponseMode' },
              },
            ],
            responses: {},
          },
        },
      },
    })
    const parameter = withEnum.operations[0].parameters[0]
    expect(typeLabel(withEnum, parameter.schema)).toBe('ResponseMode')
    expect(enumValuesOf(withEnum, parameter.schema)).toEqual([
      'auto',
      'sync',
      'stream',
    ])
  })
})
