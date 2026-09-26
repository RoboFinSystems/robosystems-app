'use client'

import { mcpEndpointFor } from '@/lib/mcp'
import { CHATGPT_PLUGIN_URL } from '@/lib/site'
import Link from 'next/link'
import FloatingElementsVariant from './FloatingElementsVariant'
import LiveDemo from './LiveDemo'

export default function SECRepositorySection() {
  return (
    <section
      id="sec-repository"
      className="relative overflow-hidden bg-black py-16 sm:py-24"
    >
      <FloatingElementsVariant variant="sec-repository" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-secondary-400 mb-4 text-sm font-semibold tracking-wider uppercase">
            SEC XBRL Repository
          </p>
          <h2 className="font-heading mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Every Public Company. Numbers and Narratives.
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            Structured XBRL facts in a knowledge graph, plus full-text and
            semantic search across MD&amp;A, risk factors, and disclosure notes.
            Subscribe once and your AI agents gain instant access to market
            intelligence&mdash;no data pipeline setup required.
          </p>
        </div>

        {/* Stats Row */}
        <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: '8,000+', label: 'Public Companies' },
            { value: '75K+', label: 'XBRL Filings' },
            { value: '40+', label: 'Canonical Concepts' },
            { value: 'Daily', label: 'Updates' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-800 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:border-gray-700 sm:p-6"
            >
              <div className="text-secondary-400 text-2xl font-bold sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-gray-400 sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo + Access Methods */}
        <div className="mb-16 grid gap-6 lg:grid-cols-5">
          {/* Console demo - Left */}
          <div className="lg:col-span-3">
            <LiveDemo
              name="sec"
              aspect={1200 / 860}
              phoneAspect={720 / 1000}
              label="The RoboSystems Console on the SEC repository shows Westrock Coffee's income statement from its 10-K, finds the MD&A passage explaining its gross margin, and breaks net sales out by segment."
              className="rounded-2xl border border-gray-800 bg-black"
            />
          </div>

          {/* Access Methods - Right */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* MCP Clients */}
            <div className="flex-1 rounded-xl border border-gray-800 bg-zinc-900/50 p-5 transition-all duration-300 hover:border-gray-700">
              <div className="mb-2 flex items-center gap-3">
                <div className="bg-secondary-500/20 flex h-9 w-9 items-center justify-center rounded-lg">
                  <svg
                    className="text-secondary-400 h-5 w-5"
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
                <h4 className="font-semibold text-white">MCP Clients</h4>
              </div>
              <p className="text-sm text-gray-400">
                Use with Claude, ChatGPT, Grok, or any MCP-compatible AI client,
                no install required.
              </p>
              <a
                href={CHATGPT_PLUGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-secondary-300 mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                Published in the ChatGPT plugin directory
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            {/* MCP Protocol */}
            <div className="flex-1 rounded-xl border border-gray-800 bg-zinc-900/50 p-5 transition-all duration-300 hover:border-gray-700">
              <div className="mb-2 flex items-center gap-3">
                <div className="bg-accent-500/20 flex h-9 w-9 items-center justify-center rounded-lg">
                  <svg
                    className="text-accent-400 h-5 w-5"
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
                <h4 className="font-semibold text-white">MCP Protocol</h4>
              </div>
              <p className="mb-2 text-sm text-gray-400">
                Paste one URL and sign in.
              </p>
              <div className="rounded-lg bg-black/40 p-2.5">
                <code className="text-xs break-all text-gray-300">
                  {mcpEndpointFor('sec')}
                </code>
              </div>
            </div>

            {/* API & SDKs */}
            <div className="flex-1 rounded-xl border border-gray-800 bg-zinc-900/50 p-5 transition-all duration-300 hover:border-gray-700">
              <div className="mb-2 flex items-center gap-3">
                <div className="bg-primary-500/20 flex h-9 w-9 items-center justify-center rounded-lg">
                  <svg
                    className="text-primary-400 h-5 w-5"
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
                <h4 className="font-semibold text-white">API & SDKs</h4>
              </div>
              <div className="space-y-1.5">
                <div className="rounded-lg bg-black/40 p-2.5">
                  <code className="text-xs text-gray-300">
                    npm i @robosystems/client
                  </code>
                </div>
                <div className="rounded-lg bg-black/40 p-2.5">
                  <code className="text-xs text-gray-300">
                    pip install robosystems-client
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="from-secondary-500 to-primary-500 shadow-secondary-500/25 hover:shadow-secondary-500/40 inline-flex items-center rounded-lg bg-linear-to-r px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all"
          >
            Get Started
          </Link>
          <Link
            href="/pricing#sec-repository"
            className="inline-flex items-center rounded-lg border border-gray-700 px-8 py-3 text-sm font-semibold text-gray-300 transition-all hover:border-gray-500 hover:text-white"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  )
}
