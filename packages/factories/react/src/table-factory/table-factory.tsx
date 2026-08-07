/**
 * React Table Factory
 *
 * Renders data tables from JSON schemas. The schema describes the visual
 * shape (columns, alignment, sortability) while the data rows are passed in
 * via the `rows` prop — mirroring real-world data grids where the schema is
 * stable and the dataset is not.
 *
 * Built on top of `createReactFactory`. All dynamic state (sort, selection,
 * current row set) is exposed to the default components via a dedicated
 * React context (`TableContext`), which is the most idiomatic way to keep
 * the orchestrator's static-subtree cache valid while still re-rendering
 * the table body when the factory state changes.
 */

import React, { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { ComponentSpec, MiddlewareFn } from '@schepta/core';
import tableSchemaDefinition from '@schepta/factories/schemas/table-schema.json';
import {
  createReactFactory,
  type FactoryBaseProps,
  type FactorySetupHook,
} from '../create-factory';
import { defaultTableComponents } from './defaults';
import {
  TableProvider,
  type TableColumnMeta,
  type TableContextValue,
  type TableSelectionMode,
  type TableSortState,
  type SortDirection,
} from './context';

export type { TableColumnMeta, TableSelectionMode, TableSortState, SortDirection };

export interface TableSelectionPayload {
  keys: string[];
  rows: Array<Record<string, any>>;
}

export interface TableFactoryRef {
  /** Currently selected row keys */
  getSelectedKeys: () => string[];
  /** Programmatically replace the selection. Honors the configured selectionMode. */
  setSelectedKeys: (keys: string[]) => void;
  /** Current sort state (or null when unsorted) */
  getSort: () => TableSortState | null;
  /** Programmatically set or clear the sort state */
  setSort: (sort: TableSortState | null) => void;
  /** Rows after the current sort has been applied */
  getVisibleRows: () => Array<Record<string, any>>;
}

export type TableRowKeyGetter = (
  row: Record<string, any>,
  index: number
) => string;

export interface TableFactoryProps extends FactoryBaseProps {
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  /** Data rows to render. When the array reference changes, the body re-renders. */
  rows: Array<Record<string, any>>;
  /**
   * Property name or accessor used to derive a unique key for each row.
   * Defaults to `'id'`. Falls back to the row index with a debug warning when
   * the value is missing.
   */
  rowKey?: string | TableRowKeyGetter;
  /** Selection behavior. Defaults to `'none'`. */
  selectionMode?: TableSelectionMode;
  /** Initially selected row keys. */
  initialSelection?: string | string[];
  /** Fired whenever the selection changes (either via interaction or ref API). */
  onSelectionChange?: (payload: TableSelectionPayload) => void;
  /** Initial sort state. */
  initialSort?: TableSortState | null;
  /**
   * Who performs the actual sort of the rows array.
   * - `'client'` (default): the factory sorts the rows array before rendering.
   * - `'none'`: the factory only tracks the sort state and emits `onSort`.
   */
  sortMode?: 'client' | 'none';
  /** Fired whenever the sort state changes. */
  onSort?: (sort: TableSortState | null) => void;
  /** Rendered in the table body when `rows` is empty and not loading. */
  emptyState?: ReactNode;
  /** Shows a loading row instead of the data when `true`. */
  loading?: boolean;
  debug?: boolean;
}

/** -------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

function readPath(row: Record<string, any>, path: string): any {
  if (!path) return undefined;
  const segments = path.split('.');
  let current: any = row;
  for (const segment of segments) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return current;
}

function extractColumns(schema: any): TableColumnMeta[] {
  const properties = (schema?.properties ?? {}) as Record<string, any>;

  const entries = Object.entries(properties);
  const sortedEntries = entries.sort(([, a], [, b]) => {
    const orderA = (a as any)?.['x-ui']?.order ?? Infinity;
    const orderB = (b as any)?.['x-ui']?.order ?? Infinity;
    return orderA - orderB;
  });

  const columns: TableColumnMeta[] = [];
  for (const [key, columnSchema] of sortedEntries) {
    if ((columnSchema as any)?.['x-component'] !== 'TableColumn') continue;
    const props = ((columnSchema as any)?.['x-component-props'] ?? {}) as Record<
      string,
      any
    >;
    columns.push({
      key,
      label: String(props.label ?? key),
      field: String(props.field ?? key),
      sortable: props.sortable === true,
      width: props.width,
      align: props.align,
      format: typeof props.format === 'string' ? props.format : undefined,
    });
  }
  return columns;
}

function compareValues(a: any, b: any): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  const aStr = String(a);
  const bStr = String(b);
  return aStr.localeCompare(bStr, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function sortRows(
  rows: Array<Record<string, any>>,
  columns: TableColumnMeta[],
  sort: TableSortState | null
): Array<Record<string, any>> {
  if (!sort) return rows;
  const column = columns.find((c) => c.key === sort.column);
  if (!column) return rows;
  const directionMultiplier = sort.direction === 'asc' ? 1 : -1;
  const sorted = [...rows].sort((a, b) => {
    const aValue = readPath(a, column.field);
    const bValue = readPath(b, column.field);
    return compareValues(aValue, bValue) * directionMultiplier;
  });
  return sorted;
}

function normalizeInitialSelection(
  initial: string | string[] | undefined,
  mode: TableSelectionMode
): string[] {
  if (mode === 'none' || !initial) return [];
  const asArray = Array.isArray(initial) ? initial : [initial];
  if (mode === 'single') return asArray.slice(0, 1);
  return Array.from(new Set(asArray));
}

function makeRowKeyGetter(
  rowKey: string | TableRowKeyGetter | undefined,
  debug: boolean
): TableRowKeyGetter {
  if (typeof rowKey === 'function') return rowKey;
  const path = typeof rowKey === 'string' && rowKey.length > 0 ? rowKey : 'id';
  return (row, index) => {
    const raw = readPath(row, path);
    if (raw !== null && raw !== undefined && raw !== '') {
      return String(raw);
    }
    if (debug) {
      console.warn(
        `TableFactory: row at index ${index} is missing "${path}"; falling back to the row index as a key.`
      );
    }
    return `__row_${index}`;
  };
}

/** -------------------------------------------------------------------------
 * useSetup
 * -------------------------------------------------------------------------- */

const useTableSetup: FactorySetupHook<
  TableFactoryProps,
  TableFactoryRef,
  Record<string, any>
> = ({ props }) => {
  const {
    schema,
    rows,
    rowKey,
    selectionMode = 'none',
    initialSelection,
    onSelectionChange,
    initialSort = null,
    sortMode = 'client',
    onSort,
    emptyState,
    loading = false,
    debug = false,
  } = props;

  const columns = useMemo(() => extractColumns(schema), [schema]);

  const [selectedKeys, setSelectedKeysState] = useState<string[]>(() =>
    normalizeInitialSelection(initialSelection, selectionMode)
  );
  const [sort, setSortState] = useState<TableSortState | null>(initialSort);

  const getRowKey = useMemo(
    () => makeRowKeyGetter(rowKey, debug),
    [rowKey, debug]
  );

  const sortedRows = useMemo(() => {
    if (sortMode === 'client') {
      return sortRows(rows, columns, sort);
    }
    return rows;
  }, [rows, columns, sort, sortMode]);

  const applySelection = useCallback(
    (nextKeys: string[]) => {
      setSelectedKeysState(nextKeys);
      if (onSelectionChange) {
        const selectedRows: Array<Record<string, any>> = [];
        const indexByKey = new Map<string, Record<string, any>>();
        rows.forEach((row, index) => {
          indexByKey.set(getRowKey(row, index), row);
        });
        for (const key of nextKeys) {
          const row = indexByKey.get(key);
          if (row) selectedRows.push(row);
        }
        onSelectionChange({ keys: nextKeys, rows: selectedRows });
      }
    },
    [rows, getRowKey, onSelectionChange]
  );

  const applySort = useCallback(
    (nextSort: TableSortState | null) => {
      setSortState(nextSort);
      onSort?.(nextSort);
    },
    [onSort]
  );

  const onToggleRow = useCallback(
    (rowKeyValue: string) => {
      if (selectionMode === 'none') return;
      if (selectionMode === 'single') {
        const alreadySelected =
          selectedKeys.length === 1 && selectedKeys[0] === rowKeyValue;
        applySelection(alreadySelected ? [] : [rowKeyValue]);
        return;
      }
      const set = new Set(selectedKeys);
      if (set.has(rowKeyValue)) {
        set.delete(rowKeyValue);
      } else {
        set.add(rowKeyValue);
      }
      applySelection(Array.from(set));
    },
    [selectionMode, selectedKeys, applySelection]
  );

  const onToggleSort = useCallback(
    (columnKey: string) => {
      const column = columns.find((c) => c.key === columnKey);
      if (!column || !column.sortable) return;
      const isActive = sort?.column === columnKey;
      let next: TableSortState | null;
      if (!isActive) {
        next = { column: columnKey, direction: 'asc' };
      } else if (sort!.direction === 'asc') {
        next = { column: columnKey, direction: 'desc' };
      } else {
        next = null;
      }
      applySort(next);
    },
    [columns, sort, applySort]
  );

  const contextValue = useMemo<TableContextValue>(
    () => ({
      columns,
      rows: sortedRows,
      selectedKeys,
      sort,
      selectionMode,
      loading,
      emptyState,
      getRowKey,
      onToggleSort,
      onToggleRow,
    }),
    [
      columns,
      sortedRows,
      selectedKeys,
      sort,
      selectionMode,
      loading,
      emptyState,
      getRowKey,
      onToggleSort,
      onToggleRow,
    ]
  );

  const wrap = useCallback(
    (children: ReactNode) => (
      <TableProvider value={contextValue}>{children}</TableProvider>
    ),
    [contextValue]
  );

  const externalContext = useMemo(
    () => ({
      table: {
        columns,
        rows: sortedRows,
        selectedKeys,
        sort,
        selectionMode,
      },
    }),
    [columns, sortedRows, selectedKeys, sort, selectionMode]
  );

  const refApi = useMemo<TableFactoryRef>(
    () => ({
      getSelectedKeys: () => selectedKeys,
      setSelectedKeys: (keys: string[]) => {
        const normalized =
          selectionMode === 'single'
            ? keys.slice(0, 1)
            : selectionMode === 'multiple'
              ? Array.from(new Set(keys))
              : [];
        applySelection(normalized);
      },
      getSort: () => sort,
      setSort: (nextSort: TableSortState | null) => {
        if (!nextSort) {
          applySort(null);
          return;
        }
        const column = columns.find((c) => c.key === nextSort.column);
        if (!column || !column.sortable) return;
        applySort(nextSort);
      },
      getVisibleRows: () => sortedRows,
    }),
    [selectedKeys, sort, sortedRows, columns, selectionMode, applySelection, applySort]
  );

  return {
    refApi,
    externalContext,
    wrap,
  };
};

export const TableFactory = createReactFactory<
  TableFactoryProps,
  TableFactoryRef
>({
  displayName: 'TableFactory',
  schemaDefinition: tableSchemaDefinition,
  rootComponentKey: 'TableContainer',
  defaultComponents: defaultTableComponents,
  useSetup: useTableSetup,
});
