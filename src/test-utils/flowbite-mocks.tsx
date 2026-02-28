import { vi } from 'vitest'

// Mock Flowbite React components
export const mockFlowbiteComponents = () => {
  vi.mock('flowbite-react', () => ({
    Badge: ({ children, color, size, ...props }: any) => (
      <span data-testid="badge" {...props}>
        {children}
      </span>
    ),
    Button: ({ children, onClick, disabled, color, size, ...props }: any) => (
      <button
        onClick={onClick}
        disabled={disabled}
        data-testid="button"
        {...props}
      >
        {children}
      </button>
    ),
    Card: ({ children, ...props }: any) => (
      <div data-testid="card" {...props}>
        {children}
      </div>
    ),
    Dropdown: ({ label, children, ...props }: any) => (
      <div data-testid="dropdown" {...props}>
        <button data-testid="dropdown-trigger">{label}</button>
        <div data-testid="dropdown-content">{children}</div>
      </div>
    ),
    Progress: ({ progress, color, size, ...props }: any) => (
      <div
        data-testid="progress"
        data-progress={progress}
        data-color={color}
        style={{ width: `${progress}%` }}
        {...props}
      />
    ),
    Table: ({ children, ...props }: any) => (
      <table data-testid="table" {...props}>
        {children}
      </table>
    ),
    TextInput: ({ value, onChange, placeholder, ...props }: any) => (
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-testid="text-input"
        {...props}
      />
    ),
    Tooltip: ({ content, children, ...props }: any) => (
      <div data-testid="tooltip" title={content} {...props}>
        {children}
      </div>
    ),
    Alert: ({ children, color, ...props }: any) => (
      <div data-testid="alert" data-color={color} {...props}>
        {children}
      </div>
    ),
    Modal: ({ show, onClose, children, ...props }: any) =>
      show ? (
        <div data-testid="modal" {...props}>
          <button onClick={onClose} data-testid="modal-close">
            Close
          </button>
          {children}
        </div>
      ) : null,
    Tabs: ({ children, ...props }: any) => (
      <div data-testid="tabs" {...props}>
        {children}
      </div>
    ),
    Label: ({ children, ...props }: any) => (
      <label data-testid="label" {...props}>
        {children}
      </label>
    ),
    Textarea: ({ value, onChange, placeholder, ...props }: any) => (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-testid="textarea"
        {...props}
      />
    ),
    Select: ({ value, onChange, children, ...props }: any) => (
      <select value={value} onChange={onChange} data-testid="select" {...props}>
        {children}
      </select>
    ),
    Checkbox: ({ checked, onChange, label, ...props }: any) => (
      <label data-testid="checkbox-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          data-testid="checkbox"
          {...props}
        />
        {label}
      </label>
    ),
    'Dropdown.Item': ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} data-testid="dropdown-item" {...props}>
        {children}
      </button>
    ),
    'Table.Head': ({ children, ...props }: any) => (
      <thead data-testid="table-head" {...props}>
        {children}
      </thead>
    ),
    'Table.HeadCell': ({ children, ...props }: any) => (
      <th data-testid="table-head-cell" {...props}>
        {children}
      </th>
    ),
    'Table.Body': ({ children, ...props }: any) => (
      <tbody data-testid="table-body" {...props}>
        {children}
      </tbody>
    ),
    'Table.Row': ({ children, ...props }: any) => (
      <tr data-testid="table-row" {...props}>
        {children}
      </tr>
    ),
    'Table.Cell': ({ children, ...props }: any) => (
      <td data-testid="table-cell" {...props}>
        {children}
      </td>
    ),
    'Tabs.Group': ({ children, ...props }: any) => (
      <div data-testid="tabs-group" {...props}>
        {children}
      </div>
    ),
    'Tabs.Item': ({ children, title, active, ...props }: any) => (
      <div
        data-testid="tabs-item"
        data-title={title}
        data-active={active}
        {...props}
      >
        {children}
      </div>
    ),
    'Modal.Header': ({ children, ...props }: any) => (
      <div data-testid="modal-header" {...props}>
        {children}
      </div>
    ),
    'Modal.Body': ({ children, ...props }: any) => (
      <div data-testid="modal-body" {...props}>
        {children}
      </div>
    ),
    'Modal.Footer': ({ children, ...props }: any) => (
      <div data-testid="modal-footer" {...props}>
        {children}
      </div>
    ),
  }))
}
