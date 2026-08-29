import FloatingElementsVariant from '../landing/FloatingElementsVariant'

export default function FinancialServices() {
  const currentServices = [
    {
      title: 'Portfolio Management',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      gradient: 'from-emerald-500 to-teal-500',
      description:
        'Track investment portfolios with cost basis, holdings, and valuations for both PE/VC and public market positions.',
      currentFeatures: [
        'PE & VC instruments: SAFEs, KISSes, convertible notes, LLC units, LP interests, warrants, options, RSUs',
        'Portfolios with positions, cost basis, and current valuations — applied as atomic envelopes that roll back on failure',
        'Receive financial reports shared by your portfolio companies on RoboLedger',
      ],
    },
    {
      title: 'SEC Research Console',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      gradient: 'from-cyan-500 to-blue-500',
      description:
        'Claude-powered deep research against 75,000+ XBRL filings from 8,000+ public companies — plain-English questions answered with narrative analysis.',
      currentFeatures: [
        '10-K and 10-Q financial statements and fundamentals',
        'Answers backed by the data and the generated Cypher',
        'Peer comparison and industry analysis',
      ],
    },
    {
      title: 'MCP & API Access',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      gradient: 'from-indigo-500 to-purple-500',
      description:
        'Connect Claude, Cursor, and other AI tools to your investment graph over MCP — every portfolio operation is exposed as a tool, so agents read and write.',
      currentFeatures: [
        'Remote MCP endpoint — one URL and an API key header, no install',
        'Portfolio, position, and security writes as agent-callable tools',
        'GraphQL and REST APIs with Python and TypeScript SDKs',
        'API key management for programmatic access',
      ],
    },
  ]

  const roadmapServices = [
    {
      title: 'Brokerage Sync',
      description:
        'Connect public market brokerage accounts to sync holdings automatically',
    },
    {
      title: 'Market Data',
      description: 'Historical prices, benchmarks, and corporate actions',
    },
    {
      title: 'Performance Analytics',
      description: 'Portfolio returns, attribution, and risk metrics',
    },
  ]

  const visionHighlights = [
    {
      title: 'The Bridge',
      description:
        "RoboInvestor connects fund-level investments to underlying company financial and operational data. Your investment in Company X links directly to Company X's SEC filing graph.",
    },
    {
      title: 'From Founders to PE Firms',
      description:
        "Whether you're a founder tracking personal investments alongside your business, or a PE firm managing 20+ portfolio companies, the same knowledge graph connects it all.",
    },
  ]

  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20">
      <FloatingElementsVariant variant="platform-investment" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-white sm:text-4xl">
            Investment Portfolio & AI Research
          </h2>
          <p className="mx-auto max-w-3xl text-gray-400">
            The RoboInvestor extension tracks investment portfolios and provides
            AI-powered research against the SEC Shared Repository — connecting
            your private holdings to public company financial data
          </p>
        </div>

        {/* Current Services */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {currentServices.map((service, idx) => (
            <InvestmentServiceCard key={idx} {...service} index={idx} />
          ))}
        </div>

        {/* Vision Highlights */}
        <div className="mx-auto mb-12 max-w-4xl">
          <h3 className="mb-6 text-center text-lg font-semibold text-white">
            The Vision: Unified Investment & Accounting
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {visionHighlights.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-800 bg-gradient-to-br from-zinc-900 to-purple-950/10 p-6"
              >
                <h4 className="mb-2 font-semibold text-purple-400">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="mx-auto mb-12 max-w-4xl">
          <h3 className="mb-4 text-center text-sm font-semibold tracking-wider text-gray-500 uppercase">
            Roadmap: Portfolio Analytics Platform
          </h3>
          <p className="mb-6 text-center text-sm text-gray-500">
            Expanding RoboInvestor to support personal portfolios, family
            offices, and institutional investors
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {roadmapServices.map((service, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-dashed border-gray-700 bg-zinc-900/30 p-4 text-center"
              >
                <h4 className="font-medium text-gray-400">{service.title}</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-r from-zinc-900 to-zinc-800 p-8">
          <h3 className="mb-6 text-center text-xl font-bold text-white">
            How It Works
          </h3>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="group rounded-lg border border-gray-800 bg-gradient-to-br from-black/50 to-emerald-950/20 p-4 text-center transition-all hover:border-emerald-500/30">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <span className="text-xl font-bold">1</span>
              </div>
              <h4 className="mb-2 font-semibold text-white">
                Track Your Portfolio
              </h4>
              <p className="text-sm text-gray-400">
                Add portfolios and positions — PE/VC instruments today, public
                market brokerage sync on the roadmap
              </p>
            </div>

            <div className="group rounded-lg border border-gray-800 bg-gradient-to-br from-black/50 to-cyan-950/20 p-4 text-center transition-all hover:border-cyan-500/30">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <span className="text-xl font-bold">2</span>
              </div>
              <h4 className="mb-2 font-semibold text-white">Research via AI</h4>
              <p className="text-sm text-gray-400">
                Ask questions in plain English — the Analyst Operator answers
                from 8,000+ public company SEC filings
              </p>
            </div>

            <div className="group rounded-lg border border-gray-800 bg-gradient-to-br from-black/50 to-purple-950/20 p-4 text-center transition-all hover:border-purple-500/30">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                <span className="text-xl font-bold">3</span>
              </div>
              <h4 className="mb-2 font-semibold text-white">
                Connect AI Tools
              </h4>
              <p className="text-sm text-gray-400">
                Paste your graph's MCP URL into Claude or Cursor — analyze it
                and record positions without leaving the chat
              </p>
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
    <div className="group relative h-full">
      <div
        className={`relative h-full overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br ${bgGradients[index]} p-6 transition-all duration-300 ${borderColors[index]}`}
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
