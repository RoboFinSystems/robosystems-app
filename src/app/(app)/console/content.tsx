'use client'

import {
  ConsoleContent,
  useGraphContext,
  useIsRepository,
  type ConsoleConfig,
} from '@/lib/core'
import type { SampleQuery } from '@/lib/core/components/console/types'
import { useMemo } from 'react'

// ── SEC Repository (reporting-only schema) ──────────────────────────────

const SEC_SUBTITLE = 'Text-to-Cypher for SEC financial filings'
const SEC_DESCRIPTION =
  'Ask questions in plain English and get Cypher queries generated automatically. The SEC graph contains filings from thousands of public companies.'

const SEC_NL_EXAMPLES = [
  'How many companies are in the graph?',
  'How many facts are in the latest report?',
  'What was the last report filed?',
  'Show me NVIDIA revenue over the last 5 years',
]

const SEC_QUERY_EXAMPLES = [
  'MATCH (n) RETURN labels(n), count(n) ORDER BY count(n) DESC',
  "MATCH (e:Entity) WHERE e.ticker = 'AAPL' RETURN e",
  'MATCH (e:Entity) RETURN e.ticker, e.name, e.industry LIMIT 10',
]

const SEC_SAMPLE_QUERIES: SampleQuery[] = [
  {
    name: 'Graph overview',
    query: `MATCH (n)
RETURN labels(n) AS label, count(n) AS count
ORDER BY count DESC`,
  },
  {
    name: 'Companies by industry',
    query: `MATCH (e:Entity)
WHERE e.industry IS NOT NULL
RETURN e.industry, count(e) AS company_count
ORDER BY company_count DESC
LIMIT 15`,
  },
  {
    name: 'NVIDIA annual revenue',
    query: `MATCH (f:Fact {has_dimensions: false})-[:FACT_HAS_ELEMENT]->(el:Element {qname: 'us-gaap:Revenues'}),
      (f)-[:FACT_HAS_ENTITY]->(e:Entity),
      (f)-[:FACT_HAS_PERIOD]->(p:Period)
WHERE e.ticker = 'NVDA' AND p.duration_type = 'annual'
RETURN DISTINCT e.ticker, f.numeric_value, p.end_date
ORDER BY p.end_date DESC`,
  },
  {
    name: 'Compare net income across tech companies',
    query: `MATCH (f:Fact {has_dimensions: false})-[:FACT_HAS_ELEMENT]->(el:Element {qname: 'us-gaap:NetIncomeLoss'}),
      (f)-[:FACT_HAS_ENTITY]->(e:Entity),
      (f)-[:FACT_HAS_PERIOD]->(p:Period)
WHERE e.ticker IN ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'] AND p.duration_type = 'annual'
RETURN DISTINCT e.ticker, f.numeric_value, p.end_date
ORDER BY p.end_date DESC, f.numeric_value DESC
LIMIT 20`,
  },
  {
    name: 'Apple balance sheet by quarter',
    query: `MATCH (f:Fact {has_dimensions: false})-[:FACT_HAS_ELEMENT]->(el:Element),
      (f)-[:FACT_HAS_ENTITY]->(e:Entity),
      (f)-[:FACT_HAS_PERIOD]->(p:Period)
WHERE e.ticker = 'AAPL'
  AND el.qname IN ['us-gaap:Assets', 'us-gaap:Liabilities', 'us-gaap:StockholdersEquity']
  AND p.period_type = 'instant'
RETURN DISTINCT el.name, f.numeric_value, p.end_date
ORDER BY p.end_date DESC, el.name
LIMIT 15`,
  },
  {
    name: 'Recent SEC filings',
    query: `MATCH (e:Entity)-[:ENTITY_HAS_REPORT]->(r:Report)
RETURN e.ticker, e.name, r.form, r.report_date, r.filing_date
ORDER BY r.filing_date DESC
LIMIT 25`,
  },
  {
    name: 'Revenue by segment (dimensional)',
    query: `MATCH (f:Fact {has_dimensions: true})-[:FACT_HAS_ELEMENT]->(el:Element {qname: 'us-gaap:Revenues'}),
      (f)-[:FACT_HAS_ENTITY]->(e:Entity),
      (f)-[:FACT_HAS_DIMENSION]->(d:Dimension),
      (f)-[:FACT_HAS_PERIOD]->(p:Period)
WHERE e.ticker = 'NVDA' AND p.duration_type = 'annual'
RETURN DISTINCT d.member_uri, f.numeric_value, p.end_date
ORDER BY p.end_date DESC
LIMIT 20`,
  },
]

