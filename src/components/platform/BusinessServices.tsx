import FloatingElementsVariant from '../landing/FloatingElementsVariant'

export default function BusinessServices() {
  const primaryServices = [
    {
      title: 'QuickBooks',
      icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      color: 'cyan',
      highlight: 'OAuth2 Secure Connection',
      description:
        'Real-time synchronization of your QuickBooks accounting data into the RoboLedger schema, enabling unified financial reporting and AI-powered analysis.',
      features: [
        'Chart of accounts and journal entry synchronization',
        'Transaction and invoice data import with categorization',
        'Report generation and analysis',
      ],
    },
    {
      title: 'SEC XBRL Filings',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'purple',
      highlight: 'EDGAR Direct Integration',
      description:
        'Automated ingestion of SEC filings into the RoboLedger reporting schema, creating a queryable repository of financial statements and disclosures.',
      features: [
        'Automated 10-K and 10-Q filing downloads',
        'XBRL fact extraction with dimensional data',
        'Financial statement taxonomy structures and associations',
        'US GAAP XBRL Taxonomy support',
      ],
    },
  ]

  const dataManagementServices = [
    {
      title: 'Banking Data Integration',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      gradient: 'from-green-600 to-emerald-600',
      capabilities: [
        'Plaid Bank Feeds',
        'Transaction Import',
        'Balance Tracking',
      ],
    },
    {
      title: 'AI-Native Intelligence',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      gradient: 'from-purple-600 to-pink-600',
      capabilities: [
        'Autonomous Report Generation',
        'Multi-Layer Validation Guard Rails',
        'Claude AI + MCP Integration',
      ],
    },
    {
      title: 'RoboLedger Application',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      gradient: 'from-indigo-600 to-blue-600',
      capabilities: [
        'Financial Reports',
        'Journal Management',
        'Data Visualization',
      ],
    },
  ]

  return (
    <section className="relative bg-gradient-to-b from-zinc-950 to-black py-16 sm:py-20">
      <FloatingElementsVariant variant="platform-business" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-white sm:text-4xl">
            Accounting Data Integration & Management
          </h2>
          <p className="mx-auto max-w-3xl text-gray-400">
            Powered by the RoboLedger schema that unifies QuickBooks
            transactions, SEC XBRL filings, and banking data into a single,
            queryable Knowledge Graph
          </p>
        </div>

        {/* Primary Services - Large Cards */}
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {primaryServices.map((service, idx) => (
            <PrimaryServiceCard key={idx} {...service} />
          ))}
        </div>

        {/* Secondary Services - Compact Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dataManagementServices.map((service, idx) => (
            <SecondaryServiceCard key={idx} {...service} index={idx} />
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-12 rounded-2xl border border-gray-800 bg-zinc-900 p-8">
          <h3 className="mb-6 text-center text-xl font-bold text-white">
            How RoboLedger Data Synchronization Works
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="group rounded-lg border border-gray-800 bg-gradient-to-br from-zinc-900 to-cyan-950/20 p-4 text-center transition-all hover:border-cyan-500/30">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <span className="text-xl font-bold">1</span>
              </div>
              <h4 className="mb-2 font-semibold text-white">Connect Sources</h4>
              <p className="text-sm text-gray-400">
                Securely authenticate with QuickBooks, link bank accounts via
                Plaid, or configure SEC entity CIKs
              </p>
            </div>
            <div className="group rounded-lg border border-gray-800 bg-gradient-to-br from-zinc-900 to-purple-950/20 p-4 text-center transition-all hover:border-purple-500/30">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                <span className="text-xl font-bold">2</span>
              </div>
              <h4 className="mb-2 font-semibold text-white">Sync to Graph</h4>
              <p className="text-sm text-gray-400">
                Data flows into the RoboLedger schema within your company's
                isolated Knowledge Graph database
              </p>
            </div>
            <div className="group rounded-lg border border-gray-800 bg-gradient-to-br from-zinc-900 to-green-950/20 p-4 text-center transition-all hover:border-green-500/30">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                <span className="text-xl font-bold">3</span>
              </div>
              <h4 className="mb-2 font-semibold text-white">
                Access & Analyze
              </h4>
              <p className="text-sm text-gray-400">
                Use the RoboLedger app to manage data, run reports, or query via
                MCP agents for AI-powered insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PrimaryServiceCard({
  title,
  icon,
  color,
  highlight,
  description,
  features,
  currentCapabilities,
}: any) {
  const colorClasses: Record<string, string> = {
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover:border-cyan-500/50',
    purple:
      'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/50',
  }

  const iconColors: Record<string, string> = {
    cyan: 'text-cyan-400 bg-cyan-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
  }

  const bulletColors: Record<string, string> = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-8 transition-all ${colorClasses[color]}`}
    >
      <div className="mb-6 flex items-start gap-4">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-xl ${iconColors[color]}`}
        >
          <svg
            className="h-8 w-8"
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
          <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
          <p className="text-gray-300">{description}</p>
        </div>
      </div>

      <div className="mb-6">
        <ul className="space-y-3">
          {features.map((feature: string, idx: number) => (
            <li key={idx} className="flex items-start">
              <svg
                className={`mr-3 h-5 w-5 ${bulletColors[color]} mt-0.5`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function SecondaryServiceCard({
  title,
  icon,
  gradient,
  capabilities,
  index,
}: any) {
  // Different border hover colors for variety
  const borderColors = [
    'hover:border-green-500/50',
    'hover:border-purple-500/50',
    'hover:border-indigo-500/50',
  ]

  // Different background gradients for each card
  const bgGradients = [
    'from-zinc-900 to-green-950/20',
    'from-zinc-900 to-purple-950/20',
    'from-zinc-900 to-indigo-950/20',
  ]

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br ${bgGradients[index]} p-6 transition-all ${borderColors[index]}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-5`}
      ></div>

      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
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

      <h3 className="mb-3 text-lg font-semibold text-white">{title}</h3>

      <ul className="space-y-2">
        {capabilities.map((capability: string, idx: number) => (
          <li key={idx} className="flex items-center text-sm text-gray-400">
            <svg
              className="mr-2 h-4 w-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            {capability}
          </li>
        ))}
      </ul>
    </div>
  )
}
