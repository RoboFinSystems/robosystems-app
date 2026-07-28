'use client'

import * as SDK from '@robosystems/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const CHECK_ICON = (
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
      d="M5 13l4 4L19 7"
    />
  </svg>
)

interface Tier {
  /** Matches the API's tier `name`, which is how live prices are reconciled. */
  id: string
  name: string
  description: string
  monthlyPrice: number
  monthlyCredits: number
  maxSubgraphs: number
  storageGb: number
  backupRetentionDays: number
  featured?: boolean
}

/**
 * Rendered immediately, then reconciled against /v1/offering below.
 *
 * These are a display fallback, never the source of truth — billing reads
 * `base_price_cents` in the API's billing config. Keeping them means the
 * pricing page still renders if the API is unreachable, which matters more
 * here than on an authenticated surface.
 */
const FALLBACK_TIERS: Tier[] = [
  {
    id: 'ladybug-standard',
    name: 'Standard',
    description: 'Dedicated infrastructure for a single set of books',
    monthlyPrice: 99,
    monthlyCredits: 8000,
    maxSubgraphs: 3,
    storageGb: 20,
    backupRetentionDays: 7,
  },
  {
    id: 'ladybug-large',
    name: 'Large',
    description: 'Enhanced performance and capacity for growing teams',
    monthlyPrice: 249,
    monthlyCredits: 32000,
    maxSubgraphs: 10,
    storageGb: 50,
    backupRetentionDays: 30,
    featured: true,
  },
  {
    id: 'ladybug-xlarge',
    name: 'XLarge',
    description: 'Maximum performance and scale for data-intensive work',
    monthlyPrice: 599,
    monthlyCredits: 100000,
    maxSubgraphs: 25,
    storageGb: 100,
    backupRetentionDays: 90,
  },
]

function tierFeatures(tier: Tier): string[] {
  return [
    `${tier.monthlyCredits.toLocaleString()} AI credits per month`,
    `Up to ${tier.maxSubgraphs} subgraphs`,
    `${tier.storageGb} GB graph storage`,
    `${tier.backupRetentionDays}-day backup retention`,
    // A billing claim, deliberately not a volume one. "Unlimited queries" was
    // false on three axes: rate limits apply (60/min), the connection pool is
    // an LRU ceiling rather than a concurrency guarantee, and LadybugDB is
    // single-writer per database. What IS true and never needs retracting is
    // that database operations cost no credits — only AI does.
    'Queries and MCP tools included — credits are for AI only',
  ]
}

/**
 * Take the live value only when it is a usable number.
 *
 * `??` is wrong here: it falls back on null/undefined but not on 0, so an API
 * reporting `max_subgraphs: 0` would override a correct fallback of 10. None of
 * these fields has a meaningful zero — a priced tier always has storage, a
 * retention window and at least one subgraph — so zero means "no data", the
 * same as absent.
 */
function positive(live: number | undefined, fallback: number): number {
  return typeof live === 'number' && live > 0 ? live : fallback
}

/**
 * Reconcile display prices against the live offerings endpoint.
 *
 * Only overrides fields the API actually returns, so a partial or changed
 * response degrades to the fallback rather than rendering blanks. The API
 * is the single source of truth for price; this page is a mirror of it.
 */
function useReconciledTiers(): Tier[] {
  const [tiers, setTiers] = useState<Tier[]>(FALLBACK_TIERS)

  useEffect(() => {
    let cancelled = false

    SDK.getServiceOfferings()
      .then((response) => {
        const live = response.data?.graph_subscriptions?.tiers
        if (cancelled || !live?.length) return

        setTiers((current) =>
          current.map((tier) => {
            const match = live.find((t) => t.name === tier.id)
            if (!match) return tier
            return {
              ...tier,
              name: match.display_name || tier.name,
              monthlyPrice: positive(
                match.monthly_price_per_graph,
                tier.monthlyPrice
              ),
              monthlyCredits: positive(
                match.monthly_credits_per_graph,
                tier.monthlyCredits
              ),
              maxSubgraphs: positive(match.max_subgraphs, tier.maxSubgraphs),
              storageGb: positive(
                match.instance_storage_limit_gb,
                tier.storageGb
              ),
              backupRetentionDays: positive(
                match.backup_retention_days,
                tier.backupRetentionDays
              ),
            }
          })
        )
      })
      .catch(() => {
        // Marketing page: a failed lookup keeps the fallback rather than
        // blanking the prices.
      })

    return () => {
      cancelled = true
    }
  }, [])

  return tiers
}

interface GraphPricingProps {
  isAuthenticated: boolean
  onContactSales: () => void
}

export default function GraphPricing({
  isAuthenticated,
  onContactSales,
}: GraphPricingProps) {
  const tiers = useReconciledTiers()

  return (
    // No top margin: this is the first block in the pricing section, which
    // supplies its own padding. RepositoryPricing below carries the gap.
    <div>
      <div className="mb-10 text-center">
        <div className="mb-4 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-400">
          Dedicated Graphs
        </div>
        <h2 className="mb-3 text-3xl font-bold text-white">
          Dedicated Graph Infrastructure
        </h2>
        <p className="mx-auto max-w-2xl text-gray-400">
          Your own knowledge graph with an AI controller layer over your books.
          Priced per graph — create as many as you need.
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`group relative flex flex-col overflow-hidden rounded-2xl bg-linear-to-br from-cyan-900/50 to-cyan-900/20 p-4 transition-all duration-300 sm:p-6 md:p-8 ${
              tier.featured
                ? 'border-2 border-cyan-500 hover:border-cyan-400'
                : 'border border-cyan-500/30 hover:border-cyan-500/50'
            }`}
          >
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            {tier.featured && (
              <div className="absolute -top-1 -right-1 z-10">
                <div className="rounded-bl-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white">
                  MOST POPULAR
                </div>
              </div>
            )}
            <div className="relative flex flex-1 flex-col">
              <div className="mb-8">
                <h3 className="font-heading mb-2 text-2xl font-bold text-white">
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">
                    ${tier.monthlyPrice}
                  </span>
                  <span className="text-gray-400">/month per graph</span>
                </div>
                <p className="text-gray-400">{tier.description}</p>
              </div>
              <ul className="mb-8 space-y-4">
                {tierFeatures(tier).map((feature) => (
                  <li key={feature} className="flex items-start text-gray-300">
                    {CHECK_ICON}
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-3">
                <Link
                  href={isAuthenticated ? '/graphs/new' : '/register'}
                  className="block w-full rounded-lg bg-cyan-500/80 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-cyan-600/80"
                >
                  {isAuthenticated ? 'Create Graph' : 'Get Started'}
                </Link>
                <button
                  onClick={onContactSales}
                  className="block w-full rounded-lg border border-cyan-700 py-3 text-center font-medium text-gray-300 transition-all duration-300 hover:bg-cyan-800/20 hover:text-white"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
