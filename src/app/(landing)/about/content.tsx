'use client'

import ContactModal from '@/components/landing/ContactModal'
import FloatingElementsVariant from '@/components/landing/FloatingElementsVariant'
import Footer from '@/components/landing/Footer'
import Header from '@/components/landing/Header'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Who builds RoboSystems and why. Copy discipline matches /enterprise: SOC 2
 * Type II is "in progress", never completed or certified; RoboInvestor is
 * stated as early. Intercompany arrangements (trademark licence, management
 * services, lending) belong in the Terms, not here.
 */

const PRINCIPLES: Array<{ title: string; body: string }> = [
  {
    title: "It's yours",
    body: 'Fork the repository and you own the software: nobody can reprice it, take it away, or shut it down. Stay close to the main line and every fix, integration and reporting update comes with it. If we disappeared tomorrow, it would still run.',
  },
  {
    title: 'Data first, then AI',
    body: "Books, statements, the plan and the public filers sit on the same elements, calculation trees and dimensions. That's why a forecast balances like the ledger, a report travels as data, and a comparison with a public company lines up.",
  },
  {
    title: 'AI drafts, people sign',
    body: 'AI analyzes the books, builds the plan and drafts the close. A person approves every posting, and nothing writes back to QuickBooks until someone posts it.',
  },
]

const PRODUCTS: Array<{ name: string; href: string; body: string }> = [
  {
    name: 'RoboSystems',
    href: '/platform',
    body: 'The platform: a graph per company, the public API, an MCP server on every graph, and the SEC filing repository.',
  },
  {
    name: 'RoboLedger',
    href: 'https://roboledger.ai',
    body: 'Books, reporting, planning and the month-end close, on top of QuickBooks.',
  },
  {
    name: 'RoboInvestor',
    href: 'https://roboinvestor.ai',
    body: 'Early, and we say so. Portfolio companies share their statements into one investor graph, next to the public market.',
  },
  {
    name: 'xbrlkit',
    href: 'https://xbrlkit.com',
    body: 'A free reader for XBRL reports, one report at a time, local and with its own MCP server.',
  },
]

const sectionHeading =
  'font-heading mb-4 text-3xl font-bold text-white sm:text-4xl'
const sectionLede = 'mx-auto max-w-3xl text-gray-400'
const primaryButton =
  'rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-3 font-medium text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40'
const secondaryButton =
  'rounded-lg border border-gray-700 px-8 py-3 font-medium text-gray-300 transition-all hover:border-gray-500 hover:text-white'
const inlineLink =
  'text-white underline decoration-gray-600 underline-offset-4 transition-colors hover:decoration-cyan-400'

