/**
 * Lightweight client for the taxonomy library GraphQL endpoint.
 *
 * The library is a read-only shared resource that lives at
 * `POST /extensions/library/graphql`. It has no per-graph ACL — any
 * authenticated user can query it. We route through the existing JWT
 * auth path by pulling a fresh token from `auth-core/token-storage`
 * on each request (same pattern as the SDK's LedgerClient).
 *
 * This is a minimal direct-fetch client rather than a generated SDK
 * facade because the library schema is still evolving in the POC. Once
 * it stabilizes, codegen a `LibraryClient` alongside the others and
 * retire this module.
 */

'use client'

import { getValidToken } from '@/lib/core/auth-core/token-storage'

const DEFAULT_BASE_URL = 'http://localhost:8000'

function resolveBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_ROBOSYSTEMS_API_URL?.replace(/\/$/, '') ||
    DEFAULT_BASE_URL
  )
}

export interface LibraryTaxonomy {
  id: string
  name: string
  description: string | null
  standard: string | null
  version: string | null
  namespaceUri: string | null
  taxonomyType: string
  isShared: boolean
  isActive: boolean
  isLocked: boolean
  elementCount: number | null
}

export interface LibraryLabel {
  role: string
  language: string
  text: string
}

export interface LibraryReference {
  refType: string | null
  citation: string
  uri: string | null
}

export interface LibraryElement {
  id: string
  qname: string
  namespace: string | null
  name: string
  classification: string | null
  statementContext: string | null
  derivationRole: string | null
  balanceType: string
  periodType: string
  isAbstract: boolean
  isMonetary: boolean
  elementType: string
  source: string
  taxonomyId: string | null
  parentId: string | null
  labels: LibraryLabel[]
  references: LibraryReference[]
}

export interface LibraryEquivalence {
  element: LibraryElement
  equivalents: LibraryElement[]
}

export interface LibraryArc {
  id: string
  structureId: string
  structureName: string | null
  fromElementId: string
  fromElementQname: string | null
  fromElementName: string | null
  toElementId: string
  toElementQname: string | null
  toElementName: string | null
  associationType: string
  arcrole: string | null
  orderValue: number | null
  weight: number | null
}

export interface LibraryElementArc {
  id: string
  direction: 'outgoing' | 'incoming'
  associationType: string
  arcrole: string | null
  taxonomyId: string | null
  taxonomyStandard: string | null
  taxonomyName: string | null
  structureId: string | null
  structureName: string | null
  peer: LibraryElement
}

