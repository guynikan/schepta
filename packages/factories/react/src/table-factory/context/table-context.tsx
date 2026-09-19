import React, { createContext, useContext, type ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface TableSortState {
  column: string;
  direction: SortDirection;
}

export interface TableColumnMeta {
  /** Schema property key (used as data-test-id and stable column identifier) */
  key: string;
  /** Display label rendered in the column header */
  label: string;
  /** Dot-path used to read the cell value from each row (e.g. 'user.email') */
  field: string;
  /** Whether the column accepts a sort toggle */
  sortable?: boolean;
  /** Optional CSS width */
  width?: string | number;
  /** Text alignment for header and cells */
  align?: 'left' | 'center' | 'right';
  /** Optional template string with the `{{ value }}` token */
  format?: string;
}

export type TableSelectionMode = 'none' | 'single' | 'multiple';

export interface TableContextValue {
  columns: TableColumnMeta[];
  rows: Array<Record<string, any>>;
  selectedKeys: string[];
  sort: TableSortState | null;
  selectionMode: TableSelectionMode;
  loading: boolean;
  emptyState: ReactNode | undefined;
  getRowKey: (row: Record<string, any>, index: number) => string;
  onToggleSort: (columnKey: string) => void;
  onToggleRow: (rowKey: string) => void;
}

const TableContext = createContext<TableContextValue | null>(null);

export function TableProvider({
  value,
  children,
}: {
  value: TableContextValue;
  children: ReactNode;
}) {
  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

export function useTableContext(): TableContextValue {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error(
      'useTableContext must be used inside a TableProvider. This component is only rendered by TableFactory.'
    );
  }
  return ctx;
}

export function useOptionalTableContext(): TableContextValue | null {
  return useContext(TableContext);
}
