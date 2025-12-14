'use client'

import { GraphFilters, GraphSelectorCore } from '@/lib/core'
import { HiCog, HiPencil } from 'react-icons/hi'

export function GraphSelector() {
  return (
    <GraphSelectorCore
      title="Graph / Repository"
      placeholder="Select Graph or Repository"
      emptyStateMessage="No graphs or repositories available"
      emptyStateAction={{
        label: 'Create Graph',
        href: '/graphs/new',
      }}
      // Filter to exclude subgraphs but allow both user graphs and repositories
      filter={GraphFilters.robosystems}
      additionalActions={[
        {
          label: 'Manage Graphs',
          href: '/home',
          icon: HiCog,
        },
        {
          label: 'Create Graph',
          href: '/graphs/new',
          icon: HiPencil,
        },
      ]}
    />
  )
}