const SEC_MCP_EXAMPLES = [
  'Compare Tesla and Ford revenue trends',
  'Which companies in the graph have the most cash on hand?',
  'Show me Microsoft earnings per share over time',
]

// ── RoboLedger Entity Graph (transactions + reporting) ──────────────────

const ROBOLEDGER_SUBTITLE = 'Text-to-Cypher for your financial data'
const ROBOLEDGER_DESCRIPTION =
  'Ask questions in plain English and get Cypher queries generated automatically. Query transactions, journal entries, and financial reports in your graph.'

const ROBOLEDGER_NL_EXAMPLES = [
  'How many nodes are in the graph?',
  'Show me all transactions from last month',
  'What accounts have the highest balances?',
  'How many reports have been filed?',
]

const ROBOLEDGER_QUERY_EXAMPLES = [
  'MATCH (n) RETURN labels(n), count(n) ORDER BY count(n) DESC',
  'MATCH (e:Entity)-[:ENTITY_HAS_TRANSACTION]->(t:Transaction) RETURN e.name, count(t) LIMIT 10',
  'MATCH (t:Transaction) RETURN t.transaction_type, count(t) ORDER BY count(t) DESC',
]

const ROBOLEDGER_SAMPLE_QUERIES: SampleQuery[] = [
  {
    name: 'Graph overview',
    query: `MATCH (n)
RETURN labels(n) AS label, count(n) AS count
ORDER BY count DESC`,
  },
  {
    name: 'Entity summary',
    query: `MATCH (e:Entity)
RETURN e.name, e.entity_type, e.industry, e.status
LIMIT 20`,
  },
  {
    name: 'Recent transactions',
    query: `MATCH (e:Entity)-[:ENTITY_HAS_TRANSACTION]->(t:Transaction)
RETURN e.name, t.description, t.amount, t.transaction_type, t.transaction_date
ORDER BY t.transaction_date DESC
LIMIT 25`,
  },
  {
    name: 'Transaction line items by account',
    query: `MATCH (t:Transaction)-[:TRANSACTION_HAS_LINE_ITEM]->(li:LineItem)-[:LINE_ITEM_RELATES_TO_ELEMENT]->(el:Element)
RETURN el.name, sum(li.debit_amount) AS total_debits, sum(li.credit_amount) AS total_credits, count(li) AS entries
ORDER BY total_debits DESC
LIMIT 15`,
  },
  {
    name: 'Reports filed by entity',
    query: `MATCH (e:Entity)-[:ENTITY_HAS_REPORT]->(r:Report)
RETURN e.name, r.form, r.report_date, r.filing_date
ORDER BY r.filing_date DESC
LIMIT 20`,
  },
  {
    name: 'Line items with dimensional breakdowns',
    query: `MATCH (li:LineItem {has_dimensions: true})-[:LINE_ITEM_HAS_DIMENSION]->(d:Dimension)
RETURN d.axis, d.member, count(li) AS line_item_count
ORDER BY line_item_count DESC
LIMIT 15`,
  },
]

const ROBOLEDGER_MCP_EXAMPLES = [
  'Show me a breakdown of expenses by category',
  'What transactions were recorded this month?',
  'Compare revenue across entities',
]

// ── Generic Graph (no schema extensions) ────────────────────────────────

const GENERIC_SUBTITLE = 'Text-to-Cypher for your graph database'
const GENERIC_DESCRIPTION =
  'Ask questions in plain English and get Cypher queries generated automatically. Explore your graph data with natural language or direct Cypher queries.'

const GENERIC_NL_EXAMPLES = [
  'How many nodes are in the graph?',
  'What types of nodes exist?',
  'Show me some sample data',
  'What relationships connect the nodes?',
]

const GENERIC_QUERY_EXAMPLES = [
  'MATCH (n) RETURN labels(n), count(n) ORDER BY count(n) DESC',
  'MATCH ()-[r]->() RETURN type(r), count(r) ORDER BY count(r) DESC',
  'MATCH (n) RETURN n LIMIT 10',
]

