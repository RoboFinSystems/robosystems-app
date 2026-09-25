import { sdkError } from '@/test-utils/sdk'
import * as RoboClient from '@robosystems/client'
import { useGraphContext } from '@robosystems/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { TablesContent } from '../content'

vi.mock('@robosystems/core', () => ({
  useGraphContext: vi.fn(),
  PageLayout: ({ children }: any) => <div>{children}</div>,
  PageHeader: ({ title, actions }: any) => (
    <div>
      <h1>{title}</h1>
      <div>{actions}</div>
    </div>
  ),
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  ConfirmModal: ({ show, children }: any) =>
    show ? <div data-testid="confirm-modal">{children}</div> : null,
}))

vi.mock('@robosystems/client', () => ({
  listTables: vi.fn(),
  listFiles: vi.fn(),
  executeSql: vi.fn(),
  deleteFile: vi.fn(),
  ingestFiles: vi.fn(),
  uploadFile: vi.fn(),
}))

vi.mock('@monaco-editor/react', () => ({
  default: ({ value }: any) => (
    <textarea data-testid="sql-editor" readOnly value={value} />
  ),
}))

vi.mock('@/lib/utils', () => ({ normalizeLocalUrl: (u: string) => u }))

vi.mock('react-icons/hi', () => ({
  HiChip: () => <span>Icon</span>,
  HiCloudUpload: () => <span>Icon</span>,
  HiDatabase: () => <span>Icon</span>,
  HiInformationCircle: () => <span>Icon</span>,
  HiPlay: () => <span>Icon</span>,
  HiTable: () => <span>Icon</span>,
  HiTrash: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
  Badge: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
  Label: ({ children }: any) => <label>{children}</label>,
  Modal: ({ show, children }: any) => (show ? <div>{children}</div> : null),
  ModalBody: ({ children }: any) => <div>{children}</div>,
  ModalFooter: ({ children }: any) => <div>{children}</div>,
  ModalHeader: ({ children }: any) => <div>{children}</div>,
  Select: ({ children, ...props }: any) => (
    <select {...props}>{children}</select>
  ),
  Spinner: () => <span>Spinner</span>,
  Tabs: Object.assign(({ children }: any) => <div>{children}</div>, {
    Item: ({ children }: any) => <div>{children}</div>,
  }),
  TextInput: (props: any) => <input type="text" {...props} />,
}))

const mockUseGraphContext = vi.mocked(useGraphContext)
const mockListTables = vi.mocked(RoboClient.listTables)
const mockListFiles = vi.mocked(RoboClient.listFiles)
const mockExecuteSql = vi.mocked(RoboClient.executeSql)

function setGraph(graphId: string | null, graphType = 'entity') {
  mockUseGraphContext.mockReturnValue({
    state: {
      currentGraphId: graphId,
      graphs: [{ graphId, graphType }],
    },
  } as any)
}

function mockTables(tables: Array<{ name: string; rows: number }>) {
  mockListTables.mockResolvedValue({
    data: {
      tables: tables.map((t) => ({
        table_name: t.name,
        row_count: t.rows,
        file_count: 1,
        total_size_bytes: 1024,
      })),
    },
    error: undefined,
  } as any)
}

