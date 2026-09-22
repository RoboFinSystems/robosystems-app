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
    title: 'One model for every number',
    body: "Books, statements, the plan and the public filers sit on the same elements, calculation trees and dimensions. That's why a forecast balances like the ledger, a report travels as data, and a comparison with a public company lines up.",
  },
  {
    title: 'Open, and yours to leave',
    body: 'The platform is Apache-2.0 on GitHub. Read how every number is produced, run it in your own AWS account, or download your backups and go. Integrations speak the public API either way.',
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
                RoboSystems puts a company&apos;s books, its plan and the public
                filing record on one structured reporting model, reachable from
                Claude, ChatGPT or any MCP client. The platform is open source,
                and we run our own books on it.
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
              <p className={sectionLede}>
                Public companies have reported as data for more than a decade:
                every number tagged, every statement checkable, every filer
                comparable with every other. Private companies still report in
                PDFs and spreadsheets. We think the books a company already
                keeps should produce statements that travel as data too, and
                that the AI working on those books should read the same
                structure an auditor would.
              </p>
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
                </div>
                <div className="space-y-4 text-gray-300">
                  <p>
                    An inactive CPA with a career spent building financial data
                    systems. Principal engineer at Workiva, the SEC reporting
                    platform. Co-founder of Intrinio, a financial data vendor.
                    Has founded multiple companies and served on boards.
                  </p>
                  <p>
                    Owns engineering, product and the SOC 2 program at
                    RoboSystems, and keeps the company&apos;s own books on the
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
