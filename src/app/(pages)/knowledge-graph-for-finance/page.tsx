import FinalCTA from '@/components/landing/FinalCTA'
import {
  Cards,
  Code,
  PAGE_BODY,
  PageHero,
  PageJsonLd,
  Section,
  TextLink,
} from '@/components/pages/PageParts'
import { getProductPage, productPageMetadata } from '@/lib/product-pages'

// Claims are checked against docs/technical (core-concepts, taxonomy-and-frameworks,
// sec-data-model-and-query-rules). The SEC figures are the tools' own output, read
// 2026-11-21; re-run the calls before changing a number.

const page = getProductPage('/knowledge-graph-for-finance')

export const metadata = productPageMetadata(page)

const NVDA_VIEWER =
  'https://xbrlkit.com/?url=https%3A%2F%2Fpublic.robosystems.ai%2F2026%2F0001045810%2F0001045810-26-000021%2Fholon.jsonld'

const holds = [
  {
    title: 'Facts',
    body: 'A number with its unit and its precision: $215,938 million, reported to the million.',
  },
  {
    title: 'Concepts',
    body: 'What the number is: revenue, gross profit, an operating lease liability. Labelled in XBRL’s standard terms wherever XBRL has one.',
  },
  {
    title: 'Periods',
    body: 'A span for flows like revenue, a single date for balances like cash. Fiscal years that end in different months stay distinct.',
  },
  {
    title: 'Entities',
    body: 'The company that reported it, its subsidiaries, and every public filer, each one a node the facts point to.',
  },
  {
    title: 'Sources',
    body: 'Where the number came from: the journal entry and the event behind a ledger balance, the filing and its tagged fact behind a public one.',
  },
  {
    title: 'Relationships',
    body: 'Which lines sum to which totals, which breakdowns belong to which statement, which entity owns which. The arithmetic is checkable.',
  },
]

// build-fact-grid, canonical concept "revenue", NVDA and AMD, 10-K, annual, read 2026-11-21.
const revenue = [
  {
    ticker: 'NVDA',
    tag: 'us-gaap:Revenues',
    rows: [
      ['Fiscal year ended Jan 25, 2026', '215,938'],
      ['Fiscal year ended Jan 26, 2025', '130,497'],
      ['Fiscal year ended Jan 28, 2024', '60,922'],
    ],
  },
  {
    ticker: 'AMD',
    tag: 'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax',
    rows: [
      ['Fiscal year ended Dec 27, 2025', '34,639'],
      ['Fiscal year ended Dec 28, 2024', '25,785'],
      ['Fiscal year ended Dec 30, 2023', '22,680'],
    ],
  },
]

const FACT_GRID_CALL = `curl -X POST "https://api.robosystems.ai/extensions/roboledger/sec/operations/build-fact-grid" \\
  -H "X-API-Key: $ROBOSYSTEMS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"canonical_concepts": ["revenue"], "entities": ["NVDA", "AMD"], "form": "10-K", "period_type": "annual"}'`

