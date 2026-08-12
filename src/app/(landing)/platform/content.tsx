'use client'

import FloatingElementsVariant from '@/components/landing/FloatingElementsVariant'
import Footer from '@/components/landing/Footer'
import Header from '@/components/landing/Header'
import BusinessServices from '@/components/platform/BusinessServices'
import ConsoleDemo from '@/components/platform/ConsoleDemo'
import FinancialServices from '@/components/platform/FinancialServices'
import GraphDashboard from '@/components/platform/GraphDashboard'
import SchemaArchitecture from '@/components/platform/SchemaArchitecture'
import Link from 'next/link'

export default function PlatformContent() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-black pt-32 pb-16 sm:pt-40 sm:pb-24">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-heading mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                RoboSystems Platform
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-gray-300 sm:text-xl">
                A financial intelligence platform that unifies structured data,
                searchable documents, and AI memory&mdash;where AI doesn&apos;t
                just retrieve information, it understands meaning and context.
              </p>
            </div>
          </div>
        </section>

        {/* Platform Overview with Screenshots */}
        <section className="relative bg-zinc-950 py-16 sm:py-20">
          <FloatingElementsVariant variant="platform-graph" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-heading mb-4 text-3xl font-bold text-white sm:text-4xl">
                Knowledge Graph Management
              </h2>
              <p className="mx-auto max-w-3xl text-gray-400">
                Connect your financial data sources, maintain semantic
                relationships, and power AI-native applications. Built on{' '}
                <a
                  href="https://ladybugdb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 transition-colors hover:text-orange-300"
                >
                  LadybugDB
                </a>{' '}
                for blazing-fast analytical performance.
              </p>
            </div>

            <GraphDashboard />
          </div>
        </section>

        {/* AI-Powered Console */}
        <section className="relative bg-black py-16 sm:py-20">
          <FloatingElementsVariant variant="platform-console" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-heading mb-4 text-3xl font-bold text-white sm:text-4xl">
                AI-Powered Interactive Console
              </h2>
              <p className="mx-auto max-w-3xl text-gray-400">
                Every graph comes with an AI analyst. Ask in plain English and
                it generates the Cypher, runs it, and answers with a narrative
                backed by the data and the query behind it&mdash;or drop into
                direct Cypher yourself. Document search and semantic memory are
                built into the same console.
              </p>
            </div>

            <ConsoleDemo />

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="group rounded-xl border border-gray-800 bg-gradient-to-br from-zinc-900 to-cyan-950/20 p-6 transition-all hover:border-cyan-500/50">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
                  <svg
                    className="h-6 w-6 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Natural Language Queries
                </h3>
                <p className="text-sm text-gray-400">
                  Ask questions in plain English and an AI analyst answers with
                  a narrative, the underlying data, and the generated Cypher
                  &mdash;ready to inspect and re-run. Examples adapt to each
                  graph&apos;s schema.
                </p>
              </div>

              <div className="group rounded-xl border border-gray-800 bg-gradient-to-br from-zinc-900 to-green-950/20 p-6 transition-all hover:border-green-500/50">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                  <svg
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Real-Time Execution
                </h3>
                <p className="text-sm text-gray-400">
                  Monitor query execution with live progress updates, streaming
                  results, and per-query timing, row counts, and credit usage.
                  Direct database queries are always free.
                </p>
              </div>

              <div className="group rounded-xl border border-gray-800 bg-gradient-to-br from-zinc-900 to-purple-950/20 p-6 transition-all hover:border-purple-500/50">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                  <svg
                    className="h-6 w-6 text-purple-400"
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
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Documents &amp; Memory
                </h3>
                <p className="text-sm text-gray-400">
                  Search your graph&apos;s document knowledge base and recall
                  semantic memories that persist across sessions&mdash;the same
                  context available to Claude over MCP.
                </p>
              </div>
            </div>
          </div>
        </section>

        <SchemaArchitecture />

        <BusinessServices />

        <FinancialServices />

        {/* CTA Section */}
        <section className="bg-zinc-950 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-heading mb-4 text-3xl font-bold text-white">
              Ready to Build Your Knowledge Graph?
            </h2>
            <p className="mb-8 text-lg text-gray-400">
              Transform your financial data into a semantic layer that AI can
              truly understand
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-3 font-medium text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40"
              >
                Get Started
              </Link>
              <a
                href="https://api.robosystems.ai/docs"
                className="rounded-lg border border-gray-700 bg-zinc-800 px-8 py-3 font-medium text-white transition-all hover:bg-zinc-700"
              >
                View API Docs
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
