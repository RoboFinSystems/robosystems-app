'use client'

import { Dust, GraphGalaxies } from '@robosystems/core/graph-stage'
import { LiveDemo } from '@robosystems/core/ui-components'

export default function ProductOverview() {
  return (
    <section id="product" className="relative bg-black pb-16 sm:pb-24">
      <Dust />
      <GraphGalaxies count={2} />
      {/* Main Headline, on the brand film's field: the one band of colour on the page. */}
      <div className="from-secondary-600 via-primary-600 to-accent-500 relative mb-16 bg-linear-to-r px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <p className="mb-4 text-sm font-semibold tracking-wider text-white/80 uppercase">
          What you get
        </p>
        <h2 className="font-heading mx-auto mb-6 max-w-6xl text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          Finance AI that ties to the books.
        </h2>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

        {/* What you get, one card each */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Every number opens to its source */}
            <div className="node-card group flex flex-col rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-gray-700">
              {/* the link to the next card */}
              <span aria-hidden="true" className="node-link">
                <i />
              </span>
              <div className="node-icon mb-4 flex h-12 w-12 items-center justify-center">
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
                Every number opens to its source
              </h4>
              <p className="flex-1 text-sm text-gray-400">
                When your AI says gross margin fell two points, you click the
                figure and see the entries behind it. Nobody redoes the work to
                trust the answer.
              </p>
            </div>

            {/* Your books stay where they are */}
            <div className="node-card group flex flex-col rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-gray-700">
              {/* the link to the next card */}
              <span aria-hidden="true" className="node-link">
                <i />
              </span>
              <div className="node-icon mb-4 flex h-12 w-12 items-center justify-center">
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
                Your books stay where they are
              </h4>
              <p className="flex-1 text-sm text-gray-400">
                Your ERP is only read, and nothing changes for the people who
                close in it. If the data can&apos;t leave your control, run the
                whole platform in your own cloud. Your data trains no one&apos;s
                model.
              </p>
            </div>

            {/* Your company beside its public peers */}
            <div className="node-card group flex flex-col rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-gray-700">
              <div className="node-icon mb-4 flex h-12 w-12 items-center justify-center">
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
                Your company beside its public peers
              </h4>
              <p className="flex-1 text-sm text-gray-400">
                Your company, or each company in your portfolio, beside the
                public companies it competes with, from their SEC filings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
