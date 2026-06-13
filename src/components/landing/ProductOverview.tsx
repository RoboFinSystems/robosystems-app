'use client'

import FloatingElementsVariant from './FloatingElementsVariant'

export default function ProductOverview() {
  return (
    <section id="product" className="relative bg-black py-16 sm:py-24">
      <FloatingElementsVariant variant="product" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Headline */}
        <div className="mb-16 text-center">
          <p className="text-secondary-400 mb-4 text-sm font-semibold tracking-wider uppercase">
            How It Works
          </p>
          <h2 className="font-heading mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Three Layers of Financial Intelligence
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            Your financial data isn&apos;t just numbers&mdash;it&apos;s
            decisions, relationships, documents, and institutional knowledge.
            RoboSystems unifies structured facts, searchable documents, and
            semantic memory into one platform where AI doesn&apos;t just
            retrieve information&mdash;it understands meaning and context.
          </p>
        </div>

        {/* Three Layers Visual */}
        <div className="mb-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Layer 1: Knowledge Graph */}
              <div className="border-secondary-500/50 from-secondary-950/40 relative rounded-2xl border bg-linear-to-br to-zinc-900 p-6">
                <div className="absolute -top-3 left-6">
                  <span className="bg-secondary-600 rounded-full px-3 py-1 text-xs font-medium text-white">
                    Structured
                  </span>
                </div>
                <div className="mb-4 flex h-16 items-center justify-center">
                  <svg className="h-16 w-24" viewBox="0 0 96 64" fill="none">
                    <line
                      x1="24"
                      y1="20"
                      x2="48"
                      y2="32"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeOpacity="0.5"
                    />
                    <line
                      x1="48"
                      y1="32"
                      x2="72"
                      y2="20"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeOpacity="0.5"
                    />
                    <line
                      x1="48"
                      y1="32"
                      x2="48"
                      y2="52"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeOpacity="0.5"
                    />
                    <line
                      x1="24"
                      y1="20"
                      x2="24"
                      y2="44"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeOpacity="0.5"
                    />
                    <line
                      x1="72"
                      y1="20"
                      x2="72"
                      y2="44"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeOpacity="0.5"
                    />
                    <circle cx="24" cy="20" r="6" fill="#06b6d4" />
                    <circle cx="72" cy="20" r="6" fill="#06b6d4" />
                    <circle cx="48" cy="32" r="8" fill="#0891b2" />
                    <circle cx="48" cy="52" r="5" fill="#06b6d4" />
                    <circle cx="24" cy="44" r="5" fill="#06b6d4" />
                    <circle cx="72" cy="44" r="5" fill="#06b6d4" />
                  </svg>
                </div>
                <h3 className="mb-2 text-center font-semibold text-white">
                  Knowledge Graph
                </h3>
                <p className="text-center text-sm text-gray-400">
                  XBRL facts, transactions, and relationships in a queryable
                  graph database powered by LadybugDB
                </p>
              </div>

              {/* Layer 2: Document Search */}
              <div className="border-primary-500/50 from-primary-950/40 relative rounded-2xl border bg-linear-to-br to-zinc-900 p-6">
                <div className="absolute -top-3 left-6">
                  <span className="bg-primary-600 rounded-full px-3 py-1 text-xs font-medium text-white">
                    Documents
                  </span>
                </div>
                <div className="mb-4 flex h-16 items-center justify-center">
                  <svg
                    className="text-primary-400 h-10 w-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-center font-semibold text-white">
                  Document Search
                </h3>
                <p className="text-center text-sm text-gray-400">
                  Full-text and semantic search across SEC filings, uploaded
                  documents, and connected sources via OpenSearch
                </p>
              </div>

              {/* Layer 3: AI Memory */}
              <div className="border-accent-500/50 from-accent-950/40 relative rounded-2xl border bg-linear-to-br to-zinc-900 p-6">
                <div className="absolute -top-3 left-6">
                  <span className="bg-accent-600 rounded-full px-3 py-1 text-xs font-medium text-white">
                    Memory
                  </span>
                </div>
                <div className="mb-4 flex h-16 items-center justify-center">
                  <svg
                    className="text-accent-400 h-10 w-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-center font-semibold text-white">
                  Semantic Memory
                </h3>
                <p className="text-center text-sm text-gray-400">
                  Vector embeddings and AI memory that persists across
                  sessions&mdash;context that compounds over time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What Context Enables */}
        <div className="mx-auto max-w-5xl">
          <h3 className="mb-8 text-center text-lg font-semibold text-gray-300">
            What This Enables
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Multi-hop Reasoning */}
            <div className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-gray-700">
              <div className="bg-accent-500/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <svg
                  className="text-accent-400 h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h4 className="mb-2 font-semibold text-white">
                Multi-Hop Reasoning
              </h4>
              <p className="mb-4 text-sm text-gray-400">
                AI traverses relationships across structured data and documents
                to answer complex questions spanning multiple sources.
              </p>
              <div className="rounded-lg bg-black/30 p-3">
                <p className="text-xs text-gray-500 italic">
                  &ldquo;What drove the change in gross margin compared to
                  industry peers last quarter?&rdquo;
                </p>
              </div>
            </div>

            {/* Semantic Understanding */}
            <div className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-gray-700">
              <div className="bg-secondary-500/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <svg
                  className="text-secondary-400 h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="mb-2 font-semibold text-white">
                Numbers + Narratives
              </h4>
              <p className="mb-4 text-sm text-gray-400">
                AI doesn&apos;t just know the numbers&mdash;it reads the
                context. Search risk factors by keyword, find the XBRL tags in
                those disclosures, then query actual figures across periods.
              </p>
              <div className="rounded-lg bg-black/30 p-3">
                <p className="text-xs text-gray-500 italic">
                  &ldquo;Why did goodwill drop?&rdquo; &rarr; searches
                  disclosure, finds impairment, queries the fact
                </p>
              </div>
            </div>

            {/* Institutional Memory */}
            <div className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-gray-700">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20">
                <svg
                  className="h-6 w-6 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="mb-2 font-semibold text-white">
                Institutional Memory
              </h4>
              <p className="mb-4 text-sm text-gray-400">
                Every transaction, decision, and relationship is preserved in
                the graph. AI agents build persistent memory — concepts,
                observations, and context — that compounds across sessions.
              </p>
              <div className="rounded-lg bg-black/30 p-3">
                <p className="text-xs text-gray-500 italic">
                  "What patterns did we find in last quarter's analysis?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
