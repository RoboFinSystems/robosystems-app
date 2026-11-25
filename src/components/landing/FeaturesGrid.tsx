import { Dust, GraphGalaxies } from '@robosystems/core/graph-stage'
import Link from 'next/link'

export default function FeaturesGrid() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-black py-16 sm:py-24"
    >
      <Dust className="[mask-image:linear-gradient(to_bottom,black_55%,transparent)]" />
      <GraphGalaxies count={3} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Three kinds of knowledge graphs, one platform
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            A graph for your company, shared repositories of public data to
            compare it against, and graphs you define yourself. Your AI reaches
            all of them over MCP.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-400 sm:text-base">
            Your company&apos;s graph and the SEC repository share one ontology,
            labelled in XBRL&apos;s standard terms wherever XBRL has one, so
            your numbers and a public company&apos;s compare line for line.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Your company's graph: the entity graph */}
          <div className="node-card group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-5 transition-all duration-300 sm:p-6 md:p-8">
            <div className="relative">
              <div className="node-icon mx-auto mb-4 flex h-12 w-12 items-center justify-center sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-7 w-7 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-1 text-center text-lg font-semibold text-white sm:text-xl">
                Your company&apos;s graph
              </h3>
              <p className="mb-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Entity graph
              </p>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                One reporting entity or a whole group. Its books, kept on
                RoboLedger or read from the ledger you close in today. Or its
                portfolio on RoboInvestor: positions, and the reports your
                portfolio companies send.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Reports, the close, plans and metrics
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Every entity of the group in one graph
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Every number traced to its source
                </li>
              </ul>
            </div>
          </div>

          {/* Shared repositories */}
          <div className="node-card group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-5 transition-all duration-300 sm:p-6 md:p-8">
            <div className="relative">
              <div className="node-icon mx-auto mb-4 flex h-12 w-12 items-center justify-center sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-7 w-7 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-1 text-center text-lg font-semibold text-white sm:text-xl">
                Shared repositories
              </h3>
              <p className="mb-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Shared repository
              </p>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Graphs RoboSystems builds from public sources and keeps current,
                the same for every subscriber. Today: the SEC repository, 8,000+
                public companies&apos; XBRL filings.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-400">•</span>
                  Benchmark your company against public peers
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-400">•</span>
                  Research a company from its statements, MD&amp;A, risk factors
                  and notes
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-400">•</span>
                  Compare filers with each other
                </li>
              </ul>
            </div>
          </div>

          {/* Your own graphs */}
          <div className="node-card group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-5 transition-all duration-300 sm:p-6 md:p-8">
            <div className="relative">
              <div className="node-icon mx-auto mb-4 flex h-12 w-12 items-center justify-center sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-7 w-7"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 200"
                >
                  <ellipse cx="100" cy="110" rx="60" ry="70" fill="#E74C3C" />
                  <circle cx="100" cy="50" r="25" fill="#2C3E50" />
                  <line
                    x1="100"
                    y1="50"
                    x2="100"
                    y2="180"
                    stroke="#2C3E50"
                    strokeWidth="3"
                  />
                  <circle cx="70" cy="80" r="10" fill="#2C3E50" />
                  <circle cx="65" cy="110" r="12" fill="#2C3E50" />
                  <circle cx="70" cy="145" r="10" fill="#2C3E50" />
                  <circle cx="130" cy="80" r="10" fill="#2C3E50" />
                  <circle cx="135" cy="110" r="12" fill="#2C3E50" />
                  <circle cx="130" cy="145" r="10" fill="#2C3E50" />
                  <line
                    x1="90"
                    y1="35"
                    x2="80"
                    y2="20"
                    stroke="#2C3E50"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="110"
                    y1="35"
                    x2="120"
                    y2="20"
                    stroke="#2C3E50"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="80" cy="20" r="3" fill="#2C3E50" />
                  <circle cx="120" cy="20" r="3" fill="#2C3E50" />
                </svg>
              </div>
              <h3 className="font-heading mb-1 text-center text-lg font-semibold text-white sm:text-xl">
                Your own graphs
              </h3>
              <p className="mb-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Generic graph
              </p>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Your schema, loaded from Parquet, queried with Cypher, for the
                data that&apos;s specific to your business.{' '}
                <a
                  href="https://ladybugdb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-orange-300"
                >
                  LadybugDB
                </a>{' '}
                underneath.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-green-400">•</span>
                  Your own node and relationship types
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-400">•</span>
                  DuckDB staging for data validation
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-400">•</span>
                  Columnar storage for fast aggregations
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-400">•</span>
                  Vector search in the graph: find by meaning, then follow the
                  relationships, in one Cypher query
                </li>
              </ul>
            </div>
          </div>

          {/* Subgraphs and memory */}
          <div className="node-card group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-5 transition-all duration-300 sm:p-6 md:p-8">
            <div className="relative">
              <div className="node-icon mx-auto mb-4 flex h-12 w-12 items-center justify-center sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-7 w-7 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                Subgraphs &amp; Memory
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                A subgraph is a workspace beside your graph, where your AI can
                model something new and query it without touching your books.
                Memory keeps what it learns about your company between
                conversations.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Working analysis kept apart from the books
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>A peer set, a
                  mapping decision or a note about a close, remembered
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Built by your AI over MCP: Claude, ChatGPT or any MCP client
                </li>
              </ul>
            </div>
          </div>

          {/* Integrations: connections, the public API and the SDKs */}
          <div className="node-card group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-5 transition-all duration-300 sm:p-6 md:p-8">
            <div className="relative">
              <div className="node-icon mx-auto mb-4 flex h-12 w-12 items-center justify-center sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="text-secondary-400 h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                Integrations &amp; API
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Bring your other systems into the graph. QuickBooks and bank
                feeds connect directly; anything else comes in through an
                integration you write against the public API.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="text-secondary-400 mr-2">•</span>
                  Business events, like invoices and payroll, landed for
                  approval
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-400 mr-2">•</span>
                  Metrics from any system, captured as facts per period
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-400 mr-2">•</span>
                  Files from a warehouse, loaded from Parquet
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-400 mr-2">•</span>
                  TypeScript and Python SDKs, and a template to start from
                </li>
              </ul>
            </div>
          </div>

          {/* Security & Isolation */}
          <div className="node-card group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-5 transition-all duration-300 sm:p-6 md:p-8">
            <div className="relative">
              <div className="node-icon mx-auto mb-4 flex h-12 w-12 items-center justify-center sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-7 w-7 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                Security & Isolation
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                A dedicated graph-database instance per subscription, or a
                Dedicated Deployment: a segregated AWS account RoboSystems runs,
                transferable to you.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  Tested cross-tenant isolation
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  Encryption at rest and in transit
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  Passkeys, plus SSO and SCIM on Dedicated Deployments
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  <span>
                    SOC 2 Type II compliance in progress &middot;{' '}
                    <Link
                      href="/enterprise"
                      className="text-gray-300 underline decoration-gray-600 underline-offset-2 hover:text-white"
                    >
                      Deployment options
                    </Link>{' '}
                    &middot;{' '}
                    <a
                      href="https://trust.robosystems.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 underline decoration-gray-600 underline-offset-2 hover:text-white"
                    >
                      Trust Center
                    </a>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
