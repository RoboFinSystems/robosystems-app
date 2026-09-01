'use client'

import { MCP_OAUTH_URL } from '@/lib/mcp'
import Link from 'next/link'
import { useState } from 'react'
import ContactModal from './ContactModal'
import FloatingElementsVariant from './FloatingElementsVariant'

/**
 * The three write lanes an integration can use, in the order the API docs
 * present them. `send` is what the integration is responsible for; `enforced`
 * is what the platform guarantees on the way in — the reason to write through
 * the envelope rather than at a database.
 */
const LANES = [
  {
    tag: 'Lane 1',
    name: 'Ledger',
    border: 'border-secondary-500/30 hover:border-secondary-500/50',
    label: 'text-secondary-400',
    send: 'Business events from any system you run — invoices, payments, payroll — landed in an inbox for approval.',
    enforced: [
      'Double-entry balance',
      'Capture, then approve',
      'Closed-period gate',
      'Idempotent per source event',
    ],
  },
  {
    tag: 'Lane 2',
    name: 'Semantic facts',
    border: 'border-primary-500/30 hover:border-primary-500/50',
    label: 'text-primary-400',
    send: 'A custom vocabulary, then observed values per period — usage counts, operational KPIs.',
    enforced: [
      'Typed concepts',
      'Presentation structure',
      'Replace per period',
      'Provenance on every fact',
    ],
  },
  {
    tag: 'Lane 3',
    name: 'Raw graph',
    border: 'border-accent-500/30 hover:border-accent-500/50',
    label: 'text-accent-400',
    send: 'Parquet or CSV files, staged and materialized into graph nodes and relationships.',
    enforced: [
      'Per-graph schema',
      'Bulk ingestion pipeline',
      'Staging you can query',
    ],
  },
]

