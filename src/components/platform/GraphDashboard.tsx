import Image from 'next/image'
import { useState } from 'react'
import {
  HiChartBar,
  HiChevronDown,
  HiChip,
  HiCode,
  HiDatabase,
  HiDocumentText,
  HiGlobeAlt,
  HiHome,
  HiMenu,
  HiMoon,
  HiPlay,
  HiPlus,
  HiSearch,
  HiTable,
  HiTerminal,
  HiUser,
  HiViewGrid,
} from 'react-icons/hi'

export default function GraphDashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedGraph, setSelectedGraph] = useState({
    name: 'RFS LLC',
    id: 'kg9c3d6',
    isRepository: false,
  })

  const graphs = [
    {
      name: 'RFS LLC',
      id: 'kg9c3d6',
      isRepository: false,
    },
    {
      name: 'SEC EDGAR Filings',
      id: 'sec',
      isRepository: true,
    },
  ]

  const sidebarItems = [
    { icon: HiHome, label: 'Home', active: true },
    { icon: HiViewGrid, label: 'Dashboard' },
    { icon: HiTerminal, label: 'Console' },
    { icon: HiSearch, label: 'Search' },
    { icon: HiDocumentText, label: 'Knowledge Base' },
    { icon: HiTable, label: 'Data Lake' },
    { icon: HiCode, label: 'Schema' },
    { icon: HiChip, label: 'Subgraphs' },
    { icon: HiDatabase, label: 'Backups' },
    { icon: HiChartBar, label: 'Usage' },
  ]

  return (
    <div className="mb-12 overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-2xl">
      <div className="relative bg-black">
        {/* Top Navigation Bar */}
        <div className="flex h-14 items-center justify-between border-b border-gray-800 bg-black px-4">
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white">
              <HiMenu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Image
                src="/images/logos/robosystems.png"
                alt="RoboSystems"
                width={32}
                height={32}
              />
              <span className="font-heading text-xl font-semibold text-white">
                RoboSystems
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700"
              >
                <HiDatabase className="h-4 w-4" />
                <span>{selectedGraph.name}</span>
                <HiChevronDown
                  className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 rounded-lg border border-gray-700 bg-zinc-800 py-1 shadow-xl">
                  {graphs.map((graph) => (
                    <button
                      key={graph.id}
                      onClick={() => {
                        setSelectedGraph(graph)
                        setIsDropdownOpen(false)
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-zinc-700"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          graph.isRepository ? 'bg-purple-900' : 'bg-blue-900'
                        }`}
                      >
                        <HiDatabase
                          className={`h-4 w-4 ${
                            graph.isRepository
                              ? 'text-purple-400'
                              : 'text-blue-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white">
                          {graph.name}
                        </div>
                        <div className="truncate text-xs text-gray-400">
                          {graph.id}
                        </div>
                      </div>
                      {selectedGraph.id === graph.id && (
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="rounded-lg p-2 text-gray-400 hover:bg-zinc-800 hover:text-white">
              <HiMoon className="h-5 w-5" />
            </button>
            <button className="rounded-lg p-2 text-gray-400 hover:bg-zinc-800 hover:text-white">
              <HiViewGrid className="h-5 w-5" />
            </button>
            <button className="rounded-lg p-2 text-gray-400 hover:bg-zinc-800 hover:text-white">
              <HiUser className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Platform Interface */}
        <div className="flex h-[480px]">
          {/* Sidebar */}
          <div className="hidden border-r border-gray-800 bg-zinc-950 p-4 lg:block lg:w-52">
            <div className="mb-4 rounded-lg bg-zinc-900 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <HiDatabase className="h-4 w-4" />
                <span>My Organization</span>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {sidebarItems.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={idx}
                    className={`px-3 py-2 text-sm ${
                      item.active
                        ? 'rounded-lg bg-zinc-800 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  </div>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-black p-6">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
                  <HiHome className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">
                    Graphs & Repositories
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Manage your graphs and access repositories
                  </p>
                </div>
              </div>
              <div className="hidden gap-2 md:flex">
                <button className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700">
                  <HiGlobeAlt className="h-4 w-4" />
                  Browse Repositories
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                  <HiPlus className="h-4 w-4" />
                  Create Graph
                </button>
              </div>
            </div>

            {/* Graph Table */}
            <GraphTable />
          </div>
        </div>
      </div>
    </div>
  )
}

function GraphTable() {
  const items = [
    {
      name: 'RFS LLC',
      id: 'kg9c3d6',
      graphType: 'entity',
      schemaExtensions: ['roboledger'],
      createdAt: '9/9/2025',
      isRepository: false,
      isActive: true,
    },
    {
      name: 'Harbinger FinLab',
      id: 'kg7f2a1',
      graphType: 'entity',
      schemaExtensions: ['roboledger', 'roboinvestor'],
      createdAt: '3/6/2026',
      isRepository: false,
      isActive: false,
    },
    {
      name: 'SEC EDGAR Filings',
      id: 'sec',
      graphType: 'repository',
      schemaExtensions: ['roboinvestor'],
      createdAt: '2/14/2026',
      isRepository: true,
      isActive: false,
    },
  ]

  return (
    <div className="rounded-xl border border-gray-800 bg-zinc-900/50">
      {/* Table Header */}
      <div className="hidden border-b border-gray-800 px-6 py-3 md:grid md:grid-cols-4">
        <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          Graph / Repository
        </div>
        <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          Type & Extensions
        </div>
        <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          Created
        </div>
        <div className="text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
          Actions
        </div>
      </div>

      <div className="divide-y divide-gray-800">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`px-6 py-4 ${
              item.isActive
                ? 'bg-blue-900/20 ring-2 ring-blue-400 ring-inset'
                : ''
            }`}
          >
            {/* Desktop layout */}
            <div className="hidden items-center md:grid md:grid-cols-4">
              {/* Graph / Repository */}
              <div className="flex items-center gap-3">
                <div
                  className={`shrink-0 rounded-lg p-2 ${
                    item.isRepository ? 'bg-purple-900' : 'bg-blue-900'
                  }`}
                >
                  <HiDatabase
                    className={`h-4 w-4 ${
                      item.isRepository ? 'text-purple-400' : 'text-blue-400'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">
                    {item.name}
                  </div>
                  <div className="truncate font-mono text-xs text-gray-400">
                    {item.id}
                  </div>
                </div>
              </div>

              {/* Type & Extensions */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-300 capitalize">
                  {item.graphType}
                </span>
                {item.schemaExtensions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.schemaExtensions.map((ext) => (
                      <span
                        key={ext}
                        className="rounded-md bg-purple-900/50 px-2 py-0.5 text-xs font-medium text-purple-300"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Created */}
              <div className="text-sm text-gray-400">{item.createdAt}</div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1.5">
                <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                  <HiPlay className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">Open</span>
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-600">
                  <HiTerminal className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">Console</span>
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-600">
                  <HiChartBar className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">Usage</span>
                </button>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="space-y-3 md:hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`shrink-0 rounded-lg p-2 ${
                      item.isRepository ? 'bg-purple-900' : 'bg-blue-900'
                    }`}
                  >
                    <HiDatabase
                      className={`h-5 w-5 ${
                        item.isRepository ? 'text-purple-400' : 'text-blue-400'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">
                      {item.name}
                    </div>
                    <div className="truncate font-mono text-xs text-gray-400">
                      {item.id}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-300 capitalize">
                  {item.graphType}
                </span>
              </div>

              {item.schemaExtensions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.schemaExtensions.map((ext) => (
                    <span
                      key={ext}
                      className="rounded-md bg-purple-900/50 px-2 py-0.5 text-xs font-medium text-purple-300"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700">
                  <HiPlay className="h-3.5 w-3.5" />
                  Open
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-zinc-700 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-600">
                  <HiTerminal className="h-3.5 w-3.5" />
                  Console
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-zinc-700 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-600">
                  <HiChartBar className="h-3.5 w-3.5" />
                  Usage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