const GENERIC_SAMPLE_QUERIES: SampleQuery[] = [
  {
    name: 'Graph overview',
    query: `MATCH (n)
RETURN labels(n) AS label, count(n) AS count
ORDER BY count DESC`,
  },
  {
    name: 'Relationship types',
    query: `MATCH ()-[r]->()
RETURN type(r) AS relationship, count(r) AS count
ORDER BY count DESC`,
  },
  {
    name: 'Sample nodes',
    query: `MATCH (n)
RETURN n
LIMIT 25`,
  },
  {
    name: 'Entity overview',
    query: `MATCH (e:Entity)
RETURN e.name, e.entity_type, e.industry, e.status
LIMIT 20`,
  },
  {
    name: 'Node connections',
    query: `MATCH (a)-[r]->(b)
RETURN labels(a) AS from_type, type(r) AS relationship, labels(b) AS to_type, count(*) AS count
ORDER BY count DESC
LIMIT 15`,
  },
]

const GENERIC_MCP_EXAMPLES = [
  'What data is in my graph?',
  'Show me the most connected nodes',
  'Summarize the graph structure',
]

// ── Config builder ──────────────────────────────────────────────────────

function getConsoleConfig(
  graphName: string | undefined,
  isRepository: boolean,
  repositoryType: string | undefined | null,
  schemaExtensions: string[] | undefined
): ConsoleConfig {
  const isSec = isRepository && repositoryType === 'sec'
  const hasRoboLedger = schemaExtensions?.includes('roboledger') ?? false

  let subtitle: string
  let description: string
  let nlExamples: string[]
  let queryExamples: string[]
  let sampleQueries: SampleQuery[]
  let mcpExamples: string[]

  if (isSec) {
    subtitle = SEC_SUBTITLE
    description = SEC_DESCRIPTION
    nlExamples = SEC_NL_EXAMPLES
    queryExamples = SEC_QUERY_EXAMPLES
    sampleQueries = SEC_SAMPLE_QUERIES
    mcpExamples = SEC_MCP_EXAMPLES
  } else if (hasRoboLedger) {
    subtitle = ROBOLEDGER_SUBTITLE
    description = graphName
      ? `${ROBOLEDGER_DESCRIPTION.replace('your graph', `"${graphName}"`)}`
      : ROBOLEDGER_DESCRIPTION
    nlExamples = ROBOLEDGER_NL_EXAMPLES
    queryExamples = ROBOLEDGER_QUERY_EXAMPLES
    sampleQueries = ROBOLEDGER_SAMPLE_QUERIES
    mcpExamples = ROBOLEDGER_MCP_EXAMPLES
  } else {
    subtitle = GENERIC_SUBTITLE
    description = graphName
      ? `${GENERIC_DESCRIPTION.replace('your graph', `"${graphName}"`)}`
      : GENERIC_DESCRIPTION
    nlExamples = GENERIC_NL_EXAMPLES
    queryExamples = GENERIC_QUERY_EXAMPLES
    sampleQueries = GENERIC_SAMPLE_QUERIES
    mcpExamples = GENERIC_MCP_EXAMPLES
  }

  return {
    header: {
      title: 'Console',
      subtitle,
      gradientFrom: 'from-primary-500',
      gradientTo: 'to-secondary-600',
    },
    welcome: {
      consoleName: 'RoboSystems Console',
      description,
      contextLabel: isRepository ? 'Repository' : 'Graph',
      naturalLanguageExamples: nlExamples,
      directQueryExamples: queryExamples,
      closingMessage: 'How can I help you today?',
    },
    mcp: {
      serverName: 'robosystems',
      packageName: '@robosystems/mcp',
      exampleQuestions: mcpExamples,
      contextIdFallback: 'your_graph_id',
    },
    sampleQueries,
    examplesLabel: 'Example Cypher Queries:',
    noSelectionError: 'No graph selected. Please select a graph first.',
  }
}

export function QueryInterfaceContent() {
  const { state } = useGraphContext()
  const { isRepository, currentGraph } = useIsRepository()

  const config = useMemo(
    () =>
      getConsoleConfig(
        currentGraph?.graphName,
        isRepository,
        currentGraph?.repositoryType,
        currentGraph?.schemaExtensions
      ),
    [
      currentGraph?.graphName,
      isRepository,
      currentGraph?.repositoryType,
      currentGraph?.schemaExtensions,
    ]
  )

  return <ConsoleContent config={config} />
}
