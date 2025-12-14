import Image from 'next/image'
import FloatingElementsVariant from '../landing/FloatingElementsVariant'

export default function SchemaArchitecture() {
  const integrations = [
    {
      name: 'QuickBooks',
      type: 'Accounting',
      icon: '/images/quickbooks.svg',
      useImage: true,
      features: ['Real-time sync', 'Journal entries', 'Chart of accounts'],
      color: 'cyan',
    },
    {
      name: 'SEC XBRL',
      type: 'Regulatory',
      icon: '/images/sec.png',
      useImage: true,
      features: ['10-K/10-Q filings', 'Financial statements', 'Disclosures'],
      color: 'purple',
    },
    {
      name: 'Plaid',
      type: 'Banking',
      icon: '/images/plaid.png',
      useImage: true,
      features: [
        'Bank transactions',
        'Account balances',
        'Credit card transactions',
      ],
      color: 'green',
    },
    {
      name: 'Plaid',
      type: 'Investments',
      icon: '/images/plaid.png',
      useImage: true,
      features: ['Portfolios', 'Holdings', 'Trading transactions'],
      color: 'green',
    },
  ]

  const schemas = [
    {
      name: 'Base Schema',
      description: 'Foundation for all data',
      components: ['Entity', 'Taxonomy', 'Element', 'Period', 'Unit'],
      icon: '/images/logo.png',
      useImage: true,
    },
    {
      name: 'RoboLedger',
      description: 'Accounting & reporting schema',
      components: [
        'Report',
        'Fact',
        'FactDimension',
        'Structure',
        'Association',
        'Transaction',
        'Line Item',
      ],
      icon: '/images/logos/roboledger.png',
      useImage: true,
    },
    {
      name: 'RoboInvestor',
      description: 'Investment management',
      components: ['Portfolio', 'Security', 'Position', 'Market Data'],
      icon: '/images/logos/roboinvestor.png',
      useImage: true,
    },
  ]

  const applications = [
    {
      name: 'RoboLedger App',
      description: 'Accounting and financial reporting',
      icon: '/images/logos/roboledger.png',
      useImage: true,
    },
    {
      name: 'RoboInvestor App',
      description: 'Portfolio management and security analysis',
      icon: '/images/logos/roboinvestor.png',
      useImage: true,
    },
    {
      name: 'AI Agents',
      description: 'Claude AI with MCP-powered analysis',
      icon: '/images/claude.svg',
      useImage: true,
    },
  ]

  return (
    <section className="relative bg-black py-16 sm:py-20">
      <FloatingElementsVariant variant="platform-schema" />
      {/* Architecture Diagram Header */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-white sm:text-4xl">
            Intelligent Graph Schema Architecture
          </h2>
          <p className="mx-auto max-w-3xl text-gray-400">
            Our proprietary Knowledge Graph technology unifies disparate
            financial data sources into a cohesive, queryable structure that
            powers advanced analytics and automated reporting
          </p>
        </div>

        {/* Visual Architecture Flow */}
        <div className="mb-16">
          <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-zinc-900 to-black p-8">
            {/* Data Flow Visualization */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left: Data Sources */}
              <div>
                <h3 className="mb-6 text-center text-sm font-semibold tracking-wider text-gray-500 uppercase">
                  Data Sources
                </h3>
                <div className="space-y-4">
                  {integrations.map((integration, idx) => (
                    <DataSourceCard key={idx} {...integration} />
                  ))}
                </div>
              </div>

              {/* Center: Knowledge Graph */}
              <div className="relative">
                <h3 className="mb-6 text-center text-sm font-semibold tracking-wider text-gray-500 uppercase">
                  Knowledge Graph
                </h3>

                {/* Central Graph Visual */}
                <div className="relative mx-auto mt-8 h-72 w-72">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-full rounded-full border-2 border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-purple-600/10">
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <div className="mb-1 text-sm font-semibold text-white">
                            <div>RoboSystems</div>
                            <div>Knowledge Graph</div>
                          </div>
                          <div className="text-xs text-gray-400">
                            Powered by LadybugDB
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orbital Schemas */}
                  {schemas.map((schema, idx) => {
                    const angle = idx * 120 - 90
                    const x = 50 + 46 * Math.cos((angle * Math.PI) / 180)
                    const y = 50 + 46 * Math.sin((angle * Math.PI) / 180)

                    return (
                      <div
                        key={idx}
                        className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2"
                        data-x={x}
                        data-y={y}
                        ref={(el) => {
                          if (el) {
                            el.style.left = `${x}%`
                            el.style.top = `${y}%`
                          }
                        }}
                      >
                        <div className="group relative h-full w-full">
                          <div className="flex h-full w-full items-center justify-center rounded-full border border-gray-700 bg-black p-2 transition-all hover:scale-110">
                            {schema.useImage ? (
                              <Image
                                src={schema.icon}
                                alt={`${schema.name} logo`}
                                width={36}
                                height={36}
                                className="rounded-lg"
                              />
                            ) : (
                              <span className="text-2xl">{schema.icon}</span>
                            )}
                          </div>
                          <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white">
                              {schema.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 h-full w-full">
                    {schemas.map((_, idx) => {
                      const angle = idx * 120 - 90
                      const x = 50 + 35 * Math.cos((angle * Math.PI) / 180)
                      const y = 50 + 35 * Math.sin((angle * Math.PI) / 180)

                      return (
                        <line
                          key={idx}
                          x1="50%"
                          y1="50%"
                          x2={`${x}%`}
                          y2={`${y}%`}
                          stroke="rgb(59, 130, 246, 0.3)"
                          strokeWidth="1"
                          strokeDasharray="2 4"
                        />
                      )
                    })}
                  </svg>
                </div>

                {/* Schema Details */}
                <div className="mt-8 space-y-3">
                  {schemas.map((schema, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-800 bg-zinc-900/50 p-3"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        {schema.useImage ? (
                          <div className="flex h-6 w-6 items-center justify-center">
                            <Image
                              src={schema.icon}
                              alt={`${schema.name} logo`}
                              width={24}
                              height={24}
                              className="rounded-lg"
                            />
                          </div>
                        ) : (
                          <span>{schema.icon}</span>
                        )}
                        <span className="font-semibold text-white">
                          {schema.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {schema.description}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {schema.components.map((comp, cidx) => (
                          <span
                            key={cidx}
                            className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Applications */}
              <div>
                <h3 className="mb-6 text-center text-sm font-semibold tracking-wider text-gray-500 uppercase">
                  Applications
                </h3>
                <div className="space-y-4">
                  {applications.map((app, idx) => (
                    <ApplicationCard key={idx} {...app} index={idx} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group rounded-xl border border-gray-800 bg-gradient-to-br from-cyan-500/10 to-zinc-900 p-6 transition-all hover:border-cyan-500/50">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500`}
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Daily Processing
            </h3>
            <p className="text-sm text-gray-400">
              Daily data synchronization across all connected sources
            </p>
          </div>
          <div className="group rounded-xl border border-gray-800 bg-gradient-to-br from-purple-500/10 to-zinc-900 p-6 transition-all hover:border-purple-500/50">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500`}
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
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Unified Data Model
            </h3>
            <p className="text-sm text-gray-400">
              Single source of truth that connects accounting, investments,
              reporting, and public datasets seamlessly
            </p>
          </div>
          <div className="group rounded-xl border border-gray-800 bg-gradient-to-br from-green-500/10 to-zinc-900 p-6 transition-all hover:border-green-500/50">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500`}
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              AI-Native Design
            </h3>
            <p className="text-sm text-gray-400">
              Built for AI agents with MCP protocol support enabling advanced
              automation and insights
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function DataSourceCard({ name, type, icon, useImage, features, color }: any) {
  const colorClasses: Record<string, string> = {
    cyan: 'border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:border-cyan-500/50 transition-all',
    purple:
      'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:border-purple-500/50 transition-all',
    green:
      'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:border-green-500/50 transition-all',
  }

  return (
    <div className={`group rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="mb-2 flex items-center gap-2">
        {useImage ? (
          <div className="flex h-8 w-8 items-center justify-center">
            <Image
              src={icon}
              alt={`${name} logo`}
              width={32}
              height={32}
              className="rounded-lg"
            />
          </div>
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-xs text-gray-400">{type}</div>
        </div>
      </div>
      <ul className="space-y-1 text-xs text-gray-400">
        {features.map((feature: string, idx: number) => (
          <li key={idx}>• {feature}</li>
        ))}
      </ul>
    </div>
  )
}

function ApplicationCard({ name, description, icon, useImage, index }: any) {
  // Different background gradients and hover colors for each app
  const bgGradients = [
    'from-zinc-900 to-cyan-950/20',
    'from-zinc-900 to-purple-950/20',
    'from-zinc-900 to-blue-950/20',
  ]

  const borderColors = [
    'hover:border-cyan-500/50',
    'hover:border-purple-500/50',
    'hover:border-blue-500/50',
  ]

  return (
    <div
      className={`group rounded-lg border border-gray-800 bg-gradient-to-br ${bgGradients[index]} p-4 transition-all ${borderColors[index]}`}
    >
      <div className="mb-2 flex items-center gap-2">
        {useImage ? (
          <div className="flex h-8 w-8 items-center justify-center">
            <Image
              src={icon}
              alt={`${name} logo`}
              width={32}
              height={32}
              className="rounded-lg"
            />
          </div>
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-xs text-gray-400">{description}</div>
        </div>
      </div>
    </div>
  )
}