export default function AboutContent() {
  const [showContact, setShowContact] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden bg-black py-16 sm:py-24">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-400">
                About
              </div>
              <h1 className="font-heading mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                Financial reporting, open all the way down
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-gray-300 sm:text-xl">
                RoboSystems gives small and growing businesses financial
                reporting, planning and analysis on one structured reporting
                model, reachable from Claude, ChatGPT or any MCP client. The
                platform is open source, and we run our own books on it.
              </p>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="relative bg-zinc-950 py-16 sm:py-20">
          <FloatingElementsVariant variant="platform" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className={sectionHeading}>Why we&apos;re building it</h2>
              <div className="mx-auto max-w-3xl space-y-4 text-gray-400">
                <p>
                  Small businesses have been priced out of good financial
                  tooling. Reporting, planning and analysis software has cost
                  tens of thousands of dollars a year, sold by venture-backed
                  companies that can shut down overnight when growth
                  doesn&apos;t satisfy their investors. When they go, the
                  customer&apos;s data and workflows go with them.
                </p>
                <p>
                  RoboSystems has no outside investors. It&apos;s owned by the
                  people who build it, it runs lean, and it&apos;s built to be
                  here in ten years.
                </p>
                <p>
                  We&apos;re building it for the right reasons. AI only adds
                  value on top of well-kept data, so the work starts with
                  knowledge and data management: books structured the way
                  financial reporting is structured, every number traceable to
                  where it came from. We give companies that foundation, in the
                  open, so the AI they deploy on it actually helps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
              {PRINCIPLES.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-cyan-500/30 bg-linear-to-br from-cyan-900/40 to-cyan-900/10 p-6 sm:p-8"
                >
                  <h3 className="font-heading mb-3 text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-300">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we make */}
        <section className="relative bg-black py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className={sectionHeading}>What we make</h2>
              <p className={sectionLede}>
                One platform, and the applications that run on it.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PRODUCTS.map((product) => {
                const external = product.href.startsWith('http')
                return (
                  <Link
                    key={product.name}
                    href={product.href}
                    {...(external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="rounded-2xl border border-gray-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-gray-600"
                  >
                    <h3 className="font-heading mb-2 text-lg font-semibold text-white">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-400">{product.body}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="relative bg-zinc-950 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <h2 className={sectionHeading}>Who builds it</h2>
                <p className="text-gray-400">
                  An AI-native company, built on its own product. The roadmap is
                  pulled by what running a real business on the platform demands
                  next.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-zinc-900 p-6 sm:p-8 lg:col-span-3">
                <div className="mb-5 flex items-center gap-4">
                  <div
                    aria-hidden="true"
                    className="font-heading flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-500 text-lg font-bold text-white"
                  >
                    JF
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-white">
                      Joseph T. French
                    </h3>
                    <div className="text-sm font-medium text-cyan-400">
                      Founder
                    </div>
                  </div>
                  <a
                    href="https://www.linkedin.com/in/josephtfrench"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Joseph T. French on LinkedIn"
                    className="ml-auto text-gray-400 transition-colors hover:text-white"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p>
                    An inactive CPA with a career spent building financial data
                    systems. Principal engineer at Workiva, the SEC reporting
                    platform. Co-founder of Intrinio, a financial data vendor.
                    Has founded multiple companies and served on boards.
                  </p>
                  <p>
                    Runs all of RoboSystems: engineering and product, sales and
                    go-to-market, finance and accounting, the SOC 2 program and
                    the board. The company&apos;s own books are kept on the
                    platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The companies */}
        <section className="relative bg-black py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className={sectionHeading}>The companies behind it</h2>
            <p className="text-lg text-gray-300">
              RoboSystems is built and operated by RFS LLC.{' '}
              <a
                href="https://harbinger.finance"
                target="_blank"
                rel="noopener noreferrer"
                className={inlineLink}
              >
                Harbinger FinLab
              </a>{' '}
              is an affiliated company under the same ownership: the
              implementation and training practice that puts RoboLedger on a
              client&apos;s books, teaches the people who own them to run it,
              and then leaves the graph.
            </p>
          </div>
        </section>

        {/* Trust + CTA */}
        <section className="relative bg-zinc-950 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              <a
                href="https://github.com/RoboFinSystems"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-gray-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-gray-600"
              >
                <h3 className="font-heading mb-2 text-lg font-semibold text-white">
                  Open source
                </h3>
                <p className="text-sm text-gray-400">
                  The platform, the apps and the SDKs, public on GitHub.
                </p>
              </a>
              <a
                href="https://trust.robosystems.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-gray-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-gray-600"
              >
                <h3 className="font-heading mb-2 text-lg font-semibold text-white">
                  Trust Center
                </h3>
                <p className="text-sm text-gray-400">
                  SOC 2 Type II compliance in progress with an independent CPA
                  firm. Controls and policies on the Trust Center.
                </p>
              </a>
              <a
                href="https://status.robosystems.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-gray-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-gray-600"
              >
                <h3 className="font-heading mb-2 text-lg font-semibold text-white">
                  Status
                </h3>
                <p className="text-sm text-gray-400">
                  Uptime and incident history, hosted apart from the platform.
                </p>
              </a>
            </div>
            <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => setShowContact(true)}
                className={primaryButton}
              >
                Talk to us
              </button>
              <a
                href="https://github.com/RoboFinSystems/robosystems"
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButton + ' text-center'}
              >
                Read the code
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </div>
  )
}
