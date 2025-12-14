import FloatingElementsVariant from '../landing/FloatingElementsVariant'

export default function FinancialServices() {
  const services = [
    {
      title: 'Portfolio Data Synchronization',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      gradient: 'from-cyan-500 to-blue-500',
      description:
        'Connect brokerage accounts to sync holdings and transactions',
      currentFeatures: [
        'Portfolio creation and management',
        'Security master data with FIGI identifiers',
        'Position tracking with cost basis',
      ],
    },
    {
      title: 'Trade & Transaction Import',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      gradient: 'from-blue-500 to-purple-500',
      description: 'Import trading history and track investment performance',
      currentFeatures: [
        'Buy/sell transaction recording',
        'Dividend and split tracking',
        'Trade date and settlement management',
      ],
    },
    {
      title: 'Securities Research',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      gradient: 'from-purple-500 to-pink-500',
      description: 'Access SEC filings and company data for research',
      currentFeatures: [
        'SEC repository integration',
        'Company fundamentals from XBRL',
        'Cross-reference with holdings',
      ],
    },
    {
      title: 'Market Data Integration',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      gradient: 'from-green-500 to-emerald-500',
      description: 'Store historical prices and market data',
      currentFeatures: [
        'OHLCV price history storage',
        'Benchmark data for comparison',
        'Corporate action adjustments',
      ],
    },
    {
      title: 'Knowledge Graph Analytics',
      icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
      gradient: 'from-orange-500 to-yellow-500',
      description: 'Query investment data using MCP agents',
      currentFeatures: [
        'Natural language portfolio queries',
        'Performance reporting via AI',
        'Cross-entity relationship analysis',
      ],
    },
    {
      title: 'RoboInvestor Application',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      gradient: 'from-indigo-500 to-purple-500',
      description: 'Web interface for portfolio management',
      currentFeatures: [
        'Portfolio dashboard views',
        'Holdings and transactions UI',
        'Basic performance metrics',
      ],
    },
  ]

  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20">
      <FloatingElementsVariant variant="platform-investment" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-white sm:text-4xl">
            Investment Data Management & Analytics
          </h2>
          <p className="mx-auto max-w-3xl text-gray-400">
            Powered by the RoboInvestor schema that organizes portfolios,
            securities, trades, and market data within your Knowledge Graph for
            intelligent analysis
          </p>
        </div>

        {/* Service Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <InvestmentServiceCard key={idx} {...service} index={idx} />
          ))}
        </div>

        {/* Data Flow Section */}
        <div className="mt-16 rounded-2xl border border-gray-800 bg-gradient-to-r from-zinc-900 to-zinc-800 p-8">
          <h3 className="mb-6 text-center text-xl font-bold text-white">
            RoboInvestor Data Architecture
          </h3>

          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="group rounded-lg border border-gray-800 bg-gradient-to-br from-black/50 to-green-950/20 p-4 transition-all hover:border-green-500/30">
              <h4 className="mb-3 font-semibold text-green-400">Data Inputs</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Brokerage account connections (via Plaid)</li>
                <li>• Manual portfolio entries</li>
                <li>• Market data feeds</li>
                <li>• SEC filings (via SEC XBRL Shared Repository)</li>
              </ul>
            </div>

            <div className="group rounded-lg border border-gray-800 bg-gradient-to-br from-black/50 to-blue-950/20 p-4 transition-all hover:border-blue-500/30">
              <h4 className="mb-3 font-semibold text-blue-400">Graph Schema</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Portfolios</li>
                <li>• Securities (with FIGI)</li>
                <li>• Holdings</li>
                <li>• Trades transactions</li>
              </ul>
            </div>

            <div className="group rounded-lg border border-gray-800 bg-gradient-to-br from-black/50 to-purple-950/20 p-4 transition-all hover:border-purple-500/30">
              <h4 className="mb-3 font-semibold text-purple-400">
                Access Methods
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• RoboInvestor web app</li>
                <li>• MCP agent queries</li>
                <li>• Cypher graph queries (via API)</li>
                <li>• Claude AI integration (via MCP)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InvestmentServiceCard({
  title,
  icon,
  gradient,
  description,
  currentFeatures,
  index,
}: any) {
  // Different border hover colors for each card
  const borderColors = [
    'hover:border-cyan-500/50',
    'hover:border-blue-500/50',
    'hover:border-purple-500/50',
    'hover:border-green-500/50',
    'hover:border-orange-500/50',
    'hover:border-indigo-500/50',
  ]

  // Different background gradients for each card
  const bgGradients = [
    'from-zinc-900 to-zinc-800',
    'from-zinc-900 to-blue-950/30',
    'from-zinc-900 to-purple-950/30',
    'from-zinc-900 to-green-950/30',
    'from-zinc-900 to-orange-950/30',
    'from-zinc-900 to-indigo-950/30',
  ]

  return (
    <div className="group relative">
      <div
        className={`relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br ${bgGradients[index]} p-6 transition-all duration-300 ${borderColors[index]}`}
      >
        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
        ></div>

        {/* Header */}
        <div className="relative mb-4 flex items-start gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
          >
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={icon}
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-400">{description}</p>

        {/* Current Features */}
        <div className="relative">
          <ul className="space-y-1">
            {currentFeatures.map((feature: string, idx: number) => (
              <li key={idx} className="flex items-start text-sm text-gray-300">
                <svg
                  className="mt-0.5 mr-2 h-4 w-4 text-green-500"
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
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
