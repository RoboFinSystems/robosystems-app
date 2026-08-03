import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GraphMembersModal from '../GraphMembersModal'

const mockSDK = vi.hoisted(() => ({
  listGraphMembers: vi.fn(),
  listOrgMembers: vi.fn(),
  addGraphMember: vi.fn(),
  updateGraphMemberRole: vi.fn(),
  removeGraphMember: vi.fn(),
}))

vi.mock('@robosystems/client', () => mockSDK)

vi.mock('@robosystems/core', () => ({
  useApiError: () => ({ handleApiError: vi.fn() }),
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}))

const explicitMember = {
  user_id: 'user_explicit',
  name: 'Explicit Member',
  email: 'explicit@example.com',
  role: 'member',
  source: 'explicit',
  granted_at: '2026-08-01T00:00:00Z',
}

const implicitAdmin = {
  user_id: 'user_owner',
  name: 'Org Owner',
  email: 'owner@example.com',
  role: 'admin',
  source: 'org_role',
  granted_at: null,
}

const defaultProps = {
  show: true,
  onClose: vi.fn(),
  graphId: 'kg123',
  graphName: 'Test Graph',
  orgId: 'org_1',
}

describe('GraphMembersModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSDK.listGraphMembers.mockResolvedValue({
      data: { members: [explicitMember, implicitAdmin], total: 2 },
    })
    mockSDK.listOrgMembers.mockResolvedValue({
      data: {
        members: [
          {
            user_id: 'user_explicit',
            name: 'Explicit Member',
            email: 'explicit@example.com',
          },
          {
            user_id: 'user_owner',
            name: 'Org Owner',
            email: 'owner@example.com',
          },
          {
            user_id: 'user_new',
            name: 'New Colleague',
            email: 'new@example.com',
          },
        ],
      },
    })
  })

  it('lists everyone with access and labels implicit org admins', async () => {
    render(<GraphMembersModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Explicit Member')).toBeInTheDocument()
    })
    expect(screen.getByText('Org Owner')).toBeInTheDocument()
    expect(screen.getByText(/via org role/i)).toBeInTheDocument()
  })

  it('offers only org members who do not already have access', async () => {
    render(<GraphMembersModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/add a team member/i)).toBeInTheDocument()
    })

    // Everyone already listed — explicit or implicit — is filtered out, so
    // the picker can never produce a 409.
    const options = screen.getAllByRole('option').map((o) => o.textContent)
    expect(options).toContain('New Colleague (new@example.com)')
    expect(options).not.toContain('Explicit Member (explicit@example.com)')
    expect(options).not.toContain('Org Owner (owner@example.com)')
  })

  it('does not load anything while hidden', () => {
    render(<GraphMembersModal {...defaultProps} show={false} />)

    expect(mockSDK.listGraphMembers).not.toHaveBeenCalled()
  })

  it('surfaces a load failure instead of an empty roster', async () => {
    mockSDK.listGraphMembers.mockResolvedValue({
      error: { detail: 'Admin access to the graph is required' },
    })

    render(<GraphMembersModal {...defaultProps} />)

    await waitFor(() => {
      expect(
        screen.getByText(/admin access to the graph is required/i)
      ).toBeInTheDocument()
    })
  })
})
