import { AuthGuard, GraphProvider } from '@robosystems/core'
import {
  getGraphSelection,
  persistGraphSelection,
} from '@robosystems/core/actions/graph-actions'
import type { PropsWithChildren } from 'react'

/**
 * The consent surface: authenticated, but without the dashboard chrome. A
 * third-party app is asking for access, so the page shows only that
 * question. AuthGuard carries `return_to` (path + query) through sign-in,
 * so an unauthenticated arrival comes back with its `request_id` intact.
 * The graph selection is read the same way the dashboard reads it, so the
 * picker preselects the graph the user was already working in.
 */
export default async function ConsentLayout({ children }: PropsWithChildren) {
  const initialGraphId = await getGraphSelection()
  return (
    <AuthGuard>
      <GraphProvider
        initialGraphId={initialGraphId}
        persistGraphSelection={persistGraphSelection}
      >
        {children}
      </GraphProvider>
    </AuthGuard>
  )
}
