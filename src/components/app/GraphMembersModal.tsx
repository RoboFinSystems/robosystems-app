'use client'

import * as SDK from '@robosystems/client'
import { useApiError, useToast } from '@robosystems/core'
import {
  Alert,
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Spinner,
} from 'flowbite-react'
import { useCallback, useEffect, useState } from 'react'
import { HiExclamationCircle, HiTrash, HiUsers } from 'react-icons/hi'

interface GraphMembersModalProps {
  show: boolean
  onClose: () => void
  graphId: string
  graphName: string
  orgId?: string
}

type GraphMember = SDK.GraphMemberResponse
type OrgMember = SDK.OrgMemberResponse

const ROLE_LABELS: Record<string, string> = {
  viewer: 'Viewer',
  member: 'Member',
  admin: 'Admin',
}

function roleBadgeColor(role: string) {
  switch (role) {
    case 'admin':
      return 'info'
    case 'member':
      return 'gray'
    default:
      return 'light'
  }
}

export default function GraphMembersModal({
  show,
  onClose,
  graphId,
  graphName,
  orgId,
}: GraphMembersModalProps) {
  const { handleApiError } = useApiError()
  const { showSuccess } = useToast()

  const [members, setMembers] = useState<GraphMember[]>([])
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addUserId, setAddUserId] = useState('')
  const [addRole, setAddRole] = useState<SDK.GraphRole>('member')
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    if (!graphId) return

    try {
      setLoading(true)
      setError('')

      // The add-member picker is sourced from the owning org's roster —
      // graph access never crosses organizations.
      const [membersResponse, orgResponse] = await Promise.all([
        SDK.listGraphMembers({ path: { graph_id: graphId } }),
        orgId
          ? SDK.listOrgMembers({ path: { org_id: orgId } })
          : Promise.resolve(null),
      ])

      if (membersResponse.error) {
        const detail = (membersResponse.error as { detail?: string })?.detail
        throw new Error(detail || 'Failed to load graph members')
      }

      setMembers(membersResponse.data?.members || [])
      setOrgMembers(orgResponse?.data?.members || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load graph members'
      )
    } finally {
      setLoading(false)
    }
  }, [graphId, orgId])

  useEffect(() => {
    if (show) {
      load()
      setAddUserId('')
      setAddRole('member')
    }
  }, [show, load])

  // Anyone already listed — explicitly or through an org role — has access,
  // so offering them again would only produce a 409.
  const grantedIds = new Set(members.map((member) => member.user_id))
  const addableMembers = orgMembers.filter(
    (member) => !grantedIds.has(member.user_id)
  )

  const handleAdd = async () => {
    if (!addUserId) return

    try {
      setAdding(true)
      const response = await SDK.addGraphMember({
        path: { graph_id: graphId },
        body: { user_id: addUserId, role: addRole },
      })

      if (response.error) {
        const detail = (response.error as { detail?: string })?.detail
        throw new Error(detail || 'Failed to add member')
      }

      showSuccess('Member added to graph')
      setAddUserId('')
      await load()
    } catch (err) {
      handleApiError(err, 'Failed to add member')
    } finally {
      setAdding(false)
    }
  }

  const handleRoleChange = async (userId: string, role: SDK.GraphRole) => {
    try {
      const response = await SDK.updateGraphMemberRole({
        path: { graph_id: graphId, user_id: userId },
        body: { role },
      })

      if (response.error) {
        throw new Error('Failed to update role')
      }

      showSuccess(`Role updated to ${ROLE_LABELS[role] ?? role}`)
      await load()
    } catch (err) {
      handleApiError(err, 'Failed to update role')
    }
  }

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name}'s access to ${graphName}?`)) return

    try {
      const response = await SDK.removeGraphMember({
        path: { graph_id: graphId, user_id: userId },
      })

      if (response.error) {
        throw new Error('Failed to remove member')
      }

      showSuccess(`${name} no longer has access`)
      await load()
    } catch (err) {
      handleApiError(err, 'Failed to remove member')
    }
  }

  return (
    <Modal show={show} onClose={onClose} size="2xl">
      <ModalHeader>Members of {graphName}</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Alert color="failure" icon={HiExclamationCircle}>
            {error}
          </Alert>
        ) : (
          <div className="space-y-6">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {members.length === 0 ? (
                <p className="py-4 text-sm text-gray-500 dark:text-gray-400">
                  No one has access to this graph yet.
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </span>
                        {member.source === 'org_role' && (
                          <Badge color="purple" size="sm">
                            Via org role
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {member.source === 'org_role' ? (
                        // Implicit admins are managed through org roles —
                        // there is no per-graph row to change or delete.
                        <Badge color={roleBadgeColor(member.role)} size="sm">
                          {ROLE_LABELS[member.role] ?? member.role}
                        </Badge>
                      ) : (
                        <>
                          <Select
                            sizing="sm"
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(
                                member.user_id,
                                e.target.value as SDK.GraphRole
                              )
                            }
                            className="w-32"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </Select>
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() =>
                              handleRemove(member.user_id, member.name)
                            }
                          >
                            <HiTrash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <HiUsers className="h-4 w-4" />
                Add a team member
              </h4>
              {addableMembers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Everyone in your organization already has access. Invite more
                  people from the Organization page.
                </p>
              ) : (
                <div className="flex items-end gap-2">
                  <Select
                    className="flex-1"
                    value={addUserId}
                    onChange={(e) => setAddUserId(e.target.value)}
                    disabled={adding}
                  >
                    <option value="">Select a member...</option>
                    {addableMembers.map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={addRole}
                    onChange={(e) =>
                      setAddRole(e.target.value as SDK.GraphRole)
                    }
                    className="w-32"
                    disabled={adding}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </Select>
                  <Button
                    color="blue"
                    onClick={handleAdd}
                    disabled={adding || !addUserId}
                  >
                    {adding && <Spinner size="sm" className="mr-2" />}
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}
