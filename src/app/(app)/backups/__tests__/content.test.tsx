import { sdkError, sdkOk } from '@/test-utils/sdk'
import {
  createBackup,
  getBackupDownloadUrl,
  getBackupStats,
  listBackups,
  listSubgraphs,
} from '@robosystems/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const showSuccess = vi.fn()
const showError = vi.fn()
const showInfo = vi.fn()
const startMonitoring = vi.fn()

vi.mock('@robosystems/core', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@robosystems/core')
  return {
    ...actual,
    PageLayout: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useGraphContext: () => ({ state: { currentGraphId: 'kg1' } }),
    useIsRepository: () => ({ isRepository: false }),
  }
})
vi.mock('@robosystems/core/hooks/use-toast', () => ({
  useToast: () => ({
    showSuccess,
    showError,
    showInfo,
    ToastContainer: () => null,
  }),
}))
vi.mock('@robosystems/core/task-monitoring/operationHooks', () => ({
  useOperationMonitoring: () => ({
    startMonitoring,
    reset: vi.fn(),
    isMonitoring: false,
    progress: 0,
    operationId: null,
    error: null,
    currentStep: null,
  }),
}))
vi.mock('@/components/docs/GuideLink', () => ({ GuideLink: () => null }))

import BackupManagementContent from '../content'

const backup = {
  backup_id: 'bk_1',
  graph_id: 'kg1',
  status: 'completed',
  created_at: '2026-09-01T00:00:00Z',
  size_bytes: 10,
}

async function openCreateModal() {
  render(<BackupManagementContent />)
  await waitFor(() => expect(listBackups).toHaveBeenCalled())
  const [openButton] = screen.getAllByRole('button', { name: /Create Backup/ })
  fireEvent.click(openButton)
  const buttons = await screen.findAllByRole('button', {
    name: /Create Backup/,
  })
  return buttons[buttons.length - 1]
}

describe('BackupManagementContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(listBackups).mockResolvedValue(sdkOk({ backups: [backup] }))
    vi.mocked(listSubgraphs).mockResolvedValue(sdkOk({ subgraphs: [] }))
    vi.mocked(getBackupStats).mockResolvedValue(sdkOk(null))
    startMonitoring.mockResolvedValue({})
  })

  it('sends one create for a double click, with an idempotency key', async () => {
    let resolveCreate: (value: unknown) => void = () => {}
    vi.mocked(createBackup).mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve
      }) as never
    )
    const submit = await openCreateModal()
    fireEvent.click(submit)
    fireEvent.click(submit)
    resolveCreate(sdkOk({ operationId: 'op_1', status: 'pending', result: {} }))
    await waitFor(() => expect(startMonitoring).toHaveBeenCalled())
    expect(createBackup).toHaveBeenCalledTimes(1)
    const call = vi.mocked(createBackup).mock.calls[0][0]
    expect(call.headers?.['Idempotency-Key']).toEqual(expect.any(String))
  })

  it('shows the refusal detail when backup creation is refused', async () => {
    vi.mocked(createBackup).mockResolvedValue(
      sdkError(403, 'Backup creation is disabled for this graph')
    )
    const submit = await openCreateModal()
    fireEvent.click(submit)
    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith(
        expect.stringMatching(/Backup creation is (currently )?disabled/),
        expect.any(Number)
      )
    )
    expect(startMonitoring).not.toHaveBeenCalled()
  })

  it('reports the retention the API actually applied', async () => {
    vi.mocked(createBackup).mockResolvedValue(
      sdkOk({
        operationId: 'op_1',
        status: 'pending',
        result: {
          retention_days: 7,
          message:
            'Backup creation started (retention capped to 7 days, the standard maximum)',
        },
      })
    )
    const submit = await openCreateModal()
    fireEvent.click(submit)
    await waitFor(() =>
      expect(showInfo).toHaveBeenCalledWith(
        expect.stringContaining('7 days'),
        expect.any(Number)
      )
    )
  })

  it('shows the quota detail when a download is refused', async () => {
    vi.mocked(getBackupDownloadUrl).mockResolvedValue(
      sdkError(429, 'Daily download limit reached; resets at 00:00 UTC')
    )
    render(<BackupManagementContent />)
    fireEvent.click(await screen.findByRole('button', { name: /Download/ }))
    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith(
        'Daily download limit reached; resets at 00:00 UTC',
        expect.any(Number)
      )
    )
  })
})
