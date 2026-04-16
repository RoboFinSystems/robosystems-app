import FloatingElementsVariant from './FloatingElementsVariant'

export default function FeaturesGrid() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-black py-16 sm:py-24"
    >
      <FloatingElementsVariant variant="features" intensity={10} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            How We Deliver It
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            A modern stack purpose-built for financial
            intelligence&mdash;knowledge graph, document search, and AI memory
            in one platform.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* LadybugDB Engine */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-orange-950/20 p-5 transition-all duration-300 hover:border-orange-500/50 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 sm:mb-6 sm:h-14 sm:w-14">
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
                <a
                  href="https://ladybugdb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-orange-300"
                >
                  LadybugDB Engine
                </a>
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Purpose-built graph database optimized for analytical workloads
                and AI-native applications.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Columnar storage for fast aggregations
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  DuckDB staging for data validation
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  LanceDB vector indexes for semantic search
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Subgraph workspaces for AI memory and isolation
                </li>
              </ul>
            </div>
          </div>

          {/* Document Search */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-emerald-950/20 p-5 transition-all duration-300 hover:border-emerald-500/50 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 sm:mb-6 sm:h-14 sm:w-14">
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
                Document Search
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Hybrid search across filings, documents, and disclosures powered
                by OpenSearch.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-400">•</span>
                  Full-text and semantic search with hybrid scoring
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-400">•</span>
                  Search across structured and unstructured data
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-400">•</span>
                  Search MD&A, risk factors, and iXBRL disclosures
                </li>
              </ul>
            </div>
          </div>

          {/* Open Source */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-green-950/20 p-5 transition-all duration-300 hover:border-green-500/50 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-7 w-7 text-green-400"
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
                Open Source
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Fork, deploy, and extend. Complete infrastructure automation
                with Docker, CloudFormation, and GitHub Actions.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-green-400">•</span>
                  TypeScript, Python, and MCP clients
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-400">•</span>
                  Docker development environment
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-400">•</span>
                  One-command AWS deployment
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-400">•</span>
                  GitHub OIDC — no stored credentials
                </li>
              </ul>
            </div>
          </div>

          {/* MCP Protocol */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-indigo-950/20 p-5 transition-all duration-300 hover:border-indigo-500/50 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 sm:mb-6 sm:h-14 sm:w-14">
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
                MCP Protocol
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Native integration with AI agents through the Model Context
                Protocol standard.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Works with Claude, Cursor, Windsurf
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Semantic element and structure resolution
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Cypher queries from natural language
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Secure API key authentication
                </li>
              </ul>
            </div>
          </div>

          {/* API & SDKs */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-purple-950/20 p-5 transition-all duration-300 hover:border-purple-500/50 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-7 w-7 text-purple-400"
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
                GraphQL for reads, named CQRS operations for writes — typed
                clients for your preferred language.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  GraphQL reads with per-graph schema introspection
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  Named operations with idempotency and audit trail
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  TypeScript and Python SDKs with full types
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  SSE streaming for real-time operation progress
                </li>
              </ul>
            </div>
          </div>

          {/* Security & Isolation */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-red-950/20 p-5 transition-all duration-300 hover:border-red-500/50 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 sm:mb-6 sm:h-14 sm:w-14">
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
                Dedicated graphs per organization with enterprise-grade security
                for your most sensitive financial data.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  Dedicated graph and workspace isolation
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  Encryption at rest and in transit
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  Role-based access control
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  Audit logging and compliance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
