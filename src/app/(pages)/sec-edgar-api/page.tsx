import FinalCTA from '@/components/landing/FinalCTA'
import {
  Code,
  PAGE_BODY,
  PageHero,
  PageJsonLd,
  Section,
  TextLink,
} from '@/components/pages/PageParts'
import { getProductPage, productPageMetadata } from '@/lib/product-pages'
import { CHATGPT_PLUGIN_URL, CLAUDE_CONNECTOR_URL } from '@/lib/site'

// Claims are checked against docs/product/robosystems/sec-filings.md and docs/technical
// (shared-repositories, sec-data-model-and-query-rules), and prices and limits against
// GET /v1/offering, on 2026-11-21.

const page = getProductPage('/sec-edgar-api')

export const metadata = productPageMetadata(page)

const operations = [
  [
    'financial-statement-analysis',
    "One company's income statement, balance sheet, cash flow or equity statement, by ticker",
  ],
  [
    'build-fact-grid',
    'Chosen concepts across companies, periods and dimensions, deduplicated',
  ],
  [
    'disclosures',
    "The map of a filing's sections: one row per note or statement",
  ],
  [
    'information-block',
    'One section read whole: its rows, breakdowns, calculation footing and text',
  ],
  [
    'describe-filing',
    'How one filing is laid out: periods, statements, notes and its Items',
  ],
  ['search-text', "Every place one filing's whole text says something"],
  ['read-text', "A window of a filing's whole text from an offset"],
]

const STATEMENT_CALL = `curl -X POST "https://api.robosystems.ai/extensions/roboledger/sec/operations/financial-statement-analysis" \\
  -H "X-API-Key: $ROBOSYSTEMS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"statement_type": "income_statement", "ticker": "NVDA", "period_type": "annual"}'`

const SEARCH_CALL = `curl -X POST "https://api.robosystems.ai/extensions/roboledger/sec/operations/search-text" \\
  -H "X-API-Key: $ROBOSYSTEMS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"ticker": "NVDA", "query": "export control*"}'`

const MCP_URL = 'https://api.robosystems.ai/v1/graphs/sec/mcp'

