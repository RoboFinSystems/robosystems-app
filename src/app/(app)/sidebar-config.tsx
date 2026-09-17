'use client'

import type { GraphInfo } from '@robosystems/client'
import type { SidebarItemData } from '@robosystems/core'
import {
  HiChartBar,
  HiChip,
  HiCode,
  HiDatabase,
  HiDocumentText,
  HiGlobeAlt,
  HiHome,
  HiLightBulb,
  HiPuzzle,
  HiSearch,
  HiTable,
  HiTerminal,
  HiViewGrid,
} from 'react-icons/hi'

/**
 * Get navigation items based on the current graph selection.
 *
 * Some features are disabled for shared repositories:
 * - Schema (read-only, managed internally)
 * - Subgraphs (not applicable)
 * - Data Lake (Duckdb tables and files in S3)
 *
 * Features that work for repositories:
 * - Console (can query shared repository data!)
 * - Usage (shows credit consumption)
 * - Dashboard (limited view)
 * - Backups (download system-generated backups)
 */
export const getNavigationItems = (
  currentGraph: GraphInfo | null
): SidebarItemData[] => {
  const baseItems: SidebarItemData[] = [
    {
      icon: HiHome,
      label: 'Home',
      href: '/home',
    },
  ]

  const hasSelectedGraph = !!currentGraph
  const isRepository = currentGraph?.isRepository ?? false

  // Only show graph-dependent items if a graph is selected
  const graphDependentItems: SidebarItemData[] = hasSelectedGraph
    ? [
        {
          icon: HiViewGrid,
          label: 'Dashboard',
          href: '/dashboard',
        },
        {
          icon: HiTerminal,
          label: 'Console',
          href: '/console',
        },
        {
          icon: HiSearch,
          label: 'Search',
          href: '/search',
        },
        // Hide these items for repositories (except Backups for downloads)
        ...(!isRepository
          ? [
              {
                icon: HiDocumentText,
                label: 'Knowledge Base',
                href: '/documents',
              },
              {
                icon: HiLightBulb,
                label: 'Memory',
                href: '/memory',
              },
              {
                icon: HiTable,
                label: 'Data Lake',
                href: '/tables',
              },
              {
                icon: HiCode,
                label: 'Schema',
                href: '/schema',
              },
              {
                icon: HiChip,
                label: 'Subgraphs',
                href: '/subgraphs',
              },
            ]
          : []),
        // Backups available for all graphs (repositories have download-only access)
        {
          icon: HiDatabase,
          label: 'Backups',
          href: '/backups',
        },
        {
          icon: HiChartBar,
          label: 'Usage',
          href: '/usage',
        },
      ]
    : []

  // Billing lives on the Organization page instead — it is org-scoped, unlike
  // the user- and graph-scoped items here, and the org page already gates its
  // tabs to owner/admin. /billing itself redirects to /organization?tab=billing
  // so Stripe's portal return and checkout cancel URLs keep working.
  const tailItems: SidebarItemData[] = [
    // Follows the selected graph (one graph is one connector), so it only
    // exists once there is something to connect — a user graph or a subscribed
    // repository. With no graph the page can only say "create one first", which
    // Home and Repositories already cover. Listed above Repositories so the
    // AI-connection path is easy to find. Labeled "MCP" to avoid the stem
    // collision with roboledger's "Connections" (data sources); the route
    // stays /connect.
    ...(hasSelectedGraph
      ? [
          {
            icon: HiPuzzle,
            label: 'MCP',
            href: '/connect',
          },
        ]
      : []),
    {
      icon: HiGlobeAlt,
      label: 'Repositories',
      href: '/repositories',
    },
  ]

  return [...baseItems, ...graphDependentItems, ...tailItems]
}

// Default export for backward compatibility
export const roboSystemsNavigationItems = getNavigationItems(null)
