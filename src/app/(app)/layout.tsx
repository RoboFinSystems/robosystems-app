import {
  AuthGuard,
  GraphProvider,
  OrgProvider,
  ServiceOfferingsProvider,
  sidebarCookie,
  SidebarProvider,
} from '@/lib/core'
import {
  getGraphSelection,
  persistGraphSelection,
} from '@/lib/core/actions/graph-actions'
import type { PropsWithChildren } from 'react'
import { LayoutWrapper } from './layout-wrapper'

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const { isCollapsed } = await sidebarCookie.get()
  const initialGraphId = await getGraphSelection()

  return (
    <AuthGuard>
      <OrgProvider>
        <ServiceOfferingsProvider>
          <GraphProvider
            initialGraphId={initialGraphId}
            persistGraphSelection={persistGraphSelection}
          >
            <SidebarProvider initialCollapsed={isCollapsed}>
              <LayoutWrapper>{children}</LayoutWrapper>
            </SidebarProvider>
          </GraphProvider>
        </ServiceOfferingsProvider>
      </OrgProvider>
    </AuthGuard>
  )
}
