import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TierSelectionStep } from '../steps/TierSelectionStep'

// Mock the theme
vi.mock('@/lib/core', () => ({
  customTheme: {
    alert: {},
    card: {},
  },
}))

const mockTiers = [
  {
    tier: 'ladybug-standard',
    display_name: 'Standard',
    monthly_price: 0,
    monthly_credits: 1000,
    max_subgraphs: 0,
    features: ['1,000 AI credits/month', 'Community support'],
  },
  {
    tier: 'ladybug-large',
    display_name: 'Large',
    monthly_price: 49,
    monthly_credits: 10000,
    max_subgraphs: 3,
    features: ['10,000 AI credits/month', 'Priority support'],
  },
  {
    tier: 'ladybug-xlarge',
    display_name: 'XLarge',
    monthly_price: 199,
    monthly_credits: 50000,
    max_subgraphs: 10,
    features: ['50,000 AI credits/month', 'Dedicated support'],
  },
]

const mockCapacity = {
  tiers: [
    { tier: 'ladybug-standard', status: 'ready' },
    { tier: 'ladybug-large', status: 'scalable' },
    { tier: 'ladybug-xlarge', status: 'at_capacity' },
  ],
}

const mockFetchGraphTiers = vi.fn()
const mockFetchGraphCapacity = vi.fn()

vi.mock('@/lib/core/lib/graph-tiers', () => ({
  fetchGraphTiers: (...args: any[]) => mockFetchGraphTiers(...args),
  fetchGraphCapacity: (...args: any[]) => mockFetchGraphCapacity(...args),
  getTierColor: (tier: any, allTiers: any[]) => {
    const sorted = [...allTiers].sort(
      (a, b) => (a.monthly_price ?? 0) - (b.monthly_price ?? 0)
    )
    const idx = sorted.findIndex((t) => t.tier === tier.tier)
    if (idx === 0) return 'info'
    if (idx === sorted.length - 1) return 'success'
    return 'warning'
  },
  getPopularTier: (tiers: any[]) => {
    if (tiers.length === 0) return null
    const sorted = [...tiers].sort(
      (a, b) => (a.monthly_price ?? 0) - (b.monthly_price ?? 0)
    )
    return sorted[Math.floor(sorted.length / 2)].tier
  },
  getCapacityBadge: (status: string) => {
    switch (status) {
      case 'ready':
        return { label: 'Available', color: 'success' }
      case 'scalable':
        return { label: 'Available — 3-5 min setup', color: 'warning' }
      case 'at_capacity':
        return { label: 'At Capacity', color: 'failure' }
      default:
        return { label: 'Available', color: 'success' }
    }
  },
}))

