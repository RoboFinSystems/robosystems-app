'use client'

import { useState } from 'react'
import ContactModal from './ContactModal'
import FloatingElementsVariant from './FloatingElementsVariant'

export default function PricingSection() {
  const [showContact, setShowContact] = useState(false)

  return (
    <section id="pricing" className="relative bg-black py-16 sm:py-20 md:py-24">
      <FloatingElementsVariant variant="pricing" intensity={15} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-white sm:mb-6 sm:text-4xl md:text-5xl">
            Tiered Pricing for Your Company's Needs
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            All database operations, queries, imports, and exports are included.
            Only pay for AI agent calls and analysis
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="mx-auto grid max-w-5xl gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Standard */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-cyan-700 bg-linear-to-br from-cyan-900/50 to-cyan-800/20 p-4 hover:bg-cyan-900/20 sm:p-6 md:p-8">
            <div className="flex-1">
              <div className="mb-8">
                <h3 className="font-heading mb-2 text-2xl font-bold text-white">
                  Standard
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$49.99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">
                  For testing and development, or just getting started
                </p>
              </div>
              <ul className="mb-8 space-y-4">
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  2,500 AI credits/month
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  10GB storage allocation
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Isolated graph on shared instance
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  30-day backup retention
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Community support
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowContact(true)}
                className="block w-full rounded-lg border border-cyan-700 bg-cyan-500/80 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-cyan-800/80"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Enterprise */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-orange-700 bg-linear-to-br from-orange-900/50 to-orange-800/20 p-4 hover:bg-orange-900/20 sm:p-6 md:p-8">
            <div className="flex-1">
              <div className="mb-8">
                <h3 className="font-heading mb-2 text-2xl font-bold text-white">
                  Enterprise
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$199.99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">
                  Best value for growing companies
                </p>
              </div>
              <ul className="mb-8 space-y-4">
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  15,000 AI credits/month
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  50GB storage allocation
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Dedicated instance with unlimited subgraphs
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  90-day backup retention
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Priority support
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowContact(true)}
              className="block w-full rounded-lg border border-orange-700 bg-orange-500/80 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-orange-800/80"
            >
              Contact Sales
            </button>
          </div>

          {/* Premium */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-purple-500/50 bg-linear-to-br from-purple-900/20 to-zinc-800 p-8 hover:bg-purple-900/20">
            <div className="flex-1">
              <div className="mb-8">
                <h3 className="font-heading mb-2 text-2xl font-bold text-white">
                  Premium
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$499.99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">
                  For larger companies with data-intensive operations
                </p>
              </div>
              <ul className="mb-8 space-y-4">
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  50,000 AI credits/month
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  200GB storage allocation
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Premium dedicated instance with unlimited subgraphs
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  365-day backup retention
                </li>
                <li className="flex items-start text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Priority support
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowContact(true)}
              className="block w-full rounded-lg border border-purple-500/50 bg-purple-500/80 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-purple-900/30"
            >
              Contact Sales
            </button>
          </div>
        </div>

        {/* SEC Financial Agent Add-on */}
        <div className="mt-16">
          <h3 className="mb-8 text-center text-2xl font-bold text-white">
            Shared Repository Add-On
          </h3>
          <div className="mx-auto max-w-sm">
            <div className="rounded-xl border border-green-500/30 bg-linear-to-br from-green-900/50 to-green-900/20 p-8 hover:bg-green-900/20">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-600">
                  <span className="text-2xl font-bold text-white">SEC</span>
                </div>
              </div>
              <h4 className="mb-3 text-xl font-semibold text-white">
                AI-Powered SEC Financial Analyst Agent
              </h4>
              <p className="mb-6 text-gray-300">
                Access 100,000+ SEC filings from 4,000+ public companies through
                an intelligent AI agent that understands financial relationships
                and can answer complex queries in natural language.
              </p>
              <div className="mb-6 text-3xl font-bold text-white">
                From $29.99
                <span className="text-base font-normal text-gray-400">
                  /month
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex gap-2">
                  <svg
                    className="h-4 w-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Same day access to AI enriched SEC filings</span>
                </div>
                <div className="flex gap-2">
                  <svg
                    className="h-4 w-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Natural language queries with Claude AI</span>
                </div>
                <div className="flex gap-2">
                  <svg
                    className="h-4 w-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    Benchmarking and market analytics with rich context
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowContact(true)}
                className="mt-6 block w-full rounded-lg border border-green-700 bg-green-500/80 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-green-800/80"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </section>
  )
}