async function graphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = await getValidToken().catch(() => null)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${resolveBaseUrl()}/extensions/library/graphql`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ query, variables: variables ?? {} }),
  })

  if (!res.ok) {
    throw new Error(`Library GraphQL HTTP ${res.status}: ${await res.text()}`)
  }

  const payload = (await res.json()) as {
    data?: T
    errors?: Array<{ message: string; extensions?: { code?: string } }>
  }

  if (payload.errors && payload.errors.length > 0) {
    const msg = payload.errors.map((e) => e.message).join('; ')
    throw new Error(`Library GraphQL error: ${msg}`)
  }

  if (!payload.data) {
    throw new Error('Library GraphQL returned no data')
  }

  return payload.data
}

export async function listLibraryTaxonomies(
  includeElementCount = true
): Promise<LibraryTaxonomy[]> {
  const data = await graphql<{ libraryTaxonomies: LibraryTaxonomy[] }>(
    /* GraphQL */ `
      query ListLibraryTaxonomies($includeElementCount: Boolean!) {
        libraryTaxonomies(includeElementCount: $includeElementCount) {
          id
          name
          description
          standard
          version
          namespaceUri
          taxonomyType
          isShared
          isActive
          isLocked
          elementCount
        }
      }
    `,
    { includeElementCount }
  )
  return data.libraryTaxonomies
}

export async function listLibraryElements(params: {
  taxonomyId?: string
  source?: string
  classification?: string
  statementContext?: string
  derivationRole?: string
  elementType?: string
  isAbstract?: boolean | null
  limit?: number
  offset?: number
  includeLabels?: boolean
}): Promise<LibraryElement[]> {
  const data = await graphql<{ libraryElements: LibraryElement[] }>(
    /* GraphQL */ `
      query ListLibraryElements(
        $taxonomyId: ID
        $source: String
        $classification: String
        $statementContext: String
        $derivationRole: String
        $elementType: String
        $isAbstract: Boolean
        $limit: Int
        $offset: Int
        $includeLabels: Boolean!
      ) {
        libraryElements(
          taxonomyId: $taxonomyId
          source: $source
          classification: $classification
          statementContext: $statementContext
          derivationRole: $derivationRole
          elementType: $elementType
          isAbstract: $isAbstract
          limit: $limit
          offset: $offset
          includeLabels: $includeLabels
        ) {
          id
          qname
          namespace
          name
          classification
          statementContext
          derivationRole
          balanceType
          periodType
          isAbstract
          isMonetary
          elementType
          source
          taxonomyId
          parentId
          labels @include(if: $includeLabels) {
            role
            language
            text
          }
          references @include(if: $includeLabels) {
            refType
            citation
            uri
          }
        }
      }
    `,
    {
      taxonomyId: params.taxonomyId ?? null,
      source: params.source ?? null,
      classification: params.classification ?? null,
      statementContext: params.statementContext ?? null,
      derivationRole: params.derivationRole ?? null,
      elementType: params.elementType ?? null,
      isAbstract: params.isAbstract ?? null,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
      includeLabels: params.includeLabels ?? false,
    }
  )
  return data.libraryElements
}

export async function searchLibraryElements(params: {
  query: string
  source?: string
  limit?: number
}): Promise<LibraryElement[]> {
  const data = await graphql<{ searchLibraryElements: LibraryElement[] }>(
    /* GraphQL */ `
      query SearchLibraryElements(
        $query: String!
        $source: String
        $limit: Int
      ) {
        searchLibraryElements(query: $query, source: $source, limit: $limit) {
          id
          qname
          namespace
          name
          classification
          statementContext
          derivationRole
          balanceType
          periodType
          isAbstract
          elementType
          source
          taxonomyId
          labels {
            role
            language
            text
          }
          references {
            refType
            citation
            uri
          }
        }
      }
    `,
    {
      query: params.query,
      source: params.source ?? null,
      limit: params.limit ?? 50,
    }
  )
  return data.searchLibraryElements
}

export async function getLibraryElement(identifier: {
  id?: string
  qname?: string
}): Promise<LibraryElement | null> {
  const data = await graphql<{ libraryElement: LibraryElement | null }>(
    /* GraphQL */ `
      query GetLibraryElement($id: ID, $qname: String) {
        libraryElement(id: $id, qname: $qname) {
          id
          qname
          namespace
          name
          classification
          statementContext
          derivationRole
          balanceType
          periodType
          isAbstract
          isMonetary
          elementType
          source
          taxonomyId
          parentId
          labels {
            role
            language
            text
          }
          references {
            refType
            citation
            uri
          }
        }
      }
    `,
    { id: identifier.id ?? null, qname: identifier.qname ?? null }
  )
  return data.libraryElement
}

export async function listLibraryTaxonomyArcs(
  taxonomyId: string,
  opts: {
    associationType?: string
    limit?: number
    offset?: number
  } = {}
): Promise<{ arcs: LibraryArc[]; count: number }> {
  const data = await graphql<{
    libraryTaxonomyArcs: LibraryArc[]
    libraryTaxonomyArcCount: number
  }>(
    /* GraphQL */ `
      query ListLibraryTaxonomyArcs(
        $taxonomyId: ID!
        $associationType: String
        $limit: Int
        $offset: Int
      ) {
        libraryTaxonomyArcCount(taxonomyId: $taxonomyId)
        libraryTaxonomyArcs(
          taxonomyId: $taxonomyId
          associationType: $associationType
          limit: $limit
          offset: $offset
        ) {
          id
          structureId
          structureName
          fromElementId
          fromElementQname
          fromElementName
          toElementId
          toElementQname
          toElementName
          associationType
          arcrole
        }
      }
    `,
    {
      taxonomyId,
      associationType: opts.associationType ?? null,
      limit: opts.limit ?? 200,
      offset: opts.offset ?? 0,
    }
  )
  return {
    arcs: data.libraryTaxonomyArcs,
    count: data.libraryTaxonomyArcCount,
  }
}

export async function getLibraryElementArcs(
  id: string
): Promise<LibraryElementArc[]> {
  const data = await graphql<{
    libraryElementArcs: LibraryElementArc[]
  }>(
    /* GraphQL */ `
      query GetLibraryElementArcs($id: ID!) {
        libraryElementArcs(id: $id) {
          id
          direction
          associationType
          arcrole
          taxonomyId
          taxonomyStandard
          taxonomyName
          structureId
          structureName
          peer {
            id
            qname
            name
            classification
            statementContext
            derivationRole
            source
          }
        }
      }
    `,
    { id }
  )
  return data.libraryElementArcs
}

export async function getLibraryElementEquivalents(
  id: string
): Promise<LibraryEquivalence | null> {
  const data = await graphql<{
    libraryElementEquivalents: LibraryEquivalence | null
  }>(
    /* GraphQL */ `
      query GetLibraryElementEquivalents($id: ID!) {
        libraryElementEquivalents(id: $id) {
          element {
            id
            qname
            name
            classification
            statementContext
            derivationRole
            source
          }
          equivalents {
            id
            qname
            name
            classification
            statementContext
            derivationRole
            source
          }
        }
      }
    `,
    { id }
  )
  return data.libraryElementEquivalents
}
