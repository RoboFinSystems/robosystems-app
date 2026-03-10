'use client'

import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { GraphSelector } from '@/components/graphs/GraphSelector'
import {
  CURRENT_APP,
  CoreNavbar,
  CoreSidebar,
  SupportModal,
  useGraphContext,
  useOrg,
  useToast,
} from '@/lib/core'
import { useState } from 'react'
import { HiExclamationCircle, HiMail } from 'react-icons/hi'
import { LayoutContent } from './layout-content'
import { getNavigationItems } from './sidebar-config'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { ToastContainer } = useToast()
  const { state } = useGraphContext()
  const { currentOrg } = useOrg()
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  // Get current graph
  const currentGraph =
    state.graphs.find((g) => g.graphId === state.currentGraphId) || null

  // Get navigation items based on current graph (handles repository filtering)
  const navigationItems = getNavigationItems(currentGraph)

  return (
    <>
      <ToastContainer />
      <CoreNavbar
        appName="RoboSystems"
        currentApp={CURRENT_APP}
        borderColorClass="dark:border-gray-800"
        additionalComponents={<GraphSelector />}
      />
      <div className="mt-16 flex items-start">
        <CoreSidebar
          navigationItems={navigationItems}
          features={{
            aiChat: false,
            companyDropdown: false,
          }}
          bottomMenuActions={[
            {
              label: 'Support',
              icon: HiMail,
              onClick: () => setIsSupportOpen(true),
              tooltip: 'Contact Support',
            },
            {
              label: 'Issues',
              icon: HiExclamationCircle,
              onClick: () =>
                window.open(
                  'https://github.com/RoboFinSystems/robosystems/issues',
                  '_blank'
                ),
              tooltip: 'Report an Issue',
            },
          ]}
          borderColorClass="dark:border-gray-800"
        />
        <LayoutContent>
          <ErrorBoundary>{children}</ErrorBoundary>
        </LayoutContent>
      </div>
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        metadata={{
          graphId: currentGraph?.graphId,
          graphName: currentGraph?.graphName,
          orgId: currentOrg?.id,
          orgName: currentOrg?.name,
          orgType: currentOrg?.org_type,
          userRole: currentGraph?.role,
        }}
      />
    </>
  )
}
