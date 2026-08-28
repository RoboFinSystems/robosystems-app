import { customTheme } from '@robosystems/core'
import {
  fetchGraphCapacity,
  fetchGraphTiers,
  getCapacityBadge,
  getTierColor,
  type GraphTier,
  type TierCapacity,
} from '@robosystems/core/lib/graph-tiers'
import { Alert, Badge, Button, Card, Spinner } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { HiCheckCircle, HiInformationCircle } from 'react-icons/hi'
import type { TierRequestTarget } from '../TierRequestForm'
import TierRequestModal from '../TierRequestModal'
import type { GraphFormData } from '../types'

interface TierSelectionStepProps {
  selectedTier?: GraphFormData['selectedTier']
  onTierChange: (tier: NonNullable<GraphFormData['selectedTier']>) => void
}

// Standard is the self-serve entry point. The larger tiers are provisioned
// on request, so "no capacity" means something different on each side of
// this line: the entry tier is full, the others are waiting for a request.
const ENTRY_TIER = 'ladybug-standard'

export function TierSelectionStep({
  selectedTier = 'ladybug-standard',
  onTierChange,
}: TierSelectionStepProps) {
  const [tiers, setTiers] = useState<GraphTier[]>([])
  const [capacityMap, setCapacityMap] = useState<Record<string, TierCapacity>>(
    {}
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // The target outlives the open flag so the modal stays mounted across a
  // close and Flowbite drives the transition off `show`, the way
  // GraphLimitModal does.
  const [requestTarget, setRequestTarget] = useState<TierRequestTarget | null>(
    null
  )
  const [requestOpen, setRequestOpen] = useState(false)

  // Valid tier values from the form data type
  const VALID_TIERS = [
    'ladybug-standard',
    'ladybug-large',
    'ladybug-xlarge',
    'neo4j-community-large',
    'neo4j-enterprise-xlarge',
  ] as const

  // Runtime validation for tier selection
  const handleTierChange = (tierValue: string) => {
    if (VALID_TIERS.includes(tierValue as any)) {
      onTierChange(tierValue as NonNullable<GraphFormData['selectedTier']>)
    } else {
      console.warn(`Invalid tier value: ${tierValue}. Skipping selection.`)
    }
  }

  useEffect(() => {
    const loadTiersAndCapacity = async () => {
      try {
        setLoading(true)
        setError(null)

        const [tiersResponse, capacityResult] = await Promise.all([
          fetchGraphTiers(false),
          fetchGraphCapacity().catch((err) => {
            console.warn('Failed to load capacity (non-blocking):', err)
            return null
          }),
        ])

        setTiers(tiersResponse.tiers)

        if (capacityResult) {
          const map: Record<string, TierCapacity> = {}
          for (const tc of capacityResult.tiers) {
            map[tc.tier] = tc
          }
          setCapacityMap(map)
        }
      } catch (err) {
        console.error('Failed to load graph tiers:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load tier configurations'
        )
      } finally {
        setLoading(false)
      }
    }

    loadTiersAndCapacity()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="xl" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert theme={customTheme.alert} color="failure">
        <p className="font-semibold">Failed to load tier configurations</p>
        <p className="text-sm">{error}</p>
      </Alert>
    )
  }

  if (tiers.length === 0) {
    return (
      <Alert theme={customTheme.alert} color="warning">
        <p>No tier configurations available. Please contact support.</p>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
        <div className="flex gap-3">
          <HiInformationCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              AI Credits System
            </h4>
            <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
              Credits are consumed only when RoboSystems invokes AI models
              (Anthropic Claude via AWS Bedrock) on your behalf—such as our
              intelligent agents, natural language processing, or AI-powered
              analysis. All direct database operations, Cypher queries, data
              imports/exports, and API calls are completely free, including MCP
              tool calls that don't trigger AI processing.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.tier
          const color = getTierColor(tier, tiers)
          const capacity = capacityMap[tier.tier]
          const isAtCapacity = capacity?.status === 'at_capacity'
          const isEntryTier = tier.tier === ENTRY_TIER
          const capacityBadge = capacity
            ? isAtCapacity && !isEntryTier
              ? { label: 'Provisioned on request', color: 'warning' as const }
              : getCapacityBadge(capacity.status)
            : null

          return (
            <Card
              key={tier.tier}
              theme={customTheme.card}
              className={`relative transition-all ${
                isAtCapacity ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${
                isSelected && !isAtCapacity
                  ? color === 'info'
                    ? 'ring-primary-500 dark:ring-primary-400 ring-2'
                    : color === 'warning'
                      ? 'ring-accent-500 dark:ring-accent-400 ring-2'
                      : 'ring-secondary-500 dark:ring-secondary-400 ring-2'
                  : isAtCapacity
                    ? ''
                    : 'hover:shadow-lg'
              }`}
              onClick={() => {
                if (!isAtCapacity) handleTierChange(tier.tier)
              }}
            >
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-heading text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {tier.display_name}
                  </h3>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${tier.monthly_price || '0'}
                    </span>
                    <span className="text-base text-gray-500 dark:text-gray-400">
                      /month
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {tier.monthly_credits.toLocaleString()} AI credits/mo
                  </p>
                  {capacityBadge && (
                    <div className="mt-2">
                      <Badge color={capacityBadge.color} size="sm">
                        {capacityBadge.label}
                      </Badge>
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <HiCheckCircle
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          color === 'info'
                            ? 'text-blue-500 dark:text-blue-400'
                            : color === 'warning'
                              ? 'text-orange-500 dark:text-orange-400'
                              : 'text-purple-500 dark:text-purple-400'
                        }`}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {isAtCapacity ? (
                  <div className="space-y-3 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isEntryTier
                        ? 'Currently full — request access and we will get you a slot.'
                        : 'Set up on request for larger ledgers and heavier usage.'}
                    </p>
                    <Button
                      size="sm"
                      color={color}
                      className="mx-auto cursor-pointer"
                      aria-label={`Request access to ${tier.display_name}`}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        setRequestTarget({
                          tier: tier.tier,
                          displayName: tier.display_name,
                          monthlyPrice: tier.monthly_price,
                          capacityStatus: capacity?.status,
                        })
                        setRequestOpen(true)
                      }}
                    >
                      Request access
                    </Button>
                  </div>
                ) : (
                  isSelected && (
                    <div className="text-center">
                      <Badge color={color} size="lg">
                        Selected
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <TierRequestModal
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
        target={requestTarget}
        isEntryTier={requestTarget?.tier === ENTRY_TIER}
      />
    </div>
  )
}