describe('TierSelectionStep', () => {
  const mockOnTierChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchGraphTiers.mockResolvedValue({ tiers: mockTiers })
    mockFetchGraphCapacity.mockResolvedValue(mockCapacity)
  })

  describe('Loading state', () => {
    it('should show spinner while loading tiers', () => {
      mockFetchGraphTiers.mockImplementation(() => new Promise(() => {}))

      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('should show error alert when tier fetch fails', async () => {
      mockFetchGraphTiers.mockRejectedValue(new Error('Network error'))

      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load tier configurations')
        ).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('should show generic error message for non-Error exceptions', async () => {
      mockFetchGraphTiers.mockRejectedValue('unknown failure')

      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        // Both the heading and detail show "Failed to load tier configurations"
        const matches = screen.getAllByText(
          'Failed to load tier configurations'
        )
        expect(matches).toHaveLength(2)
      })
    })
  })

  describe('Empty tiers', () => {
    it('should show warning when no tiers are available', async () => {
      mockFetchGraphTiers.mockResolvedValue({ tiers: [] })

      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            'No tier configurations available. Please contact support.'
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('Tier rendering', () => {
    it('should render all tier cards after loading', async () => {
      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument()
        expect(screen.getByText('Large')).toBeInTheDocument()
        expect(screen.getByText('XLarge')).toBeInTheDocument()
      })
    })

    it('should display tier prices', async () => {
      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('$0')).toBeInTheDocument()
        expect(screen.getByText('$49')).toBeInTheDocument()
        expect(screen.getByText('$199')).toBeInTheDocument()
      })
    })

    it('should display tier features', async () => {
      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('1,000 AI credits/month')).toBeInTheDocument()
        expect(screen.getByText('Community support')).toBeInTheDocument()
        expect(screen.getByText('Priority support')).toBeInTheDocument()
      })
    })

    it('should show AI Credits System info box', async () => {
      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('AI Credits System')).toBeInTheDocument()
      })
    })

    it('should show "Most Popular" badge on middle tier', async () => {
      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Most Popular')).toBeInTheDocument()
      })
    })

    it('should show "Selected" badge on the selected tier', async () => {
      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Selected')).toBeInTheDocument()
      })
    })
  })

  describe('Capacity badges', () => {
    it('should display capacity status badges', async () => {
      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Available')).toBeInTheDocument()
        expect(
          screen.getByText('Available — 3-5 min setup')
        ).toBeInTheDocument()
        expect(screen.getByText('At Capacity')).toBeInTheDocument()
      })
    })

    it('should show contact message for at-capacity tiers', async () => {
      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(
          screen.getByText('Contact us for availability')
        ).toBeInTheDocument()
      })
    })

    it('should handle capacity fetch failure gracefully', async () => {
      mockFetchGraphCapacity.mockRejectedValue(new Error('Capacity error'))

      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      // Should still render tiers without capacity info
      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument()
        expect(screen.getByText('Large')).toBeInTheDocument()
      })

      // No capacity badges should be shown
      expect(screen.queryByText('Available')).not.toBeInTheDocument()
      expect(screen.queryByText('At Capacity')).not.toBeInTheDocument()
    })
  })

  describe('Tier selection and VALID_TIERS validation', () => {
    it('should call onTierChange with valid tier when card is clicked', async () => {
      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Large')).toBeInTheDocument()
      })

      const largeCard = screen.getByText('Large').closest('.cursor-pointer')
      largeCard!.click()

      expect(mockOnTierChange).toHaveBeenCalledWith('ladybug-large')
    })

    it('should not call onTierChange for at-capacity tiers', async () => {
      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('XLarge')).toBeInTheDocument()
      })

      // XLarge is at_capacity, so its card should have cursor-not-allowed
      const xlargeCard = screen
        .getByText('XLarge')
        .closest('.cursor-not-allowed')
      expect(xlargeCard).toBeInTheDocument()
      xlargeCard!.click()

      expect(mockOnTierChange).not.toHaveBeenCalled()
    })

    it('should reject invalid tier values with console warning', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Use a tier list with an invalid tier value from the API
      mockFetchGraphTiers.mockResolvedValue({
        tiers: [
          {
            tier: 'invalid-tier-name',
            display_name: 'Invalid',
            monthly_price: 0,
            monthly_credits: 0,
            max_subgraphs: 0,
            features: [],
          },
        ],
      })
      mockFetchGraphCapacity.mockResolvedValue({ tiers: [] })

      render(
        <TierSelectionStep
          selectedTier="ladybug-standard"
          onTierChange={mockOnTierChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Invalid')).toBeInTheDocument()
      })

      const card = screen.getByText('Invalid').closest('.cursor-pointer')
      card!.click()

      expect(mockOnTierChange).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalledWith(
        'Invalid tier value: invalid-tier-name. Skipping selection.'
      )

      warnSpy.mockRestore()
    })
  })

  describe('Default props', () => {
    it('should default to ladybug-standard when no selectedTier provided', async () => {
      render(<TierSelectionStep onTierChange={mockOnTierChange} />)

      await waitFor(() => {
        expect(screen.getByText('Selected')).toBeInTheDocument()
      })

      // The "Selected" badge should be near the Standard tier
      const standardCard = screen
        .getByText('Standard')
        .closest('[class*="relative"]')
      expect(standardCard?.textContent).toContain('Selected')
    })
  })
})