export default function KnowledgeGraphForFinancePage() {
  return (
    <>
      <PageJsonLd page={page} />
      <article>
        <PageHero
          page={page}
          caption="14 days on the SEC repository, no card. Graphs start at $99 a month."
        >
          <p>
            A knowledge graph for finance stores financial facts as connected
            nodes: each number with its concept, its period, the entity that
            reported it and the source it came from. Software and AI can read it
            the way an accountant reads a ledger or a filing, and every number
            opens to what&apos;s behind it.
          </p>
          <p>
            RoboSystems is the open-source knowledge graph for finance: your
            general ledger and 8,000+ public companies&apos; XBRL filings, read
            by your AI over MCP, on your infrastructure, with the model you
            choose.
          </p>
        </PageHero>

        <div className={PAGE_BODY}>
          <Section title="What a knowledge graph for finance holds">
            <p>
              A spreadsheet or a warehouse table keeps the number and leaves the
              meaning to whoever reads the column header. A knowledge graph
              keeps the meaning with the number, as six kinds of thing:
            </p>
            <Cards items={holds} />
          </Section>

          <Section title="A live example: one concept, two companies' tags">
            <p>
              We asked the SEC graph for revenue from NVIDIA&apos;s and
              AMD&apos;s annual reports. The two companies tag it differently
              and close their fiscal years in different months. The graph
              answers both under one concept, and names each company&apos;s own
              tag. Figures in millions of US dollars, as the tool returned them
              on November 21, 2026:
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {revenue.map((company) => (
                <div
                  key={company.ticker}
                  className="rounded-xl border border-gray-800 bg-zinc-950/60 p-5"
                >
                  <p className="font-semibold text-white">{company.ticker}</p>
                  <p className="mb-3 font-mono text-xs break-all text-gray-500">
                    {company.tag}
                  </p>
                  <table className="w-full text-base">
                    <tbody>
                      {company.rows.map(([period, value]) => (
                        <tr key={period} className="border-t border-gray-900">
                          <td className="py-2 pr-4 text-gray-400">{period}</td>
                          <td className="py-2 text-right text-white tabular-nums">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <p>The call behind it, over REST (the same tool works over MCP):</p>
            <Code>{FACT_GRID_CALL}</Code>
            <p>
              Ask for &quot;revenue&quot; with NVIDIA&apos;s ticker and the
              graph resolves the phrase to the tag NVIDIA actually reports,{' '}
              <code className="text-base text-gray-200">us-gaap:Revenues</code>,
              with 35 facts behind it. Ask for NVIDIA&apos;s income statement
              and it resolves the latest 10-K, filed February 25, 2026: gross
              profit of $153,463 million and operating income of $130,387
              million for the fiscal year ended January 25, 2026, each traced to
              its tagged fact.{' '}
              <TextLink href={NVDA_VIEWER}>Open that filing →</TextLink>
            </p>
          </Section>

          <Section title="What it does for a finance team">
            <p>
              <strong className="text-white">The numbers tie.</strong> An agent
              that reads a ledger app through an export drafts a variance
              explanation nobody can check. In a knowledge graph every number
              opens to the entries behind it, so the reviewer checks the trail
              instead of redoing the work.
            </p>
            <p>
              <strong className="text-white">
                The books stay where they&apos;re allowed to live.
              </strong>{' '}
              The graph is open source. Run it in your cloud, on your own
              server, or let us run it, and point it at the model you choose.
              Your data trains no one&apos;s model.
            </p>
            <p>
              <strong className="text-white">
                The filings sit beside the books.
              </strong>{' '}
              Your ledger and the public filings share the RoboSystems ontology:
              the graph model both use, labelled in XBRL&apos;s standard terms
              wherever XBRL has one. So your margins and a public company&apos;s
              line up without a mapping spreadsheet.
            </p>
          </Section>

          <Section title="How it differs from a data warehouse or a semantic layer">
            <p>
              A data warehouse stores tables, and the meaning of a column lives
              in the queries people write against it. A semantic layer names
              metrics over those tables, so two dashboards agree on what
              &quot;revenue&quot; means. A knowledge graph stores the meaning
              with each fact: its concept, period, entity and source travel with
              the number, and so does how it rolls up.
            </p>
            <p>
              That matters most when the reader is an AI. A model handed a table
              guesses at what a column means; a model reading a graph is told.
              Some writers call the events and decisions around these facts a
              context graph. In finance that context is part of the knowledge
              graph: see{' '}
              <TextLink href="/context-graph">context graph</TextLink>.
            </p>
          </Section>

          <Section title="Three kinds of graph on one platform">
            <p>
              A graph for your company, shared repositories of public data to
              compare it against, and graphs you define yourself. Your
              company&apos;s graph and the SEC repository share the RoboSystems
              ontology, labelled in XBRL&apos;s standard terms wherever XBRL has
              one, so your numbers and a public company&apos;s compare line for
              line. All three run on LadybugDB.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="text-white">
                  Your company&apos;s graph (an entity graph):
                </strong>{' '}
                one reporting entity or a whole group. Its books on RoboLedger,
                the general ledger built on RoboSystems, with close,
                consolidation, schedules, bank feeds, reconciliations and
                forecasting, every number traced to the entry. Or its portfolio
                on RoboInvestor: positions, and the reports your portfolio
                companies send.
              </li>
              <li>
                <strong className="text-white">Shared repositories:</strong>{' '}
                graphs RoboSystems builds from public sources and keeps current,
                the same for every subscriber, to benchmark your company against
                public peers and research a company from its filings. Today: the
                SEC repository, 8,000+ public companies&apos; 10-K, 10-Q, 20-F
                and 40-F filings, updated every weekday.{' '}
                <TextLink href="/sec-edgar-api">The SEC EDGAR API →</TextLink>
              </li>
              <li>
                <strong className="text-white">
                  Your own graphs (generic graphs):
                </strong>{' '}
                your schema, loaded from Parquet, queried with Cypher, for the
                data that&apos;s specific to your business.
              </li>
            </ul>
          </Section>

          <Section title="Open source, so the graph stays yours">
            <p>
              Open source (Apache 2.0 and MIT). Run it in your cloud, on your
              own server, or let us run it. You keep the code and the data
              whatever happens to any vendor, including us.
            </p>
            <p>
              Point its AI at the model you choose: Claude, ChatGPT or any MCP
              client, or, when you host it yourself, an open-weight model on
              your own hardware.
            </p>
            <p>
              Built by an ex-Workiva principal financial knowledge engineer and
              inactive CPA. Our own companies&apos; books are kept on it.
            </p>
          </Section>

          <Section title="Read further">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <TextLink href="/docs/technical/core-concepts">
                  Core concepts
                </TextLink>
                : graphs, facts, elements and periods in the docs
              </li>
              <li>
                <TextLink href="/docs/guides/sec-filings">
                  Analyze SEC filings with Claude or ChatGPT
                </TextLink>
              </li>
              <li>
                <TextLink href="/blog/building-financial-context-graphs">
                  Knowledge graphs and ontology for finance: architecture and
                  use cases
                </TextLink>
              </li>
              <li>
                <TextLink href="/blog/understanding-knowledge-graphs-finance">
                  Knowledge graphs: the missing link in finance
                </TextLink>
              </li>
              <li>
                <TextLink href="/blog/financial-knowledge-graph-manifesto">
                  The knowledge graph manifesto
                </TextLink>
              </li>
              <li>
                <TextLink href="https://github.com/RoboFinSystems/robosystems">
                  The code on GitHub
                </TextLink>
              </li>
            </ul>
          </Section>
        </div>
      </article>
      <FinalCTA />
    </>
  )
}
