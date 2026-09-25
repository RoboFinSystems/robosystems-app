import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createGenericGraph = vi.fn()
const createEntityGraph = vi.fn()

vi.mock('@robosystems/core', () => ({
  customTheme: {},
  useOrg: () => ({ currentOrg: { id: 'org_1' } }),
  useGraphCreation: () => ({
    isLoading: false,
    error: null,
    progress: 0,
    currentStep: null,
    createGenericGraph,
    createEntityGraph,
    reset: vi.fn(),
    cancelOperation: vi.fn(),
  }),
}))
vi.mock('flowbite-react', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => (
    <div role="alert">{children}</div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Progress: () => <div />,
  Spinner: () => <span />,
}))

let genericSchemaType: 'empty' | 'custom' = 'empty'
let genericCustomSchema = ''

vi.mock('../steps/GraphTypeStep', () => ({
  GraphTypeStep: ({ onTypeChange }: { onTypeChange: (t: string) => void }) => (
    <button onClick={() => onTypeChange('generic')}>pick-generic</button>
  ),
}))
vi.mock('../steps/GenericGraphStep', () => ({
  GenericGraphStep: (props: {
    onGraphNameChange: (n: string) => void
    onTagsChange: (t: string[]) => void
    onSchemaTypeChange: (t: 'empty' | 'custom') => void
    onCustomSchemaChange: (s: string) => void
  }) => (
    <div>
      <button onClick={() => props.onGraphNameChange('My Graph')}>name</button>
      <button onClick={() => props.onTagsChange(['prod', 'acme'])}>tags</button>
      <button onClick={() => props.onSchemaTypeChange(genericSchemaType)}>
        schema-type
      </button>
      <button onClick={() => props.onCustomSchemaChange(genericCustomSchema)}>
        schema-body
      </button>
    </div>
  ),
}))
vi.mock('../steps/ReviewStep', () => ({ ReviewStep: () => <div>review</div> }))
vi.mock('../steps/EntityInfoStep', () => ({ EntityInfoStep: () => null }))
vi.mock('../steps/SchemaExtensionsStep', () => ({
  SchemaExtensionsStep: () => null,
}))
vi.mock('../steps/TierSelectionStep', () => ({ TierSelectionStep: () => null }))

import { GraphCreationWizard } from '../GraphCreationWizard'

/** Walk the generic path to the review step and press Create. */
function createGeneric() {
  render(<GraphCreationWizard onSuccess={vi.fn()} onCancel={vi.fn()} />)
  fireEvent.click(screen.getByText('pick-generic'))
  fireEvent.click(screen.getByText(/Next/))
  for (const control of ['name', 'tags', 'schema-type', 'schema-body']) {
    fireEvent.click(screen.getByText(control))
  }
  fireEvent.click(screen.getByText(/Next/))
  fireEvent.click(screen.getByRole('button', { name: /Create Graph/ }))
}

describe('GraphCreationWizard (generic)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    genericSchemaType = 'empty'
    genericCustomSchema = ''
  })

  it('shows the API refusal instead of silently re-enabling Create', async () => {
    createGenericGraph.mockRejectedValue(
      new Error('Graph limit reached for this organization.')
    )
    createGeneric()
    expect(
      await screen.findByText('Graph limit reached for this organization.')
    ).toBeInTheDocument()
  })

  it('sends an empty schema and the tags for the empty choice', async () => {
    createGenericGraph.mockResolvedValue({ graph_id: 'kg1' })
    createGeneric()
    await waitFor(() => expect(createGenericGraph).toHaveBeenCalled())
    expect(createGenericGraph.mock.calls[0][0]).toMatchObject({
      graph_name: 'My Graph',
      tags: ['prod', 'acme'],
      custom_schema: { name: 'My Graph', nodes: [], relationships: [] },
    })
  })

  it('sends the pasted schema for the custom choice', async () => {
    genericSchemaType = 'custom'
    genericCustomSchema = JSON.stringify({
      name: 'crm',
      nodes: [{ name: 'Customer', properties: [] }],
      relationships: [],
    })
    createGenericGraph.mockResolvedValue({ graph_id: 'kg1' })
    createGeneric()
    await waitFor(() => expect(createGenericGraph).toHaveBeenCalled())
    expect(createGenericGraph.mock.calls[0][0].custom_schema).toEqual({
      name: 'crm',
      nodes: [{ name: 'Customer', properties: [] }],
      relationships: [],
    })
  })

  it('refuses a custom schema that is not valid JSON, without calling the API', async () => {
    genericSchemaType = 'custom'
    genericCustomSchema = '{ nodes: '
    createGeneric()
    expect(
      await screen.findByText(/custom schema is not valid JSON/i)
    ).toBeInTheDocument()
    expect(createGenericGraph).not.toHaveBeenCalled()
  })
})
