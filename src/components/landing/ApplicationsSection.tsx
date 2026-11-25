'use client'

import { GraphGalaxies, GraphOrb } from '@robosystems/core/graph-stage'
import { LogoBadge } from '@robosystems/core/ui-components/Logo'
import Link from 'next/link'

export default function ApplicationsSection() {
  return (
    <section
      id="applications"
      className="relative bg-linear-to-b from-black to-zinc-900 py-16 sm:py-24"
    >
      <GraphOrb side="left" count={3} />
      <GraphGalaxies count={2} keepClear="left" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            What&apos;s built on it
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            Products that run on the same platform and the same public API.
          </p>
        </div>

        {/* Application Architecture Diagram */}
        <div className="mx-auto mb-16 max-w-4xl">
          <div className="node-card rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900/50 to-zinc-800/20 p-4 hover:bg-zinc-900/20 sm:p-6 md:p-8">
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
                RoboLedger keeps the books in the ledger graph. RoboInvestor
                tracks positions beside the SEC repository. Both expose MCP
                tools.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">
          {/* RoboLedger */}
          <div className="border-secondary-500/30 from-secondary-900/20 to-primary-900/20 hover:bg-secondary-900/20 relative flex flex-col overflow-hidden rounded-2xl border bg-linear-to-br">
            <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-8">
              <p className="text-secondary-400 mb-3 text-xs font-semibold tracking-wider uppercase">
                Inside your company
              </p>
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
                  <p className="text-gray-400">
                    The general ledger built on RoboSystems
                  </p>
                </div>
              </Link>

              <p className="mb-6 text-gray-300">
                A full accounting system in its own right: close, consolidation,
                schedules, bank feeds, reconciliations and forecasting, every
                number traced to the entry.
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
                        <a
                          href="https://roboledger.ai/quickbooks-mcp"
                          className="text-secondary-300 hover:text-secondary-200 underline-offset-2 hover:underline"
                        >
                          QuickBooks MCP server
                        </a>{' '}
                        for Claude, ChatGPT, or any MCP client
                      </span>
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
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        <a
                          href="https://mercury.com/partner/robosystems"
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          className="text-secondary-300 hover:text-secondary-200 underline-offset-2 hover:underline"
                        >
                          Mercury
                        </a>{' '}
                        and Plaid bank feeds: posted transactions land in the
                        inbox with a suggested account
                      </span>
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
                        Event-driven inbox: AI pre-classifies, you approve
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        AI maps your chart of accounts to rs-gaap, the
                        RoboSystems reporting taxonomy, with confidence scores
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Live Balance Sheet, Income Statement, and Cash Flow: no
                        close required
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Guided period close: fiscal calendar, depreciation and
                        prepaid schedules, rule-engine gating
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Report Creator: reports leave as a holon (RDF), a
                        DataBook, Tavi JSON or XBRL 2.1, with publish lists
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
                        Plan: actuals and forecast in one monthly grid
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Block Explorer: any number down to the facts and rules
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
                        AI Console: ask about your books, or have it draft and
                        sort the routine work for you to review
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Your AI drafts the close over MCP: scenarios, metrics
                        and handler rules. Your people approve
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-400 mr-2">•</span>
                      <span>
                        Nothing writes to QuickBooks until you post an entry
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
              <p className="mb-3 text-xs font-semibold tracking-wider text-green-400 uppercase">
                Outside your company
              </p>
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
                    Equity research, fund positions and portfolio reports
                  </p>
                </div>
              </Link>

              <p className="mb-6 text-gray-300">
                Equity research on public companies, your fund&apos;s positions
                with their terms, and your portfolio companies&apos; reports:
                shared from RoboLedger, or read from the PDF or spreadsheet they
                send. Building next: positions linked to the ledger, brokerage
                sync and portfolio analytics.
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
                        Cross-graph linking: a holding connects to its
                        issuer&apos;s own graph
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-green-300">
                    Portfolio Company Reports
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        A board package sent as a PDF or a spreadsheet, read
                        into your graph by your AI assistant
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        Every number keeps the cell or page it came from, and
                        every total is checked before anything is saved
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        Companies on RoboLedger share their reports straight
                        from the ledger
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        One open skill does the reading:{' '}
                        <Link
                          href="https://roboinvestor.ai/docs/reports-from-a-file"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-300 underline hover:text-green-200"
                        >
                          load a report from a file
                        </Link>
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
                        75,000+ XBRL filings across 8,000+ public companies
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>
                        Plain-English questions answered from the filings, with
                        the query behind each answer
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
                      <span>
                        MCP tools for Claude, ChatGPT or any MCP client
                      </span>
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
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-400">
          <a
            href="https://xbrlkit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline decoration-gray-600 underline-offset-4 hover:decoration-gray-400"
          >
            xbrlkit
          </a>
          : a free reader for XBRL reports, local, with its own MCP server.
        </p>
      </div>
    </section>
  )
}
