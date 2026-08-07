import { createSubgraph } from '@robosystems/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { SubgraphCreationWizard } from '../SubgraphCreationWizard'

const mockPush = vi.fn()
const showError = vi.fn()

vi.mock('@robosystems/core', () => ({
  useToast: () => ({ showSuccess: vi.fn(), showError, showInfo: vi.fn() }),
}))

vi.mock('@robosystems/core/theme', () => ({ customTheme: {} }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('react-icons/hi', () => ({
  HiArrowLeft: () => <span>Icon</span>,
  HiArrowRight: () => <span>Icon</span>,
  HiCheck: () => <span>Icon</span>,
  HiCheckCircle: () => <span>Icon</span>,
  HiChip: () => <span>Icon</span>,
  HiClipboardCopy: () => <span>Icon</span>,
  HiInformationCircle: () => <span>Icon</span>,
  HiPuzzle: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  Progress: () => <div />,
  Textarea: ({ value, onChange, id }: any) => (
    <textarea id={id} value={value} onChange={onChange} />
  ),
  TextInput: ({ value, onChange, id, ...props }: any) => (
    <input id={id} value={value} onChange={onChange} {...props} />
  ),
}))

const mockCreateSubgraph = vi.mocked(createSubgraph)

const renderWizard = () =>
  render(
    <SubgraphCreationWizard
      graphId="kg1a2b3c"
      parentGraphName="Acme Ledger"
      onCancel={vi.fn()}
      onSuccess={vi.fn()}
    />
  )

const fillForm = (name: string) => {
  fireEvent.change(screen.getByLabelText(/Subgraph Name/), {
    target: { value: name },
  })
  fireEvent.change(screen.getByLabelText(/Display Name/), {
    target: { value: 'Related Entities' },
  })
}

describe('SubgraphCreationWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('previews the full subgraph id while the name is typed', () => {
    renderWizard()

    fireEvent.change(screen.getByLabelText(/Subgraph Name/), {
      target: { value: 'entities' },
    })

    expect(screen.getByText(/kg1a2b3c/)).toBeInTheDocument()
    expect(document.body.textContent).toContain('kg1a2b3c_entities')
  })

  test('rejects names the API would reject', () => {
    renderWizard()

    fillForm('my-subgraph')
    fireEvent.click(screen.getByText('Next'))

    expect(
      screen.getByText(/Name must be lowercase letters and numbers only/)
    ).toBeInTheDocument()
    // Still on step 1 — no request attempted with a name that cannot become
    // a subgraph id.
    expect(screen.getByLabelText(/Subgraph Name/)).toBeInTheDocument()
  })

  test('normalizes the name to lowercase, as the API does', () => {
    renderWizard()

    fireEvent.change(screen.getByLabelText(/Subgraph Name/), {
      target: { value: 'Entities' },
    })

    expect(document.body.textContent).toContain('kg1a2b3c_entities')
  })

  test('ends on the subgraph id and its MCP endpoint', async () => {
    mockCreateSubgraph.mockResolvedValue({
      data: {
        operation: 'create-subgraph',
        operationId: 'op_1',
        status: 'completed',
        result: { graph_id: 'kg1a2b3c_entities' },
      },
    } as any)

    renderWizard()
    fillForm('entities')
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Create Subgraph'))

    await waitFor(() => {
      expect(screen.getByText('Related Entities is ready')).toBeInTheDocument()
    })

    const body = document.body.textContent ?? ''
    expect(body).toContain('kg1a2b3c_entities')
    expect(body).toContain(
      'https://api.robosystems.ai/v1/graphs/kg1a2b3c_entities/mcp'
    )
  })

  test('hands the new subgraph to the MCP page', async () => {
    mockCreateSubgraph.mockResolvedValue({
      data: {
        operation: 'create-subgraph',
        operationId: 'op_1',
        status: 'completed',
        result: { graph_id: 'kg1a2b3c_entities' },
      },
    } as any)

    renderWizard()
    fillForm('entities')
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Create Subgraph'))

    await waitFor(() => {
      expect(screen.getByText('Connect to MCP')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Connect to MCP'))

    expect(mockPush).toHaveBeenCalledWith(
      '/connect?workspace=kg1a2b3c_entities'
    )
  })

  test('falls back to the deterministic id when the envelope carries none', async () => {
    mockCreateSubgraph.mockResolvedValue({
      data: {
        operation: 'create-subgraph',
        operationId: 'op_1',
        status: 'pending',
      },
    } as any)

    renderWizard()
    fillForm('entities')
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Create Subgraph'))

    await waitFor(() => {
      expect(screen.getByText('Related Entities is ready')).toBeInTheDocument()
    })
    expect(document.body.textContent).toContain('kg1a2b3c_entities')
  })

  test('returns to the form when the name is already taken', async () => {
    mockCreateSubgraph.mockRejectedValue({ status: 409 })

    renderWizard()
    fillForm('entities')
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Create Subgraph'))

    await waitFor(() => {
      expect(screen.getByText('This name is already taken')).toBeInTheDocument()
    })
    expect(showError).toHaveBeenCalled()
  })
})
