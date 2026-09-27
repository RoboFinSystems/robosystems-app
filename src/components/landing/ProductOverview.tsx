'use client'

import { LiveDemo } from '@robosystems/core/ui-components'
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
            Every Number, in Context
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            A figure on its own answers nothing. RoboSystems keeps each fact
            with the company, filing, concept and period it belongs to, the
            passage that explains it, and what your team decided about it last
            time&mdash;the three layers your AI reads before it answers.
          </p>
        </div>

        {/* One fact across the three layers */}
        <div className="mx-auto mb-16 max-w-5xl">
          <LiveDemo
            name="trace"
            aspect={1200 / 750}
            phoneAspect={720 / 1040}
            label="Westrock Coffee's 2025 gross profit as a fact in the knowledge graph, linked to its company, 10-K, concept and period, then to the MD&A passage that explains it, and to a saved memory about the peer set."
            className="rounded-2xl border border-gray-800 bg-black"
          />
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
                The bridge between the two: the graph holds what happened,
                documents what was disclosed, memory how your team handled it.
              </p>
              <div className="rounded-lg bg-black/30 p-3">
                <p className="text-xs text-gray-500 italic">
                  &ldquo;How did we classify this vendor last quarter, and
                  why?&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
