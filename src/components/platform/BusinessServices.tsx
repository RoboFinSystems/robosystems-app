import FloatingElementsVariant from '../landing/FloatingElementsVariant'

export default function BusinessServices() {
  const primaryServices = [
    {
      title: 'Data Integrations',
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
      color: 'cyan',
      highlight: 'QuickBooks · Documents',
      description:
        'Connect your accounting data and documents into the RoboLedger schema for a unified financial picture.',
      features: [
        'QuickBooks OAuth — chart of accounts, journal entries, and transactions',
        'US-GAAP taxonomy — AI auto-mapping for the chart of accounts',
        'Document uploads — policies, contracts, and workpapers with hybrid semantic search',
      ],
    },
  ]

  const dataManagementServices = [
    {
      title: 'RoboLedger Application',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      gradient: 'from-indigo-600 to-blue-600',
      capabilities: [
        'AI-triaged transaction inbox — preview what posts before it hits the GL',
        'US-GAAP auto-mapping with confidence scores',
        'Live statements from the ledger, plus a guided period close',
        'Report Creator — XBRL 2.1 and JSON-LD export',
        'Plan — statements and assumptions across the actuals/forecast seam',
      ],
    },
    {
      title: 'AI Console',
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      gradient: 'from-purple-600 to-pink-600',
      capabilities: [
        'Ask Claude AI questions about your books',
        'Narrative answers with the data and generated Cypher',
        'MCP integration for Claude, Claude Code, and Cursor',
      ],
    },
  ]

  // Mirrors the seven-step arc on roboledger.ai, collapsed to six by pairing
  // reporting with planning. Tailwind classes are written out per step rather
  // than interpolated so the JIT compiler can see them.
  const workflowSteps = [
    {
      title: 'Connect',
      description: 'QuickBooks via OAuth, plus your own documents',
      bg: 'to-cyan-950/20',
      border: 'hover:border-cyan-500/30',
      badge: 'bg-cyan-500/20 text-cyan-400',
    },
    {
      title: 'Triage Inbox',
      description:
        'Claude pre-classifies each transaction; preview what posts, then approve',
      bg: 'to-violet-950/20',
      border: 'hover:border-violet-500/30',
      badge: 'bg-violet-500/20 text-violet-400',
    },
    {
      title: 'Map to GAAP',
      description: 'AI auto-maps chart of accounts to US-GAAP taxonomy',
      bg: 'to-purple-950/20',
      border: 'hover:border-purple-500/30',
      badge: 'bg-purple-500/20 text-purple-400',
    },
    {
      title: 'Review Ledger',
      description:
        'Transactions, trial balance, and live statements — no close required',
      bg: 'to-fuchsia-950/20',
      border: 'hover:border-fuchsia-500/30',
      badge: 'bg-fuchsia-500/20 text-fuchsia-400',
    },
    {
      title: 'Close Books',
      description: 'Guided period close with XBRL-compliant statements',
      bg: 'to-pink-950/20',
      border: 'hover:border-pink-500/30',
      badge: 'bg-pink-500/20 text-pink-400',
    },
    {
      title: 'Report & Plan',
      description:
        'Report Creator, Claude AI Console, and forecast scenarios in the Plan grid',
      bg: 'to-green-950/20',
      border: 'hover:border-green-500/30',
      badge: 'bg-green-500/20 text-green-400',
    },
  ]

  const visionHighlights = [
    {
      title: 'Reports as Structured Data',
      description:
        'RoboLedger creates XBRL-native financial reports — inherently queryable, comparable across periods, and ready to publish to stakeholders.',
    },
    {
      title: 'AI-Native Close Workflow',
      description:
        'From an AI-triaged transaction inbox to GAAP auto-mapping to guided period close — AI handles the mechanical work at machine speed so humans can focus on judgment.',
    },
    {
      title: 'Close, Then Plan',
      description:
        'The closed months feed the forecast directly. Statements and a scenario’s assumptions sit in one grid spanning the actuals/forecast seam — the plan is driven by the ledger, not a spreadsheet copied out of it.',
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
            Powered by the RoboLedger schema extension — unifying QuickBooks and
            your documents into a queryable knowledge graph for full-cycle
            ledger management, period close, AI-native financial reporting, and
            forward planning
          </p>
        </div>

        {/* Primary Service */}
        <div className="mx-auto mb-12 max-w-2xl">
          {primaryServices.map((service, idx) => (
            <PrimaryServiceCard key={idx} {...service} />
          ))}
        </div>

        {/* Secondary Services - Compact Grid */}
        <div className="mx-auto mb-12 grid max-w-3xl gap-6 md:grid-cols-2">
          {dataManagementServices.map((service, idx) => (
            <SecondaryServiceCard key={idx} {...service} index={idx} />
          ))}
        </div>

        {/* Vision Highlights */}
        <div className="mx-auto mb-12 max-w-4xl">
          <h3 className="mb-6 text-center text-lg font-semibold text-white">
            The Vision: Knowledge Graph Driven Financial Reporting
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {visionHighlights.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-800 bg-gradient-to-br from-zinc-900 to-cyan-950/10 p-6"
              >
                <h4 className="mb-2 font-semibold text-cyan-400">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="rounded-2xl border border-gray-800 bg-zinc-900 p-8">
          <h3 className="mb-6 text-center text-xl font-bold text-white">
            How It Works
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {workflowSteps.map((step, idx) => (
              <div
                key={step.title}
                className={`group rounded-lg border border-gray-800 bg-gradient-to-br from-zinc-900 ${step.bg} p-4 text-center transition-all ${step.border}`}
              >
                <div
                  className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${step.badge}`}
                >
                  <span className="text-lg font-bold">{idx + 1}</span>
                </div>
                <h4 className="mb-2 text-sm font-semibold text-white">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            ))}
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
