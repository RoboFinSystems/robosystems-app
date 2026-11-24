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
            Three kinds of graph, one platform
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            Your ledger and the public filings share the RoboSystems ontology,
            labelled in XBRL&apos;s standard terms wherever XBRL has one. A
            graph you model yourself takes your own schema. Your AI reaches all
            of it over MCP, and every answer opens to its entries or its tagged
            facts.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Your ledger */}
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
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                Your ledger
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                RoboLedger&apos;s books mapped onto the ontology, with the
                fiscal calendar and the close rules.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Chart of accounts mapped to XBRL concepts
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Period close, schedules and reconciliations
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Every entity of the group in one graph
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Every number traced to its entry
                </li>
              </ul>
            </div>
          </div>

          {/* The public record */}
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
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                The public record
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                8,000+ SEC filers&apos; XBRL filings in the same schema as your
                ledger, with search across MD&amp;A, risk factors and notes.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-400">•</span>
                  Full-text and semantic search with hybrid scoring
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-400">•</span>
                  Search MD&amp;A, risk factors, and iXBRL disclosures
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-400">•</span>
                  Statements rendered from the XBRL, not PDF scans
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
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                Your own graphs
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Bring a schema, load Parquet, query with Cypher.{' '}
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
                  LanceDB vector indexes for semantic search
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
                Subgraphs and memory
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                A subgraph is a workspace beside your graph where your AI adds
                node and relationship types and writes Cypher over MCP. Semantic
                memory carries its work between sessions.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Works with Claude, ChatGPT or any MCP client
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Schema introspection and typed GraphQL reads
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  OAuth sign-in or API key authentication
                </li>
              </ul>
            </div>
          </div>

          {/* API & SDKs */}
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
                API & SDKs
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                The platform REST API: GraphQL for reads, named operations for
                writes.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="text-secondary-400 mr-2">•</span>
                  Extensions GraphQL with per-graph schema introspection
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-400 mr-2">•</span>
                  Named operations with idempotency and audit trail
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-400 mr-2">•</span>
                  TypeScript and Python SDKs with full types
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-400 mr-2">•</span>
                  SSE streaming for real-time operation progress
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