export default function SecEdgarApiPage() {
  return (
    <>
      <PageJsonLd page={page} />
      <article>
        <PageHero
          page={page}
          caption="14-day trial on either plan, no card to start. Then $29 or $99 a month."
        >
          <p>
            RoboSystems serves the XBRL filings of more than 8,000 public
            companies as one graph: every reported number with its concept,
            period and breakdown, and the text of each filing. Read it over a
            REST API, or let Claude, ChatGPT or any MCP client read it for you.
          </p>
        </PageHero>

        <div className={PAGE_BODY}>
          <Section title="What it covers">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Annual and quarterly reports (10-K, 10-Q, 20-F and 40-F) filed
                since January 2024, with every number tagged in them.
              </li>
              <li>
                Each filing&apos;s text, searchable across filers and readable
                whole: annual reports back to 2015, and earnings releases filed
                on 8-K since 2024, with their exhibits.
              </li>
              <li>
                Updated every weekday. The graph is read-only and shared: every
                subscriber reads the same filings.
              </li>
            </ul>
          </Section>

          <Section title="SEC filings API: seven ready-made operations">
            <p>
              Seven operations answer the common questions without writing a
              query. Each is a REST operation at{' '}
              <code className="text-base break-all text-gray-200">
                POST /extensions/roboledger/sec/operations/{'{name}'}
              </code>{' '}
              and an MCP tool of the same name.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <tbody>
                  {operations.map(([name, answers]) => (
                    <tr key={name} className="border-t border-gray-900">
                      <td className="py-3 pr-6 align-top font-mono text-sm whitespace-nowrap text-white">
                        {name}
                      </td>
                      <td className="py-3 text-gray-400">{answers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>A company&apos;s latest annual income statement:</p>
            <Code>{STATEMENT_CALL}</Code>
            <p>
              Where its latest 10-K mentions export controls, exhibits included:
            </p>
            <Code>{SEARCH_CALL}</Code>
            <p>
              Once a plan has started, Cypher queries run against the graph
              directly at{' '}
              <code className="text-base text-gray-200">
                POST /v1/graphs/sec/query/cypher
              </code>
              . Request and response schemas are in the{' '}
              <TextLink href="/docs/extensions">extensions reference</TextLink>.
            </p>
          </Section>

          <Section title="SEC EDGAR MCP server for Claude, ChatGPT and any client">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="text-white">Claude:</strong> add{' '}
                <TextLink href={CLAUDE_CONNECTOR_URL}>RoboSystems SEC</TextLink>{' '}
                from Claude&apos;s connector directory and sign in.
              </li>
              <li>
                <strong className="text-white">ChatGPT:</strong> install{' '}
                <TextLink href={CHATGPT_PLUGIN_URL}>RoboSystems</TextLink> from
                ChatGPT&apos;s plugin directory and sign in.
              </li>
              <li>
                <strong className="text-white">Any MCP client:</strong> add the
                SEC graph&apos;s address. The client runs the sign-in.
              </li>
            </ul>
            <Code wrap>{MCP_URL}</Code>
            <p>
              Reading the SEC graph through an MCP client uses no RoboSystems
              credits. The reasoning happens in your AI client; RoboSystems
              returns the data.{' '}
              <TextLink href="/docs/guides/connect-an-mcp-client">
                Setup for each client →
              </TextLink>
            </p>
          </Section>

          <Section title="EDGAR XBRL data, with the rules that make a number right">
            <p>
              Raw EDGAR XBRL leaves four traps to the reader. The graph and its
              tools handle them, and the model is told the rules:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="text-white">Totals or breakdowns.</strong>{' '}
                Consolidated totals come back unless you ask for segments, so
                breakdowns aren&apos;t added to the total twice.
              </li>
              <li>
                <strong className="text-white">
                  The same concept, different tags.
                </strong>{' '}
                Companies tag revenue several ways. A comparison names each
                company&apos;s own tag, and a phrase like &quot;operating lease
                liability&quot; resolves to the tags filers actually use.
              </li>
              <li>
                <strong className="text-white">Flows and balances.</strong>{' '}
                Revenue covers a period; assets are a point in time. They
                aren&apos;t mixed.
              </li>
              <li>
                <strong className="text-white">Fiscal years differ.</strong>{' '}
                Periods keep their real dates, so a fiscal year that ends in
                January compares correctly with one that ends in December.
              </li>
            </ul>
            <p>
              Every operation that resolves a filing names the one it picked and
              returns links: the filing in a viewer, the document as filed, and
              its EDGAR folder. A number is never a step away from its source.
            </p>
          </Section>

          <Section title="How fresh it is">
            <p>
              New filings arrive on weekdays. A new 10-K or 10-Q can be read
              whole the day it&apos;s filed, and an 8-K earnings release within
              about half an hour during the US business day. Its figures reach
              statements, comparisons and queries the next morning, after the
              nightly rebuild.
            </p>
          </Section>

          <Section title="Plans and the free trial">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="text-white">Starter, $29 a month:</strong>{' '}
                API and MCP access at standard rate limits, and one download of
                the whole graph a month.
              </li>
              <li>
                <strong className="text-white">Advanced, $99 a month:</strong>{' '}
                five times the rate limits, and four downloads a month.
              </li>
            </ul>
            <p>
              Your first subscription starts with a 14-day trial of the plan you
              pick, with no card needed to start it. The analysis operations,
              search and the download are open during the trial, at lower
              limits. Direct Cypher queries, the AI analyst and the plan&apos;s
              monthly AI credits open with the first payment. Without a card,
              the trial simply ends and nothing is charged.{' '}
              <TextLink href="/pricing">See pricing →</TextLink>
            </p>
          </Section>

          <Section title="Download the whole graph, or run it yourself">
            <p>
              Subscribers can pull the repository down as a single LadybugDB
              file and query it locally. A point-in-time copy of the same graph
              is published on{' '}
              <TextLink href="https://huggingface.co/datasets/robosystems/sec-xbrl-knowledge-graphs">
                Hugging Face
              </TextLink>{' '}
              under CC BY 4.0, with no subscription; it trails the hosted graph
              and leaves out the filing text and search.
            </p>
            <p>
              RoboSystems is open source (Apache 2.0 and MIT), so you can also
              run the platform yourself and load the filings you need. To read
              one filing at a time in the browser, with no account,{' '}
              <TextLink href="https://xbrlkit.com">xbrlkit</TextLink> is free.
            </p>
            <p>
              The SEC repository is one of three kinds of graph on the platform,
              beside your own ledger and graphs you model yourself.{' '}
              <TextLink href="/knowledge-graph-for-finance">
                What a knowledge graph for finance is →
              </TextLink>
            </p>
          </Section>
        </div>
      </article>
      <FinalCTA />
    </>
  )
}
