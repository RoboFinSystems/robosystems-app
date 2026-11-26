import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createGenericGraph = vi.fn()
const createEntityGraph = vi.fn()

vi.mock('@robosystems/core', () => ({
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
vi.mock('@robosystems/core/ui', () => ({
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

let genericCustomSchema: string | null = null

vi.mock('../steps/GraphTypeStep', () => ({
  GraphTypeStep: ({ onTypeChange }: { onTypeChange: (t: string) => void }) => (
    <button onClick={() => onTypeChange('generic')}>pick-generic</button>
  ),
}))
vi.mock('../steps/GenericGraphStep', () => ({
  GenericGraphStep: (props: {
    onGraphNameChange: (n: string) => void
    onTagsChange: (t: string[]) => void
    onCustomSchemaChange: (s: string) => void
  }) => (
    <div>
      <button onClick={() => props.onGraphNameChange('My Graph')}>name</button>
      <button onClick={() => props.onTagsChange(['prod', 'acme'])}>tags</button>
      <button
        onClick={() =>
          genericCustomSchema !== null &&
          props.onCustomSchemaChange(genericCustomSchema)
        }
      >
        schema-body
      </button>
    </div>
  ),
}))
vi.mock('../steps/ReviewStep', () => ({ ReviewStep: () => <div>review</div> }))
vi.mock('../steps/EntityInfoStep', () => ({
  EntityInfoStep: ({
    onUpdate,
  }: {
    onUpdate: (u: { entityName: string }) => void
  }) => <button onClick={() => onUpdate({ entityName: 'Acme' })}>name</button>,
}))
vi.mock('../steps/SchemaExtensionsStep', () => ({
  SchemaExtensionsStep: () => null,
}))
vi.mock('../steps/TierSelectionStep', () => ({
  TierSelectionStep: ({
    onSelectableChange,
  }: {
    onSelectableChange: (s: boolean) => void
  }) => (
    <div>
      <button onClick={() => onSelectableChange(false)}>tier-full</button>
      <button onClick={() => onSelectableChange(true)}>tier-open</button>
    </div>
  ),
}))

import { GraphCreationWizard } from '../GraphCreationWizard'
import { STARTER_SCHEMA } from '../schemaTemplate'

/** Walk the generic path to the review step and press Create. */
function createGeneric() {
  render(<GraphCreationWizard onSuccess={vi.fn()} onCancel={vi.fn()} />)
  fireEvent.click(screen.getByText('pick-generic'))
  fireEvent.click(screen.getByText(/Next/))
  for (const control of ['name', 'tags', 'schema-body']) {
    fireEvent.click(screen.getByText(control))
  }
  fireEvent.click(screen.getByText(/Next/))
  fireEvent.click(screen.getByRole('button', { name: /Create Graph/ }))
}

describe('GraphCreationWizard (generic)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    genericCustomSchema = null
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

  it('sends the starter schema and the tags when the schema is left as offered', async () => {
    createGenericGraph.mockResolvedValue({ graph_id: 'kg1' })
    createGeneric()
    await waitFor(() => expect(createGenericGraph).toHaveBeenCalled())
    expect(createGenericGraph.mock.calls[0][0]).toMatchObject({
      graph_name: 'My Graph',
      tags: ['prod', 'acme'],
      custom_schema: STARTER_SCHEMA,
    })
  })

  it('sends the schema the user wrote', async () => {
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

  it.each([
    ['not valid JSON', '{ nodes: '],
    ['without a node', '{"name": "x", "nodes": [], "relationships": []}'],
    ['blank', '   '],
  ])('holds the step on a schema that is %s', (_label, schema) => {
    genericCustomSchema = schema
    render(<GraphCreationWizard onSuccess={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('pick-generic'))
    fireEvent.click(screen.getByText(/Next/))
    for (const control of ['name', 'schema-body']) {
      fireEvent.click(screen.getByText(control))
    }
    fireEvent.click(screen.getByText(/Next/))
    expect(screen.queryByText('review')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Create Graph/ })
    ).not.toBeInTheDocument()
  })
})

describe('GraphCreationWizard (tier step)', () => {
  function walkToTierStep() {
    render(
      <GraphCreationWizard
        allowGenericGraphs={false}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('name'))
    fireEvent.click(screen.getByText(/Next/))
    fireEvent.click(screen.getByText(/Next/))
  }

  it('holds Next while the selected tier is at capacity', () => {
    walkToTierStep()
    fireEvent.click(screen.getByText('tier-full'))
    const next = screen.getByRole('button', { name: /Next/ })
    expect(next).toBeDisabled()
    fireEvent.click(next)
    expect(screen.getByText('tier-full')).toBeInTheDocument()
  })

  it('advances once the selected tier is available', () => {
    walkToTierStep()
    fireEvent.click(screen.getByText('tier-open'))
    fireEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(screen.getByText('review')).toBeInTheDocument()
  })
})