describe('TablesContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setGraph('kg_test')
    mockTables([{ name: 'Entity', rows: 10 }])
    mockListFiles.mockResolvedValue({
      data: { files: [] },
      error: undefined,
    } as any)
    mockExecuteSql.mockResolvedValue({
      data: { columns: [], rows: [] },
      error: undefined,
    } as any)
  })

  test('auto-selects the first table carrying rows', async () => {
    mockTables([
      { name: 'Empty', rows: 0 },
      { name: 'Entity', rows: 10 },
    ])

    render(<TablesContent />)

    await waitFor(() => {
      expect(mockListFiles).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        query: { table_name: 'Entity' },
      })
    })
  })

  describe('switching graphs', () => {
    test('re-seeds the selection from the new graph instead of carrying it over', async () => {
      mockTables([{ name: 'Entity', rows: 10 }])

      const { rerender } = render(<TablesContent />)

      await waitFor(() => {
        expect(mockExecuteSql).toHaveBeenCalledWith({
          path: { graph_id: 'kg_test' },
          body: { sql: 'SELECT * FROM Entity LIMIT 10' },
        })
      })

      // The new graph has no table called Entity. Before the fix the selection
      // survived the switch, so the preview ran `SELECT * FROM Entity` — a
      // table name from the previous graph — against this one.
      mockExecuteSql.mockClear()
      setGraph('kg_other')
      mockTables([{ name: 'Transaction', rows: 5 }])
      rerender(<TablesContent />)

      await waitFor(() => {
        expect(mockExecuteSql).toHaveBeenCalledWith({
          path: { graph_id: 'kg_other' },
          body: { sql: 'SELECT * FROM Transaction LIMIT 10' },
        })
      })
      expect(mockExecuteSql).not.toHaveBeenCalledWith(
        expect.objectContaining({
          body: { sql: 'SELECT * FROM Entity LIMIT 10' },
        })
      )
    })

    test('keeps the selection when the new graph has a table of the same name', async () => {
      mockTables([{ name: 'Entity', rows: 10 }])

      const { rerender } = render(<TablesContent />)

      await waitFor(() => {
        expect(mockListFiles).toHaveBeenCalledWith({
          path: { graph_id: 'kg_test' },
          query: { table_name: 'Entity' },
        })
      })

      mockListFiles.mockClear()
      setGraph('kg_other')
      mockTables([{ name: 'Entity', rows: 7 }])
      rerender(<TablesContent />)

      // Same name, so the selection is preserved — but re-read against the
      // graph now selected, not the one it was chosen in.
      await waitFor(() => {
        expect(mockListFiles).toHaveBeenCalledWith({
          path: { graph_id: 'kg_other' },
          query: { table_name: 'Entity' },
        })
      })
    })

    test('clears the selection when the new graph has no tables at all', async () => {
      mockTables([{ name: 'Entity', rows: 10 }])

      const { rerender } = render(<TablesContent />)

      await waitFor(() => {
        expect(mockExecuteSql).toHaveBeenCalled()
      })

      mockExecuteSql.mockClear()
      mockListFiles.mockClear()
      setGraph('kg_other')
      mockTables([])
      rerender(<TablesContent />)

      await waitFor(() => {
        expect(mockListTables).toHaveBeenCalledWith({
          path: { graph_id: 'kg_other' },
        })
      })
      // Nothing to select, so nothing is read — in particular not the previous
      // graph's table under the new graph's id.
      expect(mockExecuteSql).not.toHaveBeenCalled()
      expect(mockListFiles).not.toHaveBeenCalled()
    })
  })

  describe('switching tables', () => {
    beforeEach(() => setGraph('kg_test', 'generic'))

    test("does not show the previous table's preview when the next one fails", async () => {
      mockTables([
        { name: 'Customers', rows: 10 },
        { name: 'Invoices', rows: 4 },
      ])
      mockExecuteSql.mockResolvedValueOnce({
        data: { columns: ['name'], rows: [['Acme Customer']] },
        error: undefined,
      } as any)

      render(<TablesContent />)
      expect(await screen.findByText('Acme Customer')).toBeInTheDocument()

      mockExecuteSql.mockResolvedValueOnce(sdkError(400, 'Invalid table'))
      mockListFiles.mockResolvedValueOnce(sdkError(500, 'boom'))
      fireEvent.click(screen.getAllByText('Invoices')[0])

      await waitFor(() =>
        expect(mockExecuteSql).toHaveBeenCalledWith(
          expect.objectContaining({
            body: { sql: 'SELECT * FROM Invoices LIMIT 10' },
          })
        )
      )
      await waitFor(() =>
        expect(screen.queryByText('Acme Customer')).not.toBeInTheDocument()
      )
    })

    test('drops a slower preview that lands after a newer selection', async () => {
      mockTables([
        { name: 'Customers', rows: 10 },
        { name: 'Invoices', rows: 4 },
      ])
      let resolveCustomers: (v: unknown) => void = () => {}
      mockExecuteSql.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveCustomers = resolve
        }) as any
      )
      mockExecuteSql.mockResolvedValueOnce({
        data: { columns: ['number'], rows: [['INV-1']] },
        error: undefined,
      } as any)

      render(<TablesContent />)
      await waitFor(() => expect(mockExecuteSql).toHaveBeenCalledTimes(1))
      fireEvent.click(screen.getAllByText('Invoices')[0])
      expect(await screen.findByText('INV-1')).toBeInTheDocument()

      resolveCustomers({
        data: { columns: ['name'], rows: [['Acme Customer']] },
        error: undefined,
      })
      await new Promise((r) => setTimeout(r, 20))
      expect(screen.queryByText('Acme Customer')).not.toBeInTheDocument()
      expect(screen.getByText('INV-1')).toBeInTheDocument()
    })
  })
})
