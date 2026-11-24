'use client'

import { McpLogo } from '@/components/mcp/McpLogo'
import { BOOK_PATH } from '@/lib/site'
import { LiveDemo } from '@robosystems/core/ui-components'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ContactModal from './ContactModal'
import GraphStage from './GraphStage'

const TRUST_ROW = [
  'Open source (Apache 2.0 and MIT)',
  'Every number traced to its entry',
  'Your cloud, your server, or ours',
  'Claude, ChatGPT or any MCP client',
  'SOC 2 in progress',
]

export default function HeroSection() {
  const [showContactModal, setShowContactModal] = useState(false)

  // Read on mount rather than with useSearchParams: the hero now renders on the server
  // (see LandingGate), and useSearchParams there would push the whole homepage back to
  // client-side rendering, which is what left crawlers an empty page.
  useEffect(() => {
    // Check if the openContact query parameter is present
    const url = new URL(window.location.href)
    if (url.searchParams.get('openContact') === 'true') {
      setShowContactModal(true)
      // Remove the query parameter from the URL without refreshing
      url.searchParams.delete('openContact')
      window.history.replaceState({}, '', url.pathname)
    }
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* A knowledge graph in the brand film's look, over the first screen and fading out
          below it. The words sit under it on a narrow page and beside it from xl, where
          GraphStage moves the graph to the right. */}
      <div className="absolute inset-x-0 top-0 h-screen min-h-[640px] [mask-image:linear-gradient(to_bottom,black_72%,transparent)]">
        <GraphStage />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-[26rem] pb-16 sm:px-6 sm:pb-24 md:pb-32 lg:px-8 xl:pt-32">
        <div className="text-center">
          <div className="xl:max-w-[40rem] xl:text-left">
            <p className="font-heading text-secondary-300 mb-4 text-xs font-semibold tracking-[0.3em] uppercase md:mb-6">
              The open-source knowledge graph for finance
            </p>
            <h1 className="font-heading mb-6 text-4xl leading-tight font-extrabold sm:text-5xl md:mb-8 md:text-7xl xl:mb-6 xl:text-6xl">
              <span className="text-white">Finance AI</span>
              <span className="text-secondary-300 mt-2 block pb-2">
                that ties to the books.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg md:mt-8 md:text-2xl xl:mx-0 xl:mt-6 xl:text-xl">
              RoboSystems is an open-source knowledge graph that gives your AI
              agents your general ledger and public companies&apos; filings as
              structured, traceable data, on your infrastructure, with the model
              you choose.
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-white sm:text-lg md:text-xl xl:mx-0 xl:text-lg">
              Keep your ERP and your books where they are today, or keep your
              books on RoboLedger. Either way, your AI works from a knowledge
              graph of them.
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-400 sm:text-base xl:mx-0">
              Built by an inactive CPA and ex-Workiva knowledge engineer. Our
              own companies&apos; books are kept on it.
            </p>

            {/* CTA Buttons */}
            <div className="mx-auto mt-12 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center md:mt-16 xl:mt-8 xl:justify-start xl:gap-3">
              <Link
                href="/register"
                className="group from-secondary-500 to-primary-500 shadow-secondary-500/25 hover:shadow-secondary-500/40 relative overflow-hidden rounded-lg bg-linear-to-r px-6 py-3 text-base font-medium text-white shadow-2xl transition-all duration-300 sm:px-8 sm:py-4 sm:text-lg xl:px-6 xl:py-3 xl:text-base"
              >
                <span className="relative z-10">Start free trial</span>
                <div className="absolute inset-0 -translate-y-full bg-white/20 transition-transform duration-500 group-hover:translate-y-0"></div>
              </Link>
              <a
                href={BOOK_PATH}
                className="inline-flex items-center rounded-lg border border-gray-600 px-6 py-3 text-base font-medium text-white transition-all duration-300 hover:border-gray-500 hover:bg-white/5 sm:px-8 sm:py-4 sm:text-lg xl:px-6 xl:py-3 xl:text-base"
              >
                Book 20 minutes
              </a>
              <a
                href="https://github.com/RoboFinSystems/robosystems"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-6 py-3 text-base font-medium text-white transition-all duration-300 hover:border-gray-500 hover:bg-white/5 sm:px-8 sm:py-4 sm:text-lg xl:px-6 xl:py-3 xl:text-base"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Read the code
              </a>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-400 xl:mx-0">
              14 days on the SEC repository, no card. Graphs start at $99 a
              month.
            </p>
          </div>

          <div className="relative mx-auto mt-14 max-w-6xl md:mt-20">
            <LiveDemo
              name="hero"
              aspect={16 / 9}
              phoneAspect={720 / 1080}
              label="An AI chat connected to RoboSystems over MCP reads a demo company's own gross margin from its ledger graph, compares it with three public coffee companies from their 10-Ks, finds the passages that explain their margins, and saves the peer set to the company's memory, while the RoboSystems app updates beside the chat."
              className="rounded-2xl border border-gray-800 bg-black shadow-2xl"
            />
          </div>

          {/* Trust Indicators */}
          <ul className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-400 sm:text-sm md:mt-12">
            {TRUST_ROW.map((item) => (
              <li key={item} className="flex items-center gap-2">
                {item.includes('MCP') ? (
                  <McpLogo className="h-4 w-4 text-gray-300" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="bg-secondary-400 h-1.5 w-1.5 rounded-full"
                  />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </section>
  )
}
