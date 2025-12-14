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
            Enterprise-Grade Features
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            Built for scale, security, and reliability from day one.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Multi-Tenant Architecture */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-cyan-950/20 p-5 transition-all duration-300 hover:border-cyan-500/50 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-7 w-7 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                Multi-Tenant Architecture
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Each entity gets its own isolated graph database. Premium tiers
                enjoy dedicated instances.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-cyan-400">•</span>
                  Separate graph databases for each entity
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-cyan-400">•</span>
                  Subgraphs for versioning, memory layers, and access control
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-cyan-400">•</span>
                  Credit pools for AI agents and storage usage for sustainable
                  operations
                </li>
              </ul>
            </div>
          </div>

          {/* Query Queue System */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-blue-950/20 p-5 transition-all duration-300 hover:border-blue-500/50 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-7 w-7 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                Query Management System
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Production-ready query management with intelligent routing,
                prioritized queueing, and tier-based rate limiting.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-blue-400">•</span>
                  Chunked NDJSON response streaming
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-400">•</span>
                  Server-Sent Events (SSE) query queue progress updates
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-400">•</span>
                  Up to 30GB RAM available for Premium tiers
                </li>
              </ul>
            </div>
          </div>

          {/* API-First Design */}
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
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                RESTful API
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Comprehensive REST API with OpenAPI specification and Clients
                available for Python and TypeScript.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  TypeScript & Python SDKs with enhanced clients for seamless
                  integration
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  Machine-readable API reference and documentation
                </li>
              </ul>
            </div>
          </div>

          {/* Backup & Recovery */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-orange-950/20 p-5 transition-all duration-300 hover:border-orange-500/50 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 sm:mb-6 sm:h-14 sm:w-14">
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
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                Easy Backup & Restore
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Create and restore backups of your databases with a single
                click.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Up to 365-day retention
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  One-click restore from backups
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-400">•</span>
                  Download your graph database backup for easy exploration and
                  experimentation
                </li>
              </ul>
            </div>
          </div>

          {/* MCP Server Integration */}
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                MCP Server Access
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Connect AI agents directly to your graph database through our
                Model Context Protocol (MCP) server.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Direct Cypher query access for AI agents
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Works with Claude, Cursor, and most MCP clients
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-400">•</span>
                  Secure API key-based authentication
                </li>
              </ul>
            </div>
          </div>

          {/* Security */}
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="font-heading mb-3 text-center text-lg font-semibold text-white sm:text-xl">
                Enterprise Security
              </h3>
              <p className="mb-4 text-sm text-gray-300 sm:text-base">
                Enterprise-grade security with encryption at rest and in transit
                for all data.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  End-to-end encryption
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  API key management and access control
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-400">•</span>
                  VPC-based network isolation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
