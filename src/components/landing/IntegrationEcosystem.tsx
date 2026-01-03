'use client'

import { useState } from 'react'
import ContactModal from './ContactModal'
import FloatingElementsVariant from './FloatingElementsVariant'

export default function IntegrationEcosystem() {
  const [showContact, setShowContact] = useState(false)

  return (
    <section
      id="integrations"
      className="relative bg-linear-to-b from-black to-zinc-900 py-24"
    >
      <FloatingElementsVariant variant="integrations" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-6 text-4xl font-bold text-white md:text-5xl">
            Connect Your Entire Stack
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-300">
            Pre-built integrations for the tools you already use. Sync data
            automatically and build your knowledge graph effortlessly.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          {/* Integration Categories */}
          <div className="grid gap-12 md:grid-cols-2">
            {/* Financial Systems */}
            <div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border border-gray-800 bg-zinc-900 p-4 hover:border-cyan-500/30 hover:bg-zinc-900/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                    <span className="text-2xl font-bold text-white">QB</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">QuickBooks</h4>
                    <p className="text-sm text-gray-400">
                      Full accounting data sync with report creation and sharing
                      capabilities
                    </p>
                  </div>
                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                    Q1 2026
                  </span>
                </div>

                <div className="flex items-center gap-4 rounded-lg border border-gray-800 bg-zinc-900 p-4 hover:border-cyan-500/30 hover:bg-zinc-900/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                    <span className="text-xl font-bold text-white">SEC</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">SEC EDGAR</h4>
                    <p className="text-sm text-gray-400">
                      Use the MCP tools and AI agent to analyze company and
                      industry trends across 4,000+ public companies in the US.
                    </p>
                  </div>
                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                    Q1 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Enterprise Systems */}
            <div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border border-gray-800 bg-zinc-900 p-4 opacity-75 hover:border-cyan-500/30 hover:bg-zinc-900/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
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
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Plaid</h4>
                    <p className="text-sm text-gray-400">
                      Bank transactions and account data
                    </p>
                  </div>
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                    Q1 2026
                  </span>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-gray-800 bg-zinc-900 p-4 opacity-75 hover:border-cyan-500/30 hover:bg-zinc-900/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600">
                    <span className="text-xl font-bold text-white">O</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Oracle</h4>
                    <p className="text-sm text-gray-400">
                      NetSuite and Oracle Cloud
                    </p>
                  </div>
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                    Q1 2026
                  </span>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-gray-800 bg-zinc-900 p-4 opacity-75 hover:border-cyan-500/30 hover:bg-zinc-900/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600">
                    <span className="text-xl font-bold text-white">SAP</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">SAP</h4>
                    <p className="text-sm text-gray-400">
                      ERP data synchronization
                    </p>
                  </div>
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                    Q2 2026
                  </span>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-gray-800 bg-zinc-900 p-4 opacity-75 hover:border-cyan-500/30 hover:bg-zinc-900/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-700">
                    <span className="text-xl font-bold text-white">MS</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">
                      Microsoft Dynamics
                    </h4>
                    <p className="text-sm text-gray-400">
                      Dynamics 365 integration
                    </p>
                  </div>
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                    Q3 2026
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Integration CTA */}
          <div className="mt-12 rounded-2xl border border-cyan-500/30 bg-linear-to-r from-cyan-900/20 to-blue-900/20 p-8 text-center hover:border-cyan-500/30 hover:bg-cyan-900/20">
            <h3 className="mb-4 text-2xl font-semibold text-white">
              Need a Custom Integration?
            </h3>
            <p className="mb-6 text-gray-300">
              Our REST API graph database system makes it easy to connect any
              data source. We also offer professional services for complex
              integrations.
            </p>
            <button
              onClick={() => setShowContact(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-cyan-600"
            >
              Contact Integration Team
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        title="Contact Integration Team"
        description="Let us know about your integration needs and we'll help you get connected."
        formType="integration_inquiry"
      />
    </section>
  )
}
