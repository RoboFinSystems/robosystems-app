'use client'

import { LogoBadge } from '@robosystems/core/ui-components/Logo'
import Link from 'next/link'
import FloatingElementsVariant from './FloatingElementsVariant'

export default function ApplicationsSection() {
  return (
    <section
      id="applications"
      className="relative bg-linear-to-b from-black to-zinc-900 py-16 sm:py-24"
    >
      <FloatingElementsVariant variant="applications" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Applications Powered by RoboSystems
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            Purpose-built applications that leverage the RoboSystems platform to
            deliver intelligent financial reporting, document search, and
            investment research capabilities.
          </p>
        </div>

        {/* Application Architecture Diagram */}
        <div className="mx-auto mb-16 max-w-4xl">
          <div className="hover:border-secondary-500/30 rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900/50 to-zinc-800/20 p-4 hover:bg-zinc-900/20 sm:p-6 md:p-8">
            <h3 className="font-heading mb-4 text-center text-lg font-semibold text-white sm:mb-6 sm:text-xl">
              How It Works
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-center overflow-x-auto">
                <div className="flex flex-col items-center gap-4 sm:gap-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-4">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="bg-secondary-600 rounded-lg px-3 py-1.5 text-sm text-white sm:px-4 sm:py-2 sm:text-base">
                        RoboLedger
                      </div>
                      <div className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white sm:px-4 sm:py-2 sm:text-base">
                        RoboInvestor
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-gray-400 sm:hidden">↕</div>
                      <div className="hidden text-gray-400 sm:block">↔</div>
                    </div>
                    <div className="bg-primary-600 rounded-lg px-4 py-4 text-sm text-white sm:px-6 sm:py-8 sm:text-base">
                      RoboSystems
                      <br className="sm:hidden" /> API
                    </div>
                    <div className="text-gray-400">
                      <span className="sm:hidden">↕</span>
                      <span className="hidden sm:inline">↔</span>
                    </div>
                    <div className="bg-accent-600 rounded-lg px-4 py-4 text-sm text-white sm:px-6 sm:py-8 sm:text-base">
                      Knowledge
                      <br className="sm:hidden" /> Graph
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-center text-sm text-gray-400">
                RoboLedger syncs QuickBooks into the RoboLedger schema for full
                ledger management, period close, AI-native financial reporting,
                and forward planning. RoboInvestor manages investment portfolios
                and provides access to the SEC Shared Repository for securities
                research. Both leverage MCP and Claude AI for natural language
                queries against the knowledge graph.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">
          {/* RoboLedger */}
          <div className="border-secondary-500/30 from-secondary-900/20 to-primary-900/20 hover:bg-secondary-900/20 relative flex flex-col overflow-hidden rounded-2xl border bg-linear-to-br">
            <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-8">
              <Link
                href="https://roboledger.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-6 flex items-center gap-4 transition-opacity hover:opacity-80"
              >
                <LogoBadge
                  app="roboledger"
                  animate="loop"
                  className="h-14 w-14"
                />
                <div>
                  <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
                    RoboLedger
                  </h3>
                  <p className="text-gray-400">AI-Native Financial Reporting</p>
                </div>
              </Link>

              <p className="mb-6 text-gray-300">
                A complete accounting close platform — connect your data
                sources, let Claude triage every transaction, close the books,
                generate XBRL-compliant financial reports, and plan the months
                ahead off the same ledger.
              </p>

              <div className="mb-8 space-y-4">
                <div>
                  <h4 className="text-secondary-300 mb-3 font-semibold">
                    Connections
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>QuickBooks over OAuth2 with on-demand sync</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Chart of accounts, journal entries, and transactions
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>Trial balance with full debit/credit detail</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-secondary-300 mb-3 font-semibold">
                    Ledger, Close &amp; Reporting
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Event-driven inbox — Claude pre-classifies, you approve
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        AI auto-maps chart of accounts to US-GAAP with
                        confidence scores
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Live Balance Sheet, Income Statement, and Cash Flow — no
                        close required
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Guided period close — fiscal calendar, depreciation and
                        prepaid schedules, rule-engine gating
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Report Creator — XBRL 2.1 and JSON-LD export with
                        publish lists
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-secondary-300 mb-3 font-semibold">
                    Planning &amp; Analysis
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Plan — actuals and forecast in one monthly grid
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Block Explorer — any number down to the facts and rules
                        behind it
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-secondary-300 mb-3 font-semibold">
                    Agents &amp; MCP
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        AI Console — ask Claude about your books in plain
                        English
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Claude drives the close over MCP — author scenarios,
                        define metrics, write handler rules
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Push approved entries back to the source system
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* RoboInvestor */}
          <div className="to-primary-900/20 relative flex flex-col overflow-hidden rounded-2xl border border-green-500/30 bg-linear-to-br from-green-900/20 hover:bg-green-900/20">
            <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-8">
              <Link
                href="https://roboinvestor.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-6 flex items-center gap-4 transition-opacity hover:opacity-80"
              >
                <LogoBadge
                  app="roboinvestor"
                  animate="loop"
                  className="h-14 w-14"
                />
                <div>
                  <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
                    RoboInvestor
                  </h3>
                  <p className="text-gray-400">
                    Investment Portfolio & AI Research
                  </p>
                </div>
              </Link>

              <p className="mb-6 text-gray-300">
                Track public and private positions in one book, research any
                public company against the SEC knowledge graph, and read equity
                research generated from the filings.
              </p>

              <div className="mb-8 space-y-4">
                <div>
                  <h4 className="mb-3 font-semibold text-green-300">
                    Portfolio Management
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        PE &amp; VC positions with full terms: SAFEs, notes, LLC
                        units, LP interests, warrants, options, and RSUs
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        Cost basis, valuations, and holdings rolled up per
                        issuer
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        Cross-graph linking — a holding connects to its
                        issuer&apos;s own graph
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-green-300">
                    SEC Research Console
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        115,000+ XBRL filings across 10,000+ public companies
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        Claude-powered deep research — plain-English questions
                        become graph queries
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        Statements rendered from the XBRL, not PDF scans
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        Full-text and semantic search across filings and your
                        own documents
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>MCP tools for Claude, Claude Code, and Cursor</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-green-300">
                    Equity Research
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        One company per report, every figure traceable to its
                        filing
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        Narrated video brief alongside the written report
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        Quarterly continuing coverage with full report history
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
