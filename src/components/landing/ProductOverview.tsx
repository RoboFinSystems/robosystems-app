'use client'

import { useState } from 'react'
import FloatingElementsVariant from './FloatingElementsVariant'

export default function ProductOverview() {
  const [activeTab, setActiveTab] = useState('graph')

  return (
    <section id="product" className="relative bg-black py-16 sm:py-24">
      <FloatingElementsVariant variant="product" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            The Financial Intelligence Platform
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            RoboSystems API transforms scattered financial and operational data
            into a unified knowledge graph, enabling AI agents to understand and
            analyze your business like never before.
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-2 rounded-xl bg-zinc-900 p-2 sm:flex-row sm:flex-wrap sm:justify-center">
            {[
              { id: 'graph', label: 'Knowledge Graph', icon: 'graph' },
              { id: 'mcp', label: 'MCP Tools', icon: 'mcp' },
              {
                id: 'integrations',
                label: 'Integrations',
                icon: 'integrations',
              },
              {
                id: 'repositories',
                label: 'Shared Repositories',
                icon: 'repositories',
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all duration-300 sm:px-6 sm:py-3 sm:text-sm ${
                  activeTab === tab.id
                    ? 'bg-linear-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {tab.icon === 'graph' && (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                )}
                {tab.icon === 'mcp' && (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
                {tab.icon === 'integrations' && (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                )}
                {tab.icon === 'repositories' && (
                  <svg
                    className="h-5 w-5"
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
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800 p-4 sm:p-6 md:p-8">
            {activeTab === 'graph' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-semibold text-white sm:text-2xl">
                    Semantic Knowledge Graph
                  </h3>
                </div>
                <div className="rounded-lg bg-linear-to-r from-orange-900/20 to-zinc-800/50 p-4">
                  <p className="text-gray-300">
                    Built on{' '}
                    <a
                      href="https://ladybugdb.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      LadybugDB
                    </a>
                    , a high-performance embedded graph database optimized for
                    analytical workloads. LadybugDB's columnar storage and
                    vectorized execution enable blazing-fast queries on complex
                    financial relationships, making it ideal for AI-powered
                    applications.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <h4 className="mb-2 font-semibold text-cyan-400">
                      Entity Resolution
                    </h4>
                    <p className="text-sm text-gray-400">
                      Automatically identify and link entities across different
                      data sources, creating a unified view of companies,
                      transactions, accounts, and more.
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <h4 className="mb-2 font-semibold text-cyan-400">
                      Versioned Subgraphs
                    </h4>
                    <p className="text-sm text-gray-400">
                      Enterprise and Premium tiers can create unlimited
                      subgraphs for version control and granular access
                      permissions - all sharing the same AI credit pool.
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <h4 className="mb-2 font-semibold text-cyan-400">
                      Report Creator
                    </h4>
                    <p className="text-sm text-gray-400">
                      Make new custom reports with your Company's graph data so
                      you can easily share meaningful insights with your
                      stakeholders and AI agents.
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <h4 className="mb-2 font-semibold text-cyan-400">
                      AI Memory Layers
                    </h4>
                    <p className="text-sm text-gray-400">
                      Create dedicated subgraphs as AI memory layers with
                      role-based access - personal agent memories, team
                      knowledge bases, or other collaborative discovery spaces.
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <h4 className="mb-2 font-semibold text-cyan-400">
                      Taxonomy Management
                    </h4>
                    <p className="text-sm text-gray-400">
                      Create and manage your Company's taxonomy - definitions of
                      the terms and concepts used in your financial data.
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <h4 className="mb-2 font-semibold text-cyan-400">
                      Schema Flexibility
                    </h4>
                    <p className="text-sm text-gray-400">
                      Define custom node and relationship types to match your
                      specific business needs and data structures.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mcp' && (
              <div className="space-y-6">
                <h3 className="font-heading text-xl font-semibold text-white sm:text-2xl">
                  Model Context Protocol Tools
                </h3>
                <p className="text-gray-300">
                  AI agents use specialized MCP tools to interact with your
                  knowledge graph:
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4 rounded-lg bg-gray-800/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        Cypher Query Tool
                      </h4>
                      <p className="text-sm text-gray-400">
                        AI-powered Cypher query tool to find patterns, analyze
                        relationships, and extract insights from your financial
                        data.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-lg bg-gray-800/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Agent Tool</h4>
                      <p className="text-sm text-gray-400">
                        Our in-house AI agent performs financial calculations
                        and and ratio analysis on your Company's data. When
                        combined with the SEC Shared Repository subscription,
                        our agent will compare your metrics to benchmarks for
                        public companies.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-lg bg-gray-800/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        Schema Explorer
                      </h4>
                      <p className="text-sm text-gray-400">
                        Discover available data structures, relationships, and
                        properties to understand what information is available
                        in your graph.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-lg bg-gray-800/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        Fact Grid Builder
                      </h4>
                      <p className="text-sm text-gray-400">
                        Automatically construct financial fact tables from your
                        knowledge graph with dimensional analysis, period
                        comparisons, and customizable aggregations.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-lg bg-gray-800/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        Workspace Manager
                      </h4>
                      <p className="text-sm text-gray-400">
                        Navigate between your main graph and subgraph workspaces
                        for versioning, testing, or creating isolated AI memory
                        layers with role-based access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <h3 className="font-heading text-xl font-semibold text-white sm:text-2xl">
                  Seamless Data Integration
                </h3>
                <p className="text-gray-300">
                  Connect your existing systems and automatically sync data into
                  your knowledge graph:
                </p>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg bg-gray-800/50 p-4 text-center sm:p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                        <span className="text-xl font-bold text-white">QB</span>
                      </div>
                    </div>
                    <h4 className="mb-2 font-semibold text-white">
                      QuickBooks
                    </h4>
                    <p className="text-sm text-gray-400">
                      Complete accounting sync with trial balance generation
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4 text-center sm:p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                        <svg
                          className="h-7 w-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="mb-2 font-semibold text-white">Plaid</h4>
                    <p className="text-sm text-gray-400">
                      Bank transactions and account data integration
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4 text-center sm:p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                        <span className="text-lg font-bold text-white">
                          SEC
                        </span>
                      </div>
                    </div>
                    <h4 className="mb-2 font-semibold text-white">SEC XBRL</h4>
                    <p className="text-sm text-gray-400">
                      Process 10-K/Q filings and financial statements
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4 text-center sm:p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600">
                        <svg
                          className="h-7 w-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="mb-2 font-semibold text-white">
                      ERP Systems
                    </h4>
                    <p className="text-sm text-gray-400">
                      SAP, Oracle, Microsoft Dynamics connectors
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4 text-center sm:p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-600">
                        <svg
                          className="h-7 w-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="mb-2 font-semibold text-white">
                      CRM Platforms
                    </h4>
                    <p className="text-sm text-gray-400">
                      Salesforce, HubSpot customer data sync
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4 text-center sm:p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
                        <svg
                          className="h-7 w-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="mb-2 font-semibold text-white">
                      Custom APIs
                    </h4>
                    <p className="text-sm text-gray-400">
                      REST/GraphQL endpoints for any data source
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'repositories' && (
              <div className="space-y-6">
                <h3 className="font-heading text-xl font-semibold text-white sm:text-2xl">
                  Shared Repositories
                </h3>
                <p className="text-gray-300">
                  Access shared knowledge graph repositories containing public
                  and proprietary data so your AI agents can use it as context.
                  When combined with your Company's knowledge graph, you can
                  gain access to AI-powered insights and benchmarking with
                  domain specific context for comparability and
                  understandability of real-time market dynamics.
                </p>
                <div className="rounded-lg border border-green-500/30 bg-linear-to-br from-green-900/20 to-cyan-900/20 p-4 sm:p-6 md:p-8">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                        <span className="text-xl font-bold text-white">
                          SEC
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white sm:text-xl">
                          SEC XBRL Filing Knowledge Graph
                        </h4>
                        <p className="text-sm text-gray-400">
                          Powered by Claude AI with MCP tools
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 space-y-4">
                    <p className="text-gray-300">
                      Our SEC knowledge graph isn't just a database—it provides
                      rich semantic context so your AI agents can perform
                      complex financial analysis and benchmarking. Your AI tools
                      will now have access to near instantaneous data about
                      public companies, industry trends and other market
                      intelligence.
                    </p>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start">
                        <svg
                          className="mr-3 h-5 w-5 shrink-0 text-cyan-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          <strong>Natural Language Queries:</strong> Ask
                          questions like "Compare Microsoft and Google's R&D
                          spending" or "What business segments are growing the
                          fastest in technology companies?"
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="mr-3 h-5 w-5 shrink-0 text-cyan-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        <span>
                          <strong>Cross-Company Analysis:</strong> Compare
                          financial metrics across multiple companies,
                          industries, and time periods
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="mr-3 h-5 w-5 shrink-0 text-cyan-400"
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
                        <span>
                          <strong>Trend Detection:</strong> Identify patterns
                          and trends in financial data that might not be obvious
                          from individual filings
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="mr-3 h-5 w-5 shrink-0 text-cyan-400"
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
                        <span>
                          <strong>Intelligent Insights:</strong> Get
                          AI-generated summaries and insights about financial
                          performance and business strategies using the latest
                          data directly sourced from XBRL filings.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-black/30 p-4">
                    <h5 className="mb-3 font-semibold text-white">
                      Dataset Coverage
                    </h5>
                    <div className="grid gap-4 text-sm sm:grid-cols-3">
                      <div>
                        <div className="text-2xl font-bold text-green-400">
                          4,000+
                        </div>
                        <div className="text-gray-400">Public Companies</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">
                          100,000+
                        </div>
                        <div className="text-gray-400">
                          XBRL Filings (10-K, 10-Q)
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">
                          Daily
                        </div>
                        <div className="text-gray-400">Updates from EDGAR</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
