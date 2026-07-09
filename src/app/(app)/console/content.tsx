'use client'

import {
  ConsoleContent,
  useGraphAwareConsoleConfig,
  type ConsoleBranding,
} from '@/lib/core'

// RoboSystems is the parent app and sees every graph kind, so the console is
// fully graph-aware: the example sets live in core (graphAwareConfig) and swap
// based on the selected graph — SEC repository, RoboLedger ledger, RoboInvestor
// portfolio, or a generic custom graph. This app supplies only branding and,
// being brand-neutral, sets no preferredKind tiebreak.
const ROBOSYSTEMS_BRANDING: ConsoleBranding = {
  title: 'Console',
  consoleName: 'RoboSystems Console',
  gradientFrom: 'from-primary-500',
  gradientTo: 'to-secondary-600',
  closingMessage: 'How can I help you today?',
  mcp: {
    serverName: 'robosystems',
    packageName: '@robosystems/mcp',
    contextIdFallback: 'your_graph_id',
  },
}

export function QueryInterfaceContent() {
  const config = useGraphAwareConsoleConfig(ROBOSYSTEMS_BRANDING)
  return <ConsoleContent config={config} />
}
