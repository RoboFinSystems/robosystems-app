'use client'

import ContactModal from '@/components/landing/ContactModal'
import FloatingElementsVariant from '@/components/landing/FloatingElementsVariant'
import Footer from '@/components/landing/Footer'
import Header from '@/components/landing/Header'
import { useUser } from '@robosystems/core/hooks'
import Link from 'next/link'
import { useState } from 'react'
import GraphPricing from './GraphPricing'
import RepositoryPricing from './RepositoryPricing'

export default function PricingContent() {
  const [showContact, setShowContact] = useState(false)
  const { isAuthenticated } = useUser()

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-black py-16 sm:py-24">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-heading mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                Transparent Pricing
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-gray-300 sm:text-xl">
                All queries, MCP tool access, and API calls are included in your
                plan. Credits are only used for AI agent calls.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative bg-zinc-950 py-16 sm:py-20">
          <FloatingElementsVariant variant="pricing" intensity={15} />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <GraphPricing
              isAuthenticated={isAuthenticated}
              onContactSales={() => setShowContact(true)}
            />

            <RepositoryPricing
              isAuthenticated={isAuthenticated}
              onContactSales={() => setShowContact(true)}
            />

            {/* FAQs */}
            <div className="mt-16">
              <h3 className="mb-8 text-center text-2xl font-bold text-white">
                Frequently Asked Questions
              </h3>
              <div className="mx-auto max-w-3xl space-y-6">
                <div className="rounded-lg border border-gray-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-gray-700">
                  <h4 className="mb-2 font-semibold text-white">
                    What are credits used for?
                  </h4>
                  <p className="text-gray-400">
                    Credits power AI agent calls — powered by Claude (Anthropic)
                    via AWS Bedrock — on your graph data. Two agents ship today:{' '}
                    <span className="text-gray-300">Text-to-Cypher</span>, which
                    turns a plain-English question into a Cypher query, runs it,
                    and answers with the query behind it; and{' '}
                    <span className="text-gray-300">account mapping</span>,
                    which maps your chart of accounts to the US-GAAP taxonomy
                    with confidence scores. Credits are calculated from actual
                    token usage per call. Everything else — MCP tool access,
                    database queries, document search, semantic memory, file
                    uploads, graph materialization, backups, and downloads — is
                    included in your plan at no additional credit cost (subject
                    to rate limits by tier).
                  </p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-gray-700">
                  <h4 className="mb-2 font-semibold text-white">
                    What AI capabilities are coming next?
                  </h4>
                  <p className="text-gray-400">
                    Those two agents, hybrid document search, and semantic
                    memory are the foundation of our AI agent system. We&apos;re
                    actively building additional agents for deeper entity
                    analysis and automated insight generation across your
                    financial data. As new capabilities launch, they&apos;ll use
                    the same credit system — more complex agents may consume
                    more credits per call, but you&apos;ll always have clear
                    visibility into usage.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-gray-700">
                  <h4 className="mb-2 font-semibold text-white">
                    How do backups work?
                  </h4>
                  <p className="text-gray-400">
                    Your graphs are backed up{' '}
                    <span className="text-gray-300">automatically</span> each
                    night, and we keep each one for your tier&apos;s retention
                    window (7 days on Standard, 30 on Large, 90 on XLarge)
                    before removing it. You can also take one{' '}
                    <span className="text-gray-300">on demand</span> from the
                    Backups page or the API — up to 2 a day on Standard, 10 on
                    Large, and no limit on XLarge. Nightly backups don&apos;t
                    count against that allowance. Every backup is a downloadable
                    archive, so you can always keep your own copy. Graphs
                    materialized from a connection — your accounting system, or
                    SEC filings — can also be rebuilt from that source. Creating
                    and downloading backups are included in your plan and
                    don&apos;t consume credits.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-gray-700">
                  <h4 className="mb-2 font-semibold text-white">
                    Can I cancel my subscription?
                  </h4>
                  <p className="text-gray-400">
                    Yes, you can cancel at any time and your subscription
                    remains active until the end of the current billing period.
                    To change graph tiers, create a new graph on the desired
                    tier and migrate your data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-black py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-heading mb-4 text-3xl font-bold text-white">
              Ready to Transform Your Financial Data?
            </h2>
            <p className="mb-8 text-lg text-gray-400">
              {isAuthenticated
                ? 'Manage your graphs and subscriptions from your dashboard'
                : 'Create a free account to start with the SEC repository, or talk to us about a dedicated graph'}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={isAuthenticated ? '/home' : '/register'}
                className="rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-3 font-medium text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </Link>
              <button
                onClick={() => {
                  setShowContact(true)
                }}
                className="rounded-lg border border-gray-700 px-8 py-3 font-medium text-gray-300 transition-all hover:border-gray-500 hover:text-white"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </div>
  )
}
