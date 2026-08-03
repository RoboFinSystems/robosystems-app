'use client'

import GraphLimitModal from '@/components/app/GraphLimitModal'
import * as SDK from '@robosystems/client'
import {
  EmptyState,
  PageHeader,
  PageLayout,
  StatCard,
  useApiError,
  useOrg,
  useToast,
} from '@robosystems/core'
import { format } from 'date-fns'
import {
  Alert,
  Badge,
  Button,
  Card,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Select,
  Spinner,
  Tabs,
  TextInput,
} from 'flowbite-react'
import { useCallback, useEffect, useState } from 'react'
import {
  HiCheck,
  HiDatabase,
  HiExclamationCircle,
  HiMail,
  HiOfficeBuilding,
  HiPencil,
  HiTrash,
  HiUserAdd,
  HiUsers,
  HiX,
} from 'react-icons/hi'

type OrgMember = SDK.OrgMemberResponse
type OrgLimits = SDK.OrgLimitsResponse
type OrgUsage = SDK.OrgUsageResponse
type OrgInvitation = SDK.OrgInvitationResponse

export function OrganizationContent() {
  const { currentOrg, refreshOrgs, loading: orgLoading } = useOrg()
  const { handleApiError } = useApiError()
  const { showSuccess, showError, ToastContainer } = useToast()

  const [activeTab, setActiveTab] = useState(0)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [invitations, setInvitations] = useState<OrgInvitation[]>([])
  const [limits, setLimits] = useState<OrgLimits | null>(null)
  const [usage, setUsage] = useState<OrgUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<SDK.OrgRole>('member')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [showGraphLimitModal, setShowGraphLimitModal] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [updatingName, setUpdatingName] = useState(false)

  // Permission checks
  const canChangeRole = ['owner', 'admin'].includes(currentOrg?.role || '')
  const canRemove = ['owner', 'admin'].includes(currentOrg?.role || '')
  const canEditOrg = ['owner', 'admin'].includes(currentOrg?.role || '')
  const canViewGraphs = ['owner', 'admin'].includes(currentOrg?.role || '')

  const loadOrgData = useCallback(async () => {
    if (!currentOrg?.id) return

    try {
      setLoading(true)

      // Load members and limits
      const [membersResponse, limitsResponse] = await Promise.all([
        SDK.listOrgMembers({ path: { org_id: currentOrg.id } }),
        SDK.getOrgLimits({ path: { org_id: currentOrg.id } }),
      ])

      if (membersResponse.error) {
        throw new Error('Failed to load organization members')
      }

      if (membersResponse.data) {
        setMembers(membersResponse.data.members || [])
      }

      if (limitsResponse.data) {
        setLimits(limitsResponse.data)
      }

      // Usage and pending invitations are admin-only reads
      const isAdmin = ['owner', 'admin'].includes(currentOrg.role)
      if (isAdmin) {
        const [usageResponse, invitationsResponse] = await Promise.all([
          SDK.getOrgUsage({
            path: { org_id: currentOrg.id },
            query: { days: 30 },
          }),
          SDK.listOrgInvitations({ path: { org_id: currentOrg.id } }),
        ])

        if (usageResponse?.data) {
          setUsage(usageResponse.data)
        }

        // Invitations are gated by a feature flag server-side; a 501 there
        // shouldn't take the whole page down with it.
        setInvitations(invitationsResponse?.data?.invitations || [])
      }
    } catch (error) {
      console.error('Failed to load organization data:', error)
      handleApiError(error, 'Failed to load organization data')
    } finally {
      setLoading(false)
    }
  }, [currentOrg, handleApiError])

  useEffect(() => {
    loadOrgData()
  }, [loadOrgData])

  const handleUpdateRole = async (
    userId: string,
    newRole: SDK.OrgRole,
    userName: string,
    currentRole: SDK.OrgRole
  ) => {
    if (!currentOrg?.id) return

    // Prevent changing owner role
    if (currentRole === 'owner') {
      showError(
        'Cannot change owner role. Transfer ownership requires a dedicated workflow.'
      )
      return
    }

    // Confirm role change
    if (
      !confirm(`Change ${userName}'s role from ${currentRole} to ${newRole}?`)
    ) {
      return
    }

    try {
      const response = await SDK.updateOrgMemberRole({
        path: { org_id: currentOrg.id, user_id: userId },
        body: { role: newRole },
      })

      if (response.error) {
        throw new Error('Failed to update role')
      }

      showSuccess(`Updated ${userName}'s role to ${newRole}`)
      await loadOrgData()
    } catch (error) {
      handleApiError(error, 'Failed to update member role')
    }
  }

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!currentOrg?.id) return
    if (!confirm(`Remove ${userName} from the organization?`)) return

    try {
      const response = await SDK.removeOrgMember({
        path: { org_id: currentOrg.id, user_id: userId },
      })

      if (response.error) {
        throw new Error('Failed to remove member')
      }

      showSuccess(`${userName} has been removed`)
      await loadOrgData()
    } catch (error) {
      handleApiError(error, 'Failed to remove member')
    }
  }

  const openInviteModal = () => {
    setInviteEmail('')
    setInviteRole('member')
    setInviteError('')
    setShowInviteModal(true)
  }

  const handleSendInvitation = async () => {
    if (!currentOrg?.id || !inviteEmail.trim()) return

    try {
      setSendingInvite(true)
      setInviteError('')

      const response = await SDK.createOrgInvitation({
        path: { org_id: currentOrg.id },
        body: { email: inviteEmail.trim(), role: inviteRole },
      })

      if (response.error) {
        // The API is specific about why an invite is refused — an email that
        // already has an account, or one already invited — and that detail is
        // what tells the admin what to do next.
        const detail = (response.error as { detail?: string })?.detail
        throw new Error(detail || 'Failed to send invitation')
      }

      showSuccess(`Invitation sent to ${inviteEmail.trim()}`)
      setShowInviteModal(false)
      await loadOrgData()
    } catch (error) {
      setInviteError(
        error instanceof Error ? error.message : 'Failed to send invitation'
      )
    } finally {
      setSendingInvite(false)
    }
  }

  const handleRevokeInvitation = async (
    invitationId: string,
    email: string
  ) => {
    if (!currentOrg?.id) return
    if (!confirm(`Revoke the invitation for ${email}?`)) return

    try {
      const response = await SDK.revokeOrgInvitation({
        path: { org_id: currentOrg.id, invitation_id: invitationId },
      })

      if (response.error) {
        throw new Error('Failed to revoke invitation')
      }

      showSuccess(`Invitation for ${email} revoked`)
      await loadOrgData()
    } catch (error) {
      handleApiError(error, 'Failed to revoke invitation')
    }
  }

  const handleResendInvitation = async (
    invitationId: string,
    email: string
  ) => {
    if (!currentOrg?.id) return

    try {
      const response = await SDK.resendOrgInvitation({
        path: { org_id: currentOrg.id, invitation_id: invitationId },
      })

      if (response.error) {
        throw new Error('Failed to resend invitation')
      }

      showSuccess(`Invitation resent to ${email}`)
      await loadOrgData()
    } catch (error) {
      handleApiError(error, 'Failed to resend invitation')
    }
  }

  const startEditingName = () => {
    setEditedName(currentOrg?.name || '')
    setIsEditingName(true)
  }

  const cancelEditingName = () => {
    setIsEditingName(false)
    setEditedName('')
  }

  const handleUpdateOrgName = async () => {
    if (!currentOrg?.id || !editedName.trim()) return

    try {
      setUpdatingName(true)

      const response = await SDK.updateOrg({
        path: { org_id: currentOrg.id },
        body: { name: editedName.trim() },
      })

      if (response.error) {
        throw new Error('Failed to update organization name')
      }

      showSuccess('Organization name updated')
      setIsEditingName(false)
      await refreshOrgs()
    } catch (error) {
      handleApiError(error, 'Failed to update organization name')
    } finally {
      setUpdatingName(false)
    }
  }

  const getOrgTypeBadgeColor = (orgType: string) => {
    switch (orgType) {
      case 'company':
        return 'info'
      case 'team':
        return 'purple'
      case 'personal':
        return 'gray'
      default:
        return 'gray'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'success'
      case 'admin':
        return 'info'
      default:
        return 'gray'
    }
  }

  if (orgLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="xl" />
        </div>
      </PageLayout>
    )
  }

  if (!currentOrg) {
    return (
      <PageLayout>
        <Alert color="failure" icon={HiExclamationCircle}>
          No organization found
        </Alert>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <ToastContainer />

      {/* Header */}
      <PageHeader
        icon={HiOfficeBuilding}
        title="Organization"
        subtitle="Manage your organization and team"
      />

      {/* Organization Info */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <TextInput
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="max-w-md"
                  disabled={updatingName}
                />
                <Button
                  size="sm"
                  color="blue"
                  onClick={handleUpdateOrgName}
                  disabled={!editedName.trim() || updatingName}
                >
                  {updatingName ? (
                    <Spinner size="sm" className="text-white" />
                  ) : (
                    <HiCheck className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  color="gray"
                  onClick={cancelEditingName}
                  disabled={updatingName}
                >
                  <HiX className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {currentOrg.name}
                </h2>
                {canEditOrg && (
                  <Button size="xs" color="gray" onClick={startEditingName}>
                    <HiPencil className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <Badge color={getOrgTypeBadgeColor(currentOrg.org_type)}>
                {currentOrg.org_type}
              </Badge>
              <Badge color={getRoleBadgeColor(currentOrg.role)}>
                Your role: {currentOrg.role}
              </Badge>
            </div>
            <div className="mt-3 flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <HiUsers className="h-4 w-4" />
                <span>{currentOrg.member_count} members</span>
              </div>
              <div className="flex items-center gap-1">
                <HiDatabase className="h-4 w-4" />
                <span>{currentOrg.graph_count} graphs</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Org ID: <span className="font-mono">{currentOrg.id}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        aria-label="Organization tabs"
        variant="underline"
        onActiveTabChange={(tab) => setActiveTab(tab)}
      >
        {/* Graphs Tab - Admin Only */}
        {canViewGraphs && (
          <Tabs.Item active title="Graphs" icon={HiDatabase}>
            <div className="space-y-6">
              {/* Usage Stats as individual cards in grid */}
              {usage && (
                <>
                  <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                    Usage Overview
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      Last {usage.period_days} days
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StatCard
                      label="Total Graphs"
                      value={usage.graph_details.length}
                    />
                    <StatCard
                      label="Credits Available"
                      value={usage.graph_details
                        .reduce(
                          (sum: number, g: any) =>
                            sum + (g.credits_available || 0),
                          0
                        )
                        .toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                    />
                  </div>
                </>
              )}

              {/* Graph Limits & Quotas */}
              {limits && (
                <Card>
                  <h2 className="font-heading text-xl font-semibold text-gray-900 dark:text-white">
                    Graph Limits & Quotas
                  </h2>

                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="py-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Total Graphs
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {(limits.current_usage.graphs as any).current} /{' '}
                          {limits.max_graphs}
                        </span>
                      </div>
                      <Progress
                        progress={
                          limits.max_graphs > 0
                            ? ((limits.current_usage.graphs as any).current /
                                limits.max_graphs) *
                              100
                            : 0
                        }
                        size="sm"
                        color={
                          (limits.current_usage.graphs as any).current >=
                          limits.max_graphs * 0.9
                            ? 'red'
                            : (limits.current_usage.graphs as any).current >=
                                limits.max_graphs * 0.7
                              ? 'yellow'
                              : 'blue'
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Can create new graphs
                      </span>
                      <Badge
                        color={limits.can_create_graph ? 'success' : 'failure'}
                      >
                        {limits.can_create_graph ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {limits.max_graphs === 0 ? (
                    <Alert
                      color="failure"
                      icon={HiExclamationCircle}
                      theme={{ wrapper: 'flex items-center [&>div]:flex-1' }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-medium">
                            Graph creation requires approval
                          </span>
                          <p className="mt-1 text-sm">
                            Your current plan does not include graph creation.
                            Contact us to request access and get set up.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          color="light"
                          className="shrink-0"
                          onClick={() => setShowGraphLimitModal(true)}
                        >
                          <HiMail className="mr-2 h-4 w-4" />
                          Contact Us
                        </Button>
                      </div>
                    </Alert>
                  ) : !limits.can_create_graph ? (
                    <Alert
                      color="failure"
                      icon={HiExclamationCircle}
                      theme={{ wrapper: 'flex items-center [&>div]:flex-1' }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-medium">
                            Graph limit reached (
                            {(limits.current_usage.graphs as any).current}/
                            {limits.max_graphs})
                          </span>
                          <p className="mt-1 text-sm">
                            You&apos;ve reached your maximum number of graphs.
                            Contact us to request a higher limit.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          color="light"
                          className="shrink-0"
                          onClick={() => setShowGraphLimitModal(true)}
                        >
                          <HiMail className="mr-2 h-4 w-4" />
                          Contact Us
                        </Button>
                      </div>
                    </Alert>
                  ) : limits.warnings.length > 0 ? (
                    <Alert color="warning" icon={HiExclamationCircle}>
                      <div className="space-y-1">
                        {limits.warnings.map((warning, idx) => (
                          <p key={idx}>{warning}</p>
                        ))}
                      </div>
                    </Alert>
                  ) : null}
                </Card>
              )}

              {/* Organization Graphs */}
              <Card>
                <h2 className="font-heading text-xl font-semibold text-gray-900 dark:text-white">
                  Organization Graphs
                </h2>

                {!usage || usage.graph_details.length === 0 ? (
                  <EmptyState
                    icon={HiDatabase}
                    title="No Graphs"
                    description="Create your first graph to get started"
                  />
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {usage.graph_details.map((graph: any) => (
                      <div
                        key={graph.graph_id}
                        className="flex items-center justify-between py-3"
                      >
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {graph.graph_name}
                          </span>
                          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                            {graph.graph_id}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-500 dark:text-gray-400">
                            Credits Available
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {graph.credits_available.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </Tabs.Item>
        )}

        {/* Members Tab */}
        <Tabs.Item title="Members" icon={HiUsers}>
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-gray-900 dark:text-white">
                Team Members
              </h2>
              {canChangeRole && (
                <Button color="blue" size="sm" onClick={openInviteModal}>
                  <HiUserAdd className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              )}
            </div>

            {members.length === 0 ? (
              <EmptyState
                icon={HiUsers}
                title="No Members"
                description="Invite team members to collaborate"
              />
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </span>
                        {member.is_active ? (
                          <Badge color="success" size="sm">
                            Active
                          </Badge>
                        ) : (
                          <Badge color="warning" size="sm">
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(member.joined_at), 'MMM d, yyyy')}
                      </span>
                      {member.role === 'owner' ? (
                        <Badge color="success" size="sm">
                          Owner
                        </Badge>
                      ) : canChangeRole ? (
                        <Select
                          sizing="sm"
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              member.user_id,
                              e.target.value as SDK.OrgRole,
                              member.name,
                              member.role
                            )
                          }
                          className="w-28"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </Select>
                      ) : (
                        <Badge color={getRoleBadgeColor(member.role)} size="sm">
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </Badge>
                      )}
                      {canRemove && member.role !== 'owner' && (
                        <Button
                          size="xs"
                          color="failure"
                          onClick={() =>
                            handleRemoveMember(member.user_id, member.name)
                          }
                        >
                          <HiTrash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {canChangeRole && invitations.length > 0 && (
            <Card className="mt-4">
              <h2 className="font-heading text-xl font-semibold text-gray-900 dark:text-white">
                Pending Invitations
              </h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {invitation.email}
                        </span>
                        <Badge
                          color={invitation.is_expired ? 'warning' : 'gray'}
                          size="sm"
                        >
                          {invitation.is_expired ? 'Expired' : 'Invited'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {invitation.invited_by_name
                          ? `Invited by ${invitation.invited_by_name} · `
                          : ''}
                        {invitation.is_expired ? 'Expired' : 'Expires'}{' '}
                        {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        color={getRoleBadgeColor(invitation.role)}
                        size="sm"
                      >
                        {invitation.role.charAt(0).toUpperCase() +
                          invitation.role.slice(1)}
                      </Badge>
                      <Button
                        size="xs"
                        color="light"
                        onClick={() =>
                          handleResendInvitation(
                            invitation.id,
                            invitation.email
                          )
                        }
                      >
                        <HiMail className="mr-1 h-4 w-4" />
                        Resend
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() =>
                          handleRevokeInvitation(
                            invitation.id,
                            invitation.email
                          )
                        }
                      >
                        <HiX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Tabs.Item>
      </Tabs>
      {/* Graph Limit Modal */}
      <GraphLimitModal
        isOpen={showGraphLimitModal}
        onClose={() => setShowGraphLimitModal(false)}
        currentLimit={limits?.max_graphs ?? 0}
        orgId={currentOrg.id}
      />

      {/* Invite Member Modal */}
      <Modal
        show={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        size="md"
      >
        <ModalHeader>Invite Team Member</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {inviteError && (
              <Alert color="failure" icon={HiExclamationCircle}>
                {inviteError}
              </Alert>
            )}
            <div>
              <label
                htmlFor="invite-email"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Email address
              </label>
              <TextInput
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                disabled={sendingInvite}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                They&apos;ll get a link to create an account and join{' '}
                {currentOrg.name}. Invitations are for people who don&apos;t
                have a RoboSystems account yet.
              </p>
            </div>
            <div>
              <label
                htmlFor="invite-role"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Role
              </label>
              <Select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as SDK.OrgRole)}
                disabled={sendingInvite}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {inviteRole === 'admin'
                  ? 'Admins manage members, billing, and every graph the organization owns.'
                  : 'Members join the organization but get access to a graph only when granted it.'}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="blue"
            onClick={handleSendInvitation}
            disabled={sendingInvite || !inviteEmail.trim()}
          >
            {sendingInvite && <Spinner size="sm" className="mr-2" />}
            {sendingInvite ? 'Sending...' : 'Send Invitation'}
          </Button>
          <Button
            color="gray"
            onClick={() => setShowInviteModal(false)}
            disabled={sendingInvite}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  )
}
