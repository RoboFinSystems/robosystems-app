import 'flowbite-react'

declare module 'flowbite-react' {
  export interface TableComponent {
    Head: React.FC<React.HTMLAttributes<HTMLTableSectionElement>>
    Body: React.FC<React.HTMLAttributes<HTMLTableSectionElement>>
    Row: React.FC<React.HTMLAttributes<HTMLTableRowElement>>
    Cell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>>
    HeadCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>>
  }

  export interface TabsComponent {
    Item: React.FC<any>
  }

  export interface ModalComponent {
    Header: React.FC<any>
    Body: React.FC<any>
    Footer: React.FC<any>
  }

  export interface DropdownComponent {
    Item: React.FC<any>
    Divider: React.FC<any>
    Header: React.FC<any>
  }

  export const Table: React.FC<any> & TableComponent
  export const Tabs: React.FC<any> & TabsComponent
  export const Modal: React.FC<any> & ModalComponent
  export const Dropdown: React.FC<any> & DropdownComponent
}
