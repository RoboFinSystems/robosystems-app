'use client'

import {
  customTheme,
  PageLayout,
  useApiError,
  useOrg,
  useToast,
} from '@/lib/core'
import * as SDK from '@robosystems/client'
import { format } from 'date-fns'
import {
  Alert,
  Badge,
  Button,
  Card,
  Label,
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
  HiChartBar,
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

export function OrganizationContent() {
  const { currentOrg, refreshOrgs } = useOrg()
  const { handleApiError } = useApiError()
  const { showSuccess, showError, ToastContainer } = useToast()

  const [activeTab, setActiveTab] = useState(0)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [limits, setLimits] = useState<OrgLimits | null>(null)
  const [usage, setUsage] = useState<OrgUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<SDK.OrgRole>('member')
  const [inviting, setInviting] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [updatingName, setUpdatingName] = useState(false)

  // Permission checks
  const canInvite = ['owner', 'admin'].includes(currentOrg?.role || '')
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

      // Only load usage if admin/owner
      const isAdmin = ['owner', 'admin'].includes(currentOrg.role)
      if (isAdmin) {
        const usageResponse = await SDK.getOrgUsage({
          path: { org_id: currentOrg.id },
          query: { days: 30 },
        })

        if (usageResponse?.data) {
          setUsage(usageResponse.data)
        }
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

  const handleInviteMember = async () => {
    if (!currentOrg?.id) return

    try {
      setInviting(true)

      const response = await SDK.inviteOrgMember({
        path: { org_id: currentOrg.id },
        body: {
          email: inviteEmail,
          role: inviteRole,
        },
      })

      if (response.error) {
        throw new Error('Failed to invite member')
      }

      showSuccess('Invitation sent successfully')
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('member')
      await loadOrgData()
    } catch (error) {
      handleApiError(error, 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

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

  if (!currentOrg) {
    return (
      <PageLayout>
        <Alert color="failure" icon={HiExclamationCircle}>
          No organization found
        </Alert>
      </PageLayout>
    )
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="xl" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <ToastContainer />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
            <HiOfficeBuilding className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
              Organization
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your organization and team
            </p>
          </div>
        </div>
      </div>

      {/* Organization Info */}
      <Card theme={customTheme.card}>
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
                    <Spinner size="sm" />
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
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        aria-label="Organization tabs"
        variant="underline"
        onActiveTabChange={(tab) => setActiveTab(tab)}
      >
        {/* Members Tab */}
        <Tabs.Item active title="Members" icon={HiUsers}>
          <Card theme={customTheme.card}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Team Members
              </h2>
              {canInvite && (
                <Button
                  color="blue"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                >
                  <HiUserAdd className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              )}
            </div>

            {members.length === 0 ? (
              <div className="py-12 text-center">
                <HiUsers className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  No Members
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Invite team members to collaborate
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <Card key={member.user_id} theme={customTheme.card}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {member.name}
                          </h3>
                          {member.is_active ? (
                            <Badge color="success" icon={HiCheck} size="sm">
                              Active
                            </Badge>
                          ) : (
                            <Badge color="warning" size="sm">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Joined{' '}
                          {format(new Date(member.joined_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Owner role is never editable */}
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
                            className="w-32"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </Select>
                        ) : (
                          <Badge
                            color={getRoleBadgeColor(member.role)}
                            size="sm"
                          >
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
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </Tabs.Item>

        {/* Graphs Tab - Admin Only */}
        {canViewGraphs && (
          <Tabs.Item title="Graphs" icon={HiDatabase}>
            <div className="space-y-4">
              {/* Organization Limits */}
              {limits && (
                <Card theme={customTheme.card}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                      <HiChartBar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Graph Limits
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Graphs Limit */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Graphs
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {(limits.current_usage.graphs as any).current} /{' '}
                          {limits.max_graphs}
                        </span>
                      </div>
                      <Progress
                        progress={
                          ((limits.current_usage.graphs as any).current /
                            limits.max_graphs) *
                          100
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

                    {/* Warnings */}
                    {limits.warnings.length > 0 && (
                      <Alert color="warning" icon={HiExclamationCircle}>
                        <div className="space-y-1">
                          {limits.warnings.map((warning, idx) => (
                            <p key={idx}>{warning}</p>
                          ))}
                        </div>
                      </Alert>
                    )}

                    {/* Can Create Graph Status */}
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Can create new graphs
                      </span>
                      <Badge
                        color={limits.can_create_graph ? 'success' : 'failure'}
                      >
                        {limits.can_create_graph ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}

              {/* Simplified Usage Stats */}
              {usage && (
                <Card theme={customTheme.card}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                      <HiChartBar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Usage Overview
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last {usage.period_days} days
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Total Graphs */}
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Total Graphs
                      </div>
                      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {usage.graph_details.length}
                      </p>
                    </div>

                    {/* Total Storage */}
                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                      <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Total Storage
                      </div>
                      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {usage.summary.total_storage_gb.toFixed(1)} GB
                      </p>
                    </div>

                    {/* Credits Used */}
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        Credits Used
                      </div>
                      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {usage.summary.total_credits_used.toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 0,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Graph Directory */}
              <Card theme={customTheme.card}>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Organization Graphs
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    All graphs across your organization
                  </p>
                </div>

                {!usage || usage.graph_details.length === 0 ? (
                  <div className="py-12 text-center">
                    <HiDatabase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                      No Graphs
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Create your first graph to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usage.graph_details.map((graph: any) => (
                      <Card key={graph.graph_id} theme={customTheme.card}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {graph.graph_name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {graph.graph_id}
                            </p>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-right">
                              <div className="text-gray-500 dark:text-gray-400">
                                Storage
                              </div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {graph.storage_gb.toFixed(2)} GB
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-500 dark:text-gray-400">
                                Credits
                              </div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {graph.credits_used.toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-500 dark:text-gray-400">
                                Available
                              </div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {graph.credits_available.toLocaleString(
                                  undefined,
                                  {
                                    maximumFractionDigits: 0,
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </Tabs.Item>
        )}
      </Tabs>

      {/* Invite Member Modal */}
      <Modal show={showInviteModal} onClose={() => setShowInviteModal(false)}>
        <ModalHeader>Invite Team Member</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <TextInput
                id="email"
                type="email"
                icon={HiMail}
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviting}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as SDK.OrgRole)}
                disabled={inviting}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                {currentOrg.role === 'owner' && (
                  <option value="owner">Owner</option>
                )}
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="blue"
            onClick={handleInviteMember}
            disabled={!inviteEmail || inviting}
          >
            {inviting ? <Spinner size="sm" className="mr-2" /> : null}
            Send Invitation
          </Button>
          <Button color="gray" onClick={() => setShowInviteModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  )
}
