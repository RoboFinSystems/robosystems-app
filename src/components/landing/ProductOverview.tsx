'use client'

import { BOOK_PATH } from '@/lib/site'
import { LiveDemo } from '@robosystems/core/ui-components'
import Dust from './Dust'

const BOOK_LINK =
  'text-secondary-400 hover:text-secondary-300 text-sm font-medium transition-colors'

export default function ProductOverview() {
  return (
    <section id="product" className="relative bg-black pb-16 sm:pb-24">
      <Dust />
      {/* Main Headline, on the brand film's field: the one band of colour on the page. */}
      <div className="from-secondary-600 via-primary-600 to-accent-500 relative mb-16 bg-linear-to-r px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <p className="mb-4 text-sm font-semibold tracking-wider text-white/80 uppercase">
          What it&apos;s for
        </p>
        <h2 className="font-heading mx-auto mb-6 max-w-6xl text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          The numbers tie. The books stay put. The filings sit beside them.
        </h2>
        <p className="mx-auto max-w-3xl text-base text-white/90 sm:text-lg md:text-xl">
          Every number opens to the entries behind it.
        </p>
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

        {/* The three jobs */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* The numbers don't tie */}
            <div className="group flex flex-col rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-gray-700">
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
                The numbers don&apos;t tie
              </h4>
              <p className="mb-4 flex-1 text-sm text-gray-400">
                Your finance agent needs the books, not a CSV export: the chart,
                the calendar, the close rules, every number traced to its entry.
              </p>
              <a href={BOOK_PATH} className={BOOK_LINK}>
                Book 20 minutes &rarr;
              </a>
            </div>

            {/* The books can't leave */}
            <div className="group flex flex-col rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-gray-700">
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
                The books can&apos;t leave
              </h4>
              <p className="mb-4 flex-1 text-sm text-gray-400">
                AI on your clients&apos; books without the books leaving your
                control. Client confidentiality, data residency, or a legal team
                that won&apos;t send the ledger to a vendor&apos;s AI. Run it in
                your cloud or on your own server, with the model you choose.
                Your data trains no one&apos;s model.
              </p>
              <a href={BOOK_PATH} className={BOOK_LINK}>
                Book 20 minutes &rarr;
              </a>
            </div>

            {/* The filings and the books live apart */}
            <div className="group flex flex-col rounded-xl border border-gray-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-gray-700">
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
                The filings and the books live apart
              </h4>
              <p className="mb-4 flex-1 text-sm text-gray-400">
                Your ledger and 8,000+ public companies&apos; XBRL filings, in
                one ontology, with every number traced back to the entry or the
                tagged fact.
              </p>
              <a href={BOOK_PATH} className={BOOK_LINK}>
                Book 20 minutes &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