export default function BuildSection() {
  const [showContact, setShowContact] = useState(false)

  return (
    <section
      id="build"
      className="relative overflow-hidden bg-black py-16 sm:py-24"
    >
      <FloatingElementsVariant variant="features" intensity={8} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Build on RoboSystems
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            Connect your data sources, write your own integrations, and build
            applications and agents on the same public API that RoboLedger and
            RoboInvestor run on.
          </p>
        </div>

        {/* Official Integrations */}
        <div className="mb-16">
          <h3 className="mb-8 text-center text-lg font-semibold text-gray-300">
            Official Integrations
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {/* QuickBooks */}
            <div className="rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-green-500/50">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                  <span className="text-lg font-bold text-white">QB</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">QuickBooks</h4>
                  <p className="text-sm text-gray-400">Accounting</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Sync your chart of accounts, transactions, and trial balance.
                Full OAuth integration with on-demand sync.
              </p>
              <a
                href="https://quickbooks.intuit.com/partners/affiliates?cid=par_pim_4TcakSEFQs73"
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="mt-3 inline-block text-sm text-green-400 hover:text-green-300"
              >
                Need a QuickBooks account? →
              </a>
            </div>

            {/* SEC XBRL */}
            <div className="hover:border-accent-500/50 rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300">
              <div className="mb-4 flex items-center gap-4">
                <div className="bg-accent-600 flex h-12 w-12 items-center justify-center rounded-lg">
                  <span className="text-lg font-bold text-white">SEC</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">SEC XBRL</h4>
                  <p className="text-sm text-gray-400">Public Filings</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Import 10-K and 10-Q filings for any public company. Structured
                XBRL facts become queryable graph nodes.
              </p>
              <Link
                href="#sec-repository"
                className="text-secondary-400 hover:text-secondary-300 mt-3 inline-block text-sm"
              >
                See the SEC Repository →
              </Link>
            </div>

            {/* Google Drive */}
            <div className="relative rounded-xl border border-gray-800 bg-zinc-900/50 p-6 opacity-75 transition-all duration-300 hover:border-yellow-500/50">
              <span className="absolute top-4 right-4 rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400">
                Coming Soon
              </span>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-600">
                  <svg
                    className="h-7 w-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Google Drive</h4>
                  <p className="text-sm text-gray-400">Documents</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Sync documents from Google Drive into your searchable index.
                Full-text and semantic search across all your connected content.
              </p>
            </div>

            {/* Plaid */}
            <div className="hover:border-primary-500/50 relative rounded-xl border border-gray-800 bg-zinc-900/50 p-6 opacity-75 transition-all duration-300">
              <span className="absolute top-4 right-4 rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400">
                Coming Soon
              </span>
              <div className="mb-4 flex items-center gap-4">
                <div className="bg-primary-600 flex h-12 w-12 items-center justify-center rounded-lg">
                  <svg
                    className="h-7 w-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Plaid</h4>
                  <p className="text-sm text-gray-400">Banking</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Connect bank accounts directly. Transaction feeds flow into your
                knowledge graph with automatic categorization.
              </p>
            </div>
          </div>
        </div>

        {/* Extensibility */}
        <div className="mb-16 rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800/50 p-6 sm:p-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h3 className="font-heading mb-4 text-xl font-semibold text-white sm:text-2xl">
              Build Your Own Integrations
            </h3>
            <p className="text-gray-300">
              Connect any source without touching the platform. An integration
              is a small program in its own repository that writes to
              RoboSystems through the public API with an API key. It never runs
              inside the platform&mdash;so it survives every release, runs
              identically against the managed cloud or a self-hosted deployment,
              and your source credentials stay on your side.
            </p>
          </div>

          {/* Trust boundary */}
          <div className="mx-auto mb-10 max-w-4xl">
            <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-xl border border-dashed border-gray-700 bg-black/40 p-5">
                <p className="mb-4 text-center text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Your Side
                </p>
                <div className="space-y-2">
                  {['Your source system', 'Collect', 'Transform'].map(
                    (step, i) => (
                      <div key={step}>
                        {i > 0 && (
                          <div className="mb-2 text-center text-xs text-gray-600">
                            &darr;
                          </div>
                        )}
                        <div className="rounded-lg border border-gray-800 bg-zinc-900/80 px-3 py-2 text-center text-sm text-gray-300">
                          {step}
                        </div>
                      </div>
                    )
                  )}
                </div>
                <p className="mt-4 text-center text-xs text-gray-500">
                  Your repo, your runtime, your credentials
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-1.5 px-2">
                <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Public API
                </span>
                <svg
                  className="text-secondary-500/70 h-6 w-6 rotate-90 md:h-8 md:w-8 md:rotate-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
                <span className="text-xs text-gray-500">+ API key</span>
              </div>

              <div className="border-secondary-500/30 bg-secondary-950/20 rounded-xl border p-5">
                <p className="text-secondary-400/80 mb-4 text-center text-[11px] font-semibold tracking-wider uppercase">
                  RoboSystems
                </p>
                <div className="space-y-2">
                  {['Validate', 'Load', 'Graph, ledger, and documents'].map(
                    (step, i) => (
                      <div key={step}>
                        {i > 0 && (
                          <div className="text-secondary-500/40 mb-2 text-center text-xs">
                            &darr;
                          </div>
                        )}
                        <div className="border-secondary-500/20 rounded-lg border bg-zinc-900/80 px-3 py-2 text-center text-sm text-gray-300">
                          {step}
                        </div>
                      </div>
                    )
                  )}
                </div>
                <p className="mt-4 text-center text-xs text-gray-500">
                  Your integration code never runs here
                </p>
              </div>
            </div>
          </div>

          {/* Three lanes */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {LANES.map((lane) => (
              <div
                key={lane.name}
                className={`rounded-xl border bg-black/30 p-5 transition-colors ${lane.border}`}
              >
                <div className="mb-3 flex items-baseline gap-2">
                  <span
                    className={`text-[11px] font-semibold tracking-wider uppercase ${lane.label}`}
                  >
                    {lane.tag}
                  </span>
                  <h4 className="font-semibold text-white">{lane.name}</h4>
                </div>
                <p className="mb-4 text-sm text-gray-400">{lane.send}</p>
                <p className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  What we enforce
                </p>
                <ul className="space-y-1.5 text-sm text-gray-400">
                  {lane.enforced.map((item) => (
                    <li key={item} className="flex items-start">
                      <span className={`mr-2 ${lane.label}`}>&bull;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400">
            Nothing to stand up: the template ships a GitHub Actions schedule
            and a Claude Code setup&mdash;fill in collect and transform, set two
            repo secrets, and it runs.
          </p>
        </div>

        <p className="mb-16 text-center text-gray-400">
          Start from the{' '}
          <Link
            href="https://github.com/RoboFinSystems/robosystems-integration-template"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-400 hover:text-secondary-300"
          >
            integration template
          </Link>
          , see a{' '}
          <Link
            href="https://github.com/RoboFinSystems/robosystems-marketing-integration"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-400 hover:text-secondary-300"
          >
            working example
          </Link>
          , or read the{' '}
          <Link
            href="https://github.com/RoboFinSystems/robosystems/wiki/Building-Custom-Integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-400 hover:text-secondary-300"
          >
            integration guide
          </Link>
          .
        </p>

        {/* Clients & SDKs */}
        <div>
          <h3 className="mb-4 text-center text-lg font-semibold text-gray-300">
            Clients &amp; SDKs
          </h3>
          <p className="mx-auto mb-8 max-w-3xl text-center text-gray-400">
            The same surface the applications above are built on. Every graph is
            a remote MCP server, and typed clients cover the REST API end to
            end.
          </p>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {/* MCP Endpoint */}
            <div className="rounded-xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800/20 p-4 transition-all duration-300 hover:border-gray-700 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-accent-600 flex h-10 w-10 items-center justify-center rounded-lg">
                  <span className="text-xl font-bold text-white">AI</span>
                </div>
                <h4 className="font-semibold text-white">MCP Endpoint</h4>
              </div>
              <p className="mb-4 text-sm text-gray-400">
                Every graph is a remote MCP server &mdash; one URL, sign in, no
                install
              </p>
              <code className="block rounded-sm bg-zinc-800 p-2 text-xs break-all text-gray-300">
                {MCP_OAUTH_URL}
              </code>
              <div className="mt-4 flex gap-3">
                <Link
                  href="https://github.com/RoboFinSystems/robosystems-mcp-client"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-400 hover:text-secondary-300 text-sm"
                >
                  Legacy stdio bridge →
                </Link>
              </div>
            </div>

            {/* TypeScript Client */}
            <div className="rounded-xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800/20 p-4 transition-all duration-300 hover:border-gray-700 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary-600 flex h-10 w-10 items-center justify-center rounded-lg">
                  <span className="text-xl font-bold text-white">TS</span>
                </div>
                <h4 className="font-semibold text-white">TypeScript Client</h4>
              </div>
              <p className="mb-4 text-sm text-gray-400">
                Full-featured client for JavaScript and TypeScript applications
              </p>
              <code className="block rounded-sm bg-zinc-800 p-2 text-xs text-gray-300">
                npm install @robosystems/client
              </code>
              <div className="mt-4 flex gap-3">
                <Link
                  href="https://www.npmjs.com/package/@robosystems/client"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-400 hover:text-secondary-300 text-sm"
                >
                  npm →
                </Link>
                <Link
                  href="https://github.com/RoboFinSystems/robosystems-typescript-client"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-400 hover:text-secondary-300 text-sm"
                >
                  GitHub →
                </Link>
              </div>
            </div>

            {/* Python Client */}
            <div className="rounded-xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800/20 p-4 transition-all duration-300 hover:border-gray-700 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                  <span className="text-xl font-bold text-white">PY</span>
                </div>
                <h4 className="font-semibold text-white">Python Client</h4>
              </div>
              <p className="mb-4 text-sm text-gray-400">
                Python client for backend applications and data science use
                cases
              </p>
              <code className="block rounded-sm bg-zinc-800 p-2 text-xs text-gray-300">
                pip install robosystems-client
              </code>
              <div className="mt-4 flex gap-3">
                <Link
                  href="https://pypi.org/project/robosystems-client/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-400 hover:text-secondary-300 text-sm"
                >
                  PyPI →
                </Link>
                <Link
                  href="https://github.com/RoboFinSystems/robosystems-python-client"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-400 hover:text-secondary-300 text-sm"
                >
                  GitHub →
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Building an application on RoboSystems?
            <button
              onClick={() => setShowContact(true)}
              className="text-secondary-400 ml-1 hover:underline"
            >
              Contact our developer team
            </button>
          </p>
        </div>
      </div>

      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </section>
  )
}
